import { Bell, Moon, Search, Sun } from 'lucide-react';

type HeaderProps = {
  darkMode: boolean;
  onToggleTheme: () => void;
  globalQuery: string;
  onGlobalQueryChange: (value: string) => void;
};

export function Header({ darkMode, onToggleTheme, globalQuery, onGlobalQueryChange }: HeaderProps) {
  return (
    <header className="glass-card flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Security Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Live posture for assets and vulnerabilities</p>
      </div>

      <div className="flex w-full items-center justify-end gap-2 md:w-auto">
        <label className="relative block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={globalQuery}
            onChange={(event) => onGlobalQueryChange(event.target.value)}
            placeholder="Global Search"
            className="glass-input w-40 py-2 pl-9 pr-3 md:w-52"
          />
        </label>
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
