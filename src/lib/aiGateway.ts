import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier = 'free' | 'premium' | 'premium_elite' | 'extra_plus' | 'premium_plus' | string;
export type AIModelRoute = 'fast' | 'reasoning' | 'analysis';

const ELITE_TIERS = new Set(['premium_elite', 'extra_plus', 'premium_plus', 'premium+elite']);
export const USER_KEY_STORAGE = 'margdarshak_user_key';

const ROUTE_TO_MODEL: Record<AIModelRoute, string> = {
  fast: 'gemini-1.5-flash',
  reasoning: 'gpt-4o-mini',
  analysis: 'claude-3-5-sonnet-latest',
};

export const getModelForRoute = (route: AIModelRoute) => ROUTE_TO_MODEL[route];
export const isEliteTier = (tier?: string | null) => !!tier && ELITE_TIERS.has(tier.toLowerCase());

export const getStoredByok = () => localStorage.getItem(USER_KEY_STORAGE) || '';
export const setStoredByok = (key: string) => localStorage.setItem(USER_KEY_STORAGE, key);

export const getSubscriptionTier = async (): Promise<SubscriptionTier> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'free';

  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  return data?.subscription_tier || 'free';
};

export const resolveAiAuthHeaders = (tier: SubscriptionTier) => {
  const elite = isEliteTier(tier);
  const byok = getStoredByok();
  const emergentKey = import.meta.env.VITE_EMERGENT_LLM_KEY as string | undefined;

  if (elite && emergentKey) {
    return {
      headers: { 'X-Emergent-LLM-Key': emergentKey },
      source: 'emergent' as const,
      canProceed: true,
    };
  }

  if (byok) {
    return {
      headers: { 'X-User-API-Key': byok },
      source: 'byok' as const,
      canProceed: true,
    };
  }

  return {
    headers: {},
    source: elite ? 'missing_emergent_fallback_to_byok' as const : 'missing_byok' as const,
    canProceed: false,
  };
};

export interface AskAIParams {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  route: AIModelRoute;
  tier: SubscriptionTier;
  signal?: AbortSignal;
}

export const askMargdarshakAI = async ({ messages, route, tier, signal }: AskAIParams) => {
  const WORKER_URL = 'https://margdarshak-api.abhinav-vsavwe4899.workers.dev';
  const { data: { session } } = await supabase.auth.getSession();
  const keyInfo = resolveAiAuthHeaders(tier);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...keyInfo.headers,
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({
      messages,
      mode: route === 'analysis' ? 'deepresearch' : 'quickchat',
      model: getModelForRoute(route),
      route,
    }),
  });

  return {
    data: await response.json(),
    keyInfo,
  };
};
