import { ChartSection } from '../components/ChartSection';
import { DeviceTable } from '../components/DeviceTable';
import { StatCard } from '../components/StatCard';

const stats = [
  { title: 'Offene CVEs', value: '121', delta: '+7.4%', trend: 'up' as const },
  { title: 'Critical Issues', value: '9', delta: '-4.2%', trend: 'down' as const },
  { title: 'Gesunde Devices', value: '74', delta: '+3.1%', trend: 'up' as const },
  { title: 'Durchschnitt Risk', value: '42', delta: '-2.0%', trend: 'down' as const },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
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
