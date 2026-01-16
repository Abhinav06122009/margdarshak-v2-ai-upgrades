// src/security/sentry.ts

import { getDeviceSignature } from './fingerprint';
import { analyzeUserBehavior } from './biometrics';

/**
 * MARGDARSHAK SECURITY SENTRY
 * The central authority for threat detection and prevention.
 */

export interface SecurityReport {
  safe: boolean;
  deviceId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  flags: string[];
  debug?: any;
}

export const SecuritySentry = {
  
  /**
   * Performs a Full Spectrum Security Scan
   */
  async performSecurityScan(): Promise<SecurityReport> {
    console.log('🛡️ Sentry: Initiating Deep Scan...');
    const flags: string[] = [];
    let riskScore = 0;

    // 1. Identity Check
    const deviceId = await getDeviceSignature();

    // 2. Biometric Reality Check
    const bio = analyzeUserBehavior();
    if (!bio.isHuman) {
      riskScore += 40;
      flags.push('Biometric Anomaly Detected (Bot-like movement/typing)');
    }

    // 3. Automation Detection
    if (navigator.webdriver) {
      riskScore += 100;
      flags.push('Critical: WebDriver Automation Detected');
    }

    // 4. Environment Integrity (Headless Checks)
    if (!navigator.languages || navigator.languages.length === 0) {
      riskScore += 20;
      flags.push('Suspicious: No Browser Languages defined');
    }
    
    if (window.outerWidth === 0 && window.outerHeight === 0) {
      riskScore += 50;
      flags.push('Headless Browser Detected (Zero dimensions)');
    }

    // 5. DevTools Detection (Heuristic)
    // Checking if the console is being monitored (simple timing attack)
    const start = performance.now();
    // eslint-disable-next-line no-console
    console.log("%cSecurity Check", "color: transparent"); 
    const end = performance.now();
    if (end - start > 100) {
      riskScore += 10;
      flags.push('DevTools potentially open (Console latency)');
    }

    // --- FINAL VERDICT ---
    let riskLevel: SecurityReport['riskLevel'] = 'LOW';
    if (riskScore > 20) riskLevel = 'MEDIUM';
    if (riskScore > 50) riskLevel = 'HIGH';
    if (riskScore >= 80) riskLevel = 'CRITICAL';

    return {
      safe: riskScore < 60,
      deviceId,
      riskLevel,
      flags,
      debug: {
        score: riskScore,
        bioMetrics: bio.details
      }
    };
  }
};