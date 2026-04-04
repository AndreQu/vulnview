import { CVETable } from '../components/CVETable';
import { GlassCard } from '../components/GlassCard';

export function CVEs() {
  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <GlassCard>
        <h2 className="text-xl font-semibold">CVE Intelligence</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Prioritized vulnerability feed with CVSS and EPSS context for triage.
        </p>
      </GlassCard>
      <CVETable />
    </div>
  );
}
