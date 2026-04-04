import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Activity, Server } from 'lucide-react';
import { getDevices, getCVEs, getStats } from '../api/client';

interface Device {
  id: string;
  name: string;
  os: string;
  os_version: string;
  status: 'online' | 'offline';
  last_seen: string;
  ip_address: string;
}

interface CVE {
  id: string;
  cve_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvss_score: number;
  description: string;
  published_date: string;
}

interface Stats {
  total_devices: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

export function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [cves, setCves] = useState<CVE[]>([]);
  const [stats, setStats] = useState<Stats>({ total_devices: 0, critical_count: 0, high_count: 0, medium_count: 0, low_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, c, s] = await Promise.all([
        getDevices(),
        getCVEs(),
        getStats()
      ]);
      setDevices(d || []);
      setCves(c || []);
      setStats(s || { total_devices: 0, critical_count: 0, high_count: 0, medium_count: 0, low_count: 0 });
    } catch (err) {
      setError('Failed to load data: ' + (err as Error).message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'text-red-500',
      high: 'text-orange-500',
      medium: 'text-yellow-500',
      low: 'text-blue-500'
    };
    const icons: Record<string, React.ComponentType<{ className?: string }> = {
      critical: AlertTriangle,
      high: AlertTriangle,
      medium: AlertTriangle,
      low: Shield
    };
    const Icon = icons[severity] || Shield;
    return <Icon className={`w-5 h-5 ${colors[severity]}`} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5, 1] }
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xl text-gray-500"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4 mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">VulnView Dashboard</h1>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Devices', value: stats.total_devices, color: 'blue' },
            { title: 'Critical', value: stats.critical_count, color: 'red' },
            { title: 'High', value: stats.high_count, color: 'orange' },
            { title: 'Medium', value: stats.medium_count, color: 'yellow' }
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">{stat.title}</span>
                <span className={`text-3xl font-bold ${
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'red' ? 'text-red-500' :
                  stat.color === 'orange' ? 'text-orange-500' : 'text-yellow-500'
                }`}>{stat.value}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    stat.color === 'blue' ? 'bg-blue-500' :
                    stat.color === 'red' ? 'bg-red-500' :
                    stat.color === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'
                  }}
                  style={{ width: '60%' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">CVSS Score Distribution</h3>
            <p className="text-gray-500 text-sm">Chart coming soon...</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Severity Timeline</h3>
            <p className="text-gray-500 text-sm">Chart coming soon...</p>
          </motion.div>
        </div>

        {/* Devices Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Devices</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 text-gray-600">Name</th>
                  <th className="text-left p-3 text-gray-600">OS</th>
                  <th className="text-left p-3 text-gray-600">Status</th>
                  <th className="text-left p-3 text-gray-600">IP</th>
                  <th className="text-left p-3 text-gray-600">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {devices.slice(0, 5).map(device => (
                  <tr key={device.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-3">{device.name}</td>
                    <td className="p-3">{device.os} {device.os_version}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {device.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-500">{new Date(device.last_seen).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}