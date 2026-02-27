import { NavLink } from 'react-router-dom';
import { Shield, Users, FileSearch, BarChart3, Settings, Bell, LifeBuoy, Lock } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: Shield },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/security', label: 'Security Center', icon: Lock },
  { to: '/admin/reports', label: 'Investigations', icon: FileSearch },
  { to: '/admin/content', label: 'Content Moderation', icon: Bell },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/support', label: 'Support', icon: LifeBuoy },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminSidebar = () => {
  return (
    <aside className="hidden lg:flex w-64 bg-zinc-950 border-r border-white/5 flex-col p-6">
      <div className="text-xl font-bold text-white mb-10">Admin Portal</div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  isActive ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
