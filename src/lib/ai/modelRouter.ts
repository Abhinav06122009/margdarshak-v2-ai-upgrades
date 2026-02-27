import { type TaskType, selectModel } from './modelConfig';
import cacheService from './cacheService';

declare global {
  interface Window {
    puter: any;
  }
}

export interface RouterOptions {
  task?: TaskType;
  tier?: string;
  userApiKey?: string;
  systemPrompt?: string;
  useCache?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
  jsonMode?: boolean;
}

const ensurePuterAuth = async (): Promise<boolean> => {
  if (!window.puter) return false;
  try {
    if (window.puter.auth && !window.puter.auth.isSignedIn()) {
      await window.puter.auth.signIn();
    }
    return true;
  } catch {
    return false;
  }
};

const getPuterChatFn = (): ((messages: any, options?: any) => Promise<any>) | null => {
  if (!window.puter) return null;
  const fn = window.puter.chat || (window.puter.ai && window.puter.ai.chat);
  return typeof fn === 'function' ? fn : null;
};

const callPuter = async (messages: any[], options: RouterOptions): Promise<string> => {
  const auth = await ensurePuterAuth();
  if (!auth) throw new Error('Puter.js not available');

  const chatFn = getPuterChatFn();
  if (!chatFn) throw new Error('AI Chat function not found');

  const payload = options.systemPrompt
    ? [{ role: 'system', content: options.systemPrompt }, ...messages]
    : messages;

  const response = await chatFn(payload);

  if (typeof response === 'string') return response;
  if (response?.message?.content) return response.message.content;
  return JSON.stringify(response);
};

export const modelRouter = {
  chat: async (
    messages: Array<{ role: string; content: string }>,
    options: RouterOptions = {}
  ): Promise<string> => {
    const { useCache = false, cacheKey, cacheTtl } = options;

    if (useCache && cacheKey) {
      const cached = cacheService.get(cacheKey);
      if (cached) return cached;
    }

    let result: string;

    try {
      result = await callPuter(messages, options);
    } catch (error: any) {
      throw new Error(`AI request failed: ${error.message}`);
    }

    if (useCache && cacheKey && result) {
      cacheService.set(cacheKey, result, cacheTtl);
    }

    return result;
  },

  complete: async (prompt: string, options: RouterOptions = {}): Promise<string> => {
    return modelRouter.chat([{ role: 'user', content: prompt }], options);
  },

  generateJSON: async <T = any>(prompt: string, options: RouterOptions = {}): Promise<T | null> => {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. No markdown, no explanation.`;
    const result = await modelRouter.complete(jsonPrompt, { ...options, jsonMode: true });

    try {
      const start = result.indexOf('{');
      const end = result.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return JSON.parse(result.substring(start, end + 1)) as T;
      }
      const arrStart = result.indexOf('[');
      const arrEnd = result.lastIndexOf(']');
      if (arrStart !== -1 && arrEnd !== -1) {
        return JSON.parse(result.substring(arrStart, arrEnd + 1)) as T;
      }
    } catch { /* ignore */ }
    return null;
  },
};

export default modelRouter;
