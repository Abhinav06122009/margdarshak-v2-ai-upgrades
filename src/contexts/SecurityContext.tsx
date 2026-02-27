import React, { createContext, useEffect, useMemo, useState } from 'react';
import { SecurityReport, SecuritySentry } from '@/security/sentry';
import { logSecurityEvent } from '@/lib/security/securityService';

export interface SecurityContextValue {
  report: SecurityReport | null;
  status: 'idle' | 'scanning' | 'ready';
  refreshScan: () => Promise<void>;
}

export const SecurityContext = createContext<SecurityContextValue>({
  report: null,
  status: 'idle',
  refreshScan: async () => undefined,
});

export const SecurityProvider = ({ children }: { children: React.ReactNode }) => {
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'ready'>('idle');

  const runScan = async () => {
    setStatus('scanning');
    const scanReport = await SecuritySentry.performSecurityScan();
    setReport(scanReport);
    setStatus('ready');
    await logSecurityEvent({
      eventType: 'security_scan',
      details: {
        riskLevel: scanReport.riskLevel,
        flags: scanReport.flags,
        score: scanReport.debug?.score,
      },
    });
  };

  useEffect(() => {
    runScan();
  }, []);

  const value = useMemo(() => ({
    report,
    status,
    refreshScan: runScan,
  }), [report, status]);

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};
