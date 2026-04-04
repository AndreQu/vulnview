import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Device } from '../types';
import { GlassCard } from './GlassCard';

type DeviceTableProps = {
  devices: Device[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  globalQuery?: string;
};

export function DeviceTable({ devices, loading, error, onRetry, globalQuery = '' }: DeviceTableProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Device['status']>('all');

  const filtered = useMemo(() => {
    const normalizedGlobalQuery = globalQuery.trim().toLowerCase();
    return devices.filter((device) => {
      const matchesSearch = device.name.toLowerCase().includes(query.toLowerCase()) || device.ip.includes(query);
      const matchesGlobal =
        normalizedGlobalQuery.length === 0 ||
        device.name.toLowerCase().includes(normalizedGlobalQuery) ||
        device.ip.toLowerCase().includes(normalizedGlobalQuery) ||
        device.os.toLowerCase().includes(normalizedGlobalQuery);
      const matchesFilter = statusFilter === 'all' || device.status === statusFilter;
      return matchesSearch && matchesFilter && matchesGlobal;
    });
  }, [devices, globalQuery, query, statusFilter]);

  return (
    <GlassCard>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold">Devices</h3>
        <div className="flex flex-col gap-2 md:flex-row">
          <label className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or IP"
              className="glass-input py-2 pl-9 pr-3"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | Device['status'])}
            className="glass-input px-3 py-2"
          >
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="warning">Warning</option>
            <option value="offline">Offline</option>
          </select>
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
              <th className="pb-2">Name</th>
              <th className="pb-2">IP</th>
              <th className="pb-2">OS</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Risk</th>
              <th className="pb-2">CVEs</th>
              <th className="pb-2">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`device-skeleton-${index}`} className="border-b border-slate-200/80 dark:border-slate-800">
                    <td className="py-3"><div className="skeleton h-4 w-32" /></td>
                    <td className="py-3"><div className="skeleton h-4 w-24" /></td>
                    <td className="py-3"><div className="skeleton h-4 w-28" /></td>
                    <td className="py-3"><div className="skeleton h-6 w-16 rounded-full" /></td>
                    <td className="py-3"><div className="skeleton h-4 w-10" /></td>
                    <td className="py-3"><div className="skeleton h-4 w-10" /></td>
                    <td className="py-3"><div className="skeleton h-4 w-20" /></td>
                  </tr>
                ))
              : filtered.map((device) => (
                  <tr key={device.id} className="border-b border-slate-200/80 text-slate-700 dark:border-slate-800 dark:text-slate-100">
                    <td className="py-3 font-medium">{device.name}</td>
                    <td className="py-3">{device.ip}</td>
                    <td className="py-3">{device.os}</td>
                    <td className="py-3">
                      <span
                        className={
                          device.status === 'online'
                            ? 'rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-500'
                            : device.status === 'warning'
                              ? 'rounded-full bg-amber-500/15 px-2 py-1 text-amber-500'
                              : 'rounded-full bg-rose-500/15 px-2 py-1 text-rose-500'
                        }
                      >
                        {device.status}
                      </span>
                    </td>
                    <td className="py-3">{device.riskScore}</td>
                    <td className="py-3">{device.openCVEs}</td>
                    <td className="py-3">{device.lastSeen}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
