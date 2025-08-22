// Government-official-only route guard
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const GovernmentRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  const isGovOfficial = !!user && (
    user.role === 'official' ||
    user.role === 'government' ||
    user.role === 'government_official' ||
    user.role === 'gov' ||
    user.is_staff === true ||
    user.role === 'admin'
  )

  if (!isGovOfficial) {
    return <Navigate to="/" replace />
  }

  return children
}

export default GovernmentRoute
