import aiService from '@/lib/aiService';

export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ThreatAssessment {
  score: number;
  level: ThreatLevel;
  flags: string[];
  summary: string;
  aiSummary?: string | null;
}

interface ThreatContext {
  eventType: string;
  ipAddress?: string | null;
  ipCountry?: string | null;
  userAgent?: string | null;
  deviceId?: string | null;
  metadata?: Record<string, any> | null;
}

const normalizeEventType = (eventType: string) => eventType.replace(/_/g, ' ').toLowerCase();

const calculateLevel = (score: number): ThreatLevel => {
  if (score >= 85) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
};

const buildSummary = (eventType: string, score: number, flags: string[]) => {
  const headline = normalizeEventType(eventType);
  const riskLabel = score >= 60 ? 'elevated' : 'moderate';
  const highlights = flags.length ? flags.join('; ') : 'No notable anomalies detected.';
  return `${headline} with ${riskLabel} risk. ${highlights}`;
};

const getAiThreatSummary = async (context: ThreatContext): Promise<string | null> => {
  if (!window?.puter) return null;
  const description = JSON.stringify({
    eventType: context.eventType,
    ipAddress: context.ipAddress,
    ipCountry: context.ipCountry,
    userAgent: context.userAgent,
    deviceId: context.deviceId,
    metadata: context.metadata,
  });

  const prompt = `You are a security analyst. Summarize potential threats in a single sentence based on this event JSON. Respond with plain text only. Event: ${description}`;

  try {
    const response = await aiService.sendMessage('security-analyst', prompt);
    if (response?.startsWith('SYSTEM_ERROR')) return null;
    return response;
  } catch (error) {
    console.error('AI threat summary failed', error);
    return null;
  }
};

export const analyzeThreat = async (context: ThreatContext): Promise<ThreatAssessment> => {
  const flags: string[] = [];
  let score = 0;

  if (context.eventType.includes('failed')) {
    score += 35;
    flags.push('Repeated failure signal detected');
  }

  if (context.eventType.includes('mfa')) {
    score += 10;
    flags.push('MFA challenge triggered');
  }

  if (context.eventType.includes('admin')) {
    score += 15;
    flags.push('Admin surface accessed');
  }

  if (context.metadata?.isProxy) {
    score += 25;
    flags.push('Connection from VPN or proxy detected');
  }

  if (context.metadata?.deviceTrustScore && context.metadata.deviceTrustScore < 50) {
    score += 20;
    flags.push('Low device trust score');
  }

  if (context.metadata?.behavioralRisk && context.metadata.behavioralRisk > 70) {
    score += 30;
    flags.push('Behavioral anomaly detected');
  }

  if (context.metadata?.policyViolations?.length) {
    score += 40;
    flags.push('Policy violations flagged');
  }

  if (context.metadata?.geoVelocity) {
    score += 20;
    flags.push('Geo-velocity anomaly detected');
  }

  if (!flags.length) {
    score = Math.max(score, 10);
  }

  const level = calculateLevel(score);
  const summary = buildSummary(context.eventType, score, flags);
  const aiSummary = await getAiThreatSummary(context);

  return {
    score,
    level,
    flags,
    summary,
    aiSummary,
  };
};
