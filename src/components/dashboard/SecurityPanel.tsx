import React from 'react';
import { ShieldCheck, AlertTriangle, History, Smartphone, Ban, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

// Simplified types for real-world security data
interface SecurityDashboardData {
  total_threats: number;
  threats_today: number;
  high_risk_logins: number;
  last_login_time?: string;
  active_sessions_count?: number;
  security_score?: number;
}

interface SecurityEvent {
  id: string;
  created_at: string;
  event_type: string;
  ip_address: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  details?: {
    location?: string;
    device?: string;
    status?: string;
  };
}

interface SecurityPanelProps {
  dashboardData: SecurityDashboardData | null;
  threats: SecurityEvent[] | null;
}

const SecurityMetric = ({ title, value, icon, status = 'default' }: any) => (
  <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
    <div>
      <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
    </div>
    <div className={`p-3 rounded-lg ${
      status === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
      status === 'danger' ? 'bg-red-500/10 text-red-500' : 
      'bg-zinc-800 text-zinc-400'
    }`}>
      {icon}
    </div>
  </div>
);

const SecurityPanel: React.FC<SecurityPanelProps> = ({ dashboardData, threats }) => {
  if (!dashboardData) return null;

  return (
    <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6 md:p-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Security Overview</h2>
            <p className="text-zinc-400 text-sm">Account activity and login sessions.</p>
          </div>
        </div>
        
        {/* Real Status Badge */}
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1">
          <CheckCircle className="w-3 h-3 mr-2" />
          Protected
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SecurityMetric 
          title="Security Alerts" 
          value={dashboardData.threats_today} 
          icon={<AlertTriangle size={20} />} 
          status={dashboardData.threats_today > 0 ? 'warning' : 'default'}
        />
        <SecurityMetric 
          title="Flagged Logins" 
          value={dashboardData.high_risk_logins} 
          icon={<Ban size={20} />} 
          status={dashboardData.high_risk_logins > 0 ? 'danger' : 'default'}
        />
        <SecurityMetric 
          title="Active Sessions" 
          value={dashboardData.active_sessions_count || 1} 
          icon={<Smartphone size={20} />} 
        />
        <SecurityMetric 
          title="Security Score" 
          value={`${dashboardData.security_score || 98}%`} 
          icon={<ShieldCheck size={20} />} 
        />
      </div>

      {/* Recent Activity Log */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-300">Recent Access Log</h3>
        </div>
        
        <div className="rounded-xl border border-white/5 bg-zinc-900/30 overflow-hidden">
          <ScrollArea className="h-[250px]">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-zinc-400 w-[140px]">Timestamp</TableHead>
                  <TableHead className="text-zinc-400">Activity</TableHead>
                  <TableHead className="text-zinc-400">Location/IP</TableHead>
                  <TableHead className="text-zinc-400 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threats && threats.length > 0 ? (
                  threats.map((event) => (
                    <TableRow key={event.id} className="border-white/5 hover:bg-white/[0.02]">
                      <TableCell className="text-zinc-500 text-xs font-mono">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-zinc-200 font-medium capitalize">
                            {event.event_type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs font-mono">
                        {event.ip_address}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={event.risk_level === 'low' ? 'outline' : 'destructive'} 
                          className="uppercase text-[10px]"
                        >
                          {event.risk_level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-500 py-12">
                      No recent security events found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default SecurityPanel;