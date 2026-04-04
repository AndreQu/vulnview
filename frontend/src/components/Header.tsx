import { Bell, Moon, Sun } from 'lucide-react';

type HeaderProps = {
  darkMode: boolean;
  onToggleTheme: () => void;
};

export function Header({ darkMode, onToggleTheme }: HeaderProps) {
  return (
    <header className="glass-card flex items-center justify-between px-5 py-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Security Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Live posture for assets and vulnerabilities</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="glass-button"
          aria-label="Theme wechseln"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="glass-button hidden sm:inline-flex"
          aria-label="Benachrichtigungen"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
