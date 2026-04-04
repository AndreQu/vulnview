export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface StatItem {
  title: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
}

export interface Device {
  id: string;
  name: string;
  ip: string;
  os: string;
  status: 'online' | 'warning' | 'offline';
  riskScore: number;
  openCVEs: number;
  lastSeen: string;
}

export interface CveItem {
  id: string;
  title: string;
  severity: Severity;
  cvss: number;
  epss: number;
  publishedAt: string;
}
