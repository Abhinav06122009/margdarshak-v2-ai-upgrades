import { supabase } from "@/integrations/supabase/client";

/**
 * MARGDARSHAK SMART SERVICE - ELITE EDITION
 * Provider: Client-side Engine
 * Persistence: Cloud Context Memory
 */

// DECLARE GLOBAL INTERFACE
declare global {
  interface Window {
    puter: any;
  }
}

// --- INTERFACES ---
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

// --- HELPER: ROBUST JSON EXTRACTOR ---
const extractJson = (text: string): any => {
  try {
    const startIndex = text.indexOf("{");
    const endIndex = text.lastIndexOf("}");
    if (startIndex === -1 || endIndex === -1) return null;
    return JSON.parse(text.substring(startIndex, endIndex + 1));
  } catch {
    return null;
  }
};

export const aiService = {
  /**
   * GET CONTEXT MEMORY
   */
  getNeuralContext: async (userId: string) => {
    try {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(userId)) return [];

      const { data, error } = await supabase
        .from("ai_neural_memory") // Table name remains to avoid DB breakage
        .select("role, content")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data?.reverse() || [];
    } catch (e) {
      console.error("Context error:", e);
      return [];
    }
  },

  /**
   * GENERATE IMAGE
   */
  generateImage: async (prompt: string) => {
    try {
      const puter = window.puter;
      if (!puter) return "SYSTEM_ERROR: Service Driver Missing.";

      if (!puter.auth.isSignedIn()) {
        await puter.auth.signIn();
      }

      const cleanPrompt = prompt
        .replace(/^(can you|please|kindly|just)\s+/i, "")
        .replace(
          /(draw|generate|create|show|make|visualize).*(image|picture|photo|diagram|sketch|illustration)( of)?/i,
          ""
        )
        .trim();

      const finalPrompt = cleanPrompt || prompt;

      const imageElement = await puter.ai.txt2img(finalPrompt);
      return imageElement?.src || "IMAGE_GENERATION_FAILED";

    } catch (error: any) {
      console.error("Image Gen Error:", error);
      return `IMAGE_ERROR: ${error.message}`;
    }
  },

  /**
   * SEND MESSAGE
   */
  sendMessage: async (userId: string, prompt: string) => {
    try {
      const puter = window.puter;
      if (!puter) return "SYSTEM_ERROR: Service Driver Missing.";

      if (!puter.auth.isSignedIn()) {
        await puter.auth.signIn();
      }

      const history = await aiService.getNeuralContext(userId);
      const messages = [...history, { role: "user", content: prompt }];

      const response = await puter.chat(messages);

      let aiResponse = "";
      if (typeof response === "string") aiResponse = response;
      else if (response?.message?.content)
        aiResponse = response.message.content;
      else aiResponse = JSON.stringify(response);

      await aiService.persistMessage(userId, prompt, aiResponse);
      return aiResponse;

    } catch (error: any) {
      console.error("Critical Service Error:", error);
      return `SYSTEM_ERROR: ${error.message || "Connection failed"}`;
    }
  },

  /**
   * PERSIST MESSAGE
   */
  persistMessage: async (userId: string, userMsg: string, aiMsg: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(userId)) return;

    await supabase.from("ai_neural_memory").insert([
      { user_id: userId, role: "user", content: userMsg },
      { user_id: userId, role: "assistant", content: aiMsg }
    ]);
  },

  /**
   * DAILY BRIEFING
   */
  generateDailyBriefing: async (
    userId: string,
    userName: string
  ): Promise<AIBriefing> => {
    const prompt = `
SYSTEM_PROTOCOL: DAILY_BRIEFING
USER: ${userName}
RETURN JSON:
{"greeting":"","focus_area":"","message":"","color":"text-emerald-400"}
`;

    try {
      const puter = window.puter;
      if (!puter) throw new Error("Service Driver Missing");

      const response = await puter.chat(prompt);
      const raw =
        typeof response === "string"
          ? response
          : response?.message?.content;

      const parsed = extractJson(raw);
      if (!parsed) throw new Error("Invalid JSON");

      return parsed;
    } catch {
      return {
        greeting: `Welcome, ${userName}`,
        focus_area: "OFFLINE",
        message: "Service connection unavailable.",
        color: "text-gray-400"
      };
    }
  }
};

export default aiService;