import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Send, BrainCircuit, Globe, Zap, Camera, 
  Sparkles, X, Activity, Download, Volume2, VolumeX, Key, Lock, Crown
} from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { jsPDF } from "jspdf";

type Mode = 'deepresearch' | 'quickchat';
const ELITE_TIERS = ['premium_elite', 'extra_plus', 'premium_plus', 'premium+elite'];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string; 
  diagram?: string; 
  agent?: string;
  userImage?: string; 
}

const SmartTutorPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('deepresearch');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedKey = localStorage.getItem('margdarshak_user_key');
    if (storedKey) setUserApiKey(storedKey);
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();
      if (data?.subscription_tier) {
        setSubscriptionTier(data.subscription_tier);
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const clearImageSelection = () => { setSelectedImage(null); setPreview(null); };

  const saveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem('margdarshak_user_key', key);
    setShowKeyModal(false);
  };

  const isEliteUser = () => ELITE_TIERS.includes(subscriptionTier);
  const executeSend = async (textToSend: string, modeToUse: Mode, imageToSend: File | null = null) => {
    if (!isEliteUser() && !userApiKey) {
      setShowKeyModal(true);
      return;
    }

    setLoading(true);
    
    setMessages(prev => [...prev, { 
        role: 'user', 
        content: textToSend, 
        userImage: imageToSend ? URL.createObjectURL(imageToSend) : undefined 
    }]);

    try {
      const WORKER_URL = "https://margdarshak-api.abhinav-vsavwe4899.workers.dev"; 
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: any = {
        ...(!isEliteUser() && userApiKey ? { "X-User-API-Key": userApiKey } : {}),
        ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {})
      };

      let body;

      if (imageToSend) {
        const formData = new FormData();
        formData.append("messages", JSON.stringify([...messages, { role: 'user', content: textToSend }]));
        formData.append("mode", modeToUse);
        formData.append("image", imageToSend);
        body = formData;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          messages: [...messages, { role: 'user', content: textToSend }],
          mode: modeToUse
        });
      }
      
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: headers,
        body: body,
      });

      const data = await response.json();

      if (data.response === "KEY_REQUIRED") {
        setMessages(prev => prev.slice(0, -1)); 
        setShowKeyModal(true);
        setLoading(false);
        return;
      }

      if (data.response === "UPGRADE_TO_EXTRA") {
        setMessages(prev => prev.slice(0, -1)); 
        setShowUpgradeModal(true);
        setLoading(false);
        return;
      }

      if (data.response === "AUTH_REQUIRED" || data.response === "INVALID_TOKEN") {
        navigate('/auth');
        return;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        diagram: data.image,
        agent: data.agent,
      }]);

    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${e.message}` }]);
    } finally {
      setLoading(false);
      setInput('');
      clearImageSelection();
    }
  };

  const handleSend = () => {
    if (!input.trim() && !selectedImage) return;
    executeSend(input, mode, selectedImage);
  };

  const exportToPDF = (c: string, t: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - (margin * 2);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("MARGDARSHAK PRO NOTES", margin, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 35);
    doc.line(margin, 40, pageWidth - margin, 40);
    const splitText = doc.splitTextToSize(c, maxLineWidth);
    doc.setFontSize(11);
    doc.text(splitText, margin, 50);
    doc.save(`Margdarshak_Notes.pdf`);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-amber-500/30 overflow-hidden relative">
      
      {/* MODAL: API KEY REQUIRED (Free & Premium) */}
      <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
        <DialogContent className="bg-[#121212] border border-amber-500/20 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-amber-500">
              <Lock className="w-5 h-5" /> BYO Key Required
            </DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
              Free and Standard Premium users must provide a <strong>Cloud API Key</strong>. <br/>
              <span className="text-emerald-400 text-xs mt-2 block">
                Upgrade to <strong>Elite</strong> to use our internal engine without a key.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your API Key</Label>
              <Input 
                placeholder="sk-..." 
                className="bg-black/50 border-white/10 text-white font-mono"
                onChange={(e) => setUserApiKey(e.target.value)}
                value={userApiKey}
              />
              <p className="text-[10px] text-gray-500">
                Don't have one? <a href="#" className="text-amber-500 hover:underline">Get a free key here</a>.
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
               <span className="text-xs text-gray-400">Want hassle-free access?</span>
               <Link to="/upgrade" className="text-xs font-bold text-emerald-400 hover:underline">Get Elite →</Link>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowKeyModal(false)}>Cancel</Button>
            <Button onClick={() => saveApiKey(userApiKey)} className="bg-amber-500 text-black font-bold">Save Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: FEATURE LOCKED (If applicable) */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="bg-gradient-to-br from-[#1a0b2e] to-black border border-purple-500/30 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-purple-400">
              <Crown className="w-5 h-5 fill-current" /> Elite Exclusive
            </DialogTitle>
            <DialogDescription className="text-gray-300 pt-2">
              This specific feature is reserved for Elite users.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-sm text-purple-200">
                🚀 Upgrade to Elite to unlock Deep Web Research, Image Analysis, and Advanced Generation.
             </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowUpgradeModal(false)}>Cancel</Button>
            <Link to="/upgrade">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold border-0">Upgrade Now</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-6xl mx-auto h-[100dvh] flex flex-col p-4 gap-4">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-center justify-between p-4 glass-card rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl relative z-20">
          <div className="flex items-center gap-4">
            <div className="relative bg-[#0a0a0a] p-3 rounded-xl border border-white/10">
              <BrainCircuit className="text-amber-500 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                MARGDARSHAK <span className="text-amber-500">PRO</span>
              </h1>
              <div className="flex items-center gap-2 text-[9px] font-bold text-amber-500/80 uppercase tracking-[0.2em]">
                {isEliteUser() && <span className="text-purple-400 flex items-center gap-1"><Zap size={10} /> Elite Active</span>}
                {!isEliteUser() && subscriptionTier === 'premium' && <span className="text-blue-400 flex items-center gap-1"><Sparkles size={10} /> Premium (BYOK)</span>}
                {!isEliteUser() && subscriptionTier !== 'premium' && <span className="text-gray-400 flex items-center gap-1"><Lock size={10} /> Free Plan (BYOK)</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 md:mt-0">
             {/* Key Button: Visible for EVERYONE who isn't Elite */}
             {!isEliteUser() && (
               <Button variant="ghost" size="sm" onClick={() => setShowKeyModal(true)} className="text-xs text-gray-400 border border-white/5 bg-black/20 hover:bg-white/10">
                 <Key size={12} className="mr-2" /> {userApiKey ? 'Change Key' : 'Set API Key'}
               </Button>
             )}
             
             <div className="flex bg-black/40 p-1 rounded-full border border-white/5">
                {[
                  { id: 'deepresearch', icon: Globe, label: 'Research' },
                  { id: 'quickchat', icon: Zap, label: 'Quick' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as Mode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                      mode === m.id 
                      ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                      : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <m.icon size={14} />
                    <span className="hidden md:inline">{m.label}</span>
                  </button>
                ))}
             </div>
          </div>
        </header>

        <ScrollArea className="flex-1 rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-4 md:p-8 shadow-inner relative" ref={scrollRef}>
          <div className="space-y-8 pb-10">
            {messages.length === 0 && (
              <div className="h-[50vh] flex flex-col items-center justify-center opacity-30 select-none">
                <Sparkles size={64} className="mb-4 animate-pulse text-amber-500" />
                <p className="font-bold tracking-[0.5em] text-xs uppercase">Ready for Query</p>
                {!isEliteUser() && !userApiKey && (
                  <p className="text-[10px] text-red-400 mt-4 bg-red-900/20 px-3 py-1 rounded-full border border-red-500/30">
                    API Key Required
                  </p>
                )}
              </div>
            )}
            
            {messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                 <div className={`relative group max-w-[90%] md:max-w-[85%] p-6 rounded-[2rem] transition-all border ${
                   m.role === 'user' 
                   ? 'bg-amber-500 text-black font-medium border-amber-400 rounded-tr-none shadow-[0_5px_20px_rgba(245,158,11,0.2)]' 
                   : 'bg-[#121212] text-slate-200 border-white/10 rounded-tl-none hover:border-amber-500/20'
                 }`}>
                    {m.role === 'assistant' && m.agent && (
                      <div className="absolute -top-3 left-6 bg-black border border-amber-500/50 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-500 shadow-lg z-10 flex items-center gap-1">
                        <Sparkles size={8} /> {m.agent}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed text-[15px]">{m.content}</div>
                    {m.diagram && <img src={m.diagram} alt="diagram" className="mt-4 rounded-xl border border-white/10 w-full" />}
                    
                    {m.role === 'assistant' && (
                      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button variant="ghost" size="icon" onClick={() => exportToPDF(m.content, "Margdarshak Notes")} className="h-8 w-8 hover:bg-amber-500 hover:text-black rounded-full"><Download size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => isSpeaking ? stopSpeaking() : speak(m.content)} className="h-8 w-8 hover:bg-amber-500 hover:text-black rounded-full">{isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}</Button>
                      </div>
                    )}
                 </div>
               </div>
            ))}
            
            {loading && (
              <div className="flex items-center gap-3 ml-6 text-amber-500 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">
                <BrainCircuit className="animate-spin" size={16} />
                Processing Request...
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="relative group w-full z-30">
           {preview && (
            <div className="absolute top-[-100px] left-6 p-2 bg-black/90 backdrop-blur border-2 border-amber-500 rounded-2xl shadow-2xl animate-in zoom-in-95">
              <img src={preview} className="h-20 w-20 object-cover rounded-xl" alt="Preview" />
              <button onClick={clearImageSelection} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"><X size={12}/></button>
            </div>
           )}

           <div className="relative flex items-center gap-2 p-2 bg-white/[0.04] backdrop-blur-3xl rounded-[3rem] border border-white/10 focus-within:border-amber-500/50">
             <input type="file" id="visionInput" hidden accept="image/*" onChange={handleImageSelect} />
             <Button variant="ghost" className="rounded-full h-12 w-12 text-gray-400 hover:text-white" onClick={() => document.getElementById('visionInput')?.click()}>
               <Camera size={24} />
             </Button>
             <Input 
               className="bg-transparent border-none focus-visible:ring-0 text-lg px-4 flex-1 h-14 placeholder:text-gray-600 font-medium" 
               placeholder={mode === 'quickchat' ? "Quick doubt? Ask here..." : "Enter complex topic..."}
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               autoComplete="off"
             />
             <Button onClick={handleSend} disabled={loading || (!input.trim() && !selectedImage)} className="rounded-full h-12 w-12 bg-amber-500 text-black hover:scale-105">
               <Send size={24} />
             </Button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SmartTutorPage;
