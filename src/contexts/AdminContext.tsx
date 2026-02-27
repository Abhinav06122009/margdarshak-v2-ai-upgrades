import React, { createContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AdminProfile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  user_type?: string | null;
}

interface AdminContextValue {
  session: Session | null;
  profile: AdminProfile | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const AdminContext = createContext<AdminContextValue>({
  session: null,
  profile: null,
  isAdmin: false,
  loading: true,
  refresh: async () => undefined,
});

const ADMIN_ROLES = new Set(['admin', 'super_admin', 'staff']);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const resolveAdmin = async (currentSession: Session | null) => {
    if (!currentSession) {
      setProfile(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    let role: string | null = null;

    try {
      const { data } = await supabase.rpc('get_current_user_role');
      if (data) role = data;
    } catch (error) {
      console.warn('Admin role RPC unavailable', error);
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name, email, user_type')
      .eq('id', currentSession.user.id)
      .single();

    setProfile(profileData || null);
    const resolvedRole = role || profileData?.user_type || null;
    setIsAdmin(resolvedRole ? ADMIN_ROLES.has(resolvedRole) : false);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      resolveAdmin(currentSession);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      resolveAdmin(currentSession);
    });
    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({
    session,
    profile,
    isAdmin,
    loading,
    refresh: () => resolveAdmin(session),
  }), [session, profile, isAdmin, loading]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
