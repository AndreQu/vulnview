import { DeviceTable } from '../components/DeviceTable';
import { GlassCard } from '../components/GlassCard';

export function Devices() {
  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-xl font-semibold">Geräteübersicht</h2>
        <p className="mt-1 text-sm text-apple-gray-500 dark:text-apple-gray-300">
          Suche, filtere und analysiere einzelne Geräte mit Risikobewertung.
        </p>
      </GlassCard>
      <DeviceTable />
    </div>
  );
}
