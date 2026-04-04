import { CVETable } from '../components/CVETable';
import { GlassCard } from '../components/GlassCard';

export function CVEs() {
  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-xl font-semibold">CVE Intelligence</h2>
        <p className="mt-1 text-sm text-apple-gray-500 dark:text-apple-gray-300">
          Severity-basierte Analyse mit CVSS- und EPSS-Bewertung.
        </p>
      </GlassCard>
      <CVETable />
    </div>
  );
}
