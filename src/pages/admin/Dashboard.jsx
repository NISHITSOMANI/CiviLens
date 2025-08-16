import React, { useEffect, useState } from 'react'
import { getStats } from '../../services/api/admin'

const StatCard = ({ title, value, color = 'yellow' }) => (
  <div className={`rounded-xl border bg-white p-5 shadow-sm`}> 
    <div className="text-sm text-gray-500">{title}</div>
    <div className={`mt-2 text-3xl font-extrabold text-${color}-600`}>{value}</div>
  </div>
)

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getStats()
        setStats(data)
      } catch (e) {
        setError(e?.message || 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div></div>
  }
  if (error) {
    return <div className="h-64 flex items-center justify-center text-red-600">{error}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Users" value={stats?.users?.total ?? 0} />
        <StatCard title="Active Users" value={stats?.users?.active ?? 0} />
        <StatCard title="Admins" value={stats?.users?.admins ?? 0} />
        <StatCard title="Schemes" value={stats?.schemes?.total ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-5 shadow-sm h-80 flex items-center justify-center text-gray-500">
          Complaint Heatmap (coming soon)
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm h-80 flex items-center justify-center text-gray-500">
          Sentiment Trends (coming soon)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-5 shadow-sm h-60 flex items-center justify-center text-gray-500">
          Success Prediction (coming soon)
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm h-60 flex items-center justify-center text-gray-500">
          Risky Scheme Alerts (coming soon)
        </div>
      </div>
    </div>
  )
}

export default Dashboard
