import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as UserIcon, Mail, Lock, Save, ArrowLeft, Shield, Eye, EyeOff, KeyRound, Command } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import logo from "@/components/logo/logo.png";

// Re-using the user interface from Dashboard for consistency
interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    user_type: string;
    student_id?: string;
  };
  last_sign_in_at?: string;
}

interface SettingsProps {
  onBack?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SecureUser | null>(null);
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error || !authUser) {
        toast({ title: "Error", description: "Could not fetch user information.", variant: "destructive" });
        throw error || new Error("User not found");
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, user_type, student_id')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        toast({ title: "Error", description: "Could not fetch user profile.", variant: "destructive" });
        throw profileError;
      }

      const secureUser: SecureUser = {
        id: authUser.id,
        email: authUser.email || '',
        last_sign_in_at: authUser.last_sign_in_at,
        profile: {
          full_name: profile.full_name || '',
          user_type: profile.user_type || 'student',
          student_id: profile.student_id || ''
        }
      };
      
      setUser(secureUser);
      setFullName(secureUser.profile?.full_name || '');
      setStudentId(secureUser.profile?.student_id || '');

    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmittingProfile(true);

    try {
      // Update user metadata in auth.users
      const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (userError) throw userError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, student_id: studentId })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        className: "bg-gray-900/50 backdrop-blur-md border border-emerald-500/60 shadow-lg rounded-xl p-4 text-emerald-300 font-semibold"
      });

      // Refresh user data
      await fetchUser();

    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update your profile.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
        className: "bg-gray-900/50 backdrop-blur-md border border-emerald-500/60 shadow-lg rounded-xl p-4 text-emerald-300 font-semibold"
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Password Update Failed",
        description: error.message || "Could not update your password.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        Loading settings...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        Could not load user data. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-300 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 font-semibold hover:bg-emerald-600/30 transition-colors shadow-soft-light active:shadow-inner-soft mb-8"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-white backdrop-blur-sm rounded-2xl shadow-lg">
              <img src={logo} alt="VSAV GyanVedu Logo" className="h-12 object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Settings</h1>
              <p className="text-white/70">Manage your account and preferences.</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <UserIcon className="text-emerald-400" />
              Profile Information
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-emerald-400/50 transition-colors shadow-inner-soft"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Student ID (Optional)</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-emerald-400/50 transition-colors shadow-inner-soft"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                <div className="flex items-center gap-3 pl-4 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white/60">
                  <Mail size={18} />
                  <span>{user.email}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmittingProfile}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSubmittingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="text-purple-400" />
              Security
            </h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 transition-colors shadow-inner-soft"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-white/50 hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 transition-colors shadow-inner-soft"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingPassword || !newPassword}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <KeyRound size={18} />
                {isSubmittingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
            {user.last_sign_in_at && (
              <div className="mt-8 text-sm text-white/50">
                Last sign-in: {new Date(user.last_sign_in_at).toLocaleString()}
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-white/10 text-sm flex items-center justify-between text-white/70 bg-black/10 backdrop-blur-sm rounded-t-2xl px-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white backdrop-blur-sm p-1 rounded-lg flex items-center justify-center">
                <img
                  src={logo}
                  alt="VSAV GyanVedu Logo"
                  className="h-8 object-contain"
                  draggable={false}
                />
              </div>
              <div>
                <div className="font-semibold text-emerald-400">VSAV GYANTAPA</div>
                <div className="text-xs">MARGDARSHAK</div>
              </div>
            </div>
            
            <div className="text-right">
              <button onClick={() => {}} className="text-sm text-white/50 hover:text-white transition-colors mb-1 flex items-center gap-2 justify-end cursor-not-allowed opacity-50">
                <Command size={14} />
                <span>Command Menu</span>
                <span className="ml-2 text-xs border border-white/20 rounded px-1.5 py-0.5">Ctrl+K</span>
              </button>
              <div className="text-xs flex items-center justify-end gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Secure Database • User Isolated • Live Sync • Real-Data
              </div>
              <div className="text-xs mt-1">© 2025 VSAV GYANTAPA - All Rights Reserved</div>
            </div>
          </footer>
      </div>
    </div>
  );
};

export default Settings;