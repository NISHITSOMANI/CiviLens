import React, { useEffect, useState } from 'react'
import { getStats, getHeatmap, getSentimentTrends, getRiskySchemes, getSuccessPredictions } from '../../services/api/admin'

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
  const [heatmap, setHeatmap] = useState([])
  const [sentiment, setSentiment] = useState([])
  const [risky, setRisky] = useState([])
  const [successPred, setSuccessPred] = useState([])

  useEffect(() => {
    const run = async () => {
      try {
        const [s, hm, st, rk, sp] = await Promise.all([
          getStats(),
          getHeatmap(),
          getSentimentTrends(),
          getRiskySchemes(),
          getSuccessPredictions(),
        ])
        setStats(s)
        setHeatmap(hm || [])
        setSentiment(st || [])
        setRisky(rk || [])
        setSuccessPred(sp || [])
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
        {/* Heatmap (Top States by Active Complaints) */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top States by Complaints</h3>
          </div>
          <div className="space-y-3">
            {(heatmap.slice(0, 8) || []).map((row) => (
              <div key={row.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{row.name}</span>
                  <span className="text-gray-500">{row.complaint_count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (row.complaint_count / Math.max(1, heatmap[0]?.complaint_count || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {heatmap.length === 0 && (
              <div className="text-gray-500 text-sm">No data</div>
            )}
          </div>
        </div>

        {/* Sentiment Trends (Sparkline of net score) */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sentiment (7d)</h3>
          </div>
          <div className="h-24">
            {sentiment.length > 0 ? (
              <svg viewBox="0 0 100 24" className="w-full h-full">
                {(() => {
                  const vals = sentiment.map(s => s.net)
                  const min = Math.min(...vals, -1)
                  const max = Math.max(...vals, 1)
                  const range = Math.max(0.0001, max - min)
                  const stepX = 100 / Math.max(1, sentiment.length - 1)
                  const d = sentiment.map((s, i) => {
                    const x = i * stepX
                    const y = 24 - ((s.net - min) / range) * 24
                    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
                  }).join(' ')
                  return (
                    <>
                      <path d={d} fill="none" stroke="#2563eb" strokeWidth="1.5" />
                      {min < 0 && max > 0 && (
                        <line x1="0" x2="100" y1={24 - ((0 - min) / range) * 24} y2={24 - ((0 - min) / range) * 24} stroke="#e5e7eb" strokeWidth="0.5" />
                      )}
                    </>
                  )
                })()}
              </svg>
            ) : (
              <div className="text-gray-500 text-sm">No data</div>
            )}
          </div>
          <div className="flex gap-4 text-xs text-gray-600 mt-2">
            <div>Days: {sentiment.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Predictions */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Likely Successful</h3>
          </div>
          <div className="divide-y">
            {(successPred.slice(0, 5) || []).map(item => (
              <div key={item.scheme_id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">closure:{(item.factors?.closure_rate ?? 0).toFixed(2)} • inactive:{item.factors?.inactivity_days}d</div>
                </div>
                <div className="text-green-600 font-semibold">{Math.round((item.success_probability || 0) * 100)}%</div>
              </div>
            ))}
            {successPred.length === 0 && (
              <div className="text-gray-500 text-sm">No data</div>
            )}
          </div>
        </div>

        {/* Risky Schemes */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Risky Schemes</h3>
          </div>
          <div className="divide-y">
            {(risky.slice(0, 5) || []).map(item => (
              <div key={item.scheme_id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.region} • ac:{item.factors?.scheme_active_complaints} • pos:{(item.factors?.region_positive_ratio ?? 0).toFixed(2)}</div>
                </div>
                <div className="text-red-600 font-semibold">{item.risk}</div>
              </div>
            ))}
            {risky.length === 0 && (
              <div className="text-gray-500 text-sm">No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
