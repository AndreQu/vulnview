import { Shield, Monitor, FileText, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/devices', label: 'Devices', icon: Monitor },
  { to: '/cves', label: 'CVEs', icon: AlertTriangle },
  { to: '/reports', label: 'Reports', icon: FileText },
];

export function Sidebar() {
  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 rounded-apple border border-white/40 bg-white/60 p-5 shadow-apple backdrop-blur-glass dark:border-white/10 dark:bg-apple-gray-800/60 lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-apple-blue to-apple-indigo p-2 text-white shadow-glow">
          <Shield size={18} />
        </div>
        <div>
          <p className="text-base font-semibold">VulnView</p>
          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-300">Threat Intelligence</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-gradient-to-r from-apple-blue to-apple-indigo text-white shadow-glow'
                    : 'text-apple-gray-600 hover:bg-white/70 dark:text-apple-gray-100 dark:hover:bg-apple-gray-700/70'
                }`
              }
              end={item.to === '/'}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
