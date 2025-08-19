import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isGovOfficial = !!user && (
    user.role === 'official' ||
    user.role === 'government' ||
    user.role === 'government_official' ||
    user.role === 'gov' ||
    user.is_staff === true ||
    user.role === 'admin'
  )

  return (
    <nav className="bg-slate-900 text-white shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-white text-slate-900 font-bold text-xl p-2 rounded shadow-sm">CL</div>
            <Link to="/" className="text-xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded px-1">CiviLens</Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/complaints">Complaints</NavLink>
            <NavLink to="/schemes">Schemes</NavLink>
            <NavLink to="/discussions">Discussions</NavLink>
            <NavLink to="/chat">Chat</NavLink>
            <NavLink to="/documents">Documents</NavLink>
            {isGovOfficial && (
              <>
                <NavLink to="/regions">Regions</NavLink>
                <NavLink to="/sentiment">Sentiment</NavLink>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="hover:text-white/90 transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded px-2 py-1">
                  <span className="hidden md:inline">{user.username}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-sm transition duration-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                    Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-sm transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-white/90 transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded px-2 py-1">Login</Link>
                <Link to="/signup" className="bg-white text-slate-900 hover:bg-white/90 px-4 py-2 rounded-full font-medium transition duration-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// Simple link with animated underline and focus ring
const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded px-1"
  >
    <span className="after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-white/60 after:transition-all after:duration-300 hover:after:w-full">
      {children}
    </span>
  </Link>
)

export default Navbar
