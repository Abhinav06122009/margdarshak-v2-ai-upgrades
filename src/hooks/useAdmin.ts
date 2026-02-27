import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  activeThreats: number;
  reportsOpen: number;
  blockedUsers: number;
}

export interface AdminThreat {
  id: string;
  created_at: string;
  event_type: string;
  threat_level: string;
  threat_score: number;
  summary?: string | null;
  ip_address?: string | null;
}

export interface AdminUser {
  id: string;
  full_name?: string | null;
  email?: string | null;
  user_type?: string | null;
  risk_level?: string | null;
  is_blocked?: boolean | null;
}

export interface AdminReport {
  id: string;
  created_at: string;
  category: string;
  severity?: string | null;
  status?: string | null;
  user_id?: string | null;
}

export interface SupportTicket {
  id: string;
  created_at: string;
  subject?: string | null;
  status?: string | null;
  priority?: string | null;
}

export const useAdmin = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [threats, setThreats] = useState<AdminThreat[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);

    const [usersResponse, threatsResponse, reportsResponse, blockedResponse, ticketsResponse] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, user_type, risk_level, is_blocked'),
      supabase.from('security_threats').select('id, created_at, event_type, threat_level, threat_score, summary, ip_address').order('created_at', { ascending: false }).limit(5),
      supabase.from('admin_reports').select('id, created_at, category, severity, status, user_id').order('created_at', { ascending: false }).limit(5),
      supabase.from('blocked_users').select('id'),
      supabase.from('support_tickets').select('id, created_at, subject, status, priority').order('created_at', { ascending: false }).limit(5),
    ]);

    if (!usersResponse.error) {
      setUsers(usersResponse.data || []);
    }

    if (!threatsResponse.error) {
      setThreats(threatsResponse.data || []);
    }

    if (!reportsResponse.error) {
      setReports(reportsResponse.data || []);
    }

    if (!ticketsResponse.error) {
      setTickets(ticketsResponse.data || []);
    }

    const totalUsers = usersResponse.data?.length || 0;
    const blockedUsers = blockedResponse.data?.length || 0;
    const activeThreats = threatsResponse.data?.length || 0;
    const reportsOpen = reportsResponse.data?.length || 0;

    setStats({
      totalUsers,
      activeThreats,
      reportsOpen,
      blockedUsers,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return {
    stats,
    threats,
    users,
    reports,
    tickets,
    loading,
    refresh: fetchAdminData,
  };
};
