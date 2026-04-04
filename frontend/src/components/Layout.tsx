import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('vulnview-theme');
    if (saved === 'light') {
      return false;
    }
    if (saved === 'dark') {
      return true;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('vulnview-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="bg-canvas min-h-screen text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Sidebar />
        <div className="w-full space-y-4">
          <Header darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
