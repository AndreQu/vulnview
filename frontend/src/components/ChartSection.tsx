import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GlassCard } from './GlassCard';

const trendData = [
  { day: 'Mon', cves: 31, patched: 18 },
  { day: 'Tue', cves: 29, patched: 20 },
  { day: 'Wed', cves: 34, patched: 25 },
  { day: 'Thu', cves: 26, patched: 19 },
  { day: 'Fri', cves: 24, patched: 17 },
  { day: 'Sat', cves: 22, patched: 15 },
  { day: 'Sun', cves: 19, patched: 14 },
];

const severityData = [
  { level: 'Critical', total: 8 },
  { level: 'High', total: 22 },
  { level: 'Medium', total: 39 },
  { level: 'Low', total: 51 },
];

export function ChartSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <GlassCard>
          <h3 className="text-lg font-semibold">CVE Trend (7 Days)</h3>
          <div className="mt-4 h-72">
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
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="cves" stroke="#0ea5e9" fill="url(#cveGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-semibold">Severity Mix</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer>
            <BarChart data={severityData} layout="vertical" margin={{ left: 4, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="level" type="category" stroke="#64748b" width={55} />
              <Tooltip />
              <Bar dataKey="total" radius={8} fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
