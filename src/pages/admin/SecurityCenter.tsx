import AdminLayout from '@/components/admin/AdminLayout';
import ThreatCard from '@/components/admin/ThreatCard';
import { useAdmin } from '@/hooks/useAdmin';
import { SecurityBadge } from '@/components/security/SecurityBadge';

const SecurityCenter = () => {
  const { threats, loading } = useAdmin();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Security Center</h2>
          <p className="text-sm text-zinc-500">Monitor AI-detected threats and automated policy enforcement.</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Threat Feed</h3>
              <p className="text-xs text-zinc-500">Latest 5 events flagged by AI and heuristics.</p>
            </div>
            <SecurityBadge
              score={threats[0]?.threat_score}
              level={['low', 'medium', 'high', 'critical'].includes(threats[0]?.threat_level || '')
                ? (threats[0]?.threat_level as 'low' | 'medium' | 'high' | 'critical')
                : 'low'}
            />
          </div>
          <div className="mt-4 grid gap-4">
            {loading ? (
              <div className="text-sm text-zinc-500">Loading threats...</div>
            ) : threats.length === 0 ? (
              <div className="text-sm text-zinc-500">No threats detected.</div>
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
      </div>
    </AdminLayout>
  );
};

export default SecurityCenter;
