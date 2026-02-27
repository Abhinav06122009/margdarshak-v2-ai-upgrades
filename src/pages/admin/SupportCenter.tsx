import AdminLayout from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';

const SupportCenter = () => {
  const { tickets, loading } = useAdmin();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Support Center</h2>
          <p className="text-sm text-zinc-500">Manage incoming tickets and user escalation workflows.</p>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-500">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-sm text-zinc-500">No tickets in queue.</div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-xl border border-white/5 bg-zinc-900/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{ticket.subject || 'Support Request'}</p>
                    <p className="text-xs text-zinc-500">Opened {new Date(ticket.created_at).toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className="uppercase text-[10px]">
                    {ticket.status || 'open'}
                  </Badge>
                </div>
                {ticket.priority && <p className="mt-3 text-xs text-zinc-400">Priority: {ticket.priority}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SupportCenter;
