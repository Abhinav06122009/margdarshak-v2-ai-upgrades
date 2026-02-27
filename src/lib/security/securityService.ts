import { supabase } from '@/integrations/supabase/client';
import { SecuritySentry } from '@/security/sentry';
import { analyzeThreat, ThreatAssessment } from './threatDetection';
import { fetchIpDetails } from './ipTracker';
import { getEnhancedFingerprint } from './deviceFingerprint';
import { moderateContent } from './contentModerator';

export interface SecurityEventInput {
  eventType: string;
  userId?: string | null;
  details?: Record<string, any> | null;
}

export interface SecurityEventResult {
  threat: ThreatAssessment;
  deviceId: string;
  ipAddress: string | null;
}

const buildRiskMeta = (threat: ThreatAssessment) => ({
  risk_score: threat.score,
  risk_level: threat.level,
  flags: threat.flags,
  summary: threat.summary,
  ai_summary: threat.aiSummary,
});

const insertSafe = async (table: string, payload: Record<string, any>) => {
  try {
    const { error } = await supabase.from(table).insert(payload);
    if (error) throw error;
  } catch (error) {
    console.error(`Failed to insert into ${table}`, error);
  }
};

export const logSecurityEvent = async ({ eventType, userId, details }: SecurityEventInput): Promise<SecurityEventResult | null> => {
  const ipDetails = await fetchIpDetails();
  const fingerprint = await getEnhancedFingerprint();
  const threat = await analyzeThreat({
    eventType,
    ipAddress: ipDetails.ip,
    ipCountry: ipDetails.country,
    userAgent: navigator.userAgent,
    deviceId: fingerprint.id,
    metadata: {
      ...details,
      isProxy: ipDetails.isProxy,
    },
  });

  await insertSafe('security_logs', {
    user_id: userId,
    event_type: eventType,
    ip_address: ipDetails.ip,
    location: ipDetails.country,
    device_id: fingerprint.id,
    metadata: details,
    ...buildRiskMeta(threat),
  });

  if (['high', 'critical'].includes(threat.level)) {
    await insertSafe('security_threats', {
      user_id: userId,
      event_type: eventType,
      ip_address: ipDetails.ip,
      threat_level: threat.level,
      threat_score: threat.score,
      flags: threat.flags,
      summary: threat.summary,
      metadata: details,
    });
  }

  if (userId) {
    await insertSafe('user_activity_logs', {
      user_id: userId,
      activity_type: eventType,
      ip_address: ipDetails.ip,
      device_id: fingerprint.id,
      metadata: details,
    });
  }

  return {
    threat,
    deviceId: fingerprint.id,
    ipAddress: ipDetails.ip,
  };
};

export const logUserActivity = async (userId: string, activityType: string, metadata?: Record<string, any>) => {
  await insertSafe('user_activity_logs', {
    user_id: userId,
    activity_type: activityType,
    metadata,
  });
};

export const logIpActivity = async (eventType: string, metadata?: Record<string, any>) => {
  const ipDetails = await fetchIpDetails();
  await insertSafe('ip_logs', {
    ip_address: ipDetails.ip,
    country: ipDetails.country,
    city: ipDetails.city,
    is_proxy: ipDetails.isProxy,
    metadata,
    event_type: eventType,
  });
};

export const runSecurityScan = async () => {
  const report = await SecuritySentry.performSecurityScan();
  await logSecurityEvent({
    eventType: 'security_scan',
    details: {
      riskLevel: report.riskLevel,
      flags: report.flags,
      debug: report.debug,
    },
  });
  return report;
};

export const evaluatePolicyViolation = async (userId: string, content: string) => {
  const moderation = await moderateContent(content);
  if (moderation.severity === 'high') {
    await insertSafe('admin_reports', {
      user_id: userId,
      category: 'policy_violation',
      severity: moderation.severity,
      details: {
        content,
        violations: moderation.violations,
        ai_summary: moderation.aiSummary,
      },
    });
  }
  return moderation;
};
