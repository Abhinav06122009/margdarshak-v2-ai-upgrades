import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * UTILITY: Device Fingerprinting
 * Generates a basic browser fingerprint to detect new devices.
 */
const generateFingerprint = async (): Promise<string> => {
  try {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency,
      (navigator as any).deviceMemory,
    ];
    
    // Create a simple hash of the components
    const msgBuffer = new TextEncoder().encode(components.join('|'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('Fingerprinting failed', err);
    return 'unknown-device';
  }
};

/**
 * UTILITY: Risk Analysis
 * Evaluates login risk based on simple heuristics.
 */
const calculateRiskScore = (fingerprint: string): { score: number; level: 'low' | 'high' } => {
  let score = 100;
  
  // Example heuristic: Check for automation tools in User Agent
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('headless') || ua.includes('selenium')) {
    score -= 50;
  }

  return {
    score,
    level: score < 70 ? 'high' : 'low'
  };
};

/**
 * HOOK: useSecurityCheck
 * Runs client-side checks on mount.
 */
export const useSecurityCheck = () => {
  const [securityState, setSecurityState] = useState<{
    isVerified: boolean;
    riskLevel: 'low' | 'high';
  }>({ isVerified: false, riskLevel: 'low' });

  useEffect(() => {
    const runChecks = async () => {
      const fp = await generateFingerprint();
      const { level } = calculateRiskScore(fp);
      
      // Log verification attempt (optional)
      if (level === 'high') {
        console.warn('Security risk detected during client initialization.');
      }

      setSecurityState({ isVerified: true, riskLevel: level });
    };

    runChecks();
  }, []);

  return securityState;
};

// --- Context for Global Access ---

interface SecurityContextType {
  isVerified: boolean;
  riskLevel: 'low' | 'high';
}

const SecurityContext = createContext<SecurityContextType>({ 
  isVerified: false, 
  riskLevel: 'low' 
});

export const SecurityProvider = ({ children }: { children: React.ReactNode }) => {
  const security = useSecurityCheck();

  return (
    <SecurityContext.Provider value={security}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => useContext(SecurityContext);