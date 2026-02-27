import { createClient } from '@supabase/supabase-js';

export interface Env {
  AI: any;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  SERPER_API_KEY: string;
  SAMBANOVA_API_KEY: string;
  HF_TOKEN: string;
  GITHUB_OPENAI_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-API-Key",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
      const userApiKey = request.headers.get("X-User-API-Key");
      const authHeader = request.headers.get("Authorization");
      
      let messages, mode, imageFile, model;

      try {
        const formData = await request.clone().formData();
        messages = JSON.parse(formData.get("messages") as string);
        mode = formData.get("mode") as string;
        model = formData.get("model") as string;
        imageFile = formData.get("image") as File | null;
      } catch (e) {
        try {
            const jsonBody: any = await request.json();
            messages = jsonBody.messages;
            if (typeof messages === 'string') messages = JSON.parse(messages);
            mode = jsonBody.mode;
            model = jsonBody.model;
        } catch (jsonError) {
            return new Response(JSON.stringify({ 
                response: "System Error: Request body format unreadable." 
            }), { headers: corsHeaders });
        }
      }

      const rawUserQuery = messages[messages.length - 1].content;
      const MODEL_CATALOG: Record<string, { provider: 'sambanova' | 'huggingface' | 'github'; id: string }> = {
        'sambanova-llama': { provider: 'sambanova', id: 'Meta-Llama-3.1-8B-Instruct' },
        'gemma-27b': { provider: 'huggingface', id: 'google/gemma-2-27b-it' },
        'qwen-27b': { provider: 'huggingface', id: 'Qwen/Qwen2.5-32B-Instruct' },
        'github-gpt4o': { provider: 'github', id: 'gpt-4o' },
      };
      const selectedModelKey = model && MODEL_CATALOG[model] ? model : 'sambanova-llama';
      const selectedModel = MODEL_CATALOG[selectedModelKey];
      const HF_IMAGE_MODEL = 'black-forest-labs/FLUX.1-dev';

      const hasUserKey = Boolean(userApiKey);
      let agentType = "GENERAL"; 
      let optimizedQuery = rawUserQuery;

      let tier = 'free';
      const isDeepResearch = mode === 'deepsearch' || mode === 'deepresearch';
      const isAdvancedMode = isDeepResearch || mode === 'imagegen' || !!imageFile;

      if (!hasUserKey || isAdvancedMode) {
        if (authHeader) {
            const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
              global: { headers: { Authorization: authHeader } }
            });
 
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (!authError && user) {
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('subscription_tier')
                  .eq('id', user.id)
                  .single();
                
                if (profile?.subscription_tier) {
                    tier = profile.subscription_tier.toLowerCase().trim();
                } else if (profileError) {
                    console.error("Profile Fetch Error:", profileError);
                }
            }
        } else if (!hasUserKey) {
            return new Response(JSON.stringify({ response: "AUTH_REQUIRED" }), { headers: corsHeaders });
        }
      }

      const VALID_PREMIUM_AI_IDS = [
          'extra_plus', 
          'premium_ai', 
          'premium_plus', 
          'premium+ai', 
          'premium + ai'
      ];
      
      const IS_PREMIUM_AI = VALID_PREMIUM_AI_IDS.includes(tier);

      if (isAdvancedMode && !IS_PREMIUM_AI) {
         return new Response(JSON.stringify({ 
             response: "UPGRADE_TO_EXTRA",
             debug_reason: `Your detected tier is '${tier}'. Mode '${mode}' requires Premium+AI.`
         }), { headers: corsHeaders });
      }

      const resolveProviderKey = (provider: 'sambanova' | 'huggingface' | 'github') => {
        if (userApiKey) return userApiKey;
        if (!IS_PREMIUM_AI) return null;
        if (provider === 'huggingface') return env.HF_TOKEN;
        if (provider === 'github') return env.GITHUB_OPENAI_TOKEN;
        return env.SAMBANOVA_API_KEY;
      };

      const providerKey = resolveProviderKey(selectedModel.provider);
      const sambanovaKey = resolveProviderKey('sambanova');

      if (!providerKey) {
        return new Response(JSON.stringify({ response: "KEY_REQUIRED" }), { headers: corsHeaders });
      }

      const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i+=32768) binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i+32768, bytes.byteLength))));
        return btoa(binary);
      };

      async function runSambaNovaModel(apiKey: string, modelId: string, systemPrompt: string, userPrompt: string, maxTokens: number = 1000, jsonMode: boolean = false) {
        try {
          const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: modelId, 
              messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
              temperature: 0.1,
              max_tokens: maxTokens,
              response_format: jsonMode ? { type: "json_object" } : undefined 
            })
          });

          if (!response.ok) {
            if (response.status === 401) return "AUTH ERROR: The API Key is invalid.";
            if (response.status === 429) return "RATE LIMIT: Please wait a moment.";
            return `SAMBANOVA ERROR (${response.status})`;
          }
          const data: any = await response.json();
          return data.choices?.[0]?.message?.content || "";
        } catch (e: any) { return `CONNECTION ERROR: ${e.message}`; }
      }

      const buildChatPrompt = (systemPrompt: string, userPrompt: string) => {
        return `${systemPrompt}\n\nUser: ${userPrompt}\nAssistant:`;
      };

      async function runHuggingFaceModel(apiKey: string, modelId: string, systemPrompt: string, userPrompt: string, maxTokens: number = 1000) {
        try {
          const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              inputs: buildChatPrompt(systemPrompt, userPrompt),
              parameters: {
                max_new_tokens: maxTokens,
                temperature: 0.2,
                return_full_text: false
              }
            })
          });

          if (!response.ok) {
            if (response.status === 401) return "AUTH ERROR: The API Key is invalid.";
            if (response.status === 429) return "RATE LIMIT: Please wait a moment.";
            return `HUGGINGFACE ERROR (${response.status})`;
          }
          const data: any = await response.json();
          if (Array.isArray(data)) {
            return data[0]?.generated_text || "";
          }
          return data?.generated_text || "";
        } catch (e: any) { return `CONNECTION ERROR: ${e.message}`; }
      }

      async function runGitHubOpenAIModel(apiKey: string, modelId: string, systemPrompt: string, userPrompt: string, maxTokens: number = 1000, jsonMode: boolean = false) {
        try {
          const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "api-key": apiKey },
            body: JSON.stringify({
              model: modelId,
              messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
              temperature: 0.2,
              max_tokens: maxTokens,
              response_format: jsonMode ? { type: "json_object" } : undefined
            })
          });

          if (!response.ok) {
            if (response.status === 401) return "AUTH ERROR: The API Key is invalid.";
            if (response.status === 429) return "RATE LIMIT: Please wait a moment.";
            return `GITHUB OPENAI ERROR (${response.status})`;
          }
          const data: any = await response.json();
          return data.choices?.[0]?.message?.content || "";
        } catch (e: any) { return `CONNECTION ERROR: ${e.message}`; }
      }

      async function runChatModel(options: {
        provider: 'sambanova' | 'huggingface' | 'github';
        modelId: string;
        apiKey: string;
        systemPrompt: string;
        userPrompt: string;
        maxTokens?: number;
        jsonMode?: boolean;
      }) {
        const { provider, modelId, apiKey, systemPrompt, userPrompt, maxTokens = 1000, jsonMode = false } = options;
        if (provider === 'sambanova') {
          return runSambaNovaModel(apiKey, modelId, systemPrompt, userPrompt, maxTokens, jsonMode);
        }
        if (provider === 'huggingface') {
          return runHuggingFaceModel(apiKey, modelId, systemPrompt, userPrompt, maxTokens);
        }
        return runGitHubOpenAIModel(apiKey, modelId, systemPrompt, userPrompt, maxTokens, jsonMode);
      }

      const generateImage = async (prompt: string) => {
        const imageKey = resolveProviderKey('huggingface');
        const styledPrompt = `${prompt}, scientific diagram, textbook style, white background`;

        if (imageKey) {
          const response = await fetch(`https://api-inference.huggingface.co/models/${HF_IMAGE_MODEL}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${imageKey}` },
            body: JSON.stringify({ inputs: styledPrompt })
          });

          if (!response.ok) {
            throw new Error(`HuggingFace image error (${response.status})`);
          }

          const arrayBuffer = await response.arrayBuffer();
          return `data:image/png;base64,${arrayBufferToBase64(arrayBuffer)}`;
        }

        const imgResponse = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
          prompt: styledPrompt,
          num_steps: 4
        });
        const arrayBuffer = await new Response(imgResponse).arrayBuffer();
        return `data:image/png;base64,${arrayBufferToBase64(arrayBuffer)}`;
      };

      if (mode !== 'imagegen') {
        const routerConfig = sambanovaKey
          ? { provider: 'sambanova' as const, modelId: MODEL_CATALOG['sambanova-llama'].id, apiKey: sambanovaKey }
          : { provider: selectedModel.provider, modelId: selectedModel.id, apiKey: providerKey };

        const planStr = await runChatModel({
          ...routerConfig,
          systemPrompt: `Router: Classify (PHYSICS/CHEMISTRY/MATH/BIOLOGY/GENERAL). Output JSON: {"agent": "...", "optimized_query": "..."}`,
          userPrompt: rawUserQuery,
          maxTokens: 150,
          jsonMode: true
        });
        try { 
            const plan = JSON.parse(planStr); 
            agentType = plan.agent || "GENERAL"; 
            optimizedQuery = plan.optimized_query || rawUserQuery; 
        } catch (e) {}
      }

      let visionContext = "";
      if (imageFile) {
        const imageArrayBuffer = await imageFile.arrayBuffer();
        const visionResult = await env.AI.run("@cf/llava-1.5-7b-hf", {
          image: [...new Uint8Array(imageArrayBuffer)],
          prompt: "Extract all text and diagrams.",
        });
        visionContext = `[VISUAL DATA]: ${visionResult.description}`;
      }

      let pdfContext = "";
      let webContext = "";
      if (mode !== 'imagegen') {
        const embeddings = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [optimizedQuery] });
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
            global: { headers: authHeader ? { Authorization: authHeader } : undefined }
        });
        
        const { data: vaultChunks } = await supabase.rpc('match_pcmb_knowledge', {
          query_embedding: embeddings.data[0], match_threshold: 0.25, match_count: 6
        });
        pdfContext = vaultChunks?.map((c: any) => `[Vault]: ${c.content}`).join("\n\n") || "";
        
        if (isDeepResearch) {
           const searchRes = await fetch("https://google.serper.dev/search", {
             method: "POST",
             headers: { "X-API-KEY": env.SERPER_API_KEY, "Content-Type": "application/json" },
             body: JSON.stringify({ q: optimizedQuery, gl: "in" })
           });
           const searchData: any = await searchRes.json();
           webContext = searchData.organic?.slice(0, 3).map((r: any) => `[Web]: ${r.snippet}`).join("\n") || "";
        }
      }

      let generatedImgBase64 = null;
      let finalAnswer = "Visual generated.";

      if (mode === 'imagegen' || /draw|diagram|image/i.test(rawUserQuery)) {
        try {
          generatedImgBase64 = await generateImage(optimizedQuery);
        } catch (imgError: any) {
          finalAnswer = "Visual gen failed: " + imgError.message;
        }
      }


      if (mode !== 'imagegen') {
         const VISUAL_INSTRUCTION = `
         - Visuals: Use 

[Image of X]
 ONLY if contextually useful.
         - LaTeX: Use $...$ for inline, $$...$$ for block math.
         - Citation: Cite [Vault] if used.
         `;
         const masterPrompt = `ACT AS: ${agentType} AGENT.\n${VISUAL_INSTRUCTION}\nCONTEXT:\n${pdfContext}\n${webContext}\n${visionContext}\nINSTRUCTIONS:\nAnswer "${optimizedQuery}".`;
         finalAnswer = await runChatModel({
           provider: selectedModel.provider,
           modelId: selectedModel.id,
           apiKey: providerKey,
           systemPrompt: masterPrompt,
           userPrompt: optimizedQuery,
           maxTokens: 2000
         });
      }

      return new Response(JSON.stringify({ 
        response: finalAnswer, 
        image: generatedImgBase64,
        agent: agentType 
      }), { headers: corsHeaders });

    } catch (e: any) {
      return new Response(JSON.stringify({ response: "System Critical Error: " + e.message }), { headers: corsHeaders });
    }
  },
};