import React, { useState, useEffect, useRef, Suspense, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation, useSpring, useTransform, useMotionValue, useScroll } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  BarChart, BookOpen, Calendar, CheckSquare, Shield, Zap, Star, 
  ArrowRight, Users, Award, TrendingUp, Rocket,
  Volume2, VolumeX, Eye, Target, Sparkles, BrainCircuit
} from 'lucide-react';
import { aiService } from '@/lib/aiService';
import Footer from '@/components/Footer';

// --- Global Sound Context (for max UX) ---
const SoundContext = createContext<any>(null);

const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    initAudio();
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playSound = useCallback((type: string) => {
    if (!soundEnabled || !audioContextRef.current) return;

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    gainNode.connect(context.destination);
    oscillator.connect(gainNode);

    const now = context.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);

    if (type === 'hover') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, now);
      oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    } else if (type === 'click') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(400, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    } else if (type === 'toggleOn') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(800, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    } else if (type === 'toggleOff') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(300, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    }

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const newState = !prev;
      if (newState) playSound('toggleOn');
      return newState;
    });
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

const useSound = () => useContext(SoundContext);

const Link = ({ to, children, className = '', onClick, ...props }: any) => {
  const { playSound } = useSound();
  
  const handleClick = (e: any) => {
    if (to.startsWith('#')) {
      e.preventDefault();
      const targetElement = document.getElementById(to.substring(1));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    playSound('click');
    if (onClick) onClick(e);
  };

  return (
    <a 
      href={to} 
      onClick={handleClick} 
      onMouseEnter={() => playSound('hover')} 
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};

// --- Global Enhancements ---

const Preloader = () => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: "-100vh" }}
      transition={{ duration: 0.8, ease: [0.6, 0.01, 0.05, 0.9] }}
      className="fixed inset-0 bg-[#0A0A0A] z-[100] flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <img src="src/components/logo/logo.png" alt="Logo" className="h-16 w-16 rounded-full" />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        className="text-3xl font-black tracking-wider text-white mt-4"
      >
        MARGDARSHAK
      </motion.h1>
      <motion.div
        className="h-1 w-24 bg-blue-500 rounded-full mt-6"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
      />
    </motion.div>
  </AnimatePresence>
);

const CustomCursor = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div 
      ref={cursorDotRef} 
      className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[99] hidden md:block"
    >
      <motion.div 
        animate={{ scale: hovered ? 1.5 : 1, opacity: hovered ? 0.3 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className={`w-6 h-6 rounded-full ${hovered ? 'bg-blue-400' : 'bg-blue-600'} transition-colors duration-200`} 
        style={{ opacity: 0.5 }}
      />
    </motion.div>
  );
};

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 origin-left z-[60]"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

// --- New Gemini-Powered Components ---

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const GeminiFeatureDemo = () => {
  const [topic, setTopic] = useState("Quantum Entanglement");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { playSound } = useSound();

  const handleGenerate = async () => {
    playSound('click');
    if (!topic || isLoading) return;

    setIsLoading(true);
    setError(null);
    setExplanation("");

    try {
      // Calls the new Puter-based function in aiService
      const result = await aiService.explainConcept(topic);

      if (result) {
        setExplanation(result);
      } else {
        throw new Error("No response received from the AI.");
      }
    } catch (err) {
      setError("Sorry, I couldn't fetch an explanation. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SectionWrapper id="margdarshak-ai" className="container mx-auto">
      <SectionHeader 
        title="✨ Try the AI Assistant" 
        subtitle="Get a simple explanation for any academic concept. Powered by Margdarshak-ai." 
      />
      <motion.div
        className="max-w-3xl mx-auto p-8 border border-blue-600/30 bg-gray-900/50 rounded-2xl shadow-xl backdrop-blur-sm"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a concept (e.g., Photosynthesis)"
            className="flex-grow bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            onMouseEnter={() => !isLoading && playSound('hover')}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <Sparkles className="w-5 h-5 transition-transform group-hover:scale-125" />
            )}
            <span>{isLoading ? "Generating..." : "Explain"}</span>
          </button>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-center">
            {error}
          </div>
        )}

        {explanation && (
          <motion.div 
            className="mt-6 p-6 bg-gray-900/70 border border-gray-700/50 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="text-xl font-bold text-emerald-400 mb-3">Explanation:</h4>
            <p className="text-gray-300 text-lg" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {explanation}
            </p>
          </motion.div>
        )}
      </motion.div>
    </SectionWrapper>
  );
};

// --- Placeholder Sections ---

const SectionWrapper = ({ children, id, className = '' }: any) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  React.useEffect(() => {
    if (inView) { controls.start('visible'); }
  }, [controls, inView]);

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.1 } }
      }}
      className={`py-20 md:py-28 px-6 relative z-20 ${className}`}
    >
      {children}
    </motion.section>
  );
};

const SectionHeader = ({ title, subtitle }: any) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 }}
    }}
    className="text-center mb-16"
  >
    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
      <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        {title}
      </span>
    </h2>
    <p className="text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
    <motion.div 
      className="w-24 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto mt-4 rounded-full pulse-shadow-sm"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1, transition: { duration: 0.8, ease: 'easeOut' } }}
      viewport={{ once: true }}
    />
  </motion.div>
);

const Features = () => (
  <SectionWrapper id="features" className="container mx-auto">
    <SectionHeader 
      title="Core Capabilities" 
      subtitle="Designed to streamline every aspect of your academic life with cutting-edge AI." 
    />
    <div className="grid md:grid-cols-3 gap-8">
      {[
        { icon: BrainCircuit, title: 'AI Study Assistant', desc: 'Generate summaries, outlines, and flashcards instantly.' },
        { icon: BarChart, title: 'Grade Prediction Engine', desc: 'Predict final outcomes based on current performance data.' },
        { icon: Calendar, title: 'Dynamic Scheduling', desc: 'Automatically optimize your study time around fixed commitments.' },
        { icon: Shield, title: 'Data Security', desc: 'Your academic data is secured with enterprise-grade encryption.' },
        { icon: BookOpen, title: 'Knowledge Base', desc: 'Centralized access to all course materials and notes.' },
        { icon: CheckSquare, title: 'Habit Tracker', desc: 'Build consistent study habits with gamified progress tracking.' },
      ].map((feature, index) => (
        <TiltCard
          key={index}
          className="p-8 border border-blue-600/30 bg-gray-900/50 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all duration-300 backdrop-blur-sm"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ boxShadow: '0 10px 50px rgba(59, 130, 246, 0.8), 0 0 20px rgba(20, 184, 166, 0.4)' }}
        >
          <div className="p-3 w-fit mb-4 rounded-full bg-blue-600/20 text-blue-400 border border-blue-400/50 pulse-shadow">
            <feature.icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
          <p className="text-gray-400">{feature.desc}</p>
        </TiltCard>
      ))}
    </div>
  </SectionWrapper>
);

const Testimonials = () => {
  const testimonials = [
    { name: 'Sarah K.', role: 'Med Student', stars: 5, quote: "MARGDARSHAK's scheduler is a lifesaver. It found study time I didn't know I had. My grades have visibly improved.", image: 'https://placehold.co/100x100/313131/FFFFFF?text=SK' },
    { name: 'David L.', role: 'Engineering', stars: 5, quote: "The AI summaries for complex research papers are spot on. It saves me hours of reading.", image: 'https://placehold.co/100x100/313131/FFFFFF?text=DL' },
    { name: 'Priya S.', role: 'Comp. Sci.', stars: 5, quote: "I was skeptical about the grade predictor, but it was scarily accurate. It motivated me to push harder for the final.", image: 'https://placehold.co/100x100/313131/FFFFFF?text=PS' },
  ];

  return (
    <SectionWrapper id="testimonials" className="bg-gray-950/50">
      <div className="container mx-auto">
        <SectionHeader 
          title="Student Success Stories"
          subtitle="See how MARGDARSHAK is helping students achieve their academic goals."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TiltCard
              key={index}
              className="p-8 bg-gray-900 border border-blue-600/20 rounded-2xl shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <div className="flex mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-emerald-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-300 italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4 border-2 border-blue-400" />
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

const About = () => {
  const values = [
    { icon: Target, title: 'Precision', desc: 'Focusing on accurate data and achievable goals.' },
    { icon: Eye, title: 'Foresight', desc: 'Using predictive analytics to guide future success.' },
    { icon: Sparkles, title: 'Innovation', desc: 'Constantly evolving our AI to meet student needs.' },
  ];
  return (
    <SectionWrapper id="about" className="container mx-auto">
      <SectionHeader 
        title="Our Mission"
        subtitle="We are building the future of personalized education, one student at a time."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <h3 className="text-3xl font-bold text-white mb-6">The Guide to Academic Excellence</h3>
          <p className="text-lg text-gray-300 mb-4">
            MARGDARSHAK, meaning 'The Guide', was born from a simple idea: that every student deserves a personalized roadmap to success. Traditional academic tools are static. We're building a dynamic, intelligent partner that adapts to *you*.
          </p>
          <p className="text-lg text-gray-300">
            Our team of educators, data scientists, and engineers is dedicated to creating a platform that not only manages your tasks but actively helps you learn, grow, and achieve results you never thought possible.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              className="flex items-start p-6 bg-gray-900 border border-blue-600/20 rounded-2xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <div className="p-3 w-fit h-fit rounded-full bg-blue-600/20 text-blue-400 mr-4">
                <value.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-1">{value.title}</h4>
                <p className="text-gray-400">{value.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

const Pricing = () => {
  const { playSound } = useSound();
  const plans = [
    {
      name: 'Explorer',
      price: '$0',
      desc: 'For casual learners getting started.',
      features: ['Basic AI Assistant', '1 Course Integration', 'Habit Tracker', 'Community Support'],
      popular: false,
    },
    {
      name: 'Premium',
      price: 'RS 750',
      desc: 'The most popular choice for dedicated students.',
      features: [
        'Advanced AI Assistant',
        'Unlimited Course Integrations',
        'Grade Prediction Engine',
        'Dynamic Scheduling',
        'Priority Support'
      ],
      popular: false,
    },
    {
      name: 'Premium + Elite',
      price: 'RS 1200',
      desc: 'For high-achievers who want every advantage.',
      features: [
                 'Everything In Premium',
                'Deep Web Research & Vision',
                'All Premium Features',
                '500 GB Cloud Storage',
                'Predictive Grade Analytics',
                'Automatic Timetable Gen',
                'Dedicated 24/7 Smart Tutor',
                'And Much More'
      ],
      popular: true,
    }
  ];

  return (
    <SectionWrapper id="pricing" className="bg-gray-950/50">
      <div className="container mx-auto">
        <SectionHeader 
          title="Flexible Plans"
          subtitle="Choose the right plan to accelerate your learning journey. Cancel anytime."
        />
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <TiltCard
              key={index}
              className={`p-8 rounded-3xl border ${plan.popular ? 'bg-gray-900 border-blue-500 shadow-2xl shadow-blue-500/30' : 'bg-gray-900/60 border-blue-600/30'} relative overflow-hidden backdrop-blur-sm`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              {plan.popular && (
                <div className="absolute top-0 -right-1/4 w-1/2 text-center py-1.5 bg-blue-500 text-white font-semibold text-sm transform rotate-45 translate-y-6">
                  POPULAR
                </div>
              )}
              <h3 className="text-2xl font-bold text-emerald-400 mb-2">{plan.name}</h3>
              <p className="text-4xl font-extrabold text-white mb-4">
                {plan.price}<span className="text-base font-medium text-gray-400">{plan.price !== '$0' && ' / mo'}</span>
              </p>
              <p className="text-gray-400 mb-6 h-10">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center text-gray-300">
                    <CheckSquare className="w-5 h-5 text-emerald-400 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <MagneticButton className="w-full">
                <Link
                  to="/auth"
                  className={`w-full inline-block text-center font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-300'}`}
                >
                  Get Started
                </Link>
              </MagneticButton>
            </TiltCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

const CTA = () => (
  <SectionWrapper id="cta" className="bg-gradient-to-br from-gray-950 to-blue-900/10 border-t border-blue-600/30">
    <div className="max-w-4xl mx-auto text-center">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-5xl font-bold mb-4 text-white"
      >
        Ready to Achieve Your Best?
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
        className="text-xl text-gray-300 mb-10"
      >
        Join over 50,000 students who are using MARGDARSHAK to master their studies.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 150 }}
        viewport={{ once: true }}
      >
        <MagneticButton>
          <Link to="/auth" className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-2xl shadow-blue-500/40 transition-all duration-300 relative overflow-hidden group">
            Get Started for Free <Rocket className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </MagneticButton>
      </motion.div>
    </div>
  </SectionWrapper>
);

// --- Custom Hooks ---

const useMouseParallax = (ref: any, strength = 2) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normalizedY = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x: normalizedX, y: normalizedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const parallaxX = useTransform(useMotionValue(mousePos.x), [-1, 1], [-strength, strength]);
  const parallaxY = useTransform(useMotionValue(mousePos.y), [-1, 1], [-strength, strength]);
  
  const rotateX = useTransform(useMotionValue(mousePos.y), [-1, 1], ['-0.5deg', '0.5deg']);
  const rotateY = useTransform(useMotionValue(mousePos.x), [-1, 1], ['0.5deg', '-0.5deg']);

  return { translateX: parallaxX, translateY: parallaxY, rotateX, rotateY };
};

const TiltCard = ({ children, className = '', ...props }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const { playSound } = useSound();
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 12 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 12 });
  
  const rotateX = useTransform(springY, [-100, 100], ['8deg', '-8deg']); 
  const rotateY = useTransform(springX, [-100, 100], ['-8deg', '8deg']); 

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current && isHovering) {
        const card = ref.current.getBoundingClientRect();
        const deltaX = (e.clientX - (card.left + card.width / 2)) / (card.width / 2) * 100;
        const deltaY = (e.clientY - (card.top + card.height / 2)) / (card.height / 2) * 100;
        
        mouseX.set(deltaX);
        mouseY.set(deltaY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovering, mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      style={{ 
        rotateX: rotateX, 
        rotateY: rotateY, 
        transformStyle: 'preserve-3d', 
        perspective: '1000px'
      }}
      onMouseEnter={() => {
        setIsHovering(true);
        playSound('hover');
      }}
      onMouseLeave={() => { setIsHovering(false); mouseX.set(0); mouseY.set(0); }}
      className={`preserve-3d ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// --- 3D Scene Simulation ---
const Scene3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: any[] = [];
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (Math.random() * 0.5 + 0.1),
        vy: (Math.random() - 0.5) * (Math.random() * 0.5 + 0.1),
        size: Math.random() * 1.5 + 0.5,
        color: `hsl(${200 + Math.random() * 40}, 80%, 60%)`
      });
    }
    
    let animationFrameId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.vx *= 0.995; 
        p.vy *= 0.995; 
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dxMouse = mousePos.x - p.x;
        const dyMouse = mousePos.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        const maxDist = 120;
        
        if (distMouse < maxDist) {
          const force = (maxDist - distMouse) / maxDist;
          p.vx -= (dxMouse / distMouse) * force * 0.05;
          p.vy -= (dyMouse / distMouse) * force * 0.05;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 opacity-70 transition-opacity duration-500" 
      style={{ zIndex: 0 }} 
    />
  );
};

// --- Custom Components ---

const AnimatedGradientText = ({ children, className = '' }: any) => {
  const style = {
    backgroundSize: '200% auto',
    animation: 'gradient-shift 6s ease-in-out infinite alternate',
    display: 'inline-block',
  };

  return (
    <>
      <style>
        {`
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          .pulse-shadow {
              box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(20, 184, 166, 0.3);
              animation: pulse-glow 2s infinite alternate;
          }
          .pulse-shadow-sm {
              box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
              animation: pulse-glow-sm 3s infinite alternate;
          }
          @keyframes pulse-glow {
            from { box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(20, 184, 166, 0.3); }
            to { box-shadow: 0 0 15px rgba(59, 130, 246, 0.8), 0 0 30px rgba(20, 184, 166, 0.5); }
          }
          @keyframes pulse-glow-sm {
            from { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
            to { box-shadow: 0 0 8px rgba(59, 130, 246, 0.8); }
          }
        `}
      </style>
      <span 
        className={`bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent ${className}`}
        style={style}
      >
        {children}
      </span>
    </>
  );
};

const MagneticButton = ({ children, className = '', ...props }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const { playSound } = useSound();
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 200, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 15 });
  
  const rotateX = useTransform(springY, [-50, 50], ['15deg', '-15deg']);
  const rotateY = useTransform(springX, [-50, 50], ['-15deg', '15deg']);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current && isHovering) {
        const button = ref.current.getBoundingClientRect();
        const centerX = button.left + button.width / 2;
        const centerY = button.top + button.height / 2;
        
        const deltaX = e.pageX - centerX;
        const deltaY = e.pageY - centerY;
        
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const maxDistance = 150;
        const strength = 0.3; 
        
        if (distance < maxDistance) {
          const factor = 1 - distance / maxDistance;
          mouseX.set(deltaX * factor * strength * 2);
          mouseY.set(deltaY * factor * strength * 2);
        } else {
          mouseX.set(0);
          mouseY.set(0);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovering, mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      style={{ 
        x: springX, 
        y: springY, 
        rotateX: rotateX, 
        rotateY: rotateY, 
        transformStyle: 'preserve-3d', 
        perspective: '1000px'
      }}
      onMouseEnter={() => {
        setIsHovering(true);
        playSound('hover');
      }}
      onMouseLeave={() => { setIsHovering(false); mouseX.set(0); mouseY.set(0); }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// --- Layout Components ---

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { soundEnabled, toggleSound, playSound } = useSound();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 2.5 }} // Delay to allow preloader
      className={`text-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-3 bg-gray-900/60 backdrop-blur-xl border-b border-blue-600/30 shadow-2xl shadow-blue-900/50' 
          : 'py-4 bg-transparent border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="src/components/logo/logo.png" alt="Logo" className="h-6 w-6 rounded-md" />
          <h1 className="text-2xl font-black tracking-wider text-white">MARGDARSHAK</h1>
        </div>
        <ul className="hidden md:flex items-center space-x-8 font-medium">
          {['home', 'features', 'margdarshak-ai', 'testimonials', 'about', 'pricing'].map(item => (
            <li key={item}>
              <Link to={`#${item}`} className="capitalize text-gray-300 hover:text-blue-400 transition-colors relative group">
                {item.replace('margdarshak-ai', 'Margdarshak-ai')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-emerald-400 group-hover:w-full transition-all duration-300" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={toggleSound} 
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <MagneticButton className="inline-block">
            <Link to="/auth" className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:shadow-xl hover:shadow-blue-500/40 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 relative overflow-hidden group button-interactive">
              <span className="relative z-10">Launch</span>
              <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 shimmer-effect" />
            </Link>
          </MagneticButton>
        </div>
        <div className="md:hidden">
          <button onClick={toggleSound} className="p-2 text-gray-400 hover:text-white transition-colors mr-2">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button onClick={() => { playSound('click'); setIsMobileMenuOpen(!isMobileMenuOpen); }} className="p-2 rounded-md hover:bg-white/10 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
            </svg>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden mt-4 px-6 pb-4 bg-gray-900/90 backdrop-blur-md border-t border-blue-600/10"
        >
          <ul className="flex flex-col items-start space-y-4">
            {['home', 'features', 'margdarshak-ai', 'testimonials', 'about', 'pricing'].map(item => (
              <li key={item} className="w-full">
                <Link to={`#${item}`} onClick={() => setIsMobileMenuOpen(false)} className="capitalize block py-2 w-full text-gray-300 hover:text-blue-400 transition-colors">
                  {item.replace('margdarshak-ai', 'Margdarshak-ai')}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-center">
            <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="inline-block w-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300">
              Launch Console
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Apply 3D Parallax Tilt to the content wrapper
  const { rotateX, rotateY } = useMouseParallax(heroRef, 1.5);

  const headline1 = "Master Your Studies with".split(" ");
  const headline2 = "Intelligence & Precision".split(" ");
  
  const headlineContainerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 3.0, // Delay for preloader
      }
    }
  };

  const headlineWordVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };

  return (
    <motion.section 
      id="home" 
      ref={heroRef}
      style={{ scale, opacity, perspective: '1000px', transformStyle: 'preserve-3d' }}
      className="relative text-white text-center px-6 overflow-hidden min-h-screen pt-24 md:pt-40 flex items-center justify-center"
    >
      {/* 3D Scene Background */}
      <Scene3D />
      
      {/* Dynamic Spotlight Effect */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-100 ease-out z-10"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.2) 0%, rgba(10, 10, 10, 0) 65%)`, 
        }}
      />

      <motion.div 
        className="relative z-20 max-w-6xl mx-auto py-20"
        style={{ rotateX, rotateY }} // Apply mouse-driven 3D tilt
        variants={headlineContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Orbital Ring (Visual focus point) */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 3.5 }}
          className="absolute inset-0 mx-auto w-96 h-96 border-2 border-blue-500/30 rounded-full my-auto"
          style={{ transform: 'scale(1.5) rotateX(75deg)', top: '10%', left: '50%', transformOrigin: 'center center', opacity: 0.1 }}
        />
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.8 }}
          className="text-sm md:text-base font-semibold uppercase tracking-widest mb-4 inline-block px-4 py-1 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-600/50 pulse-shadow-sm"
        >
          AI-Powered Academic Management
        </motion.p>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-tight"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {headline1.map((word, index) => (
            <span key={index} className="inline-block mr-3 md:mr-5 overflow-hidden">
              <motion.span variants={headlineWordVariants} className="inline-block">
                {word}
              </motion.span>
            </span>
          ))}
          <AnimatedGradientText className="block md:inline-block">
            {headline2.map((word, index) => (
              <span key={index} className="inline-block mr-3 md:mr-5 overflow-hidden">
                <motion.span variants={headlineWordVariants} className="inline-block">
                  {word}
                </motion.span>
              </span>
            ))}
          </AnimatedGradientText>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3.8 }}
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12"
        >
          MARGDARSHAK (The Guide) is the all-in-one system for students, integrating AI scheduling, predictive analytics, and dynamic task management to guarantee academic excellence.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 4.0, type: 'spring', stiffness: 150 }}
          className="flex justify-center gap-6 flex-wrap"
        >
          {/* Holographic Primary Button */}
          <MagneticButton>
            <Link to="/auth" className="inline-flex items-center gap-3 font-extrabold py-4 px-10 rounded-xl text-lg relative overflow-hidden transition-all duration-300 group holographic-button">
              <span className="relative z-10 text-white">Start Free Trial</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 relative z-10" />
            </Link>
            {/* Custom CSS for Holographic Button */}
            <style>{`
              .holographic-button {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%);
                border: 2px solid;
                border-image: linear-gradient(45deg, #3b82f6, #14b8a6) 1;
                box-shadow: 0 0 15px rgba(59, 130, 246, 0.7), 0 0 30px rgba(20, 184, 166, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.2);
                color: white;
              }
              .holographic-button:hover {
                box-shadow: 0 0 20px rgba(59, 130, 246, 1), 0 0 40px rgba(20, 184, 166, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.3);
              }
            `}</style>
          </MagneticButton>
          
          <MagneticButton>
            <Link to="#features" className="inline-flex items-center gap-3 bg-transparent border-2 border-emerald-600/50 text-emerald-300 font-bold py-4 px-10 rounded-xl text-lg hover:bg-emerald-600/10 transition-all duration-300 group">
              Explore Features
            </Link>
          </MagneticButton>
        </motion.div>

        {/* Stats Section with improved glow and border */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 4.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-20 p-6 rounded-2xl bg-gray-900/70 border border-blue-600/40 backdrop-blur-sm shadow-2xl shadow-blue-500/10"
        >
          {[
            { icon: Users, value: '50K+', label: 'Active Students' },
            { icon: Award, value: '98%', label: 'Retention Rate' },
            { icon: TrendingUp, value: '4.9/5', label: 'Student Rating' },
            { icon: Zap, value: '1M+', label: 'Tasks Managed' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 4.4 + index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -5, boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
              className="p-3 md:p-6 bg-gray-900/50 rounded-xl border border-gray-700/50 hover:border-emerald-500/50 transition-colors duration-300"
            >
              <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
};


// --- Main App Component ---

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate asset loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // Preloader duration
    return () => clearTimeout(timer);
  }, []);

  return (
    <SoundProvider>
      <div className="bg-[#0A0A0A] min-h-screen font-sans text-white antialiased relative cursor-none">
        <style>{`
          /* Global 3D/Interactive Styles */
          .preserve-3d {
            transform-style: preserve-3d;
            perspective: 1000px;
          }
          /* Custom Scrollbar for better UX */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #111827;
          }
          ::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #2563eb;
          }
        `}</style>
        
        <AnimatePresence>
          {loading && <Preloader />}
        </AnimatePresence>
        
        <CustomCursor />
        <ScrollProgressBar />
        
        <Header />
        
        <main className="relative z-20">
          <Hero />
          {/* We use Suspense as a good practice, though here all components are bundled */}
          <Suspense fallback={<div className="h-screen bg-[#0A0A0A]" />}>
            <Features />
            <GeminiFeatureDemo />
            <Testimonials />
            <About />
            <Pricing />
            <CTA />
          </Suspense>
        </main>
        
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    </SoundProvider>
  );
};

export default App;