import aiService from '@/lib/aiService';

export interface ModerationResult {
  score: number;
  severity: 'low' | 'medium' | 'high';
  violations: string[];
  aiSummary?: string | null;
}

const POLICY_KEYWORDS = ['spam', 'scam', 'hate', 'abuse', 'threat', 'violence', 'exploit'];

const getSeverity = (score: number): ModerationResult['severity'] => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

const extractViolations = (content: string) => {
  const matches = POLICY_KEYWORDS.filter((word) => content.toLowerCase().includes(word));
  return matches.map((word) => `Keyword detected: ${word}`);
};

export const moderateContent = async (content: string): Promise<ModerationResult> => {
  const violations = extractViolations(content);
  let score = violations.length * 20;
  if (content.length > 600) score += 10;
  if (content.split(' ').length < 3) score += 10;

  const severity = getSeverity(score);
  let aiSummary: string | null = null;

  if (window?.puter) {
    const prompt = `Review the following text for policy violations. Respond with one sentence summary only. Text: ${content}`;
    try {
      const response = await aiService.sendMessage('content-moderator', prompt);
      if (!response?.startsWith('SYSTEM_ERROR')) {
        aiSummary = response;
      }
    } catch (error) {
      console.error('AI moderation failed', error);
    }
  }

  return {
    score,
    severity,
    violations,
    aiSummary,
  };
};
