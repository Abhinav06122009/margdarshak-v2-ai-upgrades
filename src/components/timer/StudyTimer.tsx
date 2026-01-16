import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Settings, Home, CheckCircle2, Coffee, BrainCircuit } from "lucide-react";
import { toast } from "sonner";

// --- Types ---
type Mode = "focus" | "short" | "long";

type Settings = {
  focusMin: number;
  shortMin: number;
  longMin: number;
  longEvery: number; 
};

const DEFAULTS: Settings = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longEvery: 4,
};

// --- Helpers ---
function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatClock(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function getModeConfig(mode: Mode) {
  switch (mode) {
    case 'focus': return { color: '#ef4444', label: 'Focus Time', icon: BrainCircuit }; // Red-500
    case 'short': return { color: '#22c55e', label: 'Short Break', icon: Coffee };       // Green-500
    case 'long': return { color: '#3b82f6', label: 'Long Break', icon: Coffee };        // Blue-500
  }
}

// --- Sub-Components ---

const Stepper = ({ label, value, unit = "min", onChange }: { label: string; value: number; unit?: string; onChange: (v: number) => void }) => (
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
    <span className="text-sm font-medium text-gray-300">{label}</span>
    <div className="flex items-center gap-3">
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(value - 1)} 
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        –
      </motion.button>
      <span className="w-12 text-center font-bold text-white">
        {value} <span className="text-xs font-normal text-gray-400">{unit}</span>
      </span>
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(value + 1)} 
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        +
      </motion.button>
    </div>
  </div>
);

// --- Main Component ---

export default function StudyTimer({ initial, size = 280 }: { initial?: Partial<Settings>; size?: number }) {
  const [settings, setSettings] = useState<Settings>({ ...DEFAULTS, ...initial });
  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Calculate total seconds based on current mode & settings
  const totalSeconds = useMemo(() => {
    if (mode === "focus") return settings.focusMin * 60;
    if (mode === "short") return settings.shortMin * 60;
    return settings.longMin * 60;
  }, [mode, settings]);

  const [remaining, setRemaining] = useState(totalSeconds);
  const timerRef = useRef<number | null>(null);

  // --- Effects ---

  // 1. Browser Title Update
  useEffect(() => {
    document.title = running 
      ? `(${formatClock(remaining)}) ${mode.toUpperCase()} | MARGDARSHAK` 
      : "Study Timer | MARGDARSHAK";
  }, [remaining, running, mode]);

  // 2. Sync Remaining when Total Changes (Only if we aren't mid-session or if user forces a mode change)
  // FIX: We only reset if the totalSeconds changes significantly (like settings change) OR if mode changed.
  // We use a ref to track the previous total to avoid resetting on pause.
  const prevTotalRef = useRef(totalSeconds);
  const prevModeRef = useRef(mode);

  useEffect(() => {
    // If mode changed, always reset
    if (prevModeRef.current !== mode) {
      setRemaining(totalSeconds);
      setRunning(false);
      prevModeRef.current = mode;
      prevTotalRef.current = totalSeconds;
      return;
    }

    // If settings changed (totalSeconds changed) but mode is same
    if (prevTotalRef.current !== totalSeconds) {
        // If we are running, decide if we want to adjust strictly or reset. 
        // For simplicity, let's reset to ensure consistency with new settings.
        setRemaining(totalSeconds);
        setRunning(false);
        prevTotalRef.current = totalSeconds;
    }
  }, [totalSeconds, mode]);

  // 3. Request Notification Permissions
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // 4. Sound Player
  const playAlert = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) { console.error("Audio play failed", e); }
  };

  // 5. Timer Logic
  useEffect(() => {
    if (running) {
      timerRef.current = window.setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            // Timer Finished
            playAlert();
            
            // Logic for next mode
            if (mode === "focus") {
              const nextCount = completedFocus + 1;
              setCompletedFocus(nextCount);
              const isLongBreak = nextCount % settings.longEvery === 0;
              
              if (isLongBreak) {
                setMode("long");
                toast.success("Focus session complete! Take a long break. ☕");
                if (Notification.permission === "granted") new Notification("Great job! Take a long break.");
              } else {
                setMode("short");
                toast.success("Focus session complete! Take a short break. 🍵");
                if (Notification.permission === "granted") new Notification("Focus done. Take a short break.");
              }
            } else {
              setMode("focus");
              toast.info("Break over! Ready to focus? ⚡");
              if (Notification.permission === "granted") new Notification("Break over. Back to work!");
            }
            return 0; // The mode change effect will pick this up and reset remaining
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, mode, settings, completedFocus]);

  // --- Visuals ---
  const progress = Math.max(0, Math.min(1, 1 - remaining / totalSeconds));
  const modeConfig = getModeConfig(mode);
  const ModeIcon = modeConfig.icon;

  // Ring Calculation
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white font-sans selection:bg-blue-500/30 flex flex-col items-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000`} style={{ backgroundColor: modeConfig.color }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Nav */}
      <nav className="w-full max-w-5xl mx-auto p-6 flex justify-between items-center relative z-10">
        <Link to="/">
          <motion.button 
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </motion.button>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-gray-300">Sessions: {completedFocus}</span>
        </div>
      </nav>

      {/* Timer Card */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-[#18181b]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] shadow-2xl shadow-black/50"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <ModeIcon className="w-5 h-5" style={{ color: modeConfig.color }} />
                <span className="text-xs font-bold tracking-wider uppercase text-gray-400">Current Mode</span>
              </div>
              <motion.h2 
                key={mode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold"
              >
                {modeConfig.label}
              </motion.h2>
            </div>
            <motion.button 
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Ring */}
          <div className="relative grid place-items-center mb-10">
             {/* Glow Effect */}
             {running && (
               <motion.div 
                 animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
                 transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                 className="absolute inset-0 rounded-full blur-3xl -z-10"
                 style={{ backgroundColor: modeConfig.color, opacity: 0.2 }}
               />
             )}

            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
              {/* Background Circle */}
              <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#27272a" strokeWidth={stroke} />
              
              {/* Progress Circle */}
              <motion.circle
                cx={size/2} 
                cy={size/2} 
                r={radius} 
                fill="none" 
                stroke={modeConfig.color} 
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1, ease: "linear" }}
                style={{ filter: `drop-shadow(0 0 6px ${modeConfig.color})` }}
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div 
                key={remaining}
                className="text-7xl font-bold tracking-tighter tabular-nums"
              >
                {formatClock(remaining)}
              </motion.div>
              <motion.p 
                animate={{ opacity: running ? 1 : 0.5 }}
                className="text-sm font-medium text-gray-400 mt-2 tracking-widest uppercase"
              >
                {running ? 'Running' : 'Paused'}
              </motion.p>
              
              {/* Dots for sessions */}
              <div className="flex gap-2 mt-6">
                {Array.from({ length: settings.longEvery }).map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      scale: i < (completedFocus % settings.longEvery) ? 1 : 0.8,
                      opacity: i < (completedFocus % settings.longEvery) ? 1 : 0.2
                    }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRunning(!running)}
              className="flex-1 h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg"
              style={{ 
                backgroundColor: running ? '#27272a' : 'white', 
                color: running ? 'white' : 'black'
              }}
            >
              {running ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              {running ? "Pause" : "Start"}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02, rotate: -10 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setRunning(false); setRemaining(totalSeconds); }}
              className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* SEO Text */}
        <article className="max-w-3xl mt-20 text-center space-y-4">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">
                Master Your Time with the Pomodoro Technique
            </h1>
            <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
                The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. 
                It uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.
                This MARGDARSHAK tool helps you maintain focus and avoid burnout during intense study sessions.
            </p>
        </article>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#18181b] border border-white/10 p-6 rounded-3xl shadow-2xl z-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Timer Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-full">✕</button>
              </div>
              
              <div className="space-y-3">
                <Stepper label="Focus Duration" value={settings.focusMin} onChange={(v) => setSettings(s => ({...s, focusMin: clampInt(v, 1, 120)}))} />
                <Stepper label="Short Break" value={settings.shortMin} onChange={(v) => setSettings(s => ({...s, shortMin: clampInt(v, 1, 30)}))} />
                <Stepper label="Long Break" value={settings.longMin} onChange={(v) => setSettings(s => ({...s, longMin: clampInt(v, 1, 60)}))} />
                <Stepper label="Sessions before Long Break" value={settings.longEvery} unit="" onChange={(v) => setSettings(s => ({...s, longEvery: clampInt(v, 1, 10)}))} />
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
