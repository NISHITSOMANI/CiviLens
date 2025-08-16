import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AdminLayout = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navItem = (to, label, icon) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
          isActive ? 'bg-yellow-100 text-yellow-800' : 'text-gray-700 hover:bg-gray-100'
        }`
      }
    >
      {icon}
      <span className="font-medium">{label}</span>
    </NavLink>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 p-4 hidden md:flex md:flex-col gap-2">
        <div className="px-2 py-3 mb-2">
          <div className="text-2xl font-extrabold text-gray-900">CiviLens <span className="text-yellow-500">Admin</span></div>
          <div className="text-xs text-gray-500 mt-1">{user?.username}</div>
        </div>
        {navItem('/admin', 'Dashboard', (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        ))}
        {navItem('/admin/schemes', 'Schemes', (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6a2 2 0 012-2h8m-6 2h6m-6 4h6M5 7h14a2 2 0 012 2v8a2 2 0 01-2 2H5l-4 4V9a2 2 0 012-2z"/></svg>
        ))}
        {navItem('/admin/complaints', 'Complaints', (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"/></svg>
        ))}
        {navItem('/admin/analytics', 'Analytics', (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3v18M3 11h18"/></svg>
        ))}
        <div className="mt-auto pt-4">
          <button
            onClick={async () => { await logout(); navigate('/login') }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="md:hidden">
            <div className="text-xl font-bold">CiviLens <span className="text-yellow-500">Admin</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700">Signed in as <span className="font-medium">{user?.username}</span></div>
            <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1">
              {user?.role === 'admin' || user?.is_staff ? 'Admin' : 'User'}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
