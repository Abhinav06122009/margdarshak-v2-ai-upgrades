import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Sparkles, BookOpen, Brain, Shield, Check, Phone, ArrowLeft, AlertTriangle, Fingerprint, Smartphone, Globe, Clock, KeyRound, Bot, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatedText, StaggeredText } from '@/components/ui/animated-text';
import { AnimatedButton } from '@/components/ui/animated-button';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Link } from 'react-router-dom';
import logo from "@/components/logo/logo.png";
import { SecuritySentry } from '@/security/sentry';
import { startBioTracker, analyzeUserBehavior } from '@/security/biometrics';

interface AuthPageProps {
  onLogin: () => void;
}

interface BaseDeviceFingerprint {
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  userAgent: string;
  canvas: string;
  timestamp: string;
  colorDepth: number;
  deviceMemory: number | 'unknown';
  hardwareConcurrency: number | 'unknown';
  touchSupport: boolean;
}

interface DeviceFingerprint extends BaseDeviceFingerprint {
  webgl: {
    vendor: string;
    renderer: string;
  } | 'no_webgl' | 'webgl_error';
  audio: string;
  plugins: number;
}

interface UserData {
  full_name?: string;
  user_type?: string;
  phone_number?: string;
  country_code?: string;
}

const countries = [
  {"code": "IN", "name": "India", "dialCode": "+91", "flag": "🇮🇳"},
  {"code": "US", "name": "United States", "dialCode": "+1", "flag": "🇺🇸"},
  {"code": "GB", "name": "United Kingdom", "dialCode": "+44", "flag": "🇬🇧"},
  {"code": "CA", "name": "Canada", "dialCode": "+1", "flag": "🇨🇦"},
  {"code": "AU", "name": "Australia", "dialCode": "+61", "flag": "🇦🇺"},
  {"code": "DE", "name": "Germany", "dialCode": "+49", "flag": "🇩🇪"},
  {"code": "FR", "name": "France", "dialCode": "+33", "flag": "🇫🇷"},
  {"code": "JP", "name": "Japan", "dialCode": "+81", "flag": "🇯🇵"},
  {"code": "CN", "name": "China", "dialCode": "+86", "flag": "🇨🇳"},
  {"code": "BR", "name": "Brazil", "dialCode": "+55", "flag": "🇧🇷"},
  {"code": "RU", "name": "Russia", "dialCode": "+7", "flag": "🇷🇺"},
  {"code": "KR", "name": "South Korea", "dialCode": "+82", "flag": "🇰🇷"},
  {"code": "IT", "name": "Italy", "dialCode": "+39", "flag": "🇮🇹"},
  {"code": "ES", "name": "Spain", "dialCode": "+34", "flag": "🇪🇸"},
  {"code": "MX", "name": "Mexico", "dialCode": "+52", "flag": "🇲🇽"},
  {"code": "NL", "name": "Netherlands", "dialCode": "+31", "flag": "🇳🇱"},
  {"code": "SE", "name": "Sweden", "dialCode": "+46", "flag": "🇸🇪"},
  {"code": "CH", "name": "Switzerland", "dialCode": "+41", "flag": "🇨🇭"},
  {"code": "SG", "name": "Singapore", "dialCode": "+65", "flag": "🇸🇬"},
  {"code": "AE", "name": "UAE", "dialCode": "+971", "flag": "🇦🇪"},
  {"code": "SA", "name": "Saudi Arabia", "dialCode": "+966", "flag": "🇸🇦"},
  {"code": "ZA", "name": "South Africa", "dialCode": "+27", "flag": "🇿🇦"},
  {"code": "NG", "name": "Nigeria", "dialCode": "+234", "flag": "🇳🇬"},
  {"code": "EG", "name": "Egypt", "dialCode": "+20", "flag": "🇪🇬"},
  {"code": "TR", "name": "Turkey", "dialCode": "+90", "flag": "🇹🇷"},
  {"code": "PK", "name": "Pakistan", "dialCode": "+92", "flag": "🇵🇰"},
  {"code": "BD", "name": "Bangladesh", "dialCode": "+880", "flag": "🇧🇩"},
  {"code": "ID", "name": "Indonesia", "dialCode": "+62", "flag": "🇮🇩"},
  {"code": "MY", "name": "Malaysia", "dialCode": "+60", "flag": "🇲🇾"},
  {"code": "TH", "name": "Thailand", "dialCode": "+66", "flag": "🇹🇭"},
  {"code": "VN", "name": "Vietnam", "dialCode": "+84", "flag": "🇻🇳"},
  {"code": "PH", "name": "Philippines", "dialCode": "+63", "flag": "🇵🇭"},
  {"code": "AR", "name": "Argentina", "dialCode": "+54", "flag": "🇦🇷"},
  {"code": "CL", "name": "Chile", "dialCode": "+56", "flag": "🇨🇱"},
  {"code": "CO", "name": "Colombia", "dialCode": "+57", "flag": "🇨🇴"},
  {"code": "PE", "name": "Peru", "dialCode": "+51", "flag": "🇵🇪"},
  {"code": "VE", "name": "Venezuela", "dialCode": "+58", "flag": "🇻🇪"},
  {"code": "PL", "name": "Poland", "dialCode": "+48", "flag": "🇵🇱"},
  {"code": "CZ", "name": "Czech Republic", "dialCode": "+420", "flag": "🇨🇿"},
  {"code": "HU", "name": "Hungary", "dialCode": "+36", "flag": "🇭🇺"},
  {"code": "GR", "name": "Greece", "dialCode": "+30", "flag": "🇬🇷"},
  {"code": "PT", "name": "Portugal", "dialCode": "+351", "flag": "🇵🇹"},
  {"code": "NO", "name": "Norway", "dialCode": "+47", "flag": "🇳🇴"},
  {"code": "DK", "name": "Denmark", "dialCode": "+45", "flag": "🇩🇰"},
  {"code": "FI", "name": "Finland", "dialCode": "+358", "flag": "🇫🇮"},
  {"code": "AT", "name": "Austria", "dialCode": "+43", "flag": "🇦🇹"},
  {"code": "BE", "name": "Belgium", "dialCode": "+32", "flag": "🇧🇪"},
  {"code": "IE", "name": "Ireland", "dialCode": "+353", "flag": "🇮🇪"},
  {"code": "NZ", "name": "New Zealand", "dialCode": "+64", "flag": "🇳🇿"},
  {"code": "IL", "name": "Israel", "dialCode": "+972", "flag": "🇮🇱"},
  {"code": "LK", "name": "Sri Lanka", "dialCode": "+94", "flag": "🇱🇰"},
  {"code": "AF", "name": "Afghanistan", "dialCode": "+93", "flag": "🇦🇫"},
  {"code": "AL", "name": "Albania", "dialCode": "+355", "flag": "🇦🇱"},
  {"code": "DZ", "name": "Algeria", "dialCode": "+213", "flag": "🇩🇿"},
  {"code": "AD", "name": "Andorra", "dialCode": "+376", "flag": "🇦🇩"},
  {"code": "AO", "name": "Angola", "dialCode": "+244", "flag": "🇦🇴"},
  {"code": "AM", "name": "Armenia", "dialCode": "+374", "flag": "🇦🇲"},
  {"code": "AZ", "name": "Azerbaijan", "dialCode": "+994", "flag": "🇦🇿"},
  {"code": "BH", "name": "Bahrain", "dialCode": "+973", "flag": "🇧🇭"},
  {"code": "BY", "name": "Belarus", "dialCode": "+375", "flag": "🇧🇾"},
  {"code": "BZ", "name": "Belize", "dialCode": "+501", "flag": "🇧🇿"},
  {"code": "BT", "name": "Bhutan", "dialCode": "+975", "flag": "🇧🇹"},
  {"code": "BO", "name": "Bolivia", "dialCode": "+591", "flag": "🇧🇴"},
  {"code": "BA", "name": "Bosnia and Herzegovina", "dialCode": "+387", "flag": "🇧🇦"},
  {"code": "BW", "name": "Botswana", "dialCode": "+267", "flag": "🇧🇼"},
  {"code": "BN", "name": "Brunei", "dialCode": "+673", "flag": "🇧🇳"},
  {"code": "BG", "name": "Bulgaria", "dialCode": "+359", "flag": "🇧🇬"},
  {"code": "KH", "name": "Cambodia", "dialCode": "+855", "flag": "🇰🇭"},
  {"code": "CM", "name": "Cameroon", "dialCode": "+237", "flag": "🇨🇲"},
  {"code": "CV", "name": "Cape Verde", "dialCode": "+238", "flag": "🇨🇻"},
  {"code": "TD", "name": "Chad", "dialCode": "+235", "flag": "🇹🇩"},
  {"code": "CR", "name": "Costa Rica", "dialCode": "+506", "flag": "🇨🇷"},
  {"code": "HR", "name": "Croatia", "dialCode": "+385", "flag": "🇭🇷"},
  {"code": "CU", "name": "Cuba", "dialCode": "+53", "flag": "🇨🇺"},
  {"code": "CY", "name": "Cyprus", "dialCode": "+357", "flag": "🇨🇾"},
  {"code": "EC", "name": "Ecuador", "dialCode": "+593", "flag": "🇪🇨"},
  {"code": "SV", "name": "El Salvador", "dialCode": "+503", "flag": "🇸🇻"},
  {"code": "EE", "name": "Estonia", "dialCode": "+372", "flag": "🇪🇪"},
  {"code": "ET", "name": "Ethiopia", "dialCode": "+251", "flag": "🇪🇹"},
  {"code": "FJ", "name": "Fiji", "dialCode": "+679", "flag": "🇫🇯"},
  {"code": "GA", "name": "Gabon", "dialCode": "+241", "flag": "🇬🇦"},
  {"code": "GM", "name": "Gambia", "dialCode": "+220", "flag": "🇬🇲"},
  {"code": "GE", "name": "Georgia", "dialCode": "+995", "flag": "🇬🇪"},
  {"code": "GH", "name": "Ghana", "dialCode": "+233", "flag": "🇬🇭"},
  {"code": "GT", "name": "Guatemala", "dialCode": "+502", "flag": "🇬🇹"},
  {"code": "GN", "name": "Guinea", "dialCode": "+224", "flag": "🇬🇳"},
  {"code": "GY", "name": "Guyana", "dialCode": "+592", "flag": "🇬🇾"},
  {"code": "HT", "name": "Haiti", "dialCode": "+509", "flag": "🇭🇹"},
  {"code": "HN", "name": "Honduras", "dialCode": "+504", "flag": "🇭🇳"},
  {"code": "HK", "name": "Hong Kong", "dialCode": "+852", "flag": "🇭🇰"},
  {"code": "IS", "name": "Iceland", "dialCode": "+354", "flag": "🇮🇸"},
  {"code": "IR", "name": "Iran", "dialCode": "+98", "flag": "🇮🇷"},
  {"code": "IQ", "name": "Iraq", "dialCode": "+964", "flag": "🇮🇶"},
  {"code": "JM", "name": "Jamaica", "dialCode": "+1876", "flag": "🇯🇲"},
  {"code": "JO", "name": "Jordan", "dialCode": "+962", "flag": "🇯🇴"},
  {"code": "KZ", "name": "Kazakhstan", "dialCode": "+7", "flag": "🇰🇿"},
  {"code": "KE", "name": "Kenya", "dialCode": "+254", "flag": "🇰🇪"},
  {"code": "KW", "name": "Kuwait", "dialCode": "+965", "flag": "🇰🇼"},
  {"code": "KG", "name": "Kyrgyzstan", "dialCode": "+996", "flag": "🇰🇬"},
  {"code": "LA", "name": "Laos", "dialCode": "+856", "flag": "🇱🇦"},
  {"code": "LV", "name": "Latvia", "dialCode": "+371", "flag": "🇱🇻"},
  {"code": "LB", "name": "Lebanon", "dialCode": "+961", "flag": "🇱🇧"},
  {"code": "LS", "name": "Lesotho", "dialCode": "+266", "flag": "🇱🇸"},
  {"code": "LR", "name": "Liberia", "dialCode": "+231", "flag": "🇱🇷"},
  {"code": "LY", "name": "Libya", "dialCode": "+218", "flag": "🇱🇾"},
  {"code": "LT", "name": "Lithuania", "dialCode": "+370", "flag": "🇱🇹"},
  {"code": "LU", "name": "Luxembourg", "dialCode": "+352", "flag": "🇱🇺"},
  {"code": "MO", "name": "Macao", "dialCode": "+853", "flag": "🇲🇴"},
  {"code": "MK", "name": "North Macedonia", "dialCode": "+389", "flag": "🇲🇰"},
  {"code": "MG", "name": "Madagascar", "dialCode": "+261", "flag": "🇲🇬"},
  {"code": "MW", "name": "Malawi", "dialCode": "+265", "flag": "🇲🇼"},
  {"code": "MV", "name": "Maldives", "dialCode": "+960", "flag": "🇲🇻"},
  {"code": "ML", "name": "Mali", "dialCode": "+223", "flag": "🇲🇱"},
  {"code": "MT", "name": "Malta", "dialCode": "+356", "flag": "🇲🇹"},
  {"code": "MR", "name": "Mauritania", "dialCode": "+222", "flag": "🇲🇷"},
  {"code": "MU", "name": "Mauritius", "dialCode": "+230", "flag": "🇲🇺"},
  {"code": "MD", "name": "Moldova", "dialCode": "+373", "flag": "🇲🇩"},
  {"code": "MC", "name": "Monaco", "dialCode": "+377", "flag": "🇲🇨"},
  {"code": "MN", "name": "Mongolia", "dialCode": "+976", "flag": "🇲🇳"},
  {"code": "ME", "name": "Montenegro", "dialCode": "+382", "flag": "🇲🇪"},
  {"code": "MA", "name": "Morocco", "dialCode": "+212", "flag": "🇲🇦"},
  {"code": "MZ", "name": "Mozambique", "dialCode": "+258", "flag": "🇲🇿"},
  {"code": "MM", "name": "Myanmar", "dialCode": "+95", "flag": "🇲🇲"},
  {"code": "NA", "name": "Namibia", "dialCode": "+264", "flag": "🇳🇦"},
  {"code": "NP", "name": "Nepal", "dialCode": "+977", "flag": "🇳🇵"},
  {"code": "NI", "name": "Nicaragua", "dialCode": "+505", "flag": "🇳🇮"},
  {"code": "NE", "name": "Niger", "dialCode": "+227", "flag": "🇳🇪"},
  {"code": "KP", "name": "North Korea", "dialCode": "+850", "flag": "🇰🇵"},
  {"code": "OM", "name": "Oman", "dialCode": "+968", "flag": "🇴🇲"},
  {"code": "PW", "name": "Palau", "dialCode": "+680", "flag": "🇵🇼"},
  {"code": "PS", "name": "Palestine", "dialCode": "+970", "flag": "🇵🇸"},
  {"code": "PA", "name": "Panama", "dialCode": "+507", "flag": "🇵🇦"},
  {"code": "PG", "name": "Papua New Guinea", "dialCode": "+675", "flag": "🇵🇬"},
  {"code": "PY", "name": "Paraguay", "dialCode": "+595", "flag": "🇵🇾"},
  {"code": "QA", "name": "Qatar", "dialCode": "+974", "flag": "🇶🇦"},
  {"code": "RO", "name": "Romania", "dialCode": "+40", "flag": "🇷🇴"},
  {"code": "RW", "name": "Rwanda", "dialCode": "+250", "flag": "🇷🇼"},
  {"code": "WS", "name": "Samoa", "dialCode": "+685", "flag": "🇼🇸"},
  {"code": "SM", "name": "San Marino", "dialCode": "+378", "flag": "🇸🇲"},
  {"code": "SN", "name": "Senegal", "dialCode": "+221", "flag": "🇸🇳"},
  {"code": "RS", "name": "Serbia", "dialCode": "+381", "flag": "🇷🇸"},
  {"code": "SC", "name": "Seychelles", "dialCode": "+248", "flag": "🇸🇨"},
  {"code": "SL", "name": "Sierra Leone", "dialCode": "+232", "flag": "🇸🇱"},
  {"code": "SK", "name": "Slovakia", "dialCode": "+421", "flag": "🇸🇰"},
  {"code": "SI", "name": "Slovenia", "dialCode": "+386", "flag": "🇸🇮"},
  {"code": "SB", "name": "Solomon Islands", "dialCode": "+677", "flag": "🇸🇧"},
  {"code": "SO", "name": "Somalia", "dialCode": "+252", "flag": "🇸🇴"},
  {"code": "SS", "name": "South Sudan", "dialCode": "+211", "flag": "🇸🇸"},
  {"code": "SD", "name": "Sudan", "dialCode": "+249", "flag": "🇸🇩"},
  {"code": "SR", "name": "Suriname", "dialCode": "+597", "flag": "🇸🇷"},
  {"code": "SZ", "name": "Swaziland", "dialCode": "+268", "flag": "🇸🇿"},
  {"code": "SY", "name": "Syria", "dialCode": "+963", "flag": "🇸🇾"},
  {"code": "TW", "name": "Taiwan", "dialCode": "+886", "flag": "🇹🇼"},
  {"code": "TJ", "name": "Tajikistan", "dialCode": "+992", "flag": "🇹🇯"},
  {"code": "TZ", "name": "Tanzania", "dialCode": "+255", "flag": "🇹🇿"},
  {"code": "TG", "name": "Togo", "dialCode": "+228", "flag": "🇹🇬"},
  {"code": "TO", "name": "Tonga", "dialCode": "+676", "flag": "🇹🇴"},
  {"code": "TT", "name": "Trinidad and Tobago", "dialCode": "+1868", "flag": "🇹🇹"},
  {"code": "TN", "name": "Tunisia", "dialCode": "+216", "flag": "🇹🇳"},
  {"code": "TM", "name": "Turkmenistan", "dialCode": "+993", "flag": "🇹🇲"},
  {"code": "TV", "name": "Tuvalu", "dialCode": "+688", "flag": "🇹🇻"},
  {"code": "UG", "name": "Uganda", "dialCode": "+256", "flag": "🇺🇬"},
  {"code": "UA", "name": "Ukraine", "dialCode": "+380", "flag": "🇺🇦"},
  {"code": "UY", "name": "Uruguay", "dialCode": "+598", "flag": "🇺🇾"},
  {"code": "UZ", "name": "Uzbekistan", "dialCode": "+998", "flag": "🇺🇿"},
  {"code": "VU", "name": "Vanuatu", "dialCode": "+678", "flag": "🇻🇺"},
  {"code": "VA", "name": "Vatican City", "dialCode": "+379", "flag": "🇻🇦"},
  {"code": "YE", "name": "Yemen", "dialCode": "+967", "flag": "🇾🇪"},
  {"code": "ZM", "name": "Zambia", "dialCode": "+260", "flag": "🇿🇲"},
  {"code": "ZW", "name": "Zimbabwe", "dialCode": "+263", "flag": "🇿🇼"}
];


const advancedSecurity = {
  getWebGLFingerprint: () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no_webgl';
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'no_webgl_debug';
      return {
        vendor: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      };
    } catch (e) {
      return 'webgl_error';
    }
  },

  getAudioFingerprint: async () => {
    try {
      const audioContext = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
      if (!audioContext) return 'no_audio_context';
      const context = new audioContext(1, 44100, 44100);
      const oscillator = context.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, context.currentTime);
      const compressor = context.createDynamicsCompressor();
      const properties: [keyof DynamicsCompressorNode, number][] = [['threshold', -50], ['knee', 40], ['ratio', 12], ['reduction', -20], ['attack', 0], ['release', 0.25]];
      properties.forEach(
        (item) => {
          const prop = compressor[item[0]];
          if (prop && typeof prop.setValueAtTime === 'function') {
            prop.setValueAtTime(item[1], context.currentTime);
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
  },

  enhanceDeviceFingerprint: async (baseFingerprint: BaseDeviceFingerprint) => {
    const [webgl, audio] = await Promise.all([
      advancedSecurity.getWebGLFingerprint(),
      advancedSecurity.getAudioFingerprint(),
    ]);
    return { ...baseFingerprint, webgl, audio, plugins: navigator.plugins.length };
  },

  calculateDeviceTrustScore: (fingerprint: DeviceFingerprint) => {
    let score = 100;
    const heuristics = {
      'no_webgl': -20,
      'webgl_error': -10,
      'no_audio_context': -15,
      'audio_context_error': -10,
      'Tor': -40,
      'Headless': -50,
    };

    if (fingerprint.userAgent.includes('Tor')) score += heuristics['Tor'];
    if (fingerprint.userAgent.includes('Headless')) score += heuristics['Headless'];
    if (fingerprint.webgl === 'no_webgl') score += heuristics['no_webgl'];
    if (fingerprint.webgl === 'webgl_error') score += heuristics['webgl_error'];
    if (fingerprint.audio === 'no_audio_context') score += heuristics['no_audio_context'];
    if (fingerprint.audio === 'audio_context_error') score += heuristics['audio_context_error'];
    if (navigator.webdriver) score -= 50;

    return Math.max(0, score);
  },

  checkForAnomalies: (currentFingerprint: DeviceFingerprint, previousFingerprint: DeviceFingerprint) => {
    if (!previousFingerprint) return [];
    const anomalies = [];
    if (currentFingerprint.timezone !== previousFingerprint.timezone) {
      anomalies.push(`Timezone changed from ${previousFingerprint.timezone} to ${currentFingerprint.timezone}`);
    }
    if (currentFingerprint.language !== previousFingerprint.language) {
      anomalies.push(`Language changed from ${previousFingerprint.language} to ${currentFingerprint.language}`);
    }
    if (currentFingerprint.platform !== previousFingerprint.platform) {
      anomalies.push(`Platform changed from ${previousFingerprint.platform} to ${currentFingerprint.platform}`);
    }
    return anomalies;
  },
  
  useBehavioralAnalysis: () => {
    const [isBehaviorNormal, setIsBehaviorNormal] = useState(true);    
    const [typingSpeed, setTypingSpeed] = useState(0);
    const lastActivity = useRef(Date.now());
    const keyPressCount = useRef(0);
    const lastKeyPressTime = useRef(Date.now());

    const handleActivity = useCallback(() => {
      lastActivity.current = Date.now();
      if (!isBehaviorNormal) setIsBehaviorNormal(true);
    }, [isBehaviorNormal]);

    const handleKeyDown = useCallback(() => {
      const now = Date.now();
      if (keyPressCount.current > 0) {
        setTypingSpeed(keyPressCount.current / ((now - lastKeyPressTime.current) / 1000));
      }
      keyPressCount.current += 1;
      lastKeyPressTime.current = now;
      handleActivity();
    }, [handleActivity]);

    useEffect(() => {
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('scroll', handleActivity);

      const interval = setInterval(() => {
        if (Date.now() - lastActivity.current > 60000) { 
          if (isBehaviorNormal) {
            setIsBehaviorNormal(false);
            securityFeatures.logSecurityEvent('behavioral_anomaly_detected', { type: 'inactivity' });
          }
        }
      }, 10000); 

      return () => {
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('scroll', handleActivity);
        clearInterval(interval);
      };
    }, [handleActivity, handleKeyDown, isBehaviorNormal]);

    return { isBehaviorNormal, typingSpeed };
  }
};

const securityFeatures = {

  generateDeviceFingerprint: async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const baseFingerprint = {
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent.substring(0, 100),
      canvas: canvas.toDataURL().substring(0, 50),
      timestamp: new Date().toISOString(),
      colorDepth: screen.colorDepth,
      deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      touchSupport: 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0,
    };

    return advancedSecurity.enhanceDeviceFingerprint(baseFingerprint);
  },

  checkRateLimit: (email: string) => {
    const attempts = localStorage.getItem(`auth_attempts_${email}`);
    const lastAttempt = localStorage.getItem(`last_attempt_${email}`);
    
    if (attempts && parseInt(attempts) >= 5) {
      const timeDiff = Date.now() - parseInt(lastAttempt || '0');
      const lockTime = 0 * 60 * 1000;
      if (timeDiff < lockTime) {
        const remaining = lockTime - timeDiff;
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.ceil((remaining % 60000) / 1000);
        const remainingTime = minutes > 0 ? `${minutes} minute(s) and ${seconds} second(s)` : `${seconds} second(s)`;
        return { allowed: false, remainingTime };
      } else { 
        localStorage.removeItem(`auth_attempts_${email}`);
        localStorage.removeItem(`last_attempt_${email}`);
      }
    }
    
    return { allowed: true };
  },

  logSecurityEvent: async (event: string, data: unknown) => {
    try {
      let fingerprint;
      try {
        fingerprint = await securityFeatures.generateDeviceFingerprint();
      } catch (fpError) {
        console.error("Advanced fingerprinting failed, falling back to basic.", fpError);
        fingerprint = { userAgent: navigator.userAgent, timestamp: new Date().toISOString() };
      }

      const { error } = await supabase.functions.invoke('log-security-event', {
        body: {
          event,
          deviceFingerprint: fingerprint,
          data,
        },
      });

      if (error) {
        console.error(`Failed to log security event '${event}':`, error.message);
      }
    } catch (e: unknown) {
      console.error('An unexpected error occurred while trying to log a security event:', e.message);
    }
  },

  checkPasswordStrength: (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommon: !['password', '123456', 'qwerty', 'admin'].includes(password.toLowerCase())
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return { score, checks, strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong' };
  }
};

import { User } from '@supabase/supabase-js';
const createSecureUserProfile = async (user: User, userData?: UserData) => {
  try {
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, security_settings')
      .eq('id', user.id)
      .single();
    
    const fingerprint = await securityFeatures.generateDeviceFingerprint();

    if (checkError && checkError.code === 'PGRST116') { 
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: userData?.full_name || user.user_metadata?.full_name || user.email.split('@')[0],
          user_type: userData?.user_type || 'student',
          phone_number: userData?.phone_number || null,
          country_code: userData?.country_code || null,
          security_settings: {
            two_factor_enabled: !!(userData?.phone_number),
            login_notifications: true,
            device_fingerprints: [fingerprint],
            created_at: new Date().toISOString()
          }
        });
      if (createError) throw createError;
      
      securityFeatures.logSecurityEvent('profile_created', {
        userId: user.id,
        email: user.email,
        userType: userData?.user_type
      });
    } else if (existingProfile) { 
      const anomalies = advancedSecurity.checkForAnomalies(fingerprint, existingProfile.security_settings?.device_fingerprints?.[0]);
      if (anomalies.length > 0) {
        securityFeatures.logSecurityEvent('login_anomaly_detected', { userId: user.id, anomalies });
      }
      
      const updatedFingerprints = [fingerprint, ...(existingProfile.security_settings?.device_fingerprints || [])].slice(0, 5);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ security_settings: { ...existingProfile.security_settings, device_fingerprints: updatedFingerprints } })
        .eq('id', user.id);
      if (updateError) throw updateError;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

const handleMfaSignIn = async (user: User) => {
  const profileData = await secureAuth.getCurrentUser();
  const userPhoneNumber = profileData?.profile?.phone_number;
  const userCountryCode = profileData?.profile?.country_code;

  if (user && userPhoneNumber && userCountryCode) {
    const dialCode = countries.find(c => c.code === userCountryCode)?.dialCode;
    if (dialCode) {
      const fullPhoneNumber = `${dialCode}${userPhoneNumber}`;
      await secureAuth.sendPhoneOtp(fullPhoneNumber);
      return { mfaRequired: true, fullPhoneNumber };
    }
  }
  return { mfaRequired: false };
};



const secureAuth: { [key: string]: (...args: any[]) => Promise<any> } = {
  signUp: async (email: string, password: string, userData?: UserData) => {
    const rateLimitCheck = securityFeatures.checkRateLimit(email);
    if (!rateLimitCheck.allowed) {
      throw new Error(`Too many attempts. Please try again in ${rateLimitCheck.remainingTime} minutes.`);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData?.full_name,
          user_type: userData?.user_type || 'student',
          phone_number: userData?.phone_number,
          country_code: userData?.country_code,
          security_metadata: await securityFeatures.generateDeviceFingerprint()
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (error) {
      const attempts = parseInt(localStorage.getItem(`auth_attempts_${email}`) || '0') + 1;
      localStorage.setItem(`auth_attempts_${email}`, attempts.toString());
      localStorage.setItem(`last_attempt_${email}`, Date.now().toString());
      securityFeatures.logSecurityEvent('signup_failed', { email, error: error.message });
      throw error;
    }
    
    if (data.user) {
      await createSecureUserProfile(data.user, userData);
      securityFeatures.logSecurityEvent('signup_success', { email, userId: data.user.id });
      localStorage.removeItem(`auth_attempts_${email}`);
      localStorage.removeItem(`last_attempt_${email}`);
    }
    
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const rateLimitCheck = securityFeatures.checkRateLimit(email);
    if (!rateLimitCheck.allowed) {
      throw new Error(`Too many attempts. Please try again in ${rateLimitCheck.remainingTime} minutes.`);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      const attempts = parseInt(localStorage.getItem(`auth_attempts_${email}`) || '0') + 1;
      localStorage.setItem(`auth_attempts_${email}`, attempts.toString());
      localStorage.setItem(`last_attempt_${email}`, Date.now().toString());
      securityFeatures.logSecurityEvent('signin_failed', { email, error: error.message });
      throw error;
    }
    
    if (data.user) {
      await createSecureUserProfile(data.user);
      securityFeatures.logSecurityEvent('signin_success', { email, userId: data.user.id });
      localStorage.removeItem(`auth_attempts_${email}`);
      localStorage.removeItem(`last_attempt_${email}`);
    }
    
    return { data, error };
  },

  signInWithGoogle: async () => {
    securityFeatures.logSecurityEvent('google_signin_attempt', {});
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
    if (error) securityFeatures.logSecurityEvent('google_signin_failed', { error: error.message });
    return { data, error };
  },

  resetPassword: async (email: string) => {
    securityFeatures.logSecurityEvent('password_reset_requested', { email });
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  },

  updatePassword: async (newPassword: string) => {
    const strength = securityFeatures.checkPasswordStrength(newPassword);
    if (strength.score < 4) throw new Error('Password is too weak.');
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    securityFeatures.logSecurityEvent('password_updated', {});
    return { data, error };
  },

  signInWithGitHub: async () => {
    securityFeatures.logSecurityEvent('github_signin_attempt', {});
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) securityFeatures.logSecurityEvent('github_signin_failed', { error: error.message });
    return { data, error };
  },

  signInWithMagicLink: async (email: string) => {
    securityFeatures.logSecurityEvent('magic_link_requested', { email });
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) securityFeatures.logSecurityEvent('magic_link_failed', { email, error: error.message });
    return { data, error };
  },

  sendPhoneOtp: async (phone: string) => {
    securityFeatures.logSecurityEvent('mfa_otp_sent_attempt', { phone });
    return await supabase.auth.signInWithOtp({ phone });
  },

  verifyPhoneOtp: async (phone: string, token: string) => {
    securityFeatures.logSecurityEvent('mfa_otp_verify_attempt', { phone });
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) {
      securityFeatures.logSecurityEvent('mfa_otp_verify_failed', { phone, error: error.message });
      throw error;
    }
    securityFeatures.logSecurityEvent('mfa_otp_verify_success', { phone });
    return { data, error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) return null;
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code === 'PGRST116') {
        await createSecureUserProfile(user);
        const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        return { user, profile: newProfile };
      }
      return { user, profile };
    } catch (err) {
      return { user, profile: null };
    }
  }
};

secureAuth.signInWithBiometrics = async () => {
  if (!navigator.credentials || !navigator.credentials.get) {
    throw new Error('Biometric authentication is not supported on this browser.');
  }

  try {
    securityFeatures.logSecurityEvent('biometric_signin_attempt', {});

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'preferred',
      },
    });

    if (!credential) {
      throw new Error('Biometric authentication failed or was canceled.');
    }

    securityFeatures.logSecurityEvent('biometric_signin_success', { credentialId: credential.id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      securityFeatures.logSecurityEvent('biometric_signin_failed', { error: error.message });
      throw error;
    }
  }
};


const GoogleLogo = () => ( <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> );
const GitHubLogo = () => ( <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg> );
const TwitterLogo = () => ( <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> );
const FacebookLogo = () => ( <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/></svg> );

interface PasswordStrength { score: number; strength: 'weak' | 'medium' | 'strong'; checks: { length?: boolean; uppercase?: boolean; lowercase?: boolean; numbers?: boolean; special?: boolean; noCommon?: boolean; };}
interface FloatingLabelInputProps { id: string; label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; icon?: React.ReactNode; error?: string; required?: boolean; autoComplete?: string; children?: React.ReactNode; className?: string; }

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({ id, label, type, value, onChange, icon, error, required = false, autoComplete, children, className = '' }) => {
  return (
    <div className={`relative group ${className}`}>
      {icon && ( <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 peer-focus:text-indigo-400 z-10"> {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-white/50 peer-focus:text-indigo-400" })} </div> )}
      <input id={id} type={type} value={value} onChange={onChange} placeholder=" " className={`peer w-full py-4 bg-white/10 border-2 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-0 transition-all duration-300 ${icon ? 'pl-12' : 'px-4'} ${children ? 'pr-12' : 'pr-4'} ${error ? 'border-red-500/70 focus:border-red-500' : 'border-white/20 focus:border-indigo-500'}`} required={required} autoComplete={autoComplete} />
      <label htmlFor={id} className={`absolute top-4 text-white/60 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs bg-black/80 backdrop-blur-sm px-1 rounded-md ${icon ? 'left-12 peer-focus:left-10 peer-[:not(:placeholder-shown)]:left-10' : 'left-4 peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3'} ${error ? 'text-red-400 peer-focus:text-red-400' : 'peer-focus:text-indigo-400'}`}> {label} </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1 ml-2 animate-fade-in-fast">{error}</p>}
    </div>
  );
};

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('IN');
  const [userType, setUserType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, strength: 'weak', checks: {} });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [authStep, setAuthStep] = useState<'credentials' | 'mfa' | 'success'>('credentials');
  const [mfaPhoneNumber, setMfaPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [deviceTrustScore, setDeviceTrustScore] = useState(100);  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const { isBehaviorNormal } = advancedSecurity.useBehavioralAnalysis();

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-200, 200], [10, -10]);
  const rotateY = useTransform(x, [-200, 200], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Start tracking mouse/keyboard patterns immediately
    startBioTracker();

    const initSecurity = async () => {
      // 2. Run the Sentry Check
      const report = await SecuritySentry.performSecurityScan();
      
      // 3. (Optional) Log the result to your console or state
      console.log("🛡️ Security Status:", report.riskLevel);
      
      if (report.riskLevel === 'CRITICAL') {
         // You can disable the login button here if you want
         toast({ title: "Security Alert", description: "Unusual traffic detected.", variant: "destructive" });
      }
    };

    initSecurity();
}, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [countryDropdownRef]);

  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.dialCode.includes(countrySearch)
  );

  useEffect(() => {
    setMounted(true);
    const checkBiometricSupport = async () => {
      if (window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
        setIsBiometricSupported(true);
      }
    };
    checkBiometricSupport();
    const verifySecuritySetup = async () => {
      try {
        const fingerprint = await securityFeatures.generateDeviceFingerprint();
        const score = advancedSecurity.calculateDeviceTrustScore(fingerprint);
        setDeviceTrustScore(score);
        if (score < 40) {
          securityFeatures.logSecurityEvent('suspicious_device_detected', { trustScore: score, action: 'monitoring' });
        }
        
        await supabase.from('profiles').select('count').single();
        setSecurityVerified(true);
        securityFeatures.logSecurityEvent('auth_page_loaded', { trustScore: score });
      } catch {
        setSecurityVerified(true);
      }
    };
    verifySecuritySetup();

    const urlHash = window.location.hash;
    if (urlHash.includes('type=recovery')) setIsPasswordReset(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordReset(true);
          toast({ title: "Password Reset", description: "Please enter your new password." });
        }
        if (event === 'SIGNED_IN' && session?.user && !isPasswordReset && authStep !== 'mfa') {
          const { mfaRequired } = await handleMfaSignIn(session.user);
          if (!mfaRequired) {
            const userData = await secureAuth.getCurrentUser();
            if (userData?.user) {
              toast({ title: "🎉 Authentication Successful", description: `Welcome back, ${userData.profile?.full_name || userData.user.email}!` });
              onLogin();
            }
          }
        }
        if (event === 'SIGNED_OUT') {
          securityFeatures.logSecurityEvent('user_signed_out', {});
          toast({ title: "🔒 Signed Out Securely", description: "Your session has been safely terminated." });
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && !isPasswordReset) {
        const userData = await secureAuth.getCurrentUser();
        if (userData?.user) onLogin();
      }
    });

    return () => subscription.unsubscribe();
  }, [onLogin, toast, isPasswordReset, authStep]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email";
    if (isLogin) {
      if (!password.trim()) newErrors.password = "Password is required";
    } else {
      if (!firstName.trim()) newErrors.firstName = "First name is required";
      if (!lastName.trim()) newErrors.lastName = "Last name is required";
      if (honeypot) { securityFeatures.logSecurityEvent('honeypot_triggered', { email }); return false; }
      if (!termsAccepted) newErrors.terms = "You must accept the Terms & Conditions";
      const strength = securityFeatures.checkPasswordStrength(password);
      if (strength.score < 4) {
        const { checks } = strength;
        if (!checks.length) newErrors.password = "Password must be at least 8 characters.";
        else if (!checks.uppercase) newErrors.password = "Password must contain an uppercase letter.";
        else if (!checks.lowercase) newErrors.password = "Password must contain a lowercase letter.";
        else if (!checks.numbers) newErrors.password = "Password must contain a number.";
        else if (!checks.special) newErrors.password = "Password must contain a special character.";
        else newErrors.password = "Password is too weak. Please choose a stronger one.";
      }
      if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
      if (phoneNumber && phoneNumber.length < 8) newErrors.phoneNumber = "Please enter a valid phone number";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast({ title: "Validation Error", description: Object.values(newErrors)[0], variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSendOtp = async (fullPhoneNumber: string) => {
    setLoading(true);
    try {
      await secureAuth.sendPhoneOtp(fullPhoneNumber);
      toast({
        title: "📱 OTP Sent",
        description: `A verification code has been sent to ${fullPhoneNumber}.`,
      });
      setAuthStep('mfa');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ title: "❌ OTP Send Failed", description: error.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      let authResult;

      if (isLogin) {
        authResult = await secureAuth.signIn(email, password);
      } else {
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        authResult = await secureAuth.signUp(email, password, {
          full_name: fullName, user_type: userType, phone_number: phoneNumber, country_code: countryCode
        });
        if (authResult.data.user) {
          setSignupSuccess(true);
          toast({ title: "🚀 Account Created!", description: "Please check your email for verification." });          
        }
      }
      if (isLogin && authResult.data.user) {
        const { mfaRequired, fullPhoneNumber, profileExists } = await handleMfaSignIn(authResult.data.user);
        const forceMfa = deviceTrustScore < 50;

        if ((mfaRequired || (forceMfa && profileExists)) && fullPhoneNumber) {
          if (forceMfa && !mfaRequired) {
            toast({
              title: "Enhanced Security Check",
              description: "Due to unusual activity, we're requiring an extra verification step.",
              variant: "default",
              duration: 6000,
            });
          }
          setMfaPhoneNumber(fullPhoneNumber);
          setAuthStep('mfa');
        } else { onLogin(); }
      } else if (authResult.data.user && !isLogin) {
        setTimeout(() => {
          setSignupSuccess(false);
          setIsLogin(true);
        }, 5000);
      } else if (authResult.data.user) {
        onLogin();
      }
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        if (error.message?.includes('Invalid login credentials')) errorMessage = "Invalid email or password.";
        else if (error.message?.includes('Email not confirmed')) errorMessage = "Your email is not confirmed. Please check your inbox for a verification link.";
        else if (error.message?.includes('User already registered')) errorMessage = "An account with this email already exists. Please sign in or use 'Forgot Password'.";
        else if (error.message) errorMessage = error.message;
      }
      toast({ title: isLogin ? "Login Failed" : "Signup Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => { setLoading(true); try { await secureAuth.signInWithGoogle(); toast({ title: "🔄 Redirecting to Google", description: "Securely redirecting..." }); } catch (error: unknown) { if (error instanceof Error) { toast({ title: "❌ Google Sign-In Failed", description: error.message, variant: "destructive" }); } } finally { setLoading(false); } };
  const handleGitHubSignIn = async () => { setLoading(true); try { await secureAuth.signInWithGitHub(); toast({ title: "🔄 Redirecting to GitHub", description: "Securely redirecting..." }); } catch (error: unknown) { if (error instanceof Error) { toast({ title: "❌ GitHub Sign-In Failed", description: error.message, variant: "destructive" }); } } finally { setLoading(false); } };
  const handleBiometricSignIn = async () => { setLoading(true); try { await secureAuth.signInWithBiometrics(); toast({ title: "Biometric Scan Successful", description: "Verifying your identity..." }); onLogin(); } catch (error: unknown) { if (error instanceof Error) { toast({ title: "Biometric Sign-In Failed", icon: <Fingerprint className="w-5 h-5 text-red-400" />, description: error.message, variant: "destructive" }); } } finally { setLoading(false); } };
  const handleMagicLink = async () => { if (!email.trim()) { toast({ title: "Validation Error", description: "Please enter your email address.", variant: "destructive" }); return; } setLoading(true); try { await secureAuth.signInWithMagicLink(email); toast({ title: "✨ Magic Link Sent!", description: "Check your email for a secure sign-in link." }); } catch (error: unknown) { if (error instanceof Error) { toast({ title: "❌ Magic Link Failed", description: error.message, variant: "destructive" }); } } finally { setLoading(false); } };
  const handleForgotPassword = async (e: React.FormEvent) => { e.preventDefault(); if (!forgotPasswordEmail.trim()) { toast({ title: "Validation Error", description: "Email is required", variant: "destructive" }); return; } setLoading(true); try { await secureAuth.resetPassword(forgotPasswordEmail); toast({ title: "📧 Password Reset Email Sent", description: "Check your email for reset instructions." }); setShowForgotPassword(false); setForgotPasswordEmail(''); } catch (error: unknown) { if (error instanceof Error) { toast({ title: "❌ Reset Failed", description: error.message, variant: "destructive" }); } } finally { setLoading(false); } };
  const handlePasswordReset = async (e: React.FormEvent) => { e.preventDefault(); const strength = securityFeatures.checkPasswordStrength(password); if (!password.trim() || strength.score < 4) { toast({ title: "Security Error", description: "Password must meet all security requirements.", variant: "destructive" }); return; } if (password !== confirmPassword) { toast({ title: "Validation Error", description: "Passwords do not match", variant: "destructive" }); return; } setLoading(true); try { await secureAuth.updatePassword(password); toast({ title: "✅ Password Updated!", description: "You can now sign in with your new secure password." }); setIsPasswordReset(false); setPassword(''); setConfirmPassword(''); window.history.replaceState({}, document.title, window.location.pathname); } catch (error: unknown) { if (error instanceof Error) { toast({ title: "❌ Update Failed", description: error.message, variant: "destructive" }); } } finally { setLoading(false); } };
  
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({ title: "Validation Error", description: "Please enter a valid 6-digit OTP.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await secureAuth.verifyPhoneOtp(mfaPhoneNumber, otp);
      toast({ title: "✅ Verification Successful!", description: "Your device has been verified. Welcome!" });
      onLogin();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ title: "❌ OTP Verification Failed", description: "Invalid or expired code. Please try again.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (password) setPasswordStrength(securityFeatures.checkPasswordStrength(password)); }, [password]);

  if (!mounted || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
            <Shield className="w-8 h-8 text-green-400 animate-pulse" />
          </div>
          <p className="text-white mb-2">Initializing Zero-Trust Security Framework...</p>
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <Cpu className="w-4 h-4" />
            <span className="text-sm">AI Threat Detection Engine Active</span>
          </div>
        </div>
      </div>
    );
  }

  if (authStep === 'mfa') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden particle-bg">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <KeyRound className="w-12 h-12 text-blue-400" />
          </div>
            <h2 className="text-3xl font-bold text-white mb-2">Multi-Factor Authentication</h2>
            <p className="text-white/70">A 6-digit code was sent to your phone for enhanced security.</p>
          </div>
          <AnimatedCard variant="glass" className="p-8 shadow-2xl border border-white/20 backdrop-blur-2xl">
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label htmlFor="otp" className="sr-only">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="------"
                  className="w-full tracking-[1.5em] text-center text-2xl font-mono py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                  autoComplete="one-time-code"
                />
              </div>
              <AnimatedButton type="submit" disabled={loading} variant="gradient" className="w-full py-4 rounded-xl font-semibold">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "🔐 Verify & Sign In"}
              </AnimatedButton>
              <div className="text-center">
                <button type="button" onClick={() => handleSendOtp(mfaPhoneNumber)} disabled={loading} className="text-sm text-white/60 hover:text-white">Resend Code</button>
              </div>
            </form>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden particle-bg">
        <div className="w-full max-w-md relative z-10">
          <AnimatedCard variant="glass" className="p-8 shadow-2xl border border-white/20 backdrop-blur-xl text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><Check className="w-10 h-10 text-white" /></div>
            <h2 className="text-3xl font-bold text-white mb-4">🎉 Signup Completed!</h2>
            <div className="space-y-4 text-white/80 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-blue-500/20 rounded-lg"><Mail className="w-5 h-5 text-blue-400" /><span>Verification email sent to your inbox</span></div>
              <div className="flex items-center space-x-3 p-3 bg-green-500/20 rounded-lg"><Shield className="w-5 h-5 text-green-400" /><span>Account secured with Zero-Trust protocol</span></div>
              <div className="flex items-center space-x-3 p-3 bg-purple-500/20 rounded-lg"><Cpu className="w-5 h-5 text-purple-400" /><span>AI-powered threat detection enabled</span></div>
            </div>
            <p className="text-white/60 text-sm mb-6">Please check your email to activate your account. You will be redirected shortly.</p>
            <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div></div>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  if (isPasswordReset) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden particle-bg">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8"><Shield className="w-12 h-12 text-green-400 mx-auto mb-4" /><h2 className="text-3xl font-bold text-white mb-2">🔒 Reset Password</h2><p className="text-white/70">Create a new secure password</p></div>
          <AnimatedCard variant="glass" className="p-8 shadow-2xl border border-white/20 backdrop-blur-2xl">
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <FloatingLabelInput id="password" label="New Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock />} required autoComplete="new-password">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center">{showPassword ? <EyeOff className="h-5 w-5 text-white/50" /> : <Eye className="h-5 w-5 text-white/50" />}</button>
              </FloatingLabelInput>
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white/10 rounded-full h-2"><div className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.strength === 'weak' ? 'bg-red-500 w-1/4' : passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/4' : 'bg-green-500 w-full'}`} /></div>
                    <span className={`text-sm ${passwordStrength.strength === 'weak' ? 'text-red-400' : passwordStrength.strength === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{passwordStrength.strength.toUpperCase()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/60">
                    <div className={`flex items-center space-x-2 transition-colors ${passwordStrength.checks.length ? 'text-green-400' : 'text-white/50'}`}><Check size={14} /><span>8+ characters</span></div>
                    <div className={`flex items-center space-x-2 transition-colors ${passwordStrength.checks.uppercase ? 'text-green-400' : 'text-white/50'}`}><Check size={14} /><span>Uppercase</span></div>
                    <div className={`flex items-center space-x-2 transition-colors ${passwordStrength.checks.lowercase ? 'text-green-400' : 'text-white/50'}`}><Check size={14} /><span>Lowercase</span></div>
                    <div className={`flex items-center space-x-2 transition-colors ${passwordStrength.checks.numbers ? 'text-green-400' : 'text-white/50'}`}><Check size={14} /><span>Number</span></div>
                    <div className={`flex items-center space-x-2 transition-colors ${passwordStrength.checks.special ? 'text-green-400' : 'text-white/50'}`}><Check size={14} /><span>Special character</span></div>
                  </div>
                </div>
              )}
              <FloatingLabelInput id="confirmPassword" label="Confirm New Password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} icon={<Lock />} required autoComplete="new-password">
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center">{showConfirmPassword ? <EyeOff className="h-5 w-5 text-white/50" /> : <Eye className="h-5 w-5 text-white/50" />}</button>
              </FloatingLabelInput>
              <AnimatedButton type="submit" disabled={loading || passwordStrength.score < 4} variant="gradient" className="w-full py-4 rounded-xl font-semibold">{loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "🔒 Update Password"}</AnimatedButton>
            </form>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden particle-bg">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8"><button onClick={() => setShowForgotPassword(false)} className="inline-flex items-center text-white/70 hover:text-white mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Login</button><h2 className="text-3xl font-bold text-white mb-2">🔐 Forgot Password?</h2><p className="text-white/70">Enter your email to receive secure reset instructions</p></div>
          <AnimatedCard variant="glass" className="p-8 shadow-2xl border border-white/20 backdrop-blur-2xl">
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <FloatingLabelInput id="forgot-email" label="Email Address" type="email" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} icon={<Mail />} required autoComplete="email" />
              <AnimatedButton type="submit" disabled={loading} variant="gradient" className="w-full py-4 rounded-xl font-semibold">{loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "📧 Send Reset Email"}</AnimatedButton>
            </form>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden particle-bg" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} ref={containerRef}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => ( <motion.div key={i} className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-50 shadow-[0_0_12px_3px] shadow-purple-400/50" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `particle-float ${6 + Math.random() * 8}s ease-in-out infinite`, animationDelay: `${Math.random() * 5}s`, }} /> ))}
      </div>

      <motion.div className="w-full max-w-md relative z-10" style={{ perspective: '1200px', rotateX, rotateY }}>
        <div className="flex flex-col items-center justify-center gap-4 mb-6 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl transform hover:rotate-[-12deg] hover:scale-110 transition-all duration-300"><img src={logo} alt="MARGDARSHAK Logo" className="w-16 h-16 object-contain" draggable={false} /></div>
          <div className="flex flex-col text-center">
            <AnimatedText text="MARGDARSHAK" className="text-4xl sm:text-5xl font-black text-white tracking-tight bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-xl" animation="typing" gradient={true} />
            <StaggeredText text="YOUR WAY TO SUCCESS" className="text-purple-200 text-sm mt-1 tracking-widest" staggerDelay={100} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-center">
          <div className="p-2 bg-green-500/20 border border-green-400/30 rounded-lg">
            <p className="text-xs text-green-300/80">Device Trust Score</p>
            <p className="text-lg font-bold text-green-300">{deviceTrustScore}</p>
          </div>
          <div className={`p-2 bg-white/10 border ${isBehaviorNormal ? 'border-blue-400/30' : 'border-yellow-400/50'} rounded-lg`}>
            <p className="text-xs text-white/60">Behavioral Analysis</p>
            <p className={`text-lg font-bold ${isBehaviorNormal ? 'text-blue-300' : 'text-yellow-300 animate-pulse'}`}>{isBehaviorNormal ? 'Nominal' : 'Anomaly'}</p>
          </div>
        </div>

        <AnimatedCard variant="glass" animation="zoom-in" hover="none" className="p-8 shadow-2xl border border-white/20 backdrop-blur-2xl">
          <div className="flex mb-8 bg-black/20 rounded-2xl p-1.5 animate-slide-up shadow-inner-soft" >
            <AnimatedButton onClick={() => { setIsLogin(true); setErrors({}); }} variant={isLogin ? "gradient" : "ghost"} className={`flex-1 py-3 px-4 rounded-xl font-bold text-lg transition-all duration-300 ${!isLogin && 'text-white/60'}`} ripple={true}>🔐 Sign in</AnimatedButton>
            <AnimatedButton onClick={() => { setIsLogin(false); setErrors({}); }} variant={!isLogin ? "gradient" : "ghost"} className={`flex-1 py-3 px-4 rounded-xl font-bold text-lg transition-all duration-300 ${isLogin && 'text-white/60'}`} ripple={true}>🚀 Sign up</AnimatedButton>
          </div>

          <div className="text-center mb-8"><h2 className="text-3xl font-extrabold text-white">{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2><p className="text-white/60 mt-2">{isLogin ? 'Securely access your dashboard.' : 'Join us and start your journey.'}</p></div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && <div className="absolute opacity-0 h-0 w-0"><label htmlFor="bot-check">Do not fill</label><input id="bot-check" type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" /></div>}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 animate-slide-down">
                <FloatingLabelInput id="firstName" label="First Name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} required autoComplete="given-name" />
                <FloatingLabelInput id="lastName" label="Last Name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} required autoComplete="family-name" />
              </div>
            )}
            <FloatingLabelInput id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail />} error={errors.email} required autoComplete="email" className="animate-slide-up" />
            {!isLogin && (
              <div className="relative animate-slide-down" ref={countryDropdownRef}>
                <div className="flex items-center">
                  <div className="relative">
                    <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="bg-white/10 border-2 border-white/20 rounded-l-xl h-[60px] px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 min-w-[80px]">
                      <span>{countries.find(c => c.code === countryCode)?.flag}</span><span className="text-sm">{countries.find(c => c.code === countryCode)?.dialCode}</span>
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-80 bg-gray-900 border-2 border-white/20 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                        <div className="p-2 border-b border-white/20"><input type="text" placeholder="Search country..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none" /></div>
                        <div className="max-h-48 overflow-y-auto">{filteredCountries.map((country) => ( <button key={country.code} type="button" onClick={() => { setCountryCode(country.code); setShowCountryDropdown(false); setCountrySearch(''); }} className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center space-x-3 text-white"><span>{country.flag}</span><span className="flex-1">{country.name}</span><span className="text-white/60">{country.dialCode}</span></button> ))}</div>
                      </div>
                    )}
                  </div>
                  <input type="tel" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: '' })); }} placeholder="Phone number (for MFA)" className={`flex-1 px-4 h-[60px] bg-white/10 border-2 border-l-0 rounded-r-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phoneNumber ? 'border-red-500/70' : 'border-white/20'}`} autoComplete="tel" />
                </div>
                {errors.phoneNumber && <p className="text-red-400 text-xs mt-1 ml-2">{errors.phoneNumber}</p>}
              </div>
            )}
            <FloatingLabelInput id="password" label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock />} error={errors.password} required autoComplete={isLogin ? "current-password" : "new-password"} className="animate-slide-up">
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center z-10">{showPassword ? <EyeOff className="h-5 w-5 text-white/50" /> : <Eye className="h-5 w-5 text-white/50" />}</button>
            </FloatingLabelInput>
            {isLogin && (
              <div className="flex items-center justify-between animate-slide-up">
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="form-checkbox h-4 w-4 bg-white/20 border-white/30 rounded text-blue-500 focus:ring-blue-500" /><span className="text-sm text-white/80">Remember me</span></label>
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-white/70 hover:text-white text-sm font-medium">🔑 Forgot password?</button>
              </div>
            )}
            {!isLogin && password && (
              <div className="space-y-2 animate-slide-down">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white/10 rounded-full h-2"><div className={`h-2 rounded-full transition-all ${passwordStrength.strength === 'weak' ? 'bg-red-500 w-1/4' : passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/4' : 'bg-green-500 w-full'}`} /></div>
                  <span className={`text-sm ${passwordStrength.strength === 'weak' ? 'text-red-400' : passwordStrength.strength === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{passwordStrength.strength.toUpperCase()}</span>
                </div>
              </div>
            )}
            {!isLogin && (
              <FloatingLabelInput id="confirmPassword" label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} icon={<Lock />} error={errors.confirmPassword} required autoComplete="new-password" className="animate-slide-down">
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center z-10">{showConfirmPassword ? <EyeOff className="h-5 w-5 text-white/50" /> : <Eye className="h-5 w-5 text-white/50" />}</button>
              </FloatingLabelInput>
            )}
            {!isLogin && (
              <div className="animate-slide-down">
                <label className="block text-white/80 text-sm font-medium mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setUserType('student')} className={`p-3 rounded-xl border transition-all ${userType === 'student' ? 'bg-blue-500/20 border-blue-400/50' : 'bg-white/5 border-white/20 hover:bg-white/10'}`}><GraduationCap className="w-5 h-5 mx-auto mb-1" /><div className="text-sm">🎓 Student</div></button>
                  <button type="button" onClick={() => setUserType('teacher')} className={`p-3 rounded-xl border transition-all ${userType === 'teacher' ? 'bg-purple-500/20 border-purple-400/50' : 'bg-white/5 border-white/20 hover:bg-white/10'}`}><BookOpen className="w-5 h-5 mx-auto mb-1" /><div className="text-sm">👨‍🏫 Teacher</div></button>
                </div>
              </div>
            )}
            {!isLogin && (
              <div className="pt-2 animate-slide-down">
                <label className="flex items-start space-x-3 cursor-pointer"><input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="form-checkbox h-4 w-4 mt-1 bg-white/20 border-white/30 rounded text-blue-500 focus:ring-blue-500 shrink-0" required /><p className={`text-xs transition-colors ${errors.terms ? 'text-red-400' : 'text-white/60'}`}>I agree to the <Link to="/terms" className="text-blue-400 hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.</p></label>
              </div>
            )}
            <AnimatedButton type="submit" disabled={loading} variant="gradient" size="lg" animation="glow" ripple={true} className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:-translate-y-1">
              {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <><Shield className="w-6 h-6" /><span>{isLogin ? 'Sign In Securely' : 'Create Secure Account'}</span></>}
            </AnimatedButton>
            <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-black text-white/50 font-medium">OR CONTINUE WITH</span></div></div>
            <div className="space-y-3 animate-slide-up">
              {isLogin && isBiometricSupported && (
                <AnimatedButton type="button" onClick={handleBiometricSignIn} variant="ghost" className="w-full p-1 bg-black/20 border-2 border-white/10 rounded-xl group transform hover:-translate-y-1 transition-all duration-300 hover:border-transparent hover:[background:linear-gradient(to_right,theme(colors.purple.700),theme(colors.cyan.700))] disabled:opacity-50" disabled={loading}>
                  <div className="w-full h-full bg-black/80 rounded-lg flex items-center justify-center space-x-3 py-3 px-4">
                  <Fingerprint className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-medium">Sign in with Biometrics</span>
                  </div>
                </AnimatedButton>
              )}
              <AnimatedButton type="button" onClick={handleMagicLink} variant="ghost" className="w-full p-1 bg-black/20 border-2 border-white/10 rounded-xl group transform hover:-translate-y-1 transition-all duration-300 hover:border-transparent hover:[background:linear-gradient(to_right,theme(colors.yellow.500),theme(colors.amber.500))] disabled:opacity-50" disabled={loading}>
                <div className="w-full h-full bg-black/80 rounded-lg flex items-center justify-center space-x-3 py-3 px-4">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">Sign in with Magic Link</span>
                </div>
              </AnimatedButton>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<AnimatedButton type="button" onClick={handleGoogleSignIn} variant="ghost" className="w-full p-1 bg-black/20 border-2 border-white/10 rounded-xl group transform hover:-translate-y-1 transition-all duration-300 hover:border-transparent hover:[background:linear-gradient(to_right,theme(colors.blue.500),theme(colors.green.500),theme(colors.yellow.500),theme(colors.red.500))] disabled:opacity-50" disabled={loading}><div className="w-full h-full bg-black/80 rounded-lg flex items-center justify-center space-x-3 py-3 px-4"><GoogleLogo /><span className="text-white font-medium text-sm sm:text-base">Google</span></div></AnimatedButton>
                <AnimatedButton type="button" onClick={handleGitHubSignIn} variant="ghost" className="w-full p-1 bg-black/20 border-2 border-white/10 rounded-xl group transform hover:-translate-y-1 transition-all duration-300 hover:border-transparent hover:[background:linear-gradient(to_right,theme(colors.slate.500),theme(colors.slate.300))] disabled:opacity-50" disabled={loading}><div className="w-full h-full bg-black/80 rounded-lg flex items-center justify-center space-x-3 py-3 px-4"><GitHubLogo /><span className="text-white font-medium text-sm sm:text-base">GitHub</span></div></AnimatedButton>

              </div>
            </div>
          </form>
          <footer className="mt-8 pt-6 border-t border-white/20 text-white/70 text-xs">
            <div className="text-center mb-4">
              <h3 className="font-bold text-base text-white mb-2">Zero-Trust Security Framework Enabled</h3>
              <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 text-xs text-green-300/70">
                <span className="inline-flex items-center gap-1"><Check size={12}/>CSRF Protection</span>
                <span className="inline-flex items-center gap-1"><Check size={12}/>XSS Prevention</span>
                <span className="inline-flex items-center gap-1"><Check size={12}/>Secure Headers</span>
                <span className="inline-flex items-center gap-1"><Check size={12}/>Anomaly Detection</span>
              </div>
              <p className="text-xs text-white/40 mt-2">Note: CSRF, XSS, and Security Headers (CSP, HSTS) are enforced at the server and CDN level for comprehensive protection.</p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p>Developed by <span className="font-semibold text-emerald-400">VSAV GYANTAPA</span> | © 2025 VSAV GYANTAPA</p>
            </div>
          </footer>
        </AnimatedCard>
      </motion.div>
    </div>
  );
};

export default AuthPage;