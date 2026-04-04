import type { PropsWithChildren } from 'react';

export function GlassCard({ children }: PropsWithChildren) {
  return <div className="glass-card p-5">{children}</div>;
}
