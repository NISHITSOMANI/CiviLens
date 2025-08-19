import React, { useEffect, useMemo, useState } from 'react'
import { getAdminComplaints, getAdminComplaintsHeatmap } from '../../services/api/admin'
import { updateComplaint } from '../../services/api/complaints'

const AdminComplaints = () => {
  const LIMIT = 10
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    region: '', // state/region name
    status: 'all', // all|open|closed
  })
  const [loading, setLoading] = useState(false)
  const [hm, setHm] = useState([])
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)

  const apply = async (targetPage = page) => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      if (filters.region) params.region = filters.region
      if (filters.status && filters.status !== 'all') params.status = filters.status
      params.limit = LIMIT
      params.page = targetPage

      const [hmData, list] = await Promise.all([
        getAdminComplaintsHeatmap(params),
        getAdminComplaints(params),
      ])
      setHm(hmData || [])
      setRows(list || [])
    } catch (e) {
      setError(e?.message || 'Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFilters({ start_date: '', end_date: '', region: '', status: 'all' })
    setPage(1)
    apply(1)
  }

  useEffect(() => {
    apply(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const maxCount = useMemo(() => Math.max(1, ...(hm || []).map(r => r.complaint_count || r.count || 0)), [hm])

  const onToggleStatus = async (item) => {
    const next = (item.status === 'closed') ? 'open' : 'closed'
    try {
      await updateComplaint(item.id || item._id, { status: next })
      apply()
    } catch (e) {
      setError(e?.message || 'Failed to update complaint')
    }
  }

  const onAssign = async (item) => {
    const assignee = window.prompt('Assign to (name or email):', item.assignee || '')
    if (!assignee) return
    try {
      await updateComplaint(item.id || item._id, { assignee })
      apply()
    } catch (e) {
      setError(e?.message || 'Failed to assign complaint')
    }
  }

  const canPrev = page > 1
  const canNext = rows.length === LIMIT && !loading

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Complaints Overview</h1>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <div className="text-xs text-gray-600 mb-1">Start date</div>
            <input type="date" value={filters.start_date} onChange={e=>setFilters(f=>({...f,start_date:e.target.value}))} className="w-full border rounded-md px-2 py-1" />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">End date</div>
            <input type="date" value={filters.end_date} onChange={e=>setFilters(f=>({...f,end_date:e.target.value}))} className="w-full border rounded-md px-2 py-1" />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Region/State</div>
            <input type="text" placeholder="e.g. Maharashtra" value={filters.region} onChange={e=>setFilters(f=>({...f,region:e.target.value}))} className="w-full border rounded-md px-2 py-1" />
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Status</div>
            <select value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))} className="w-full border rounded-md px-2 py-1">
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={() => { setPage(1); apply(1) }} className="px-3 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600">Apply</button>
            <button onClick={reset} className="px-3 py-2 rounded-md border hover:bg-gray-50">Reset</button>
          </div>
        </div>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Complaints by Region</h3>
        </div>
        <div className="space-y-3">
          {(hm.slice(0, 12) || []).map((row) => {
            const name = row.name || row.region || 'Unknown'
            const count = row.complaint_count ?? row.count ?? 0
            const pct = Math.min(100, (count / maxCount) * 100)
            return (
              <div key={`${name}-${count}`}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{name}</span>
                  <span className="text-gray-500">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          {hm.length === 0 && (
            <div className="text-gray-500 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Complaints</h3>
          <div className="text-xs text-gray-600">{rows.length} items</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Scheme</th>
                <th className="py-2 pr-4">Region</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(item => (
                <tr key={item.id || item._id} className="border-b last:border-b-0">
                  <td className="py-2 pr-4 text-gray-500">{item.id || item._id?.slice?.(0,6)}</td>
                  <td className="py-2 pr-4 font-medium">{item.title || item.subject || '—'}</td>
                  <td className="py-2 pr-4">{item.scheme?.name || item.scheme || '—'}</td>
                  <td className="py-2 pr-4">{item.region || item.state || item.location || '—'}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${item.status==='closed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.status || 'open'}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>onToggleStatus(item)} className="px-2 py-1 rounded border hover:bg-gray-50">{item.status==='closed' ? 'Reopen' : 'Close'}</button>
                      <button onClick={()=>onAssign(item)} className="px-2 py-1 rounded border hover:bg-gray-50">Assign</button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500">No complaints found</td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <div className="py-4 text-center text-gray-500">Loading…</div>
          )}
        </div>
      </div>
      {/* Pagination Controls */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => { const p = Math.max(1, page - 1); setPage(p); apply(p) }}
            disabled={!canPrev}
            className={`px-3 py-1.5 rounded border ${canPrev ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">Page {page}</span>
          <button
            onClick={() => { const p = page + 1; setPage(p); apply(p) }}
            disabled={!canNext}
            className={`px-3 py-1.5 rounded border ${canNext ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminComplaints
