import { Bell, Moon, Sun } from 'lucide-react';

type HeaderProps = {
  darkMode: boolean;
  onToggleTheme: () => void;
};

export function Header({ darkMode, onToggleTheme }: HeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between rounded-apple border border-white/40 bg-white/60 px-5 py-4 shadow-apple backdrop-blur-glass dark:border-white/10 dark:bg-apple-gray-800/60">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Security Operations Dashboard</h1>
        <p className="text-sm text-apple-gray-500 dark:text-apple-gray-300">Live posture und aktuelle Schwachstellenlage</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="rounded-xl border border-apple-gray-200 bg-white/80 p-2 transition hover:shadow-apple dark:border-apple-gray-700 dark:bg-apple-gray-800"
          aria-label="Theme wechseln"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="rounded-xl border border-apple-gray-200 bg-white/80 p-2 transition hover:shadow-apple dark:border-apple-gray-700 dark:bg-apple-gray-800"
          aria-label="Benachrichtigungen"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
