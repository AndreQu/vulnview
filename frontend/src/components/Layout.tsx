import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { LayoutOutletContext, ToastType } from '../types';

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

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

  const [globalQuery, setGlobalQuery] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, type: ToastType = 'error') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const outletContext = useMemo<LayoutOutletContext>(
    () => ({ globalQuery, setGlobalQuery, pushToast }),
    [globalQuery, pushToast],
  );

  return (
    <div className="bg-canvas min-h-screen text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Sidebar />
        <div className="w-full space-y-4">
          <Header
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode((prev) => !prev)}
            globalQuery={globalQuery}
            onGlobalQueryChange={setGlobalQuery}
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Outlet context={outletContext} />
          </motion.div>
        </div>
      </div>
      <div className="pointer-events-none fixed bottom-6 right-6 z-40 w-80 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className={`glass-card border px-4 py-3 text-sm ${
                toast.type === 'error'
                  ? 'border-rose-400/45 text-rose-700 dark:text-rose-200'
                  : 'border-sky-400/45 text-sky-700 dark:text-sky-200'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
