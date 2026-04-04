import { AlertTriangle, LayoutDashboard, Monitor, Shield } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/devices', label: 'Devices', icon: Monitor },
  { to: '/cves', label: 'CVEs', icon: AlertTriangle },
];

export function Sidebar() {
  return (
    <>
      <aside className="glass-card sticky top-5 hidden h-[calc(100vh-2.5rem)] w-64 flex-col p-5 md:flex">
        <div className="mb-7 flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-2 text-white shadow-lg shadow-sky-500/20">
            <Shield size={18} />
          </div>
          <div>
            <p className="text-base font-semibold">VulnView</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Security Posture</p>
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
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/60'
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

      <nav className="glass-card fixed bottom-4 left-1/2 z-20 flex w-[min(92vw,460px)] -translate-x-1/2 justify-around px-2 py-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-w-20 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition ${
                  isActive ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-500 dark:text-slate-300'
                }`
              }
              end={item.to === '/'}
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
