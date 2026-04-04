import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DeviceTable } from '../components/DeviceTable';
import { GlassCard } from '../components/GlassCard';
import { useDevicesApi } from '../hooks/useVulnApi';
import type { LayoutOutletContext } from '../types';

export function Devices() {
  const { globalQuery, pushToast } = useOutletContext<LayoutOutletContext>();
  const devicesApi = useDevicesApi();

  useEffect(() => {
    if (devicesApi.error) {
      pushToast(`Devices API failed: ${devicesApi.error}`);
    }
  }, [devicesApi.error, pushToast]);

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <GlassCard>
        <h2 className="text-xl font-semibold">Device Inventory</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track endpoint health, filter by status and inspect exposure per device.
        </p>
      </GlassCard>
      <DeviceTable
        devices={devicesApi.data}
        loading={devicesApi.loading}
        error={devicesApi.error}
        onRetry={devicesApi.retry}
        globalQuery={globalQuery}
      />
    </div>
  );
}
