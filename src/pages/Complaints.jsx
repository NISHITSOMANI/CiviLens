import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import * as complaintsApi from '../services/api/complaints'

const Complaints = () => {
  const { t } = useLanguage()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: complaintsData, isLoading, isError } = useQuery({
    queryKey: ['complaints', user?.id || user?._id || null],
    queryFn: complaintsApi.listComplaints,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !loading, // wait for auth bootstrap/refresh so Authorization header is present
    retry: 1,
  })

  const complaints = complaintsData || []
  
  const handleNewComplaintClick = (e) => {
    e.preventDefault()
    if (!user) {
      // Not logged in: send to login page
      navigate('/login')
      return
    }
    // Logged in: go to new complaint page
    navigate('/complaints/new')
  }
  
  const filteredComplaints = filter === 'all' 
    ? complaints 
    : complaints.filter(complaint => complaint.category === filter)

  const categories = [...new Set(complaints.map(complaint => complaint.category))]

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'in_progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading complaints...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-500 font-bold mb-2">Error Loading Data</div>
        <p className="text-red-700 mb-4">Failed to load complaints data. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Complaints</h2>
          <p className="text-gray-600 mt-2">View and manage your complaints</p>
        </div>
        <a
          href="/complaints/new"
          onClick={handleNewComplaintClick}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 hover:bg-blue-700 text-center"
        >
          File New Complaint
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Filter by Category</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => setFilter('all')}
                className={`block w-full text-left px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                All
              </button>
              
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setFilter(category)}
                  className={`block w-full text-left px-4 py-2 rounded-lg ${filter === category ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {filter === 'all' ? 'All Complaints' : `${filter} Complaints`}
                <span className="text-gray-500 font-normal ml-2">({filteredComplaints.length})</span>
              </h3>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-6">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition duration-300">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-bold text-gray-800">{complaint.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                            {getStatusText(complaint.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{complaint.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500 block">Category</span>
                            <span className="font-medium text-gray-800">{complaint.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Location</span>
                            <span className="font-medium text-gray-800">{complaint.location}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Date</span>
                            <span className="font-medium text-gray-800">{complaint.date}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Upvotes</span>
                            <span className="font-medium text-gray-800">{complaint.upvotes}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 md:items-end">
                        <Link
                          to={`/complaints/${complaint.id}`}
                          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 hover:bg-blue-700 text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">No Complaints Found</h4>
                  <p className="text-gray-600">Try adjusting filters or file a new complaint.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Complaints
