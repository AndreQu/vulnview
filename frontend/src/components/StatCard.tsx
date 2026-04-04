import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { GlassCard } from './GlassCard';

type StatCardProps = {
  title: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
};

export function StatCard({ title, value, delta, trend }: StatCardProps) {
  const positive = trend === 'up';

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <GlassCard>
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className={positive ? 'inline-flex items-center gap-1 text-emerald-500' : 'inline-flex items-center gap-1 text-rose-500'}>
            {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {delta}
          </span>
          <span className="text-slate-400">vs last week</span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
