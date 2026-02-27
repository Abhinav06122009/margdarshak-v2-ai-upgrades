import { logSecurityEvent } from '@/lib/security/securityService';

export interface AuditLogEntry {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export const logAuditEvent = async (entry: AuditLogEntry) => {
  return logSecurityEvent({
    eventType: `audit_${entry.action}`,
    userId: entry.userId,
    details: {
      entity: entry.entity,
      entityId: entry.entityId,
      metadata: entry.metadata,
    },
  });
};
