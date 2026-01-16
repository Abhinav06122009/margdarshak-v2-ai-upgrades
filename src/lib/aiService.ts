import { supabase } from "@/integrations/supabase/client";

/**
 * MARGDARSHAK INTELLIGENCE CORE
 * -----------------------------
 * This service handles all AI interactions via the Puter.js bridge.
 * It manages context (memory), image generation, and chat persistence.
 * * @author Abhinav Jha
 */

// --- Global Types ---
declare global {
  interface Window {
    puter: any; // The bridge to our AI provider
  }
}

export interface UserStats {
  studyStreak: number;
  tasksCompleted: number;
  hoursStudied: number;
  averageGrade?: number;
}

export interface AIBriefing {
  greeting: string;
  focus_area: string;
  message: string;
  color: string;
}

// --- Utilities ---

/**
 * A robust JSON parser that handles occasional AI formatting errors.
 * Sometimes the AI adds text before/after the JSON, this cleans it up.
 */
const cleanAndParseJSON = (text: string): any => {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.substring(start, end + 1));
  } catch (err) {
    console.warn("AI returned malformed JSON, using fallback.", err);
    return null;
  }
};

// --- Core Service ---

export const aiService = {
  
  /**
   * RECALL CONTEXT (Memory)
   * Fetches the last 10 interactions so the AI remembers the conversation context.
   */
  getNeuralContext: async (userId: string) => {
    try {
      // 1. Validate UUID to prevent database errors
      const uuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidFormat.test(userId)) return [];

      // 2. Fetch history from Supabase
      const { data, error } = await supabase
        .from("ai_neural_memory")
        .select("role, content")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10); // Limit context to save tokens

      if (error) throw error;
      
      // 3. Reverse to chronological order (Oldest -> Newest)
      return data?.reverse() || [];

    } catch (e) {
      console.error("Failed to recall memory:", e);
      return [];
    }
  },

  /**
   * GENERATE IMAGE
   * Takes a user prompt and converts it into an image using the AI driver.
   */
  generateImage: async (prompt: string) => {
    try {
      // Check if driver is loaded
      if (!window.puter) return "SYSTEM_ERROR: AI Driver not loaded.";

      // Auto-login if needed
      if (!window.puter.auth.isSignedIn()) {
        await window.puter.auth.signIn();
      }

      // Cleanup the prompt: Remove conversational filler to focus on the visual
      const visualPrompt = prompt
        .replace(/^(can you|please|kindly|just)\s+/i, "")
        .replace(
          /(draw|generate|create|show|make|visualize).*(image|picture|photo|diagram|sketch|illustration)( of)?/i,
          ""
        )
        .trim();

      // Use the raw prompt if cleanup emptied it
      const finalPrompt = visualPrompt || prompt;
      
      const imageElement = await window.puter.ai.txt2img(finalPrompt);
      return imageElement?.src || "IMAGE_GENERATION_FAILED";

    } catch (error: any) {
      console.error("Image Gen Failed:", error);
      return `IMAGE_ERROR: ${error.message}`;
    }
  },

  /**
   * SEND MESSAGE (Chat)
   * The main loop: Get context -> Send to AI -> Save response.
   */
  sendMessage: async (userId: string, prompt: string) => {
    try {
      if (!window.puter) return "SYSTEM_ERROR: AI Driver not loaded.";

      if (!window.puter.auth.isSignedIn()) {
        await window.puter.auth.signIn();
      }

      // 1. Build Context
      const history = await aiService.getNeuralContext(userId);
      const messages = [...history, { role: "user", content: prompt }];

      // 2. Get AI Response
      const response = await window.puter.chat(messages);

      // 3. Parse Response (Handle different return types)
      let aiResponse = "";
      if (typeof response === "string") {
        aiResponse = response;
      } else if (response?.message?.content) {
        aiResponse = response.message.content;
      } else {
        aiResponse = JSON.stringify(response);
      }

      // 4. Save to Memory
      await aiService.persistMessage(userId, prompt, aiResponse);
      
      return aiResponse;

    } catch (error: any) {
      console.error("Chat Error:", error);
      return `SYSTEM_ERROR: ${error.message || "Connection failed"}`;
    }
  },

  /**
   * PERSIST MESSAGE
   * Saves the interaction to the database for future context.
   */
  persistMessage: async (userId: string, userMsg: string, aiMsg: string) => {
    // strict UUID check
    const uuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidFormat.test(userId)) return;

    await supabase.from("ai_neural_memory").insert([
      { user_id: userId, role: "user", content: userMsg },
      { user_id: userId, role: "assistant", content: aiMsg }
    ]);
  },

  /**
   * DAILY BRIEFING
   * Generates the personalized dashboard greeting.
   */
  generateDailyBriefing: async (
    userId: string,
    userName: string
  ): Promise<AIBriefing> => {
    // Explicit system prompt to force JSON format
    const systemPrompt = `
      SYSTEM_PROTOCOL: DAILY_BRIEFING
      USER: ${userName}
      TASK: Generate a motivating morning briefing.
      FORMAT: Valid JSON Only.
      STRUCTURE: {"greeting":"","focus_area":"","message":"","color":"text-emerald-400"}
    `;

    try {
      if (!window.puter) throw new Error("Service Driver Missing");

      const response = await window.puter.chat(systemPrompt);
      const rawContent = typeof response === "string" 
        ? response 
        : response?.message?.content;

      const briefing = cleanAndParseJSON(rawContent);
      if (!briefing) throw new Error("Invalid JSON from AI");

      return briefing;

    } catch (e) {
      // Graceful fallback so the dashboard doesn't break
      return {
        greeting: `Welcome, ${userName}`,
        focus_area: "System Check",
        message: "AI services are initializing...",
        color: "text-gray-400"
      };
    }
  }
};

export default aiService;