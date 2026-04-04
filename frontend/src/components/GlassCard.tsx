import type { PropsWithChildren } from 'react';

export function GlassCard({ children }: PropsWithChildren) {
  return (
    <div className="rounded-card border border-white/40 bg-white/70 p-5 shadow-apple backdrop-blur-glass transition-all duration-300 hover:-translate-y-0.5 hover:shadow-apple-lg dark:border-white/10 dark:bg-apple-gray-800/65">
      {children}
    </div>
  );
}
