// src/components/ui/EnhancedFooter.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket, Users, Star, Shield, Globe, ArrowUp, Send, Twitter, Github, Linkedin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import logo from "@/components/logo/logo.png";

const footerLinks = {
  product: [
    { name: 'Features', href: '#' },
    { name: 'Pricing', href: '#' },
    { name: 'API', href: '#' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Community', href: '#' },
    { name: 'Status', href: '#' },
  ],
  company: [
    { name: 'About Us', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Blog', href: '#' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  { name: 'Twitter', href: 'https://x.com/gyantappas', icon: Twitter },
  { name: 'GitHub', href: 'https://github.com/vsavgyantappas', icon: Github },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
];

const EnhancedFooter = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (window.pageYOffset > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full mt-12 pt-16 pb-8 bg-black/30 backdrop-blur-xl border-t border-white/10 text-white/70 text-sm relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1), rgba(236, 72, 153, 0.1))',
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 15s ease infinite'
      }}></div>
      
      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm p-2 rounded-2xl flex items-center justify-center border border-white/10">
                <img src={logo} alt="VSAV GyanVedu Logo" className="h-10 object-contain" draggable={false} />
              </div>
              <div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  GYANVEDU
                </h3>
                <p className="text-white/60">by VSAV MANAGEMENTS</p>
              </div>
            </div>
            <p className="text-white/60 leading-relaxed">
              The ultimate platform for students and professionals to manage tasks, track progress, and boost productivity.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key}>
                <h4 className="font-bold text-base text-white mb-4 capitalize">{key}</h4>
                <ul className="space-y-3">
                  {section.links.map(link => (
                    <li key={link.name}>
                      <Link to={link.href} className="hover:text-white hover:underline transition-colors duration-200">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            {socialLinks.map((link) => (
              <motion.a 
                key={link.name} 
                href={link.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={link.name} 
                className="text-white/60 hover:text-white transition-colors" 
                whileHover={{ scale: 1.2, y: -2 }}
              >
                <link.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
          <p className="text-center md:text-right">
            Developed by <a href="https://github.com/vsavgyantappas" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-400 hover:underline">Abhinav Jha</a> | © {new Date().getFullYear()} VSAV MANAGEMENTS
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 p-4 bg-blue-600/80 backdrop-blur-sm border border-blue-400/30 rounded-full text-white shadow-lg hover:bg-blue-500/90 hover:scale-110 transition-all duration-300"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            whileHover={{ scale: 1.1, rotate: 360 }}
            whileTap={{ scale: 0.9 }}
            title="Back to Top"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default EnhancedFooter;