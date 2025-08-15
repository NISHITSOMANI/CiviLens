import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

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

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-white text-blue-600 font-bold text-xl p-2 rounded">CL</div>
            <Link to="/" className="text-xl font-bold">CiviLens</Link>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-blue-200 transition duration-300">Home</Link>
            <Link to="/complaints" className="hover:text-blue-200 transition duration-300">Complaints</Link>
            <Link to="/schemes" className="hover:text-blue-200 transition duration-300">Schemes</Link>
            <Link to="/discussions" className="hover:text-blue-200 transition duration-300">Discussions</Link>
            <Link to="/chat" className="hover:text-blue-200 transition duration-300">Chat</Link>
            <Link to="/documents" className="hover:text-blue-200 transition duration-300">Documents</Link>
            <Link to="/regions" className="hover:text-blue-200 transition duration-300">Regions</Link>
            <Link to="/sentiment" className="hover:text-blue-200 transition duration-300">Sentiment</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {user ? (
              <>
                <Link to="/profile" className="hover:text-blue-200 transition duration-300">
                  <span className="hidden md:inline">{user.username}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition duration-300">
                    Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition duration-300">Login</Link>
                <Link to="/signup" className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-medium transition duration-300">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
