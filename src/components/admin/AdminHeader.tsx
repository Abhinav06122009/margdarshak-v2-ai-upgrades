import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import { AdminContext } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';

const AdminHeader = () => {
  const { profile } = useContext(AdminContext);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-zinc-950/80 px-6 py-4">
      <div>
        <p className="text-sm text-zinc-400">Security Command Center</p>
        <h1 className="text-lg font-semibold text-white">Welcome, {profile?.full_name || 'Administrator'}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
