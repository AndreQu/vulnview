import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:18080'

function App() {
  const [devices, setDevices] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [devicesRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/devices`),
        axios.get(`${API_URL}/api/v1/stats`)
      ])
      setDevices(devicesRes.data.data || [])
      setStats(statsRes.data.data || {})
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">VulnView Dashboard</h1>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Devices" value={stats.total || 0} color="blue" />
          <StatCard title="Critical" value={stats.critical || 0} color="red" />
          <StatCard title="High" value={stats.high || 0} color="orange" />
          <StatCard title="Medium" value={stats.medium || 0} color="yellow" />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Devices</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">OS</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {devices.map(device => (
                  <tr key={device.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{device.name}</td>
                    <td className="p-2">{device.os} {device.os_version}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        device.status === 'online' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {device.status}
                      </span>
                    </td>
                    <td className="p-2">{new Date(device.last_seen).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500'
  }

  return (
    <div className={`${colors[color]} text-white rounded-lg p-4 shadow`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

export default App
