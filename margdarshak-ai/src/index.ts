import { createClient } from '@supabase/supabase-js';

export interface Env {
  AI: any;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  SERPER_API_KEY: string;
  SAMBANOVA_API_KEY: string;
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
      // 1. EXTRACT DATA
      const userApiKey = request.headers.get("X-User-API-Key");
      const authHeader = request.headers.get("Authorization");
      
      let messages, mode, imageFile;

      // 2. PARSE BODY
      try {
        const formData = await request.clone().formData();
        messages = JSON.parse(formData.get("messages") as string);
        mode = formData.get("mode") as string;
        imageFile = formData.get("image") as File | null;
      } catch (e) {
        try {
            const jsonBody: any = await request.json();
            messages = jsonBody.messages;
            if (typeof messages === 'string') messages = JSON.parse(messages);
            mode = jsonBody.mode;
        } catch (jsonError) {
            return new Response(JSON.stringify({ 
                response: "System Error: Request body format unreadable." 
            }), { headers: corsHeaders });
        }
      }

      const rawUserQuery = messages[messages.length - 1].content;
      let activeApiKey = userApiKey; 
      let agentType = "GENERAL"; 
      let optimizedQuery = rawUserQuery;

      // 3. GATEKEEPER & SUBSCRIPTION CHECK
      let tier = 'free';
      const isAdvancedMode = mode === 'deepsearch' || mode === 'imagegen' || !!imageFile;

      // If we need to verify subscription (No Key provided OR Advanced Mode requested)
      if (!activeApiKey || isAdvancedMode) {
        
        if (authHeader) {
            // ✅ FIX: Initialize Supabase WITH the user's token
            // This ensures RLS policies allow us to read the profile
            const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
              global: { headers: { Authorization: authHeader } }
            });
            
            // Verify the user
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (!authError && user) {
                // Fetch Profile Tier
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
        } else if (!activeApiKey) {
            return new Response(JSON.stringify({ response: "AUTH_REQUIRED" }), { headers: corsHeaders });
        }

        // 🛡️ TIER CHECK: Robust Array
        const VALID_PREMIUM_AI_IDS = [
            'extra_plus', 
            'premium_ai', 
            'premium_plus', 
            'premium+ai', 
            'premium + ai'
        ];
        
        const IS_PREMIUM_AI = VALID_PREMIUM_AI_IDS.includes(tier);

        // 🔒 RULE 1: Advanced Modes -> LOCKED to Premium+AI
        if (isAdvancedMode) {
            if (!IS_PREMIUM_AI) {
                 // 🛑 DEBUG INFO: This will show up in your frontend if it fails
                 return new Response(JSON.stringify({ 
                     response: "UPGRADE_TO_EXTRA",
                     debug_reason: `Your detected tier is '${tier}'. Mode '${mode}' requires Premium+AI.`
                 }), { headers: corsHeaders });
            }
        }

        // 🔒 RULE 2: System API Key Assignment
        if (!activeApiKey) {
           if (IS_PREMIUM_AI) {
               activeApiKey = env.SAMBANOVA_API_KEY;
           } else {
               return new Response(JSON.stringify({ response: "KEY_REQUIRED" }), { headers: corsHeaders });
           }
        }
      }

      // Final Sanity Check
      if (!activeApiKey) {
        return new Response(JSON.stringify({ 
            response: `System Error: Key generation failed. Tier detected: ${tier}` 
        }), { headers: corsHeaders });
      }

      // --- HELPER: Base64 ---
      const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i+=32768) binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i+32768, bytes.byteLength))));
        return btoa(binary);
      };

      // --- HELPER: SambaNova API ---
      async function runSambaNovaModel(systemPrompt: string, userPrompt: string, maxTokens: number = 1000, jsonMode: boolean = false) {
        try {
          const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${activeApiKey}` },
            body: JSON.stringify({
              model: "Meta-Llama-3.1-8B-Instruct", 
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

      // --- 4. PLANNER (Router) ---
      if (mode !== 'imagegen') {
        const planStr = await runSambaNovaModel(`Router: Classify (PHYSICS/CHEMISTRY/MATH/BIOLOGY/GENERAL). Output JSON: {"agent": "...", "optimized_query": "..."}`, rawUserQuery, 150, true);
        try { 
            const plan = JSON.parse(planStr); 
            agentType = plan.agent || "GENERAL"; 
            optimizedQuery = plan.optimized_query || rawUserQuery; 
        } catch (e) {}
      }

      // --- 5. VISION ---
      let visionContext = "";
      if (imageFile) {
        const imageArrayBuffer = await imageFile.arrayBuffer();
        const visionResult = await env.AI.run("@cf/llava-1.5-7b-hf", {
          image: [...new Uint8Array(imageArrayBuffer)],
          prompt: "Extract all text and diagrams.",
        });
        visionContext = `[VISUAL DATA]: ${visionResult.description}`;
      }

      // --- 6. RAG (Context) ---
      let pdfContext = "";
      let webContext = "";
      if (mode !== 'imagegen') {
        const embeddings = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [optimizedQuery] });
        // Use user-scoped client for RPC as well
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
            global: { headers: authHeader ? { Authorization: authHeader } : undefined }
        });
        
        const { data: vaultChunks } = await supabase.rpc('match_pcmb_knowledge', {
          query_embedding: embeddings.data[0], match_threshold: 0.25, match_count: 6
        });
        pdfContext = vaultChunks?.map((c: any) => `[Vault]: ${c.content}`).join("\n\n") || "";
        
        if (mode === 'deepsearch') {
           const searchRes = await fetch("https://google.serper.dev/search", {
             method: "POST",
             headers: { "X-API-KEY": env.SERPER_API_KEY, "Content-Type": "application/json" },
             body: JSON.stringify({ q: optimizedQuery, gl: "in" })
           });
           const searchData: any = await searchRes.json();
           webContext = searchData.organic?.slice(0, 3).map((r: any) => `[Web]: ${r.snippet}`).join("\n") || "";
        }
      }

      // --- 7. IMAGE GEN (Flux) ---
      let generatedImgBase64 = null;
      let finalAnswer = "Visual generated.";

      if (mode === 'imagegen' || /draw|diagram|image/i.test(rawUserQuery)) {
        try {
          const imgResponse = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
            prompt: optimizedQuery + ", scientific diagram, textbook style, white background",
            num_steps: 4
          });
          const arrayBuffer = await new Response(imgResponse).arrayBuffer();
          generatedImgBase64 = `data:image/png;base64,${arrayBufferToBase64(arrayBuffer)}`;
        } catch (imgError: any) { finalAnswer = "Visual gen failed: " + imgError.message; }
      }

      // --- 8. EXECUTOR ---
      if (mode !== 'imagegen') {
         const VISUAL_INSTRUCTION = `
         - Visuals: Use 

[Image of X]
 ONLY if contextually useful.
         - LaTeX: Use $...$ for inline, $$...$$ for block math.
         - Citation: Cite [Vault] if used.
         `;
         const masterPrompt = `ACT AS: ${agentType} AGENT.\n${VISUAL_INSTRUCTION}\nCONTEXT:\n${pdfContext}\n${webContext}\n${visionContext}\nINSTRUCTIONS:\nAnswer "${optimizedQuery}".`;
         finalAnswer = await runSambaNovaModel(masterPrompt, optimizedQuery, 2000);
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