import { DeviceTable } from '../components/DeviceTable';
import { GlassCard } from '../components/GlassCard';

export function Devices() {
  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <GlassCard>
        <h2 className="text-xl font-semibold">Device Inventory</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track endpoint health, filter by status and inspect exposure per device.
        </p>
      </GlassCard>
      <DeviceTable />
    </div>
  );
}
