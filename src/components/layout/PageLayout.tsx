import React from 'react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer'; // Uses our new Master Footer
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showBack?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title, description, showBack = true }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Animated Entry */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-grow container mx-auto px-4 py-8 md:py-12"
      >
        {/* Unified Header */}
        {(title || showBack) && (
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              {showBack && (
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(-1)} 
                  className="pl-0 text-slate-400 hover:text-white hover:bg-transparent -ml-2 mb-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              {title && (
                <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-lg text-slate-400 max-w-2xl">{description}</p>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.main>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
};

export default PageLayout;
