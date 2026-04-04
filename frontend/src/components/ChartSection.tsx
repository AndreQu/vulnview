import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GlassCard } from './GlassCard';

const trendData = [
  { day: 'Mo', cves: 22 },
  { day: 'Di', cves: 19 },
  { day: 'Mi', cves: 24 },
  { day: 'Do', cves: 17 },
  { day: 'Fr', cves: 13 },
  { day: 'Sa', cves: 16 },
  { day: 'So', cves: 12 },
];

const riskData = [
  { name: 'Critical', value: 9, fill: '#FF3B30' },
  { name: 'High', value: 21, fill: '#FF9500' },
  { name: 'Medium', value: 37, fill: '#FFCC00' },
  { name: 'Low', value: 54, fill: '#34C759' },
];

export function ChartSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <GlassCard>
          <h3 className="text-lg font-semibold">CVE Verlauf (7 Tage)</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="cveGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#D1D1D6" opacity={0.3} />
                <XAxis dataKey="day" stroke="#8E8E93" />
                <YAxis stroke="#8E8E93" />
                <Tooltip />
                <Area type="monotone" dataKey="cves" stroke="#007AFF" fill="url(#cveGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-semibold">Risk Score</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
