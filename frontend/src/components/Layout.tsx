import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('vulnview-theme');
    return saved === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('vulnview-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(0,122,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(175,82,222,0.16),transparent_35%)] px-4 py-6 text-apple-gray-900 dark:text-apple-gray-50 sm:px-6">
      <div className="mx-auto flex max-w-7xl gap-6">
        <Sidebar />

        <main className="w-full">
          <Header darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
