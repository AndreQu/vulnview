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
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <GlassCard>
        <p className="text-sm text-apple-gray-500 dark:text-apple-gray-300">{title}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span
            className={
              positive
                ? 'inline-flex items-center gap-1 text-apple-green'
                : 'inline-flex items-center gap-1 text-apple-red'
            }
          >
            {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {delta}
          </span>
          <span className="text-apple-gray-400">vs. letzte Woche</span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
