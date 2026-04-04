import { useEffect, useState } from 'react';
import { getDevices, getCVEs, getStats } from '../api/client';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

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
  const [stats, setStats] = useState<Stats | {}>({});
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
      setStats(s || {});
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
       switch(severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-xl text-gray-500"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="p-8 max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold">{stats.total_devices || 0}</span>
          </div>
          <p className="text-sm text-gray-600">Devices</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold">{stats.critical_count || 0}</span>
          </div>
          <p className="text-sm text-gray-600">Critical</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold">{stats.high_count || 0}</span>
          </div>
          <p className="text-sm text-gray-600">High</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold">{stats.medium_count || 0}</span>
          </div>
          <p className="text-sm text-gray-600">Medium</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-white/20 mb-8"
      >
        <p>Charts coming soon...</p>
      </motion.div>

      {/* Devices Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-white/20"
      >
        <h2 className="text-xl font-semibold mb-4">Recent Devices</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">OS</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">IP</th>
                <th className="text-left p-3">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {devices.slice(0, 5).map(device => (
                <tr key={device.id} className="border-b border-gray-100">
                  <td className="p-3">{device.name}</td>
                  <td className="p-3">{device.os} {device.os_version}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`>
                      {device.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(device.last_seen).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}