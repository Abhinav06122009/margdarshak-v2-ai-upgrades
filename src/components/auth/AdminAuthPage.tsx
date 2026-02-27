import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AdminContext } from '@/contexts/AdminContext';
import { toast } from 'sonner';

const AdminAuthPage = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useContext(AdminContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }

    toast.success('Signed in. Validating admin access...');
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-zinc-900/70 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-xl">Admin Access</CardTitle>
          <p className="text-sm text-zinc-500">Sign in with elevated credentials.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs text-zinc-400">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Password</label>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Authenticating...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuthPage;
