
import { useState, useEffect } from 'react';
import { supabase, supabaseHelpers, Profile } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const SupabaseStatus = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        // 1. Check authentication status
        const authStatus = await supabaseHelpers.isAuthenticated();
        setIsAuthenticated(authStatus);

        // 2. Get current user
        const currentUser = await supabaseHelpers.getCurrentUser();
        setUser(currentUser);

        // 3. Get user profile (if user is authenticated)
        if (currentUser) {
          const userProfile = await supabaseHelpers.getUserProfile(currentUser.id);
          setProfile(userProfile);
        }

      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    };

    checkSupabase();
  }, []);

  return (
    <div>
      <h2>Supabase Status</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <div>
        <h3>Connection</h3>
        <p>Supabase client initialized: {supabase ? 'Yes' : 'No'}</p>
      </div>
      <div>
        <h3>Authentication</h3>
        <p>Is authenticated: {isAuthenticated === null ? 'Checking...' : isAuthenticated ? 'Yes' : 'No'}</p>
        <p>Current User: {user ? user.email : 'Not logged in'}</p>
      </div>
      <div>
        <h3>User Profile</h3>
        <p>User Profile: {profile ? JSON.stringify(profile, null, 2) : 'No profile found'}</p>
      </div>
    </div>
  );
};

export default SupabaseStatus;
