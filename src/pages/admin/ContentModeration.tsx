import AdminLayout from '@/components/admin/AdminLayout';
import { ThreatAlert } from '@/components/security/ThreatAlert';

const ContentModeration = () => {
  const queue = [
    {
      id: 'flag-1',
      title: 'Potential harassment detected',
      summary: 'Language pattern indicates harassment or abusive intent in recent content submissions.',
      level: 'high' as const,
    },
    {
      id: 'flag-2',
      title: 'Spam-like behavior',
      summary: 'Repetitive content and rapid submissions flagged by automated filters.',
      level: 'medium' as const,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Content Moderation</h2>
          <p className="text-sm text-zinc-500">Review AI-flagged content and enforce community guidelines.</p>
        </div>

        <div className="grid gap-4">
          {queue.map((item) => (
            <ThreatAlert key={item.id} title={item.title} summary={item.summary} level={item.level} />
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentModeration;
