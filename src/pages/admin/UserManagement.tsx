import { useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import FilterBar from '@/components/admin/FilterBar';
import UserRow from '@/components/admin/UserRow';
import { useAdmin } from '@/hooks/useAdmin';
import { logSecurityEvent } from '@/lib/security/securityService';

const UserManagement = () => {
  const { users, loading, refresh } = useAdmin();
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!query) return users;
    const lowered = query.toLowerCase();
    return users.filter((user) => `${user.full_name} ${user.email}`.toLowerCase().includes(lowered));
  }, [query, users]);

  const handleAction = async (action: 'block' | 'unblock', userId: string) => {
    await logSecurityEvent({
      eventType: action === 'block' ? 'admin_block_user' : 'admin_unblock_user',
      userId,
      details: { action },
    });
    refresh();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">User Management</h2>
            <p className="text-sm text-zinc-500">Audit, block, and review user access policies.</p>
          </div>
          <FilterBar placeholder="Search users by name or email" onChange={setQuery} />
        </div>

        {loading ? (
          <div className="text-sm text-zinc-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-sm text-zinc-500">No users found.</div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                id={user.id}
                name={user.full_name}
                email={user.email}
                role={user.user_type}
                risk={user.risk_level}
                blocked={user.is_blocked}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
