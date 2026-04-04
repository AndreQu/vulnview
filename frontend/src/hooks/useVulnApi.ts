import { useCallback } from 'react';
import type { CveItem, Device, Severity } from '../types';
import { getApiData, useApi } from './useApi';

type BackendDevice = {
  id: string;
  device_id: string;
  hostname: string;
  os_type: string;
  os_version: string;
  last_seen?: string;
  is_online: boolean;
};

type BackendVulnerability = {
  severity?: string;
  risk_score?: number | null;
};

type BackendCve = {
  cve_id: string;
  description: string;
  severity: string;
  cvss_score?: number | null;
  epss_score?: number | null;
  published?: string;
};

export type VulnerabilityStats = {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
};

function toSeverity(rawSeverity?: string): Severity {
  switch ((rawSeverity || '').toLowerCase()) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    default:
      return 'low';
  }
}

function formatRelativeTime(input?: string): string {
  if (!input) {
    return 'n/a';
  }

  const date = new Date(input);
  const ts = date.getTime();
  if (Number.isNaN(ts)) {
    return 'n/a';
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSeconds < 60) {
    return 'just now';
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

async function fetchDevices(): Promise<Device[]> {
  const devices = await getApiData<BackendDevice[]>('/v1/devices');

  const enrichedDevices = await Promise.all(
    devices.map(async (device) => {
      let vulnerabilities: BackendVulnerability[] = [];
      try {
        vulnerabilities = await getApiData<BackendVulnerability[]>(`/v1/devices/${device.device_id}/vulnerabilities`);
      } catch {
        vulnerabilities = [];
      }

      const openCVEs = vulnerabilities.length;
      const riskScore = Math.round(
        vulnerabilities.reduce((max, vuln) => {
          const next = typeof vuln.risk_score === 'number' ? vuln.risk_score : 0;
          return Math.max(max, next);
        }, 0),
      );

      const status: Device['status'] = !device.is_online ? 'offline' : openCVEs > 0 ? 'warning' : 'online';

      return {
        id: device.device_id || device.id,
        name: device.hostname,
        ip: '-',
        os: [device.os_type, device.os_version].filter(Boolean).join(' '),
        status,
        riskScore,
        openCVEs,
        lastSeen: formatRelativeTime(device.last_seen),
      };
    }),
  );

  return enrichedDevices;
}

async function fetchCVEs(): Promise<CveItem[]> {
  const cves = await getApiData<BackendCve[]>('/v1/vulnerabilities', { limit: 500 });
  return cves.map((cve) => ({
    id: cve.cve_id,
    title: cve.description,
    severity: toSeverity(cve.severity),
    cvss: cve.cvss_score ?? 0,
    epss: cve.epss_score ?? 0,
    publishedAt: cve.published ? new Date(cve.published).toISOString().slice(0, 10) : 'n/a',
  }));
}

async function fetchStats(): Promise<VulnerabilityStats> {
  return getApiData<VulnerabilityStats>('/v1/vulnerabilities/stats');
}

export function useDevicesApi() {
  const loader = useCallback(() => fetchDevices(), []);
  return useApi(loader, []);
}

export function useCvesApi() {
  const loader = useCallback(() => fetchCVEs(), []);
  return useApi(loader, []);
}

export function useStatsApi() {
  const loader = useCallback(() => fetchStats(), []);
  return useApi(loader, { total: 0, critical: 0, high: 0, medium: 0, low: 0 });
}
