import { useContext } from 'react';
import { SecurityContext } from '@/contexts/SecurityContext';
import { logSecurityEvent, logUserActivity, runSecurityScan } from '@/lib/security/securityService';

export const useSecurity = () => {
  const context = useContext(SecurityContext);

  return {
    ...context,
    logSecurityEvent,
    logUserActivity,
    runSecurityScan,
  };
};
