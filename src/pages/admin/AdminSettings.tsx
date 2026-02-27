import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminSettings = () => {
  const [rateLimit, setRateLimit] = useState('120');
  const [aiSensitivity, setAiSensitivity] = useState('0.7');

  const handleSave = async () => {
    const { error } = await supabase.from('security_settings').upsert({
      id: 'global',
      rate_limit: Number(rateLimit),
      ai_sensitivity: Number(aiSensitivity),
    });

    if (error) {
      toast.error('Failed to save settings');
      return;
    }

    toast.success('Security settings updated');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-semibold">Admin Settings</h2>
          <p className="text-sm text-zinc-500">Configure global security and AI moderation thresholds.</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-zinc-900/40 p-5">
          <div>
            <label className="text-xs text-zinc-400">Rate limit per minute</label>
            <Input value={rateLimit} onChange={(event) => setRateLimit(event.target.value)} />
          </div>
          <div>
            <label className="text-xs text-zinc-400">AI sensitivity (0-1)</label>
            <Input value={aiSensitivity} onChange={(event) => setAiSensitivity(event.target.value)} />
          </div>
          <Button onClick={handleSave}>Save settings</Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
