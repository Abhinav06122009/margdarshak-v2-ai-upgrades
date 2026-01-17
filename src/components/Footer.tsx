import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUp, Twitter, Github, Linkedin, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import logo from "@/components/logo/logo.png";

const Footer = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="relative w-full bg-[#050505] border-t border-white/10 pt-16 pb-8 overflow-hidden font-sans">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl relative z-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  MARGDARSHAK
                </h3>
                <p className="text-xs text-blue-400 font-medium tracking-widest">STUDENT OS v2.0</p>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              The ultimate AI-powered ecosystem for academic excellence. Manage grades, tasks, and focus in one zero-trust secure environment.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Twitter, href: "https://x.com" },
                { icon: Github, href: "https://github.com" },
                { icon: Linkedin, href: "https://linkedin.com" }
              ].map((Social, idx) => (
                <a 
                  key={idx}
                  href={Social.href} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/50 transition-all duration-300"
                >
                  <Social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {[
              { 
                title: "Product", 
                links: [
                  { label: "Dashboard", to: "/dashboard" },
                  { label: "AI Tutor", to: "/ai-chat" },
                  { label: "Timetable", to: "/timetable" },
                  { label: "Pro Grade Tracker", to: "/grades" },
                ] 
              },
              { 
                title: "Free Tools (SEO)", 
                links: [
                  { label: "Scientific Calculator", to: "/calculator" },
                  { label: "Pomodoro Timer", to: "/timer" },
                  { label: "Student Blog", to: "/blog" },
                  { label: "Study Resources", to: "/resources" },
                ] 
              },
              { 
                title: "Support", 
                links: [
                  { label: "Help Center", to: "/help" },
                  { label: "Privacy Policy", to: "/privacy" },
                  { label: "Terms of Service", to: "/terms" },
                  { label: "Contact Us", to: "/contact" },
                ] 
              }
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link 
                        to={link.to} 
                        className="text-sm text-slate-400 hover:text-blue-400 hover:pl-2 transition-all duration-300 flex items-center gap-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Secured by VSAV Zero-Trust Architecture</span>
          </div>
          <p>© {new Date().getFullYear()} VSAV GYANTAPA. Developed by Abhinav Jha.</p>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl shadow-blue-500/30 z-50 transition-all"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
