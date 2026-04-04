import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CVETable } from '../components/CVETable';
import { GlassCard } from '../components/GlassCard';
import { useCvesApi } from '../hooks/useVulnApi';
import type { LayoutOutletContext } from '../types';

export function CVEs() {
  const { globalQuery, pushToast } = useOutletContext<LayoutOutletContext>();
  const cvesApi = useCvesApi();

  useEffect(() => {
    if (cvesApi.error) {
      pushToast(`CVE API failed: ${cvesApi.error}`);
    }
  }, [cvesApi.error, pushToast]);

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <GlassCard>
        <h2 className="text-xl font-semibold">CVE Intelligence</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Prioritized vulnerability feed with CVSS and EPSS context for triage.
        </p>
      </GlassCard>
      <CVETable
        cves={cvesApi.data}
        loading={cvesApi.loading}
        error={cvesApi.error}
        onRetry={cvesApi.retry}
        globalQuery={globalQuery}
      />
    </div>
  );
}
