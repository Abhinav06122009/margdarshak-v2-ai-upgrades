import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import ThreatCard from '@/components/admin/ThreatCard';
import { useAdmin } from '@/hooks/useAdmin';
import { ShieldCheck, User, AlertTriangle, Ban } from 'lucide-react';

const AdminDashboard = () => {
  const { stats, threats, loading } = useAdmin();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Security Overview</h2>
          <p className="text-sm text-zinc-500">Live snapshot of system health and policy enforcement.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Users" value={stats?.totalUsers ?? '—'} icon={<User className="h-5 w-5" />} />
          <StatCard title="Active Threats" value={stats?.activeThreats ?? '—'} icon={<AlertTriangle className="h-5 w-5" />} />
          <StatCard title="Open Reports" value={stats?.reportsOpen ?? '—'} icon={<ShieldCheck className="h-5 w-5" />} />
          <StatCard title="Blocked Users" value={stats?.blockedUsers ?? '—'} icon={<Ban className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5">
            <h3 className="text-lg font-semibold text-white">Latest Threats</h3>
            <div className="mt-4 grid gap-4">
              {loading ? (
                <div className="text-sm text-zinc-500">Loading threat feed...</div>
              ) : threats.length === 0 ? (
                <div className="text-sm text-zinc-500">No active threats detected.</div>
              ) : (
                threats.map((threat) => (
                  <ThreatCard
                    key={threat.id}
                    title={threat.event_type.replace(/_/g, ' ')}
                    level={threat.threat_level}
                    score={threat.threat_score}
                    summary={threat.summary}
                    ip={threat.ip_address}
                  />
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5">
            <h3 className="text-lg font-semibold text-white">Automation Insight</h3>
            <p className="mt-3 text-sm text-zinc-400">
              AI monitoring is actively inspecting high-risk sessions and content. Review flagged entries in the
              Security Center to take action.
            </p>
            <div className="mt-6 text-xs text-zinc-500">
              Status: {loading ? 'Connecting sensors...' : 'All sensors active'}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
