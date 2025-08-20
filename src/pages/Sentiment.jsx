import React, { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useQuery } from '@tanstack/react-query'
import * as sentimentApi from '../services/api/sentiment'
import { toast } from 'react-hot-toast'

const Sentiment = () => {
  const { t } = useLanguage()
  const [timeRange, setTimeRange] = useState('week')
  const [chartType, setChartType] = useState('polar') // 'line' | 'area' | 'polar'
  const [seriesVisible, setSeriesVisible] = useState({ positive: true, neutral: true, negative: true })

  // Fetch sentiment data using React Query
  const { data: sentimentData, isLoading, error, refetch } = useQuery({
    queryKey: ['sentiment', 'overview'],
    queryFn: sentimentApi.overview,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      toast.error(t('sentiment.fetchError') || 'Failed to load sentiment data')
      console.error('Error fetching sentiment data:', error)
    }
  })

  // Polar stacked area chart (circular timeline)
  const PolarStackedChart = ({ data, size = 300, colors = { positive: '#22c55e', neutral: '#6b7280', negative: '#ef4444' }, visible = { positive: true, neutral: true, negative: true } }) => {
    if (!data || !data.length) return null
    const n = data.length
    const cx = size / 2
    const cy = size / 2
    const innerR = size * 0.22
    const outerR = size * 0.48
    const band = outerR - innerR
    const [hoverIdx, setHoverIdx] = React.useState(null)

    const angAt = (i) => (i / n) * Math.PI * 2 - Math.PI / 2
    const toPoint = (angle, r) => [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]

    const pos = data.map(d => d.positive || 0)
    const neu = data.map(d => d.neutral || 0)
    const neg = data.map(d => d.negative || 0)

    const topNeg = neg.map(v => innerR + band * (v / 100))
    const topNeu = neu.map((v, i) => innerR + band * ((v + neg[i]) / 100))
    const topPos = pos.map((v, i) => innerR + band * ((v + neu[i] + neg[i]) / 100))

    const areaPath = (upper, lower) => {
      const up = upper.map((r, i) => toPoint(angAt(i), r))
      const low = lower.map((r, i) => toPoint(angAt(i), r)).reverse()
      const all = up.concat(low)
      return `M ${all.map(p => `${p[0]},${p[1]}`).join(' L ')} Z`
    }

    const xLabels = data.map(d => {
      try { return new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }) } catch { return '' }
    })

    const handleMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left - cx
      const y = e.clientY - rect.top - cy
      let angle = Math.atan2(y, x) + Math.PI / 2
      if (angle < 0) angle += Math.PI * 2
      const idx = Math.round((angle / (Math.PI * 2)) * n) % n
      setHoverIdx(idx)
    }

    return (
      <svg width={size} height={size} className="max-w-full"
           onMouseMove={handleMove} onMouseLeave={() => setHoverIdx(null)}>
        {/* Rings (25% steps) */}
        {[0, 25, 50, 75, 100].map((g, i) => (
          <circle key={i} cx={cx} cy={cy} r={innerR + band * (g / 100)} fill="none" stroke="#e5e7eb" strokeDasharray="4 4" />
        ))}

        {/* Areas: Negative (base), Neutral, Positive */}
        {visible.negative && (
          <path d={areaPath(topNeg, Array(n).fill(innerR))} fill={colors.negative} opacity="0.35" />
        )}
        {visible.neutral && (
          <path d={areaPath(topNeu, topNeg)} fill={colors.neutral} opacity="0.28" />
        )}
        {visible.positive && (
          <path d={areaPath(topPos, topNeu)} fill={colors.positive} opacity="0.35" />
        )}

        {/* Outer outlines */}
        {visible.negative && (
          <path d={`M ${topNeg.map((r,i)=>toPoint(angAt(i),r).join(',')).join(' L ')}`} fill="none" stroke={colors.negative} strokeWidth="1.5" />
        )}
        {visible.neutral && (
          <path d={`M ${topNeu.map((r,i)=>toPoint(angAt(i),r).join(',')).join(' L ')}`} fill="none" stroke={colors.neutral} strokeWidth="1.5" />
        )}
        {visible.positive && (
          <path d={`M ${topPos.map((r,i)=>toPoint(angAt(i),r).join(',')).join(' L ')}`} fill="none" stroke={colors.positive} strokeWidth="1.5" />
        )}

        {/* Hover indicator and tooltip */}
        {hoverIdx != null && (
          <g>
            <line x1={cx} y1={cy} x2={toPoint(angAt(hoverIdx), outerR)[0]} y2={toPoint(angAt(hoverIdx), outerR)[1]} stroke="#9ca3af" strokeDasharray="3 3" />

            {[topNeg[hoverIdx], topNeu[hoverIdx], topPos[hoverIdx]].map((r, k) => (
              ((k===0 && visible.negative) || (k===1 && visible.neutral) || (k===2 && visible.positive)) ? (
                <circle key={k} cx={toPoint(angAt(hoverIdx), r)[0]} cy={toPoint(angAt(hoverIdx), r)[1]} r={3}
                        fill={k===0?colors.negative:k===1?colors.neutral:colors.positive} />
              ) : null
            ))}

            {(() => {
              const d = data[hoverIdx]
              const label = xLabels[hoverIdx]
              const boxW = 170
              const boxH = 94
              const bx = cx + 8
              const by = cy - boxH / 2
              return (
                <g>
                  <rect x={bx} y={by} width={boxW} height={boxH} rx={8} fill="#111827" opacity="0.9" />
                  <text x={bx + 8} y={by + 16} className="text-[11px]" fill="#e5e7eb">{label}</text>
                  {visible.positive && <text x={bx + 8} y={by + 34} className="text-[11px]" fill={colors.positive}>Positive: {d.positive}%</text>}
                  {visible.neutral && <text x={bx + 8} y={by + 50} className="text-[11px]" fill={colors.neutral}>Neutral: {d.neutral}%</text>}
                  {visible.negative && <text x={bx + 8} y={by + 66} className="text-[11px]" fill={colors.negative}>Negative: {d.negative}%</text>}
                </g>
              )
            })()}
          </g>
        )}

        {/* Cardinal labels */}
        {xLabels.map((lbl, i) => {
          const a = angAt(i)
          const p = toPoint(a, outerR + 12)
          return <text key={i} x={p[0]} y={p[1]} textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-gray-500">{lbl}</text>
        })}
      </svg>
    )
  }

  // Multi-line chart (clean, easy to compare)
  const MultiLineChart = ({ data, width = 720, height = 220, colors = { positive: '#22c55e', neutral: '#6b7280', negative: '#ef4444' }, visible = { positive: true, neutral: true, negative: true } }) => {
    if (!data || !data.length) return null
    const padding = { top: 12, right: 16, bottom: 28, left: 32 }
    const w = width - padding.left - padding.right
    const h = height - padding.top - padding.bottom
    const xStep = w / (data.length - 1 || 1)
    const [hoverIdx, setHoverIdx] = React.useState(null)

    const yScale = v => padding.top + (h - (v / 100) * h)
    const xAt = i => padding.left + i * xStep

    const toLine = (key) => {
      const pts = data.map((d, i) => [xAt(i), yScale(d[key] || 0)])
      if (pts.length <= 1) return ''
      const dseg = ['M', pts[0].join(',')]
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1]
        const p1 = pts[i]
        const mx = (p0[0] + p1[0]) / 2
        dseg.push('Q', `${mx},${p0[1]}`, `${p1[0]},${p1[1]}`)
      }
      return dseg.join(' ')
    }

    const xLabels = data.map(d => {
      try { return new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }) } catch { return '' }
    })

    return (
      <svg
        width={width}
        height={height}
        className="max-w-full"
        onMouseLeave={() => setHoverIdx(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left - padding.left
          const i = Math.max(0, Math.min(data.length - 1, Math.round(x / xStep)))
          setHoverIdx(i)
        }}
      >
        {/* Grid */}
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line x1={padding.left} x2={padding.left + w} y1={yScale(g)} y2={yScale(g)} stroke="#e5e7eb" strokeDasharray="4 4" />
            <text x={8} y={yScale(g) + 3} className="text-[10px] fill-gray-400">{g}%</text>
          </g>
        ))}

        {/* Lines */}
        {visible.positive && <path d={toLine('positive')} fill="none" stroke={colors.positive} strokeWidth="2.2" />}
        {visible.neutral && <path d={toLine('neutral')} fill="none" stroke={colors.neutral} strokeWidth="2.2" strokeDasharray="5 4" />}
        {visible.negative && <path d={toLine('negative')} fill="none" stroke={colors.negative} strokeWidth="2.2" />}

        {/* Hover */}
        {hoverIdx != null && (
          <g>
            <line x1={xAt(hoverIdx)} x2={xAt(hoverIdx)} y1={padding.top} y2={padding.top + h} stroke="#9ca3af" strokeDasharray="3 3" />
            {['positive','neutral','negative'].map((k, i) => (
              visible[k] ? (
                <circle key={k} cx={xAt(hoverIdx)} cy={yScale(data[hoverIdx][k] || 0)} r={3} fill={{positive:'#22c55e',neutral:'#6b7280',negative:'#ef4444'}[k]} />
              ) : null
            ))}

            {/* Tooltip */}
            {(() => {
              const px = xAt(hoverIdx)
              const py = padding.top + 12
              const d = data[hoverIdx]
              const label = xLabels[hoverIdx]
              const boxW = 170
              const boxH = 94
              const bx = Math.min(px + 8, padding.left + w - boxW)
              const by = py
              return (
                <g>
                  <rect x={bx} y={by} width={boxW} height={boxH} rx={8} fill="#111827" opacity="0.9" />
                  <text x={bx + 8} y={by + 16} className="text-[11px]" fill="#e5e7eb">{label}</text>
                  {visible.positive && <text x={bx + 8} y={by + 34} className="text-[11px]" fill="#22c55e">Positive: {d.positive}%</text>}
                  {visible.neutral && <text x={bx + 8} y={by + 50} className="text-[11px]" fill="#6b7280">Neutral: {d.neutral}%</text>}
                  {visible.negative && <text x={bx + 8} y={by + 66} className="text-[11px]" fill="#ef4444">Negative: {d.negative}%</text>}
                  <text x={bx + 8} y={by + 82} className="text-[11px]" fill="#9ca3af">Total: {(d.positive||0)+(d.neutral||0)+(d.negative||0)}%</text>
                </g>
              )
            })()}
          </g>
        )}

        {/* X labels */}
        {xLabels.map((lbl, i) => (
          <text key={i} x={xAt(i)} y={height - 6} className="text-[10px] fill-gray-400" textAnchor="middle">{lbl}</text>
        ))}
      </svg>
    )
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500'
      case 'negative': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Fancy radial gauge without external libs
  const RadialGauge = ({ value = 0, size = 160, thickness = 16, color = '#16a34a' }) => {
    const clamped = Math.max(0, Math.min(100, value))
    const bg = `conic-gradient(${color} ${clamped}%, #e5e7eb ${clamped}%)`
    const inner = size - thickness * 2
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="rounded-full"
          style={{ width: size, height: size, background: bg }}
        />
        <div
          className="absolute inset-0 m-auto bg-white rounded-full flex items-center justify-center"
          style={{ width: inner, height: inner, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)' }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color }}>{clamped}%</div>
            <div className="text-sm text-gray-500">{t('sentiment.overall.positiveLabel')}</div>
          </div>
        </div>
      </div>
    )
  }

  // Smooth stacked area chart (SVG)
  const StackedAreaChart = ({ data, width = 720, height = 220, colors = { positive: '#22c55e', neutral: '#6b7280', negative: '#ef4444' }, visible = { positive: true, neutral: true, negative: true } }) => {
    if (!data || !data.length) return null
    const padding = { top: 12, right: 12, bottom: 28, left: 12 }
    const w = width - padding.left - padding.right
    const h = height - padding.top - padding.bottom
    const xStep = w / (data.length - 1 || 1)
    const [hoverIdx, setHoverIdx] = React.useState(null)

    // Build cumulative stacks 0-100
    const pos = data.map(d => d.positive || 0)
    const neu = data.map(d => d.neutral || 0)
    const neg = data.map(d => d.negative || 0)
    const yScale = v => h * (v / 100)

    // Helper to create smooth path using cardinal-like curves
    const toPath = (ys) => {
      const points = ys.map((y, i) => [padding.left + i * xStep, padding.top + (h - yScale(y))])
      if (points.length <= 2) return `M ${points.map(p => p.join(',')).join(' L ')}`
      const d = ['M', points[0].join(',')]
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1]
        const p1 = points[i]
        const mx = (p0[0] + p1[0]) / 2
        d.push('Q', `${mx},${p0[1]}`, `${p1[0]},${p1[1]}`)
      }
      return d.join(' ')
    }

    // Build stacked upper boundaries
    const topNeg = neg
    const topNeu = neu.map((v, i) => v + neg[i])
    const topPos = pos.map((v, i) => v + neu[i] + neg[i])

    // Area polygons (upper path + reversed lower path)
    const areaPath = (upper, lower, fill) => {
      const upPts = upper.map((v, i) => [padding.left + i * xStep, padding.top + (h - yScale(v))])
      const loPts = lower.map((v, i) => [padding.left + i * xStep, padding.top + (h - yScale(v))]).reverse()
      const all = upPts.concat(loPts)
      return (
        <path d={`M ${all[0][0]},${all[0][1]} ` + all.slice(1).map(p => `L ${p[0]},${p[1]}`).join(' ')} fill={fill} opacity="0.35" />
      )
    }

    const xLabels = data.map(d => {
      try { return new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }) } catch { return '' }
    })

    return (
      <svg
        width={width}
        height={height}
        className="max-w-full"
        onMouseLeave={() => setHoverIdx(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left - padding.left
          const i = Math.max(0, Math.min(data.length - 1, Math.round(x / xStep)))
          setHoverIdx(i)
        }}
      >
        <defs>
          <linearGradient id="gradPos" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={colors.positive} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.positive} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="gradNeu" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={colors.neutral} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors.neutral} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="gradNeg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={colors.negative} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.negative} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line
              x1={padding.left} x2={padding.left + w}
              y1={padding.top + (h - yScale(g))} y2={padding.top + (h - yScale(g))}
              stroke="#e5e7eb" strokeDasharray="4 4"
            />
            <text x={padding.left} y={padding.top + (h - yScale(g)) - 4} className="text-[10px] fill-gray-400">
              {g}%
            </text>
          </g>
        ))}

        {/* Areas stacked: negative at bottom, neutral, then positive */}
        <g style={{ transition: 'opacity 200ms ease' }} opacity={visible.negative ? 1 : 0.08}>
          {areaPath(topNeg, Array(topNeg.length).fill(0), 'url(#gradNeg)')}
        </g>
        <g style={{ transition: 'opacity 200ms ease' }} opacity={visible.neutral ? 1 : 0.08}>
          {areaPath(topNeu, topNeg, 'url(#gradNeu)')}
        </g>
        <g style={{ transition: 'opacity 200ms ease' }} opacity={visible.positive ? 1 : 0.08}>
          {areaPath(topPos, topNeu, 'url(#gradPos)')}
        </g>

        {/* Outline curves for clarity */}
        <path d={toPath(topNeg)} fill="none" stroke={colors.negative} strokeWidth="1.5" opacity={visible.negative ? 0.9 : 0.15} style={{ transition: 'opacity 200ms ease' }} />
        <path d={toPath(topNeu)} fill="none" stroke={colors.neutral} strokeWidth="1.5" opacity={visible.neutral ? 0.8 : 0.15} style={{ transition: 'opacity 200ms ease' }} />
        <path d={toPath(topPos)} fill="none" stroke={colors.positive} strokeWidth="1.5" opacity={visible.positive ? 0.9 : 0.15} style={{ transition: 'opacity 200ms ease' }} />

        {/* Hover crosshair and dots */}
        {hoverIdx != null && (
          <g>
            <line
              x1={padding.left + hoverIdx * xStep}
              x2={padding.left + hoverIdx * xStep}
              y1={padding.top}
              y2={padding.top + h}
              stroke="#9ca3af"
              strokeDasharray="3 3"
            />
            {/* Dots at stacked boundaries */}
            {[topNeg[hoverIdx], topNeu[hoverIdx], topPos[hoverIdx]].map((yVal, k) => (
              <circle
                key={k}
                cx={padding.left + hoverIdx * xStep}
                cy={padding.top + (h - yScale(yVal))}
                r={3}
                fill={k === 0 ? colors.negative : k === 1 ? colors.neutral : colors.positive}
                opacity={(k === 0 && visible.negative) || (k === 1 && visible.neutral) || (k === 2 && visible.positive) ? 1 : 0}
              />
            ))}
          </g>
        )}

        {/* X labels */}
        {xLabels.map((lbl, i) => (
          <text key={i} x={padding.left + i * xStep} y={height - 6} className="text-[10px] fill-gray-400" textAnchor="middle">
            {lbl}
          </text>
        ))}

        {/* Tooltip */}
        {hoverIdx != null && (
          <g>
            {(() => {
              const px = padding.left + hoverIdx * xStep
              const py = padding.top + 12
              const d = data[hoverIdx]
              const label = xLabels[hoverIdx]
              const boxW = 160
              const boxH = 86
              const bx = Math.min(px + 8, padding.left + w - boxW)
              const by = py
              return (
                <g>
                  <rect x={bx} y={by} width={boxW} height={boxH} rx={8} fill="#111827" opacity="0.9" />
                  <text x={bx + 8} y={by + 16} className="text-[11px]" fill="#e5e7eb">{label}</text>
                  {visible.positive && <text x={bx + 8} y={by + 32} className="text-[11px]" fill={colors.positive}>+ {d.positive}%</text>}
                  {visible.neutral && <text x={bx + 8} y={by + 46} className="text-[11px]" fill={colors.neutral}>= {d.neutral}%</text>}
                  {visible.negative && <text x={bx + 8} y={by + 60} className="text-[11px]" fill={colors.negative}>- {d.negative}%</text>}
                </g>
              )
            })()}
          </g>
        )}
      </svg>
    )
  }

  const getSentimentBg = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-500 font-bold mb-2">{t('error_loading_data')}</div>
        <p className="text-red-700 mb-4">{t('failed_to_load_sentiment_data')}</p>
        <button 
          onClick={() => refetch()} 
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          {t('retry')}
        </button>
      </div>
    )
  }

  if (!sentimentData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('sentiment.dataNotAvailable')}</h2>
        <p className="text-gray-600">{t('sentiment.unableToLoad')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{t('sentiment.title')}</h2>
          <p className="text-gray-600 mt-2">{t('sentiment.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {t('sentiment.timeRange.week')}
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {t('sentiment.timeRange.month')}
          </button>
          <button 
            onClick={() => setTimeRange('quarter')}
            className={`px-4 py-2 rounded-lg font-medium ${timeRange === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {t('sentiment.timeRange.quarter')}
          </button>
        </div>
      </div>

      {/* Overall Sentiment */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('sentiment.overall.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Positive</span>
                  <span className="text-sm font-medium text-green-600">{sentimentData.overall.positive}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-green-500 h-4 rounded-full" style={{ width: `${sentimentData.overall.positive}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Neutral</span>
                  <span className="text-sm font-medium text-gray-600">{sentimentData.overall.neutral}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-gray-500 h-4 rounded-full" style={{ width: `${sentimentData.overall.neutral}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Negative</span>
                  <span className="text-sm font-medium text-red-600">{sentimentData.overall.negative}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-red-500 h-4 rounded-full" style={{ width: `${sentimentData.overall.negative}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <RadialGauge value={sentimentData.overall.positive} />
          </div>
        </div>
      </div>

      {/* Sentiment Trends */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">{t('sentiment.trends.title')}</h3>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-gray-200 mr-2">
              {[
                { key: 'line', label: 'Line' },
                { key: 'area', label: 'Area' },
                { key: 'polar', label: 'Polar' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setChartType(opt.key)}
                  className={`px-3 py-1.5 text-sm font-medium ${chartType === opt.key ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  title={`Show ${opt.label} chart`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {[
              { key: 'positive', color: 'bg-green-500', label: t('sentiment.positive') || 'Positive' },
              { key: 'neutral', color: 'bg-gray-500', label: t('sentiment.neutral') || 'Neutral' },
              { key: 'negative', color: 'bg-red-500', label: t('sentiment.negative') || 'Negative' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setSeriesVisible(v => ({ ...v, [item.key]: !v[item.key] }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition ${seriesVisible[item.key] ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-100 border-gray-200 opacity-60'}`}
                title={`Toggle ${item.label}`}
              >
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          {chartType === 'polar' ? (
            <div className="flex justify-center">
              <PolarStackedChart data={sentimentData.trends} visible={seriesVisible} />
            </div>
          ) : chartType === 'line' ? (
            <MultiLineChart data={sentimentData.trends} visible={seriesVisible} />
          ) : (
            <StackedAreaChart data={sentimentData.trends} visible={seriesVisible} />
          )}
        </div>
      </div>

      {/* Category Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">{t('sentiment.category.title')}</h3>
          <div className="space-y-4">
            {sentimentData.categories.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <span className="text-sm font-medium text-green-600">{category.positive}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${category.positive}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Keywords */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">{t('sentiment.keywords.title')}</h3>
          <div className="flex flex-wrap gap-2">
            {sentimentData.keywords.map((keyword, index) => (
              <span 
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentBg(keyword.sentiment)}`}
              >
                {keyword.word} ({keyword.count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sentiment
