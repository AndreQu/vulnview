import { Download, FileDown, FileSpreadsheet } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

function ExportButton({ label, icon: Icon }: { label: string; icon: typeof Download }) {
  return (
    <button className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/75 px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-apple dark:border-white/10 dark:bg-apple-gray-800/70">
      <Icon size={16} />
      {label}
    </button>
  );
}

export function Reports() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <h2 className="text-xl font-semibold">Reports Export</h2>
        <p className="mt-1 text-sm text-apple-gray-500 dark:text-apple-gray-300">
          Exportiere Security Reports für Audit, Compliance und Incident Reviews.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ExportButton label="PDF Report" icon={FileDown} />
          <ExportButton label="CSV Export" icon={FileSpreadsheet} />
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold">SBOM Download</h2>
        <p className="mt-1 text-sm text-apple-gray-500 dark:text-apple-gray-300">
          Software Bill of Materials für Assets und Container herunterladen.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ExportButton label="CycloneDX JSON" icon={Download} />
          <ExportButton label="SPDX Tag-Value" icon={Download} />
        </div>
      </GlassCard>
    </div>
  );
}
