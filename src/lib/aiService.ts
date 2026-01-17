import { supabase } from "@/integrations/supabase/client";

/**
 * MARGDARSHAK INTELLIGENCE CORE
 * -----------------------------
 * This service handles all AI interactions via the Puter.js bridge.
 * It manages context (memory), image generation, and chat persistence.
 * @author Abhinav Jha
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

export interface BriefingContext {
  tasks: any[];
  grades: any[];
  courses: any[];
  schedule: any[];
  stats: UserStats;
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

      // 2. Get AI Response (Safe check for chat function location)
      const chatFn = window.puter.chat || (window.puter.ai && window.puter.ai.chat);
      if (typeof chatFn !== 'function') throw new Error("AI Chat function not found");

      const response = await chatFn(messages);

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
   * Generates the personalized dashboard greeting using tasks, grades, and schedule.
   */
  generateDailyBriefing: async (
    userId: string,
    userName: string,
    context?: BriefingContext // New optional parameter for rich context
  ): Promise<AIBriefing> => {
    
    // Construct a rich prompt based on available data
    let contextStr = "";
    if (context) {
      const { tasks, grades, courses, schedule, stats } = context;
      
      const pendingTasks = tasks?.filter(t => t.status !== 'completed').slice(0, 5).map(t => t.title).join(", ") || "None";
      const recentGrades = grades?.slice(0, 3).map(g => `${g.subject}: ${g.percentage}%`).join(", ") || "None";
      const activeCourses = courses?.map(c => c.name).join(", ") || "General Studies";
      
      contextStr = `
        CONTEXT DATA:
        - Pending Tasks: ${pendingTasks}
        - Recent Grades: ${recentGrades}
        - Active Courses: ${activeCourses}
        - Study Streak: ${stats.studyStreak} days
        - Hours Studied: ${stats.hoursStudied}
      `;
    }

    const systemPrompt = `
      SYSTEM_PROTOCOL: DAILY_BRIEFING
      USER: ${userName}
      ROLE: You are MARGDARSHAK, an AI academic mentor.
      ${contextStr}
      TASK: Generate a concise, motivating morning briefing based on the user's real academic data.
      GUIDELINES:
      - If they have low grades, be encouraging and suggest a focus area.
      - If they have a high streak, congratulate them.
      - If they have many tasks, suggest prioritizing.
      FORMAT: Valid JSON Only. No markdown blocks.
      STRUCTURE: {"greeting":"<Short greeting>","focus_area":"<One specific subject/topic to focus on today>","message":"<2 sentences max advice>","color":"text-emerald-400"}
    `;

    try {
      if (!window.puter) throw new Error("Service Driver Missing");

      // Safe check for chat function location
      const chatFn = window.puter.chat || (window.puter.ai && window.puter.ai.chat);
      if (typeof chatFn !== 'function') throw new Error("AI Chat function not found");

      const response = await chatFn(systemPrompt);
      const rawContent = typeof response === "string" 
        ? response 
        : response?.message?.content;

      const briefing = cleanAndParseJSON(rawContent);
      if (!briefing) throw new Error("Invalid JSON from AI");

      return briefing;

    } catch (e) {
      // Graceful fallback so the dashboard doesn't break
      return {
        greeting: `Welcome back, ${userName}`,
        focus_area: "General Review",
        message: "I'm ready to help you organize your studies today.",
        color: "text-indigo-400"
      };
    }
  },

  /**
   * LANDING PAGE - EXPLAIN CONCEPT (Puter.js)
   * Generates a simple academic explanation for the public landing page demo.
   * Uses robust detection for the Puter.js chat function location.
   */
  explainConcept: async (topic: string): Promise<string | null> => {
    try {
      if (!window.puter) {
        console.error("Puter.js not loaded");
        return "System initializing... please refresh the page.";
      }

      // Check auth before trying to chat to prevent 401 errors
      if (window.puter.auth && !window.puter.auth.isSignedIn()) {
        await window.puter.auth.signIn();
      }

      const systemPrompt = `You are an expert tutor named MARGDARSHAK. Explain the following academic concept clearly and concisely, as if for a college student. Use short paragraphs and simple language. Do not use markdown formatting like asterisks for bolding. Concept: ${topic}`;

      // Robustly find the chat function (it can be at puter.chat OR puter.ai.chat)
      const chatFunction = window.puter.chat || (window.puter.ai && window.puter.ai.chat);

      if (typeof chatFunction !== 'function') {
        console.error("Puter Chat function missing. Available keys:", Object.keys(window.puter));
        return "AI Service unavailable. Please try again later.";
      }

      const response = await chatFunction(systemPrompt);
      
      // Handle various response types from Puter
      if (typeof response === 'string') return response;
      if (response?.message?.content) return response.message.content;
      
      return "No valid response received from AI.";

    } catch (error) {
      console.error("Landing Page AI Error:", error);
      return null;
    }
  },

  // -----------------------------------------------------
  // NEW COURSE MANAGEMENT AI FEATURES ADDED BELOW
  // -----------------------------------------------------

  /**
   * COURSE SYLLABUS GENERATOR
   * Generates a structured syllabus JSON based on a course name and description.
   */
  generateCourseSyllabus: async (courseName: string, level: string): Promise<any> => {
    try {
      if (!window.puter) throw new Error("AI Driver Missing");
      
      const systemPrompt = `
        You are an expert curriculum developer. 
        Create a 4-module syllabus for a course titled "${courseName}" at the "${level}" level.
        Return ONLY valid JSON. No text before or after.
        JSON Structure:
        {
          "modules": [
            {
              "title": "Module Title",
              "lessons": [
                { "title": "Lesson Title", "duration": "45m" },
                { "title": "Lesson Title", "duration": "1h" }
              ]
            }
          ]
        }
      `;

      const chatFn = window.puter.chat || (window.puter.ai && window.puter.ai.chat);
      const response = await chatFn(systemPrompt);
      const rawContent = typeof response === "string" ? response : response?.message?.content;
      return cleanAndParseJSON(rawContent) || { modules: [] };
    } catch (e) {
      console.error("AI Syllabus Error", e);
      return { modules: [] };
    }
  },

  /**
   * AI TUTOR FOR COURSE
   * Provides specific advice or explanation for a selected course context.
   */
  askCourseTutor: async (courseName: string, question: string): Promise<string> => {
    try {
      const systemPrompt = `You are an expert tutor for the course "${courseName}". Answer this student question clearly and concisely: "${question}"`;
      const chatFn = window.puter.chat || (window.puter.ai && window.puter.ai.chat);
      const response = await chatFn(systemPrompt);
      return typeof response === "string" ? response : response?.message?.content || "I couldn't generate an answer.";
    } catch (e) {
      return "AI Tutor is currently offline.";
    }
  }
};

export default aiService;