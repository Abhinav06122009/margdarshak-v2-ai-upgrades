import AdminLayout from '@/components/admin/AdminLayout';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  { name: 'Mon', threats: 4, logins: 120 },
  { name: 'Tue', threats: 6, logins: 140 },
  { name: 'Wed', threats: 2, logins: 160 },
  { name: 'Thu', threats: 8, logins: 150 },
  { name: 'Fri', threats: 5, logins: 170 },
  { name: 'Sat', threats: 3, logins: 90 },
  { name: 'Sun', threats: 7, logins: 110 },
];

const Analytics = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Security Analytics</h2>
          <p className="text-sm text-zinc-500">Monitor threat frequency, login volumes, and behavioral signals.</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-5">
          <h3 className="text-lg font-semibold text-white">Weekly Threat Trends</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="name" stroke="#52525b" />
                <YAxis stroke="#52525b" />
                <Tooltip contentStyle={{ background: '#09090b', borderColor: '#27272a' }} />
                <Line type="monotone" dataKey="threats" stroke="#f97316" strokeWidth={2} />
                <Line type="monotone" dataKey="logins" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
