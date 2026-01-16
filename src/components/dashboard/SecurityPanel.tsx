import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Bot, Fingerprint, Ban, Cpu, Lock, Database, BrainCircuit } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animated-card';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
interface SecurityDashboardData {
  total_threats: number;
  threats_today: number;
  high_risk_logins: number;
  mitigated_threats: number;
  average_trust_score: number;
  // New Ultimate Security Metrics
  quantum_keys_active?: number;
  blockchain_blocks?: number;
  ai_models_active?: number;
  threat_intel_sources?: number;
  fraud_rules_active?: number;
  soc_status?: 'operational' | 'degraded' | 'offline';
}

interface ActiveThreat {
  id: string;
  created_at: string;
  event_type: string;
  ip_address: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  details: {
    trustScore?: number;
    action?: string;
    error?: string;
    anomalies?: string[];
  };
}

interface SecurityPanelProps {
  dashboardData: SecurityDashboardData | null;
  threats: ActiveThreat[] | null;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; tooltip: string }> = ({ title, value, icon, tooltip }) => (
  <TooltipProvider>
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center transition-all duration-300 hover:bg-white/10 hover:border-purple-400/50 cursor-help">
          <div className="flex justify-center items-center mb-2 text-purple-300">{icon}</div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-white/60 truncate">{title}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const getRiskBadgeVariant = (riskLevel: ActiveThreat['risk_level']) => {
  switch (riskLevel) {
    case 'critical':
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    default:
      return 'default';
  }
};

const SecurityPanel: React.FC<SecurityPanelProps> = ({ dashboardData, threats }) => {
  if (!dashboardData) {
    return null; // Or a loading state
  }

  return (
    <AnimatedCard variant="glass" className="p-6 my-8 border border-purple-400/30 shadow-2xl shadow-purple-500/10 relative overflow-hidden scanline-bg card-magic-border">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-400/30">
          <Cpu className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Ultimate Security Center</h2>
          <p className="text-white/60">Military-Grade Threat Intelligence & Quantum Defense.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 mb-6">
        <StatCard title="Threats Today" value={dashboardData.threats_today} icon={<AlertTriangle className="w-6 h-6 text-yellow-400" />} tooltip="Security events detected in the last 24 hours." />
        <StatCard title="High-Risk Logins" value={dashboardData.high_risk_logins} icon={<Ban className="w-6 h-6 text-red-400" />} tooltip="Logins flagged as high-risk." />
        <StatCard title="Avg. Trust Score" value={Math.round(dashboardData.average_trust_score)} icon={<Fingerprint className="w-6 h-6 text-cyan-400" />} tooltip="Average device trust score." />
        <StatCard title="Mitigated" value={dashboardData.mitigated_threats} icon={<Shield className="w-6 h-6 text-emerald-400" />} tooltip="Threats automatically blocked." />
        {/* New Ultimate Security Stats */}
        <StatCard title="Quantum Keys" value={dashboardData.quantum_keys_active ?? 0} icon={<Lock className="w-6 h-6 text-fuchsia-400" />} tooltip="Active quantum-resistant keys." />
        <StatCard title="Audit Blocks" value={dashboardData.blockchain_blocks ?? 0} icon={<Database className="w-6 h-6 text-orange-400" />} tooltip="Immutable blockchain audit trail blocks." />
        <StatCard title="AI Models" value={dashboardData.ai_models_active ?? 0} icon={<BrainCircuit className="w-6 h-6 text-rose-400" />} tooltip="Active AI behavioral learning models." />
        <StatCard title="Threat Intel" value={dashboardData.threat_intel_sources ?? 0} icon={<Bot className="w-6 h-6 text-indigo-400" />} tooltip="Integrated threat intelligence sources." />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Recent Security Events</h3>
        <ScrollArea className="h-[250px] rounded-md border border-white/10 bg-black/20">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/80">Event</TableHead>
                <TableHead className="text-white/80">Risk</TableHead>
                <TableHead className="text-white/80 hidden md:table-cell">IP Address</TableHead>
                <TableHead className="text-white/80 text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {threats && threats.length > 0 ? (
                threats.map((threat) => (
                  <TableRow key={threat.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <p className="font-medium text-white capitalize">{threat.event_type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-white/50 hidden sm:block">
                        {threat.details?.trustScore !== undefined && `Score: ${threat.details.trustScore}`}
                        {threat.details?.action && ` | Action: ${threat.details.action}`}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(threat.risk_level)} className="capitalize">
                        {threat.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs hidden md:table-cell">{threat.ip_address}</TableCell>
                    <TableCell className="text-right text-xs text-white/60">
                      {formatDistanceToNow(new Date(threat.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-white/50 py-8">
                    No security events detected recently. System is secure.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </AnimatedCard>
  );
};

export default SecurityPanel;