import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMemo } from 'react';
import { GlassCard } from './GlassCard';
import type { CveItem, Severity } from '../types';

type ChartSectionProps = {
  cves: CveItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

const severityColors: Record<Severity, string> = {
  critical: '#f43f5e',
  high: '#f59e0b',
  medium: '#facc15',
  low: '#10b981',
};

function getLast30DaysTrend(cves: CveItem[]) {
  const days = Array.from({ length: 30 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - index));
    const key = date.toISOString().slice(0, 10);
    return { key, day: key.slice(5), cves: 0 };
  });

  const dayMap = new Map(days.map((item) => [item.key, item]));
  for (const cve of cves) {
    if (dayMap.has(cve.publishedAt)) {
      const hit = dayMap.get(cve.publishedAt);
      if (hit) {
        hit.cves += 1;
      }
    }
  }

  return days;
}

export function ChartSection({ cves, loading, error, onRetry }: ChartSectionProps) {
  const trendData = useMemo(() => getLast30DaysTrend(cves), [cves]);
  const severityData = useMemo(
    () => [
      { level: 'Critical', severity: 'critical' as const, total: cves.filter((cve) => cve.severity === 'critical').length },
      { level: 'High', severity: 'high' as const, total: cves.filter((cve) => cve.severity === 'high').length },
      { level: 'Medium', severity: 'medium' as const, total: cves.filter((cve) => cve.severity === 'medium').length },
      { level: 'Low', severity: 'low' as const, total: cves.filter((cve) => cve.severity === 'low').length },
    ],
    [cves],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <GlassCard>
          <h3 className="text-lg font-semibold">CVE Trend (30 Days)</h3>
          {error ? (
            <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-100/60 p-4 dark:bg-rose-900/15">
              <p className="text-sm text-rose-700 dark:text-rose-300">API error: {error}</p>
              <button onClick={onRetry} className="mt-3 rounded-lg bg-rose-500 px-3 py-1.5 text-sm text-white transition hover:bg-rose-600">
                Retry
              </button>
            </div>
          ) : null}
          <div className="mt-4 h-72">
            {loading ? (
              <div className="skeleton h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="cveGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="cves" stroke="#0ea5e9" fill="url(#cveGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-semibold">Severity Mix</h3>
        <div className="mt-4 h-72">
          {loading ? (
            <div className="skeleton h-full w-full rounded-2xl" />
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={severityData} dataKey="total" nameKey="level" innerRadius={48} outerRadius={88} paddingAngle={2}>
                  {severityData.map((entry) => (
                    <Cell key={entry.level} fill={severityColors[entry.severity]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
