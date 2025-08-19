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

        {/* Sentiment Trends (7d) - Grouped bars: Positive / Neutral / Negative */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sentiment (7d)</h3>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-green-500"/> Positive</div>
              <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-gray-400"/> Neutral</div>
              <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-500"/> Negative</div>
            </div>
          </div>
          {sentiment.length > 0 ? (
            <div className="h-64">
              {(() => {
                const data = sentiment
                const W = 140, H = 100
                const M = {top: 6, right: 4, bottom: 18, left: 18}
                const iw = W - M.left - M.right
                const ih = H - M.top - M.bottom
                const vals = data.flatMap(d => [d.pos||0, d.neu||0, d.neg||0])
                const maxY = Math.max(1, ...vals)
                const minBar = 2
                const n = data.length
                const dayBand = iw / n
                const gap = dayBand * 0.15
                const inner = dayBand - gap
                const barW = inner / 3
                const xDay = (i) => M.left + i*dayBand + gap/2

                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                    {[0,0.25,0.5,0.75,1].map(t => (
                      <line key={t} x1={M.left} x2={M.left+iw} y1={M.top + ih*(1-t)} y2={M.top + ih*(1-t)} stroke="#e5e7eb" strokeWidth="0.5" />
                    ))}
                    <line x1={M.left} x2={M.left+iw} y1={M.top+ih} y2={M.top+ih} stroke="#9ca3af" strokeWidth="0.6" />
                    <line x1={M.left} x2={M.left} y1={M.top} y2={M.top+ih} stroke="#9ca3af" strokeWidth="0.6" />

                    {data.map((d,i) => {
                      const baseX = xDay(i)
                      const bars = [
                        {key:'pos', val: Math.max(0,d.pos||0), color:'#22c55e'},
                        {key:'neu', val: Math.max(0,d.neu||0), color:'#9ca3af'},
                        {key:'neg', val: Math.max(0,d.neg||0), color:'#ef4444'},
                      ]
                      return (
                        <g key={i}>
                          {bars.map((b,j) => {
                            const h = Math.max(minBar, (b.val/maxY)*ih)
                            const x = baseX + j*barW
                            const yTop = M.top + ih - h
                            return (
                              <g key={b.key}>
                                <rect x={x.toFixed(2)} y={yTop.toFixed(2)} width={Math.max(2, barW-1).toFixed(2)} height={h.toFixed(2)} fill={b.color} rx="1">
                                  <title>{`${new Date(d.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})} • ${b.key.toUpperCase()}\n${b.val}`}</title>
                                </rect>
                                <text x={(x + (barW-1)/2).toFixed(2)} y={(yTop-1).toFixed(2)} textAnchor="middle" fontSize="2.6" fill="#6b7280">{b.val}</text>
                              </g>
                            )
                          })}
                          <text x={(baseX + inner/2).toFixed(2)} y={(M.top+ih+10).toFixed(2)} fontSize="3" textAnchor="middle" fill="#6b7280">
                            {new Date(d.date).toLocaleDateString(undefined,{month:'short', day:'numeric'})}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                )
              })()}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No data</div>
          )}
          <div className="flex gap-4 text-xs text-gray-600 mt-2">
            <div>Days: {sentiment.length}</div>
            <div>Total: {sentiment.reduce((a, s) => a + ((s.pos||0)+(s.neu||0)+(s.neg||0)), 0)}</div>
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
