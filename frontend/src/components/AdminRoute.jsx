// Admin-only route guard
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  // must be logged in and admin
  const isAdmin = !!user && (user.is_staff === true || user.role === 'admin')
  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default AdminRoute
