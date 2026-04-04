import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Device } from '../types';
import { GlassCard } from './GlassCard';

const devices: Device[] = [
  {
    id: 'dev-001',
    name: 'MacBook-Pro-001',
    ip: '10.0.0.14',
    os: 'macOS 14.7',
    status: 'online',
    riskScore: 28,
    openCVEs: 3,
    lastSeen: 'vor 2 min',
  },
  {
    id: 'dev-002',
    name: 'Ubuntu-Server-API',
    ip: '10.0.1.20',
    os: 'Ubuntu 24.04',
    status: 'warning',
    riskScore: 71,
    openCVEs: 14,
    lastSeen: 'vor 30 sek',
  },
  {
    id: 'dev-003',
    name: 'Windows-Workstation-9',
    ip: '10.0.4.12',
    os: 'Windows 11',
    status: 'offline',
    riskScore: 45,
    openCVEs: 7,
    lastSeen: 'vor 1 h',
  },
  {
    id: 'dev-004',
    name: 'K8s-Node-Edge',
    ip: '10.0.8.55',
    os: 'Debian 12',
    status: 'online',
    riskScore: 36,
    openCVEs: 5,
    lastSeen: 'gerade eben',
  },
];

export function DeviceTable() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Device['status']>('all');

  const filtered = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch = device.name.toLowerCase().includes(query.toLowerCase()) || device.ip.includes(query);
      const matchesFilter = statusFilter === 'all' || device.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [query, statusFilter]);

  return (
    <GlassCard>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold">Devices</h3>
        <div className="flex flex-col gap-2 md:flex-row">
          <label className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Suche Name oder IP"
              className="rounded-xl border border-apple-gray-200 bg-white/80 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-apple-blue dark:border-apple-gray-700 dark:bg-apple-gray-800/80"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | Device['status'])}
            className="rounded-xl border border-apple-gray-200 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-apple-blue dark:border-apple-gray-700 dark:bg-apple-gray-800/80"
          >
            <option value="all">Alle</option>
            <option value="online">Online</option>
            <option value="warning">Warning</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-apple-gray-200/70 text-apple-gray-500 dark:border-apple-gray-700 dark:text-apple-gray-300">
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
            {filtered.map((device) => (
              <tr key={device.id} className="border-b border-apple-gray-100/80 text-apple-gray-700 dark:border-apple-gray-700/70 dark:text-apple-gray-100">
                <td className="py-3 font-medium">{device.name}</td>
                <td className="py-3">{device.ip}</td>
                <td className="py-3">{device.os}</td>
                <td className="py-3">
                  <span
                    className={
                      device.status === 'online'
                        ? 'rounded-full bg-apple-green/15 px-2 py-1 text-apple-green'
                        : device.status === 'warning'
                          ? 'rounded-full bg-apple-orange/15 px-2 py-1 text-apple-orange'
                          : 'rounded-full bg-apple-red/15 px-2 py-1 text-apple-red'
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
