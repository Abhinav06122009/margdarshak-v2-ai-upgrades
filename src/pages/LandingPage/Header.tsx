import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from "@/components/logo/logo.png";
import MagneticButton from './MagneticButton';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`text-white sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? 'py-3 bg-black/70 backdrop-blur-xl border-white/10' : 'py-4 bg-transparent border-transparent'}`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="MARGDARSHAK Logo" className="h-10 w-10 rounded-lg" />
          <h1 className="text-2xl font-bold tracking-wider text-white">MARGDARSHAK</h1>
        </div>
        <ul className="hidden md:flex items-center space-x-8">
          {['home', 'features', 'testimonials', 'about'].map(item => (
            <li key={item}>
              <a href={`${item}`} className="capitalize text-gray-300 hover:text-white transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300" />
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden md:block">
          <MagneticButton>
            <Link to="/auth" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:shadow-lg hover:shadow-emerald-500/40 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 button-interactive button-glow relative overflow-hidden shimmer-effect button-nova">
              Get Started
            </Link>
          </MagneticButton>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 px-6 pb-4">
          <ul className="flex flex-col items-center space-y-4">
            {['home', 'features', 'testimonials', 'about'].map(item => (
              <li key={item}>
                <a href={`${item}`} onClick={() => setIsMobileMenuOpen(false)} className="capitalize text-gray-300 hover:text-white transition-colors relative group">
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-center">
            <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:shadow-lg hover:shadow-emerald-500/40 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 button-interactive button-glow relative overflow-hidden shimmer-effect button-nova">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Header;