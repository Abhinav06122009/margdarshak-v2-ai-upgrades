import AdminLayout from '@/components/admin/AdminLayout';
import EvidenceViewer from '@/components/admin/EvidenceViewer';
import ActionButtons from '@/components/admin/ActionButtons';
import { useAdmin } from '@/hooks/useAdmin';

const ReportsInvestigation = () => {
  const { reports, loading } = useAdmin();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Investigations</h2>
          <p className="text-sm text-zinc-500">Review reports, compile evidence, and close cases.</p>
        </div>

        {loading ? (
          <div className="text-sm text-zinc-500">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-sm text-zinc-500">No open reports.</div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{report.category.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-zinc-500">Report ID: {report.id}</p>
                  </div>
                  <span className="text-xs text-zinc-400">Severity: {report.severity || 'unknown'}</span>
                </div>
                <EvidenceViewer title="Investigation Notes" details="Review the linked evidence, analyze security logs, and attach investigator notes here." />
                <ActionButtons primaryLabel="Mark Resolved" secondaryLabel="Escalate" />
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportsInvestigation;
