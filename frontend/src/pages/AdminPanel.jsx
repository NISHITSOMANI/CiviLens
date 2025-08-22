import React, { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as adminApi from '../services/api/admin'
import { toast } from 'react-hot-toast'

const AdminPanel = () => {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch users using React Query
  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      toast.error(t('adminPanel.fetchError') || 'Failed to load users')
      console.error('Error fetching users:', error)
    }
  })

  // Analytics queries
  const { data: heatmap = [] } = useQuery({
    queryKey: ['admin', 'analytics', 'heatmap'],
    queryFn: adminApi.getHeatmap,
    staleTime: 1000 * 60 * 5,
    onError: (error) => console.error('Error fetching heatmap:', error)
  })
  const { data: sentiment = [] } = useQuery({
    queryKey: ['admin', 'analytics', 'sentiment'],
    queryFn: adminApi.getSentimentTrends,
    staleTime: 1000 * 60 * 5,
    onError: (error) => console.error('Error fetching sentiment trends:', error)
  })
  const { data: risky = [] } = useQuery({
    queryKey: ['admin', 'analytics', 'risky-schemes'],
    queryFn: adminApi.getRiskySchemes,
    staleTime: 1000 * 60 * 5,
    onError: (error) => console.error('Error fetching risky schemes:', error)
  })
  const { data: successPred = [] } = useQuery({
    queryKey: ['admin', 'analytics', 'success-predictions'],
    queryFn: adminApi.getSuccessPredictions,
    staleTime: 1000 * 60 * 5,
    onError: (error) => console.error('Error fetching success predictions:', error)
  })

  // Fetch admin stats using React Query
  const { data: stats = {} } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      toast.error(t('adminPanel.statsFetchError') || 'Failed to load stats')
      console.error('Error fetching stats:', error)
    }
  })

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }) => adminApi.updateUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users'])
      toast.success(t('adminPanel.userStatusUpdated') || 'User status updated successfully')
    },
    onError: (error) => {
      toast.error(t('adminPanel.userStatusUpdateError') || 'Failed to update user status')
      console.error('Error updating user status:', error)
    }
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users'])
      toast.success(t('adminPanel.userDeleted') || 'User deleted successfully')
    },
    onError: (error) => {
      toast.error(t('adminPanel.userDeleteError') || 'Failed to delete user')
      console.error('Error deleting user:', error)
    }
  })

  const filteredUsers = users.filter(user => {
    // Apply role filter
    if (filter !== 'all' && user.role !== filter) return false
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      )
    }
    
    return true
  })

  const handleToggleStatus = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      updateUserStatusMutation.mutate({ userId, isActive: !user.is_active })
    }
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm(t('adminPanel.deleteConfirm') || 'Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'official': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-500 font-bold mb-2">{t('error_loading_data')}</div>
        <p className="text-red-700 mb-4">{t('failed_to_load_admin_data')}</p>
        <button 
          onClick={() => refetch()} 
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          {t('retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{t('adminPanel.title')}</h2>
        <p className="text-gray-600 mt-2">{t('adminPanel.subtitle')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('adminPanel.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('adminPanel.filterAll')}
              </button>
              <button 
                onClick={() => setFilter('admin')}
                className={`px-4 py-2 rounded-lg font-medium ${filter === 'admin' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('adminPanel.filterAdmin')}
              </button>
              <button 
                onClick={() => setFilter('official')}
                className={`px-4 py-2 rounded-lg font-medium ${filter === 'official' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('adminPanel.filterOfficials')}
              </button>
              <button 
                onClick={() => setFilter('citizen')}
                className={`px-4 py-2 rounded-lg font-medium ${filter === 'citizen' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {t('adminPanel.filterCitizens')}
              </button>
            </div>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            {t('adminPanel.addNewUser')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminPanel.table.user')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminPanel.table.role')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminPanel.table.activity')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminPanel.table.contributions')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminPanel.table.status')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminPanel.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-800 font-bold">{user.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Joined: {new Date(user.date_joined).toLocaleDateString()}</div>
                    <div>Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Complaints: {user.complaints}</div>
                    <div>Schemes: {user.schemes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleToggleStatus(user.id)}
                      className={`mr-2 ${user.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                    >
                      {user.is_active ? t('adminPanel.deactivate') : t('adminPanel.activate')}
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('adminPanel.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('adminPanel.noUsersFound')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('adminPanel.adjustSearch')}</p>
          </div>
        )}
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('adminPanel.stats.totalUsers')}</p>
              <p className="text-2xl font-bold">{stats.totalUsers || users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('adminPanel.stats.activeUsers')}</p>
              <p className="text-2xl font-bold">{stats.activeUsers || users.filter(u => u.is_active).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('adminPanel.stats.officials')}</p>
              <p className="text-2xl font-bold">{stats.officials || users.filter(u => u.role === 'official').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('adminPanel.stats.admins')}</p>
              <p className="text-2xl font-bold">{stats.admins || users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap (Top States by Active Complaints) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top States by Complaints</h3>
          </div>
          <div className="space-y-3">
            {(heatmap.slice(0, 8) || []).map((row) => (
              <div key={row.name} className="">
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

        {/* Sentiment Trends (7d) - Stacked Bars: Positive / Neutral / Negative */}
        <div className="bg-white rounded-xl shadow-md p-6">
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
                const minBar = 2 // px
                const n = data.length
                const dayBand = iw / n
                const gap = dayBand * 0.15
                const inner = dayBand - gap
                const barW = inner / 3
                const xDay = (i) => M.left + i*dayBand + gap/2
                const y = (v) => M.top + ih - (v/maxY)*ih

                return (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                    {/* gridlines */}
                    {[0,0.25,0.5,0.75,1].map(t => (
                      <line key={t} x1={M.left} x2={M.left+iw} y1={M.top + ih*(1-t)} y2={M.top + ih*(1-t)} stroke="#e5e7eb" strokeWidth="0.5" />
                    ))}
                    {/* axes */}
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
                          {/* day label */}
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

        {/* Risky Schemes */}
        <div className="bg-white rounded-xl shadow-md p-6">
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

        {/* Success Predictions */}
        <div className="bg-white rounded-xl shadow-md p-6">
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
      </div>
    </div>
  )
}

export default AdminPanel
