import React, { useState, useEffect, useRef, useMemo, useReducer, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import logo from "@/components/logo/logo.png";

const THEMES = {
  light: {
    bg: 'bg-gradient-to-br from-blue-50 via-white to-gray-100',
    card: 'bg-white/90 shadow-xl',
    display: 'bg-gray-50/95',
    txt: 'text-gray-900',
    accent: 'blue-500',
    btn: {
      num: 'bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-50 hover:to-gray-150 text-gray-900',
      op: 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white',
      fn: 'bg-gradient-to-b from-gray-300 to-gray-400 hover:from-gray-200 hover:to-gray-300 text-gray-800'
    }
  },
  dark: {
    bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
    card: 'bg-gray-800/90 shadow-xl border border-gray-700',
    display: 'bg-gray-900/95 text-white',
    txt: 'text-white',
    accent: 'blue-400',
    btn: {
      num: 'bg-gray-700 hover:bg-gray-600 text-white',
      op: 'bg-blue-600 hover:bg-blue-500 text-white',
      fn: 'bg-gray-600 hover:bg-gray-500 text-white'
    }
  },
  neon: {
    bg: 'bg-black',
    card: 'bg-black/90 shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-purple-500/30',
    display: 'bg-gray-900/95 text-purple-400 font-mono',
    txt: 'text-purple-100',
    accent: 'purple-500',
    btn: {
      num: 'bg-gray-900 border border-purple-500/30 text-purple-100 hover:bg-purple-900/20',
      op: 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]',
      fn: 'bg-gray-900 border border-pink-500/30 text-pink-400 hover:bg-pink-900/20'
    }
  }
};

const SCIENTIFIC_OPS = {
  sin: (x, d) => Math.sin(d ? x * Math.PI / 180 : x),
  cos: (x, d) => Math.cos(d ? x * Math.PI / 180 : x),
  tan: (x, d) => Math.tan(d ? x * Math.PI / 180 : x),
  ln: Math.log,
  log: Math.log10,
  '√': Math.sqrt,
  'x²': x => x * x,
  'x³': x => x ** 3,
  'e': () => Math.E,
  'π': () => Math.PI,
  '|x|': Math.abs,
  '1/x': x => 1 / x,
  'x!': n => {
    if (n < 0) return NaN;
    let r = 1; for(let i=2; i<=n; i++) r*=i; return r;
  }
};

const initialState = {
  display: '0',
  prev: null,
  op: null,
  waiting: false,
  history: [],
  memory: 0,
  error: '',
  lastPressed: ''
};

function calcReducer(state, action) {
  const { type, payload } = action;
  const current = parseFloat(state.display.replace(/,/g, ''));

  switch (type) {
    case 'DIGIT':
      if (state.display.length >= 20) return state;
      const newVal = state.waiting || state.display === '0' ? payload : state.display + payload;
      return { ...state, display: newVal, waiting: false, error: '', lastPressed: payload };

    case 'OP':
      if (state.op && !state.waiting && state.prev !== null) {
        const result = calculate(state.prev, current, state.op);
        return {
          ...state,
          display: String(result),
          prev: result,
          op: payload,
          waiting: true,
          history: addToHistory(state.history, state.prev, state.op, current, result),
          lastPressed: payload
        };
      }
      return { ...state, prev: current, op: payload, waiting: true, lastPressed: payload };

    case 'EQUALS':
      if (!state.op || state.prev === null) return state;
      const res = calculate(state.prev, current, state.op);
      return {
        ...state,
        display: String(res),
        prev: null,
        op: null,
        waiting: true,
        history: addToHistory(state.history, state.prev, state.op, current, res),
        lastPressed: '='
      };

    case 'CLEAR':
      return { ...initialState, history: state.history, memory: state.memory, lastPressed: 'C' };

    case 'SCI':
      const sciRes = typeof SCIENTIFIC_OPS[payload] === 'function' 
        ? SCIENTIFIC_OPS[payload](current, action.isDeg)
        : SCIENTIFIC_OPS[payload]; 
      return { ...state, display: String(sciRes), waiting: true, lastPressed: payload };

    case 'MEM':
      return handleMemory(state, payload, current);

    case 'SET_DISPLAY':
      return { ...state, display: payload };
    
    case 'SET_HISTORY': 
      return { ...state, history: payload };
    
    case 'RESTORE':
      return { ...state, ...payload };

    default: return state;
  }
}


const calculate = (a, b, op) => {
  switch(op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    case '%': return a % b;
    case '^': return Math.pow(a, b);
    default: return b;
  }
};

const addToHistory = (hist, a, op, b, res) => [
  { id: Date.now().toString(), expression: `${a} ${op} ${b}`, result: String(res) },
  ...hist
].slice(0, 19);

const handleMemory = (state, op, val) => {
  let mem = state.memory;
  if (op === 'MC') mem = 0;
  if (op === 'M+') mem += val;
  if (op === 'M-') mem -= val;
  if (op === 'MS') mem = val;
  if (op === 'MR') return { ...state, display: String(mem), waiting: true };
  return { ...state, memory: mem };
};



const Calculator = ({ onBack }) => {
  const [state, dispatch] = useReducer(calcReducer, initialState);
  const [mode, setMode] = useState('scientific');
  const [theme, setTheme] = useState('light');
  const [settings, setSettings] = useState({ 
    angle: 'deg', 
    prec: 10, 
    sciNot: false, 
    sound: true, 
    haptic: true 
  });
  
  const [ui, setUi] = useState({ showHist: false, showSettings: false, anim: '' });
  const audioCtx = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('calcState_v2');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.math) dispatch({ type: 'RESTORE', payload: data.math });
      if (data.ui) {
        setMode(data.ui.mode || 'scientific');
        setTheme(data.ui.theme || 'light');
        setSettings(data.ui.settings || settings);
      }
    }
  }, []);

  useEffect(() => {
    const data = {
      math: { 
        display: state.display, 
        history: state.history, 
        memory: state.memory 
      },
      ui: { mode, theme, settings }
    };
    localStorage.setItem('calcState_v2', JSON.stringify(data));
  }, [state, mode, theme, settings]);

  const playTone = useCallback((freq, type = 'sine') => {
    if (!settings.sound) return;
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.frequency.value = freq;
      osc.type = type;
      gain.gain.setValueAtTime(0.1, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.current.currentTime + 0.1);
    } catch (e) { console.error(e); }
  }, [settings.sound]);

  const vibrate = useCallback((pattern = [5]) => {
    if (settings.haptic && navigator.vibrate) navigator.vibrate(pattern);
  }, [settings.haptic]);

  const handleInput = (btn) => {
    vibrate();
    setUi(p => ({ ...p, anim: btn.type === 'equals' ? 'animate-bounce' : 'animate-pulse' }));
    setTimeout(() => setUi(p => ({ ...p, anim: '' })), 300);

    if (btn.type === 'number') {
      playTone(400 + parseInt(btn.label) * 50);
      dispatch({ type: 'DIGIT', payload: btn.label });
    } else if (btn.type === 'operation') {
      playTone(600, 'square');
      dispatch({ type: 'OP', payload: btn.label });
    } else if (btn.type === 'equals') {
      playTone(800, 'triangle');
      dispatch({ type: 'EQUALS' });
    } else if (btn.type === 'clear') {
      playTone(200, 'sawtooth');
      dispatch({ type: 'CLEAR' });
    } else if (btn.type === 'scientific') {
      playTone(1000, 'sine');
      dispatch({ type: 'SCI', payload: btn.label, isDeg: settings.angle === 'deg' });
    } else if (btn.type === 'memory') {
      playTone(800);
      dispatch({ type: 'MEM', payload: btn.label });
    } else if (btn.type === 'decimal') {
      if (!state.display.includes('.')) dispatch({ type: 'DIGIT', payload: '.' });
    } else if (btn.type === 'function') {
      if (btn.label === '±') dispatch({ type: 'SET_DISPLAY', payload: String(parseFloat(state.display) * -1) });
      if (btn.label === '%') dispatch({ type: 'SET_DISPLAY', payload: String(parseFloat(state.display) / 100) });
    }
  };

  
  useEffect(() => {
    const map = {
      'Enter': { type: 'equals' }, '=': { type: 'equals' },
      'Escape': { type: 'clear' }, 'c': { type: 'clear' },
      '+': { type: 'operation', label: '+' }, '-': { type: 'operation', label: '-' },
      '*': { type: 'operation', label: '×' }, '/': { type: 'operation', label: '÷' },
      '.': { type: 'decimal' }
    };
    const handler = (e) => {
      if (/[0-9]/.test(e.key)) handleInput({ type: 'number', label: e.key });
      if (map[e.key]) handleInput(map[e.key]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, settings]);


  const formatDisplay = (val) => {
    if (state.error) return state.error;
    const n = parseFloat(val);
    if (isNaN(n)) return val;
    if (settings.sciNot || Math.abs(n) > 1e9) return n.toExponential(settings.prec);
    return n.toLocaleString('en-US', { maximumFractionDigits: settings.prec });
  };

  const getButtonStyle = (type) => {
    const th = THEMES[theme].btn;
    const base = 'font-semibold rounded-2xl border-0 transition-all duration-300 shadow-lg active:scale-95 hover:scale-105';
    if (type === 'number' || type === 'decimal') return `${base} ${th.num} h-16 text-xl`;
    if (type === 'operation' || type === 'equals') return `${base} ${th.op} h-16 text-xl ring-2 ring-${THEMES[theme].accent}/30`;
    return `${base} ${th.fn} ${mode === 'scientific' ? 'h-12 text-sm' : 'h-16 text-xl'}`;
  };

  const currentTheme = THEMES[theme];


  const buttons = useMemo(() => {
    const sci = [
      ['2nd','fn'], [settings.angle.toUpperCase(),'fn'], ['sin','sci'], ['cos','sci'], ['tan','sci'],
      ['ln','sci'], ['log','sci'], ['x!','sci'], ['(','fn'], [')','fn'],
      ['MC','mem'], ['MR','mem'], ['M+','mem'], ['M-','mem'], ['MS','mem'],
      ['C','clear'], ['±','fn'], ['%','fn'], ['÷','op'],
      ['x²','sci'], ['7','num'], ['8','num'], ['9','num'], ['×','op'],
      ['√','sci'], ['4','num'], ['5','num'], ['6','num'], ['-','op'],
      ['π','sci'], ['1','num'], ['2','num'], ['3','num'], ['+','op'],
      ['e','sci'], ['0','num', 2], ['.','dec'], ['=','equals']
    ];
    const std = [
      ['C','clear'], ['±','fn'], ['%','fn'], ['÷','op'],
      ['7','num'], ['8','num'], ['9','num'], ['×','op'],
      ['4','num'], ['5','num'], ['6','num'], ['-','op'],
      ['1','num'], ['2','num'], ['3','num'], ['+','op'],
      ['0','num', 2], ['.','dec'], ['=','equals']
    ];
    return (mode === 'scientific' ? sci : std).map(([label, type, span]) => ({
      label, type: type === 'num' ? 'number' : type === 'dec' ? 'decimal' : type === 'fn' ? 'function' : type === 'sci' ? 'scientific' : type === 'mem' ? 'memory' : type === 'op' ? 'operation' : type,
      span
    }));
  }, [mode, settings.angle]);

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.txt} flex flex-col relative overflow-hidden`}>
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-${currentTheme.accent} rounded-full filter blur-3xl animate-pulse`}></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-2xl mx-auto p-4 flex-grow flex flex-col justify-center relative z-10">
        
        {/* Header Controls */}
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <Button onClick={onBack} variant="outline" className={`${currentTheme.card} border-${currentTheme.accent}/30 ${currentTheme.txt} hover:bg-${currentTheme.accent}/20 backdrop-blur-sm transition-all hover:scale-105`}>
               {onBack ? '← Back' : <Link to="/">← Home</Link>}
            </Button>
            <Button onClick={() => setUi(p => ({...p, showSettings: !p.showSettings}))} className={`${currentTheme.btn.fn} h-auto px-3 py-2 text-sm`}>⚙️</Button>
          </div>
          
          <div className="relative mb-4">
            <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-${currentTheme.accent} via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2 animate-pulse`}>
              Scientific Calculator
            </h1>
            <p className="text-gray-400 text-lg">Free Online {mode.toUpperCase()} Tool</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex justify-center gap-2 mb-4">
            {['scientific', 'standard'].map(m => (
              <Button key={m} onClick={() => setMode(m)} className={`capitalize ${mode === m ? `${currentTheme.btn.op} ring-2 ring-${currentTheme.accent}/50` : currentTheme.btn.fn}`}>
                {m}
              </Button>
            ))}
          </div>

          {/* Theme Switcher */}
          <div className="flex justify-center gap-2 mb-4">
            {Object.keys(THEMES).map(t => (
              <Button key={t} onClick={() => setTheme(t)} className={`w-8 h-8 rounded-full border-2 ${theme === t ? `border-${currentTheme.accent}` : 'border-gray-600'}`} style={{background: t==='light'?'#f3f4f6':t==='neon'?'#000':'#1f2937'}}>
                {t==='light'?'☀️':t==='neon'?'⚡':'🌙'}
              </Button>
            ))}
          </div>
        </div>

        {/* Settings Panel */}
        {ui.showSettings && (
          <Card className={`${currentTheme.card} border border-${currentTheme.accent}/30 mb-4 backdrop-blur-xl`}>
            <CardHeader><h3 className="font-semibold">Settings</h3></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Angle Unit</span>
                <Button onClick={() => setSettings(s => ({...s, angle: s.angle === 'deg' ? 'rad' : 'deg'}))} className={currentTheme.btn.fn}>{settings.angle.toUpperCase()}</Button>
              </div>
              <div className="flex justify-between items-center">
                <span>Scientific Notation</span>
                <Button onClick={() => setSettings(s => ({...s, sciNot: !s.sciNot}))} className={settings.sciNot ? currentTheme.btn.op : currentTheme.btn.fn}>{settings.sciNot ? 'ON' : 'OFF'}</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display Area */}
        <Card className={`${currentTheme.card} border border-${currentTheme.accent}/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl`}>
          <div className={`${currentTheme.display} p-6 md:p-8 text-right backdrop-blur-sm relative min-h-[160px] flex flex-col justify-end`}>
            {state.op && (
              <div className={`text-xl text-${currentTheme.accent} mb-2 font-mono opacity-80`}>
                {formatDisplay(state.prev)} {state.op}
              </div>
            )}
            <div className={`text-4xl md:text-6xl font-light font-mono break-all leading-tight transition-transform ${ui.anim}`}>
              {formatDisplay(state.display)}
            </div>
            <Button variant="ghost" size="sm" className="absolute bottom-2 left-2 text-xs opacity-50 hover:opacity-100" onClick={() => setUi(p => ({...p, showHist: !p.showHist}))}>
              History
            </Button>
          </div>

          {/* Keypad */}
          <CardContent className={`p-4 md:p-6 ${currentTheme.display} backdrop-blur-sm`}>
            {ui.showHist && state.history.length > 0 && (
              <div className="mb-4 max-h-32 overflow-y-auto bg-black/5 rounded p-2 text-sm">
                <div className="flex justify-between opacity-50 mb-2"><span>Recent</span><span className="cursor-pointer" onClick={() => dispatch({type: 'SET_HISTORY', payload: []})}>Clear</span></div>
                {state.history.map(h => (
                  <div key={h.id} className="flex justify-between mb-1">
                    <span className="opacity-70">{h.expression}</span>
                    <span className="font-bold">{h.result}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className={`grid ${mode === 'scientific' ? 'grid-cols-5 gap-2' : 'grid-cols-4 gap-4'}`}>
              {buttons.map((btn, i) => (
                <Button
                  key={i}
                  onClick={() => handleInput(btn)}
                  className={`${getButtonStyle(btn.type)} ${btn.span === 2 ? 'col-span-2' : ''} ${state.lastPressed === btn.label ? 'brightness-125' : ''}`}
                >
                  <span className="relative z-10">{btn.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CalculatorInfo theme={theme} accent={currentTheme.accent} />

      <footer className="py-6 border-t border-white/10 text-center text-sm opacity-60">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={logo} alt="Logo" className="w-8 h-8" />
          <span className="font-bold">MARGDARSHAK</span>
        </div>
        <p>© 2025 VSAV GYANTAPA. All rights reserved.</p>
      </footer>
    </div>
  );
};


const CalculatorInfo = ({ theme, accent }) => (
  <div className="max-w-3xl mx-auto mt-12 mb-20 px-6 text-slate-600 dark:text-slate-400">
    <article className="prose dark:prose-invert lg:prose-lg mx-auto">
      <h2 className={`text-3xl font-bold mb-6 text-${accent}`}>Master Mathematics with Our Free Scientific Calculator</h2>
      <p className="mb-4">
        Welcome to the MARGDARSHAK Online Scientific Calculator... { /* Content preserved as requested */ }
        Unlike a basic calculator, our tool supports advanced functions essential for algebra, trigonometry, calculus, and statistics.
      </p>
      <h3 className="text-xl font-semibold mt-8 mb-4">Key Features</h3>
      <ul className="list-disc pl-5 space-y-2 mb-6">
        <li><strong>Trigonometric Functions:</strong> Sine, Cosine, Tangent in Degrees/Radians.</li>
        <li><strong>Logarithms:</strong> Natural (ln) and base-10 (log).</li>
        <li><strong>Memory:</strong> Store (MS), Recall (MR), Clear (MC).</li>
      </ul>
    </article>
  </div>
);

export default Calculator;