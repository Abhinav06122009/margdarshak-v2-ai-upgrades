import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ==============================================
// 1. ADVANCED DEVICE FINGERPRINTING
// ==============================================

export class AdvancedDeviceFingerprinting {
  private static async getCanvasFingerprint(): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve('no_canvas_context');
      }
      const txt = 'i9asdm..$#po((^@KbXr...!';
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText(txt, 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText(txt, 4, 17);

      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve(dataUrl.slice(-16, -12));
        };
        reader.readAsDataURL(blob as Blob);
      });
    });
  }

  private static async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
      if (!audioContext) return 'no_audio_context';
      const context = new audioContext(1, 44100, 44100);
      const oscillator = context.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, context.currentTime);
      const compressor = context.createDynamicsCompressor();
      [['threshold', -50], ['knee', 40], ['ratio', 12], ['reduction', -20], ['attack', 0], ['release', 0.25]].forEach(
        (item) => {
          const param = compressor[item[0] as keyof DynamicsCompressorNode] as AudioParam;
          if (param && typeof param.setValueAtTime === 'function') {
            param.setValueAtTime(item[1] as number, context.currentTime);
          }
        }
      );
      oscillator.connect(compressor);
      compressor.connect(context.destination);
      oscillator.start(0);
      const buffer = await context.startRendering();
      const sum = buffer.getChannelData(0).slice(4500, 5000).reduce((acc, val) => acc + Math.abs(val), 0);
      return sum.toString();
    } catch (e) {
      return 'audio_context_error';
    }
  }

  private static getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no_webgl';
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'no_webgl_debug';
      const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return `${vendor}~${renderer}`;
    } catch (e) {
      return 'webgl_error';
    }
  }

  private static getFontFingerprint(): string {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testString = "mmmmmmmmmmlli";
    const testSize = '72px';
    const h = document.getElementsByTagName("body")[0];
    const s = document.createElement("span");
    s.style.fontSize = testSize;
    s.innerHTML = testString;
    let defaultWidth: Record<string, number> = {};
    let defaultHeight: Record<string, number> = {};
    for (let font of baseFonts) {
      s.style.fontFamily = font;
      h.appendChild(s);
      defaultWidth[font] = s.offsetWidth;
      defaultHeight[font] = s.offsetHeight;
      h.removeChild(s);
    }

    const fontList = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact'];
    return fontList.filter(font => {
      let detected = false;
      for (let baseFont of baseFonts) {
        s.style.fontFamily = font + ',' + baseFont;
        h.appendChild(s);
        const matched = (s.offsetWidth !== defaultWidth[baseFont] || s.offsetHeight !== defaultHeight[baseFont]);
        h.removeChild(s);
        detected = detected || matched;
      }
      return detected;
    }).join(',');
  }

  static async generateFingerprint(): Promise<string> {
    const components = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      colorDepth: screen.colorDepth,
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      plugins: Array.from(navigator.plugins).map(p => p.name).join(','),
      webgl: this.getWebGLFingerprint(),
      fonts: this.getFontFingerprint(),
      canvas: await this.getCanvasFingerprint(),
      audio: await this.getAudioFingerprint(),
      webdriver: navigator.webdriver,
    };

    const values = Object.keys(components).map(key => components[key as keyof typeof components]);
    const json = JSON.stringify(values);
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json));
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// ==============================================
// 2. BEHAVIORAL BIOMETRICS
// ==============================================

export class BehavioralBiometrics {
  private static typingData: { key: string; timestamp: number; type: 'down' | 'up' }[] = [];
  private static mouseData: { x: number; y: number; timestamp: number }[] = [];
  private static isTracking = false;

  private static handleKeyDown = (e: KeyboardEvent) => {
    if (!this.isTracking) return;
    this.typingData.push({ key: e.key, timestamp: Date.now(), type: 'down' });
  };

  private static handleKeyUp = (e: KeyboardEvent) => {
    if (!this.isTracking) return;
    this.typingData.push({ key: e.key, timestamp: Date.now(), type: 'up' });
  };

  private static handleMouseMove = (e: MouseEvent) => {
    if (!this.isTracking) return;
    this.mouseData.push({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
  };

  static startTracking() {
    if (this.isTracking) return;
    this.isTracking = true;
    this.typingData = [];
    this.mouseData = [];
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  static stopTracking() {
    if (!this.isTracking) return;
    this.isTracking = false;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  static getTypingPattern() {
    const keyPresses: Record<string, { down: number; up?: number }> = {};
    const dwellTimes: number[] = [];
    const flightTimes: number[] = [];

    this.typingData.forEach(event => {
      if (event.type === 'down') {
        keyPresses[event.key] = { down: event.timestamp };
      } else if (keyPresses[event.key] && !keyPresses[event.key].up) {
        keyPresses[event.key].up = event.timestamp;
        const press = keyPresses[event.key];
        dwellTimes.push(press.up! - press.down);
      }
    });

    for (let i = 1; i < this.typingData.length; i++) {
      if (this.typingData[i].type === 'down' && this.typingData[i - 1].type === 'up') {
        flightTimes.push(this.typingData[i].timestamp - this.typingData[i - 1].timestamp);
      }
    }

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      avg_dwell_time: avg(dwellTimes),
      avg_flight_time: avg(flightTimes),
      typing_events: this.typingData.length,
    };
  }

  static getMousePattern() {
    if (this.mouseData.length < 2) {
      return { avg_velocity: 0, total_distance: 0, mouse_events: this.mouseData.length };
    }

    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 1; i < this.mouseData.length; i++) {
      const p1 = this.mouseData[i - 1];
      const p2 = this.mouseData[i];
      const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const time = p2.timestamp - p1.timestamp;

      if (time > 0) {
        totalDistance += distance;
        totalTime += time;
      }
    }

    return {
      avg_velocity: totalTime > 0 ? totalDistance / totalTime : 0, // pixels per millisecond
      total_distance: totalDistance,
      mouse_events: this.mouseData.length,
    };
  }
}

// ==============================================
// 3. GEOLOCATION & IP ANALYSIS
// ==============================================

export class GeolocationSecurity {
  static async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | { error: string }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        return resolve({ error: 'Geolocation is not supported by this browser.' });
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          resolve({ error: 'Unable to retrieve your location.' });
        }
      );
    });
  }

  static async getIPGeolocation(): Promise<object> {
    const services = [
      'https://ipapi.co/json/',
      'https://ipinfo.io/json',
      'https://freegeoip.app/json/'
    ];

    try {
      for (const url of services) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          const data = await response.json();
          return {
            ip: data.ip,
            city: data.city,
            country: data.country_name || data.country,
            latitude: data.latitude,
            longitude: data.longitude,
            is_vpn: data.security?.vpn || data.vpn || false,
          };
        } catch (error) {
          continue;
        }
      }

      throw new Error('All IP geolocation services failed');
    } catch (error) {
      return { error: 'IP geolocation failed' };
    }
  }

  static async analyzeLocationConsistency(): Promise<object> {
    const [deviceLocation, ipLocation] = await Promise.all([
      this.getCurrentLocation(),
      this.getIPGeolocation()
    ]);

    if ((deviceLocation as any).error || (ipLocation as any).error) {
      return { consistent: false, reason: 'Could not retrieve both location types.' };
    }

    const distance = this.calculateHaversineDistance(
      (deviceLocation as any).latitude, (deviceLocation as any).longitude,
      (ipLocation as any).latitude, (ipLocation as any).longitude
    );

    // Threshold in kilometers. If the distance is > 100km, it's likely a VPN/proxy.
    const isConsistent = distance < 100;

    return {
      consistent: isConsistent,
      distance_km: distance,
      device_coords: { lat: (deviceLocation as any).latitude, lon: (deviceLocation as any).longitude },
      ip_coords: { lat: (ipLocation as any).latitude, lon: (ipLocation as any).longitude },
      ip_country: (ipLocation as any).country,
      is_vpn: (ipLocation as any).is_vpn
    };
  }

  private static calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// ==============================================
// 4. AI-POWERED TRUST SCORING & ANOMALY DETECTION
// ==============================================

export class TrustScoringEngine {
  private static baseScore = 100;

  static async calculateTrustScore(
    fingerprint: string,
    behavioralPattern: object,
    locationConsistency: object
  ): Promise<{ score: number; riskLevel: 'low' | 'medium' | 'high' | 'critical'; reasons: string[] }> {
    let score = this.baseScore;
    const reasons: string[] = [];

    // Analyze Fingerprint (simulated AI model)
    if (fingerprint.includes('webdriver') || fingerprint.includes('selenium')) {
      score -= 50;
      reasons.push('Automation tool detected (WebDriver/Selenium).');
    }
    if (fingerprint.includes('phantom')) {
      score -= 40;
      reasons.push('Headless browser detected (PhantomJS).');
    }

    // Analyze Behavioral Biometrics
    const { avg_dwell_time, avg_flight_time, avg_velocity } = behavioralPattern as any;
    if (avg_dwell_time > 250 || avg_dwell_time < 50) {
      score -= 15;
      reasons.push('Atypical typing dwell time.');
    }
    if (avg_flight_time > 400 || avg_flight_time < 80) {
      score -= 15;
      reasons.push('Atypical typing flight time.');
    }
    if (avg_velocity > 2) { // pixels/ms
      score -= 10;
      reasons.push('Unusually high mouse velocity, possible bot activity.');
    }

    // Analyze Location
    const { consistent, distance_km, is_vpn } = locationConsistency as any;
    if (!consistent) {
      score -= 30;
      reasons.push(`Significant distance (${Math.round(distance_km)} km) between device and IP location.`);
    }
    if (is_vpn) {
      score -= 25;
      reasons.push('VPN or proxy detected from IP analysis.');
    }

    score = Math.max(0, Math.min(100, score));

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (score < 80) riskLevel = 'medium';
    if (score < 50) riskLevel = 'high';
    if (score < 25) riskLevel = 'critical';

    return { score, riskLevel, reasons };
  }
}

// ==============================================
// 5. CENTRALIZED SECURITY ORCHESTRATOR
// ==============================================

export const useSecurityOrchestrator = () => {
  const [securityContext, setSecurityContext] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const runFullSecurityCheck = async () => {
    setIsLoading(true);
    try {
      // Start all security checks in parallel
      const [fingerprint, locationConsistency] = await Promise.all([
        AdvancedDeviceFingerprinting.generateFingerprint(),
        GeolocationSecurity.analyzeLocationConsistency()
      ]);

      // Behavioral biometrics are collected over time, so we get the latest pattern
      const behavioralPattern = {
        ...BehavioralBiometrics.getTypingPattern(),
        ...BehavioralBiometrics.getMousePattern()
      };

      const { score, riskLevel, reasons } = await TrustScoringEngine.calculateTrustScore(
        fingerprint,
        behavioralPattern,
        locationConsistency
      );

      const newContext = {
        fingerprint,
        location: locationConsistency,
        behavior: behavioralPattern,
        trustScore: score,
        riskLevel,
        reasons,
        timestamp: new Date().toISOString()
      };

      setSecurityContext(newContext);

      // Log the security check event to Supabase
      await supabase.from('security_events').insert({
        event_type: 'security_check',
        ip_address: (locationConsistency as any).ip_coords?.ip || 'unknown',
        risk_level: riskLevel,
        details: {
          trustScore: score,
          reasons,
          fingerprint
        }
      });

    } catch (error) {
      console.error("Security check failed:", error);
      setSecurityContext({ error: 'Security check failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Start tracking user behavior on mount
    BehavioralBiometrics.startTracking();
    // Run initial security check
    runFullSecurityCheck();

    // Re-run checks periodically
    const interval = setInterval(runFullSecurityCheck, 5 * 60 * 1000); // every 5 minutes

    return () => {
      BehavioralBiometrics.stopTracking();
      clearInterval(interval);
    };
  }, []);

  return { securityContext, isLoading, runFullSecurityCheck };
};

// ==============================================
// 6. SECURE AUTHENTICATION COMPONENT
// ==============================================

export const SecureAuthForm: React.FC<{
  onAuthenticated: (user: any) => void;
  onError: (error: any) => void;
}> = ({ onAuthenticated, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { securityContext, isLoading: isSecurityLoading } = useSecurityOrchestrator();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!securityContext || securityContext.trustScore < 30) {
      const error = new Error('Login blocked due to low trust score.');
      await supabase.from('security_events').insert({
        event_type: 'login_blocked_low_trust',
        risk_level: 'critical',
        details: { trustScore: securityContext?.trustScore, email }
      });
      onError(error);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        onAuthenticated(data.user);
      }
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border border-purple-500/30">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-300">Secure Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-400">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-400">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || isSecurityLoading}
            className="w-full p-3 font-semibold text-white bg-purple-600 rounded hover:bg-purple-700 disabled:bg-gray-500 transition-colors"
          >
            {loading ? 'Logging in...' : isSecurityLoading ? 'Securing Connection...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-gray-500">
          {isSecurityLoading ? (
            <p>Analyzing security posture...</p>
          ) : securityContext ? (
            <p>Trust Score: <span className={`font-bold ${securityContext.trustScore > 70 ? 'text-green-400' : securityContext.trustScore > 40 ? 'text-yellow-400' : 'text-red-400'}`}>{securityContext.trustScore}%</span></p>
          ) : (
            <p>Initializing security...</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ==============================================
// 7. SECURITY CONTEXT AND PROVIDER
// ==============================================

const SecurityContext = React.createContext<any>(null);

export const useSecurity = () => React.useContext(SecurityContext);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const security = useSecurityOrchestrator();
  return (
    <SecurityContext.Provider value={security}>
      {children}
    </SecurityContext.Provider>
  );
};

// ==============================================
// 8. EXAMPLE SECURITY DASHBOARD COMPONENT
// ==============================================

export const SecurityDashboard: React.FC = () => {
  const { securityContext, isLoading } = useSecurity();

  if (isLoading) {
    return <div>Loading Security Dashboard...</div>;
  }

  if (!securityContext || securityContext.error) {
    return <div>Error loading security data.</div>;
  }

  const { trustScore, riskLevel, reasons, location, fingerprint } = securityContext;

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg m-4 border border-gray-700">
      <h3 className="text-xl font-bold mb-4">Live Security Posture</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trust Score */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <h4 className="font-semibold text-gray-400">Device Trust Score</h4>
          <p className={`text-4xl font-bold ${trustScore > 70 ? 'text-green-400' : trustScore > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {trustScore}%
          </p>
          <p className="text-sm text-gray-500">Risk Level: <span className="font-semibold">{riskLevel}</span></p>
        </div>

        {/* Risk Factors */}
        <div className="p-4 bg-gray-700 rounded-lg">
          <h4 className="font-semibold text-gray-400">Risk Factors Detected</h4>
          {reasons.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-red-400 mt-2 space-y-1">
              {reasons.map((reason: string, i: number) => <li key={i}>{reason}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-green-400 mt-2">No significant risk factors detected.</p>
          )}
        </div>

        {/* Location Analysis */}
        <div className="p-4 bg-gray-700 rounded-lg col-span-1 md:col-span-2">
          <h4 className="font-semibold text-gray-400">Location Analysis</h4>
          <div className="text-sm mt-2 space-y-1">
            <p>IP Location: <span className="font-mono">{location.ip_coords?.city || 'N/A'}, {location.ip_coords?.country || 'N/A'}</span></p>
            <p>VPN/Proxy Detected: <span className={`font-bold ${location.is_vpn ? 'text-red-400' : 'text-green-400'}`}>{location.is_vpn ? 'Yes' : 'No'}</span></p>
            <p>Location Consistency: <span className={`font-bold ${location.consistent ? 'text-green-400' : 'text-red-400'}`}>{location.consistent ? 'Consistent' : 'Inconsistent'}</span></p>
          </div>
        </div>

        {/* Device Fingerprint */}
        <div className="p-4 bg-gray-700 rounded-lg col-span-1 md:col-span-2">
          <h4 className="font-semibold text-gray-400">Device Fingerprint</h4>
          <p className="text-xs font-mono break-all text-gray-500 mt-2">{fingerprint}</p>
        </div>
      </div>
    </div>
  );
};