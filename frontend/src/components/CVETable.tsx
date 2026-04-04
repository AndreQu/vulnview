import { useMemo, useState } from 'react';
import type { CveItem, Severity } from '../types';
import { GlassCard } from './GlassCard';

const cves: CveItem[] = [
  {
    id: 'CVE-2026-1021',
    title: 'Remote Code Execution in OpenSSL handler',
    severity: 'critical',
    cvss: 9.8,
    epss: 0.94,
    publishedAt: '2026-03-25',
  },
  {
    id: 'CVE-2026-2114',
    title: 'Privilege Escalation in kernel module',
    severity: 'high',
    cvss: 8.1,
    epss: 0.66,
    publishedAt: '2026-03-14',
  },
  {
    id: 'CVE-2026-3342',
    title: 'Denial of service in API gateway',
    severity: 'medium',
    cvss: 5.6,
    epss: 0.2,
    publishedAt: '2026-03-04',
  },
  {
    id: 'CVE-2026-3900',
    title: 'Information leak in telemetry daemon',
    severity: 'low',
    cvss: 3.1,
    epss: 0.08,
    publishedAt: '2026-02-11',
  },
];

const labels: Severity[] = ['critical', 'high', 'medium', 'low'];

export function CVETable() {
  const [filter, setFilter] = useState<'all' | Severity>('all');

  const filtered = useMemo(() => {
    return cves.filter((item) => filter === 'all' || item.severity === filter);
  }, [filter]);

  return (
    <GlassCard>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold">CVEs</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-3 py-1.5 text-sm transition ${filter === 'all' ? 'bg-apple-blue text-white shadow-glow' : 'bg-white/70 text-apple-gray-600 dark:bg-apple-gray-700 dark:text-apple-gray-200'}`}
          >
            Alle
          </button>
          {labels.map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`rounded-full px-3 py-1.5 text-sm capitalize transition ${
                filter === severity
                  ? 'bg-apple-blue text-white shadow-glow'
                  : 'bg-white/70 text-apple-gray-600 dark:bg-apple-gray-700 dark:text-apple-gray-200'
              }`}
            >
              {severity}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-apple-gray-200/70 text-apple-gray-500 dark:border-apple-gray-700 dark:text-apple-gray-300">
              <th className="pb-2">CVE</th>
              <th className="pb-2">Titel</th>
              <th className="pb-2">Severity</th>
              <th className="pb-2">CVSS</th>
              <th className="pb-2">EPSS</th>
              <th className="pb-2">Veröffentlicht</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-apple-gray-100/80 dark:border-apple-gray-700/70">
                <td className="py-3 font-medium">{item.id}</td>
                <td className="py-3">{item.title}</td>
                <td className="py-3">
                  <span
                    className={
                      item.severity === 'critical'
                        ? 'rounded-full bg-apple-red/15 px-2 py-1 text-apple-red'
                        : item.severity === 'high'
                          ? 'rounded-full bg-apple-orange/15 px-2 py-1 text-apple-orange'
                          : item.severity === 'medium'
                            ? 'rounded-full bg-apple-yellow/20 px-2 py-1 text-yellow-700 dark:text-apple-yellow'
                            : 'rounded-full bg-apple-green/15 px-2 py-1 text-apple-green'
                    }
                  >
                    {item.severity}
                  </span>
                </td>
                <td className="py-3">{item.cvss.toFixed(1)}</td>
                <td className="py-3">{(item.epss * 100).toFixed(0)}%</td>
                <td className="py-3">{item.publishedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
