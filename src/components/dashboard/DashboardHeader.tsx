import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Wifi, WifiOff, Download, User as UserIcon, Shield, LogOut, Sparkles } from 'lucide-react';
import NeumorphicButton from '@/lib/NeumorphicButton';
import logo from "@/components/logo/logo.png";
import type { SecureUser } from '@/types/dashboard';

interface DashboardHeaderProps {
  currentUser: SecureUser;
  isOnline: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onExport: (type: 'csv' | 'json') => void;
  onOpenFeatureSpotlight: () => void;
  extraActions?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentUser, isOnline, refreshing, onRefresh, onExport, onOpenFeatureSpotlight, extraActions }) => {
  const { toast } = useToast();
  const logoX = useMotionValue(0);
  const logoY = useMotionValue(0);
  const logoRotateX = useTransform(logoY, [-30, 30], [10, -10]);
  const logoRotateY = useTransform(logoX, [-30, 30], [-10, 10]);

  const handleLogoMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    logoX.set(event.clientX - rect.left - rect.width / 2);
    logoY.set(event.clientY - rect.top - rect.height / 2);
  };
  const handleLogoMouseLeave = () => { logoX.set(0); logoY.set(0); };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: 'spring', stiffness: 100, damping: 15 }}
      className="flex items-center justify-between mb-8 p-6 bg-black/10 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-xl"
    >
      <div className="flex items-center space-x-6">
        <motion.div className="relative" style={{ perspective: 800 }} onMouseMove={handleLogoMouseMove} onMouseLeave={handleLogoMouseLeave}>
          <motion.div style={{ rotateX: logoRotateX, rotateY: logoRotateY }} className="bg-white backdrop-blur-sm p-3 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 ease-out">
            <img
              src={logo}
              alt="MARGDARSHAK Logo"
              className="h-12 object-contain"
              draggable={false}
            />
          </motion.div>
        </motion.div>

        <div className="flex items-center space-x-4">
          <NeumorphicButton
            onClick={onRefresh}
            disabled={refreshing}            className="p-4 group"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 text-emerald-400 transition-transform group-hover:rotate-[270deg] ${refreshing ? 'animate-spin' : ''}`} />
          </NeumorphicButton>

          <div className="flex items-center space-x-2 px-4 py-3 bg-black/20 rounded-xl border border-white/10 shadow-inner-soft">
            {isOnline ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Wifi className="w-5 h-5 text-emerald-400" />
              </motion.div>
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <span className={`text-sm font-bold ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
              {isOnline ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {extraActions}


        <motion.div
          className="flex items-center space-x-4 bg-black/20 backdrop-blur-sm rounded-2xl px-4 py-2 border border-emerald-400/30 shadow-soft-light cursor-pointer group transition-all duration-300 hover:shadow-emerald-500/20 hover:border-emerald-400/60"
          whileHover={{ scale: 1.05, y: -4, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-emerald-500/30">
              <UserIcon className="w-7 h-7 text-white" />
            </div>
            <motion.div
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-black/50"
              animate={{ 
              scale: [1, 1.3, 1],
                boxShadow: ['0 0 0px 0px rgba(34, 197, 94, 0)', '0 0 8px 2px rgba(34, 197, 94, 0.7)', '0 0 0px 0px rgba(34, 197, 94, 0)']
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div>
            <div className="text-white font-bold text-md">
              {currentUser.profile?.full_name || "User"}
            </div>
            <div className="text-emerald-400 text-xs font-bold uppercase flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              {currentUser.profile?.role || "STUDENT"}
            </div>
          </div>
        </motion.div>

        <NeumorphicButton
          onClick={handleLogout}
          className="p-4 bg-red-900/50 border-red-500/30 hover:text-red-300 group"
          title="Logout"
        >
          <LogOut className="w-6 h-6 transition-transform group-hover:scale-110 group-hover:translate-x-1" />
        </NeumorphicButton>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;