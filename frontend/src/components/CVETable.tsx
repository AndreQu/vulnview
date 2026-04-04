import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { CveItem, Severity } from '../types';
import { GlassCard } from './GlassCard';

type CVETableProps = {
  cves: CveItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  globalQuery?: string;
};

const labels: Severity[] = ['critical', 'high', 'medium', 'low'];

export function CVETable({ cves, loading, error, onRetry, globalQuery = '' }: CVETableProps) {
  const [filter, setFilter] = useState<'all' | Severity>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalizedGlobalQuery = globalQuery.trim().toLowerCase();
    return cves.filter((item) => {
      const matchesSeverity = filter === 'all' || item.severity === filter;
      const localQuery = query.trim().toLowerCase();
      const matchesSearch =
        localQuery.length === 0 ||
        item.id.toLowerCase().includes(localQuery) ||
        item.title.toLowerCase().includes(localQuery);
      const matchesGlobal =
        normalizedGlobalQuery.length === 0 ||
        item.id.toLowerCase().includes(normalizedGlobalQuery) ||
        item.title.toLowerCase().includes(normalizedGlobalQuery) ||
        item.severity.toLowerCase().includes(normalizedGlobalQuery);
      return matchesSeverity && matchesSearch && matchesGlobal;
    });
  }, [cves, filter, globalQuery, query]);

  return (
    <GlassCard>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold">CVEs</h3>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative mr-2">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search CVE or title"
              className="glass-input py-2 pl-9 pr-3"
            />
          </label>
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-3 py-1.5 text-sm transition ${filter === 'all' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-white/70 text-slate-600 dark:bg-slate-800/90 dark:text-slate-300'}`}
          >
            All
          </button>
          {labels.map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`rounded-full px-3 py-1.5 text-sm capitalize transition ${
                filter === severity
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-white/70 text-slate-600 dark:bg-slate-800/90 dark:text-slate-300'
              }`}
            >
              {severity}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-100/60 p-4 dark:bg-rose-900/15">
          <p className="text-sm text-rose-700 dark:text-rose-300">API error: {error}</p>
          <button onClick={onRetry} className="mt-3 rounded-lg bg-rose-500 px-3 py-1.5 text-sm text-white transition hover:bg-rose-600">
            Retry
          </button>
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-300/70 text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <th className="pb-2">CVE</th>
              <th className="pb-2">Title</th>
              <th className="pb-2">Severity</th>
              <th className="pb-2">CVSS</th>
              <th className="pb-2">EPSS</th>
              <th className="pb-2">Published</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`cve-skeleton-${index}`} className="border-b border-slate-200/80 dark:border-slate-800">
                    <td className="py-3"><div className="skeleton h-4 w-24" /></td>
                    <td className="py-3"><div className="skeleton h-4 w-72" /></td>
                    <td className="py-3"><div className="skeleton h-6 w-16 rounded-full" /></td>
                    <td className="py-3"><div className="skeleton h-4 w-10" /></td>
                    <td className="py-3"><div className="skeleton h-4 w-12" /></td>
                    <td className="py-3"><div className="skeleton h-4 w-20" /></td>
                  </tr>
                ))
              : filtered.map((item) => {
                  const badgeStyle =
                    item.severity === 'critical'
                      ? 'rounded-full bg-rose-500/15 px-2 py-1 text-rose-500'
                      : item.severity === 'high'
                        ? 'rounded-full bg-amber-500/15 px-2 py-1 text-amber-500'
                        : item.severity === 'medium'
                          ? 'rounded-full bg-yellow-500/15 px-2 py-1 text-yellow-600 dark:text-yellow-400'
                          : 'rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-500';

                  return (
                    <tr key={item.id} className="border-b border-slate-200/80 dark:border-slate-800">
                      <td className="py-3 font-medium">{item.id}</td>
                      <td className="py-3">{item.title}</td>
                      <td className="py-3">
                        <span className={badgeStyle}>{item.severity}</span>
                      </td>
                      <td className="py-3">{item.cvss.toFixed(1)}</td>
                      <td className="py-3">{(item.epss * 100).toFixed(0)}%</td>
                      <td className="py-3">{item.publishedAt}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
