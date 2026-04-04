import { ChartSection } from '../components/ChartSection';
import { DeviceTable } from '../components/DeviceTable';
import { StatCard } from '../components/StatCard';

const stats = [
  { title: 'Open CVEs', value: '120', delta: '-5.1%', trend: 'down' as const },
  { title: 'Critical Findings', value: '8', delta: '-2.0%', trend: 'down' as const },
  { title: 'Healthy Devices', value: '74', delta: '+4.3%', trend: 'up' as const },
  { title: 'Patch SLA', value: '91%', delta: '+1.7%', trend: 'up' as const },
];

export function Dashboard() {
  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </section>

      <ChartSection />

      <DeviceTable />
    </div>
  );
}
