import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, BookOpen, Calendar, CheckSquare, Cpu, Shield, Zap, Star, MessageSquare, Twitter, Linkedin, Github, CheckCircle2, Clock, Target, TrendingUp, Users, CheckCircle } from 'lucide-react';
import logo from "public/logo.png";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SectionWrapper = ({ children, id, className = '' }: { children: React.ReactNode, id: string, className?: string }) => {
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
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
      }}
      className={`py-20 md:py-28 px-6 relative ${className}`}
    >
      {children}
    </motion.section>
  );
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.8, 
      ease: [0.6, -0.05, 0.01, 0.99] 
    } 
  }
};

const TiltCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);
  const controls = useAnimation();
  const [inViewRef, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const card = ref.current.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;
    const rotX = ((y - centerY) / centerY) * -8; // Reduced rotation
    const rotY = ((x - centerX) / centerX) * 8;
    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={(node) => { ref.current = node; inViewRef(node); }}
      variants={cardVariants}
      initial="hidden"
      animate={controls}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, transition: 'transform 0.1s ease-out' }}
      className="relative bg-gradient-to-br from-gray-800/60 via-gray-800/40 to-gray-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/50 group overflow-hidden"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
      <div className="relative z-10">
        <motion.div className="text-emerald-400 mb-5 p-4 bg-emerald-500/10 rounded-xl border border-emerald-400/20 inline-block" whileHover={{ scale: 1.1, rotate: 15 }}>{icon}</motion.div>
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">{title}</h3>
        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{description}</p>
      </div>
    </motion.div>
  );
};

const SectionHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="text-center mb-16">
    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
    <p className="text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
    <motion.div      
      className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1, transition: { duration: 0.8, ease: 'easeOut' } }}
      viewport={{ once: true }}
    />
  </div>
);

export const Features = () => (
  <SectionWrapper id="features" className="bg-black/20">
    <div className="container mx-auto">
      <SectionHeader title="Everything You Need to Succeed" subtitle="A comprehensive suite of tools designed to elevate your learning experience and maximize your potential." />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        <TiltCard icon={<Cpu size={32} />} title="AI-Powered Dashboard" description="Get instant insights with a smart dashboard that calculates your productivity score, tracks study streaks, and highlights key stats." />
        <TiltCard icon={<Zap size={32} />} title="Advanced Task Management" description="Organize your academic life with a robust task manager. Prioritize, track progress, and never miss a deadline again." />
        <TiltCard icon={<BarChart size={32} />} title="In-Depth Analytics" description="Visualize your study habits, track grade distribution, and analyze subject performance to identify strengths and weaknesses." />
        <TiltCard icon={<BookOpen size={32} />} title="Comprehensive Course Hub" description="Manage all your courses, from materials to schedules, in one centralized and easy-to-navigate location." />
        <TiltCard icon={<Calendar size={32} />} title="Smart Timetable" description="Stay on top of your schedule with an intelligent timetable that shows upcoming classes and helps you manage your time effectively." />
        <TiltCard icon={<Shield size={32} />} title="Zero-Trust Security" description="Your data is protected with cutting-edge security, including device fingerprinting, behavioral analysis, and MFA." />
      </div>
    </div>
  </SectionWrapper>
);

export const Benefits = () => {
  const benefits = [
    { icon: CheckCircle2, text: "Boost productivity by 3x with smart organization" },
    { icon: CheckCircle2, text: "Never miss deadlines with intelligent reminders" },
    { icon: CheckCircle2, text: "Improve grades with data-driven insights" },
    { icon: CheckCircle2, text: "Save 10+ hours per week on planning" },
    { icon: CheckCircle2, text: "Access from any device, anywhere" },
    { icon: CheckCircle2, text: "Secure cloud backup of all your data" },
  ];

  return (
    <SectionWrapper id="benefits" className="bg-black/20">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Students Love <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">MARGDARSHAK</span>
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join thousands of successful students who transformed their academic journey.
            </p>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg text-gray-300">{benefit.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10 rounded-3xl p-10">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Clock, value: "10hrs+", label: "Time Saved" },
                  { icon: Target, value: "3x", label: "Productivity" },
                  { icon: TrendingUp, value: "85%", label: "Grade Improvement" },
                  { icon: Users, value: "50K+", label: "Happy Students" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
                  >
                    <stat.icon className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                    <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export const Pricing = () => {
  const plans = [
    { name: "Free", price: "₹0", period: "forever", features: ["Basic Timetable", "Task Manager", "Grade Tracker", "5GB Storage", "Email Support"], cta: "Get Started", popular: false, link: "/auth"  },
    { name: "Pro", price: "₹750", period: "per month", features: [
        '50 GB Storage',
        'AI Note Summarization (Soon)',
        'Task Bulk Operations',
        'Task Timer',
        'Full Progress Tracker Access',
        'Priority Support'
      ], cta: "Start Free Trial", popular: true, link: "/upgrade"  },
    { name: "Ultimate", price: "₹1200", period: "per month", features: [
        'All Premium Features',
        '500 GB Expandable Storage',
        'Advanced AI Coach Insights (Soon)',
        'Team Collaboration (Soon)',
        'Dedicated Onboarding'
      ], cta: "Contact Sales", popular: false, link: "/upgrade"  }
  ];

  return (
    <SectionWrapper id="pricing">
      <div className="container mx-auto">
        <SectionHeader title="Simple, Transparent Pricing" subtitle="Choose the perfect plan for your academic journey" />
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <TiltCard
              key={index}
              icon={
                <div className={`relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl p-8 rounded-3xl border ${plan.popular ? 'border-blue-500 shadow-2xl shadow-blue-500/20' : 'border-white/10'} hover:border-blue-400/50 transition-all`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  </div>
                  <ul className="space-y-4 mb-8 text-left">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.link}>
                    <button className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              }
              title=""
              description=""
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

const testimonials = [
  { name: "Priya Sharma", role: "University Student", text: "MARGDARSHAK has completely transformed how I study. The AI dashboard is a game-changer for my productivity!", stars: 5 },
  { name: "Rohan Gupta", role: "High School Student", text: "The task manager and timetable keep me so organized. I've never felt more in control of my schoolwork.", stars: 5 },
  { name: "Anjali Mehta", role: "Competitive Exam Aspirant", text: "The security is top-notch, and having all my resources in one place is incredibly efficient. Highly recommended!", stars: 5 },
];

const TestimonialCard = ({ name, role, text, stars }: typeof testimonials[0]) => (
  <motion.div 
    variants={cardVariants} 
    className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-blue-400/50 transition-all"
  >
    <div className="flex items-center gap-4 mb-6">
      <div className="text-5xl">{name.includes("Priya") ? '👩‍🎓' : name.includes("Rohan") ? '👨‍💻' : '👩‍💼'}</div>
      <div>
        <h4 className="text-xl font-bold text-white">{name}</h4>
        <p className="text-gray-400">{role}</p>
      </div>
    </div>
    <div className="flex gap-1 mb-4">
      {[...Array(stars)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
    </div>
    <p className="text-gray-300 leading-relaxed">"{text}"</p>
  </motion.div>
);

export const Testimonials = () => (
  <SectionWrapper id="testimonials">
    <div className="container mx-auto">
      <SectionHeader title="Loved by Students" subtitle="Hear what our users have to say about their experience with MARGDARSHAK." />
      <motion.div className="grid md:grid-cols-3 gap-10" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
        {testimonials.map(t => <TestimonialCard key={t.name} {...t} />)}
      </motion.div>
    </div>
  </SectionWrapper>
);

export const About = () => (
  <SectionWrapper id="about" className="bg-black/20">
    <div className="container mx-auto text-center max-w-4xl">
      <SectionHeader title="About MARGDARSHAK" subtitle="Our Mission to Revolutionize Learning" />
      <div className="text-lg md:text-xl text-gray-300 space-y-6">
        <p>MARGDARSHAK is a revolutionary platform meticulously engineered to make learning more engaging, effective, and accessible for everyone.</p>
        <p>Our mission is to empower students with the tools they need to thrive in the digital age. We fuse a user-friendly, intuitive interface with powerful, zero-trust security to create a holistic academic ecosystem that you can rely on.</p>
      </div>
    </div>
  </SectionWrapper>
);

export const Contact = () => {
  const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Contact Form Submission from ${formData.name}`;
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
    window.location.href = `mailto:contact@margdarshak.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <SectionWrapper id="contact">
      <div className="container mx-auto max-w-2xl">
        <SectionHeader title="Get In Touch" subtitle="Have questions or feedback? We'd love to hear from you." />
        <motion.form
          onSubmit={handleSubmit}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-6"
        >
          <motion.div variants={cardVariants} className="relative">
            <input type="text" id="name" value={formData.name} onChange={handleChange} className="peer bg-black/30 text-white px-4 py-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-white/20 placeholder-transparent" placeholder="Name" required />
            <label htmlFor="name" className="absolute left-4 -top-3.5 text-gray-400 text-sm bg-[#0A0A0A] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-emerald-400 peer-focus:text-sm">Name</label>
          </motion.div>
          <motion.div variants={cardVariants} className="relative">
            <input type="email" id="email" value={formData.email} onChange={handleChange} className="peer bg-black/30 text-white px-4 py-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-white/20 placeholder-transparent" placeholder="Email" required />
            <label htmlFor="email" className="absolute left-4 -top-3.5 text-gray-400 text-sm bg-[#0A0A0A] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-emerald-400 peer-focus:text-sm">Email</label>
          </motion.div>
          <motion.div variants={cardVariants} className="relative">
            <textarea id="message" value={formData.message} onChange={handleChange} rows={5} className="peer bg-black/30 text-white px-4 py-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-white/20 placeholder-transparent" placeholder="Message" required></textarea>
            <label htmlFor="message" className="absolute left-4 -top-3.5 text-gray-400 text-sm bg-[#0A0A0A] px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-emerald-400 peer-focus:text-sm">Message</label>
          </motion.div>
          <motion.div variants={cardVariants} className="text-center">
            <button type="submit" className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-blue-600 hover:shadow-lg hover:shadow-emerald-500/40 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 button-interactive button-glow relative overflow-hidden shimmer-effect button-nova">
              <MessageSquare className="w-5 h-5" /> Send Message
            </button>
          </motion.div>
        </motion.form>
      </div>
    </SectionWrapper>
  );
};

export const CTA = () => (
  <section className="relative bg-gray-900 py-32 px-6 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
    <div className="container mx-auto relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
      >
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Ready to Transform Your Academic Journey?
        </h2>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12">
          Join 50,000+ students who are already achieving their goals with MARGDARSHAK.
        </p>
        <Link 
          to="/auth"
          className="inline-block px-12 py-5 bg-white text-gray-900 font-bold rounded-xl text-xl hover:shadow-2xl hover:shadow-white/20 transition-all transform hover:scale-105"
        >
          Start Free Today
        </Link>
      </motion.div>
    </div>
  </section>
);

export const Footer = () => (
  <footer className="bg-black/50 border-t border-white/10 text-gray-400 py-12 px-6">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left mb-8">
        <div>
          <div className="flex items-center gap-3 mb-4 justify-center md:justify-start"><img src={logo} alt="MARGDARSHAK Logo" className="h-10 w-10 rounded-lg" /><p className="font-bold text-xl text-white">MARGDARSHAK</p></div>
          <p className="text-gray-500">Your trusted guide to academic excellence.</p>
        </div>
        <div className="md:mx-auto">
          <h4 className="font-bold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Company</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
          </ul>
        </div>
        <div className="md:ml-auto">
          <h4 className="font-bold text-white mb-4">Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="mailto:contact@margdarshak.com" className="hover:text-white transition-colors">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
        <p className="mb-4 sm:mb-0">&copy; {new Date().getFullYear()} MARGDARSHAK. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-white transition-colors"><Twitter /></a>
          <a href="#" aria-label="GitHub" className="text-gray-500 hover:text-white transition-colors"><Github /></a>
          <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-white transition-colors"><Linkedin /></a>
        </div>
      </div>
    </div>
  </footer>
);