export type ModelProvider = 'sambanova' | 'gemini' | 'puter';
export type TaskType = 'chat' | 'analysis' | 'creative' | 'research' | 'summarize' | 'quiz' | 'plan';
export type SubscriptionTier = 'free' | 'premium' | 'premium_elite' | 'extra_plus' | 'premium_plus';

export interface ModelConfig {
  id: string;
  provider: ModelProvider;
  name: string;
  maxTokens: number;
  supportsVision: boolean;
  costLevel: 'free' | 'low' | 'medium' | 'high';
  bestFor: TaskType[];
}

export const MODELS: Record<string, ModelConfig> = {
  'gemini-flash': {
    id: 'gemini-2.0-flash',
    provider: 'gemini',
    name: 'Gemini Flash',
    maxTokens: 8192,
    supportsVision: true,
    costLevel: 'low',
    bestFor: ['chat', 'summarize', 'quiz'],
  },
  'gemini-pro': {
    id: 'gemini-1.5-pro',
    provider: 'gemini',
    name: 'Gemini Pro',
    maxTokens: 32768,
    supportsVision: true,
    costLevel: 'medium',
    bestFor: ['analysis', 'research', 'plan'],
  },
  'sambanova-llama': {
    id: 'Meta-Llama-3.1-8B-Instruct',
    provider: 'sambanova',
    name: 'Llama 3.1',
    maxTokens: 4096,
    supportsVision: false,
    costLevel: 'free',
    bestFor: ['chat', 'creative'],
  },
  'puter-gpt4o': {
    id: 'gpt-4o',
    provider: 'puter',
    name: 'GPT-4o (via Puter)',
    maxTokens: 8192,
    supportsVision: true,
    costLevel: 'free',
    bestFor: ['chat', 'analysis', 'research', 'creative', 'summarize', 'quiz', 'plan'],
  },
};

export const ELITE_TIERS: SubscriptionTier[] = ['premium_elite', 'extra_plus', 'premium_plus'];
export const PREMIUM_TIERS: SubscriptionTier[] = [...ELITE_TIERS, 'premium'];

export const isEliteTier = (tier: string): boolean =>
  ELITE_TIERS.includes(tier as SubscriptionTier);

export const isPremiumTier = (tier: string): boolean =>
  PREMIUM_TIERS.includes(tier as SubscriptionTier);

export const selectModel = (task: TaskType, tier: string, hasUserKey: boolean): ModelConfig => {
  if (isEliteTier(tier) || hasUserKey) {
    return MODELS['puter-gpt4o'];
  }
  return MODELS['puter-gpt4o'];
};
