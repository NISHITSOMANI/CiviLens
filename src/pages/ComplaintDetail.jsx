import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import * as complaintsApi from '../services/api/complaints'

const ComplaintDetail = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: complaint, isLoading, isError, error } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintsApi.getComplaint(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })

  const upvoteMutation = useMutation({
    mutationFn: () => complaintsApi.upvoteComplaint(id),
  })

  const handleUpvote = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (complaint?.already_upvoted) return
    try {
      await upvoteMutation.mutateAsync()
      // No manual state update needed; API invalidates queries
    } catch (e) {
      // silently fail or add toast if available
      console.error('Upvote failed', e)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t?.('loading') || 'Loading...'}</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-500 font-bold mb-2">{t?.('error') || 'Error'}</div>
        <p className="text-red-700 mb-4">{error?.message || t?.('failed_to_load') || 'Failed to load data.'}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          {t?.('go_back') || 'Go Back'}
        </button>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <h4 className="text-lg font-medium text-gray-800 mb-2">{t?.('complaint_not_found') || 'Complaint not found'}</h4>
        <p className="text-gray-600">{t?.('complaint_not_found_message') || 'The complaint you are looking for does not exist.'}</p>
        <div className="mt-6">
          <Link to="/complaints" className="text-blue-600 hover:underline">{t?.('back_to_complaints') || 'Back to complaints'}</Link>
        </div>
      </div>
    )
  }

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
      case 'pending': return t('complaints_status_pending')
      case 'in_progress': return t('complaints_status_in_progress')
      case 'resolved': return t('complaints_status_resolved')
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">{complaint.title}</h2>
          {complaint.status && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
              {getStatusText(complaint.status)}
            </span>
          )}
        </div>
        <Link to="/complaints" className="text-blue-600 hover:underline">{t('back_to_complaints') || 'Back to complaints'}</Link>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        {complaint.description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{t('description') || 'Description'}</h3>
            <p className="text-gray-700">{complaint.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaint.category && (
            <div>
              <div className="text-gray-500">{t('complaints_category')}</div>
              <div className="font-medium text-gray-800">{complaint.category}</div>
            </div>
          )}
          {complaint.location && (
            <div>
              <div className="text-gray-500">{t('complaints_location')}</div>
              <div className="font-medium text-gray-800">{complaint.location}</div>
            </div>
          )}
          {complaint.date && (
            <div>
              <div className="text-gray-500">{t('complaints_date')}</div>
              <div className="font-medium text-gray-800">{complaint.date}</div>
            </div>
          )}
          {typeof complaint.upvotes !== 'undefined' && (
            <div>
              <div className="text-gray-500 flex items-center gap-3">
                <span>{t('complaints_upvotes')}</span>
                <button
                  onClick={handleUpvote}
                  disabled={upvoteMutation.isLoading || complaint.already_upvoted}
                  className={`px-3 py-1 rounded-md text-white ${
                    complaint.already_upvoted
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {complaint.already_upvoted ? (t('upvoted') || 'Upvoted') : (t('upvote') || 'Upvote')}
                </button>
              </div>
              <div className="font-medium text-gray-800 mt-1">{complaint.upvotes}</div>
            </div>
          )}
        </div>

        {complaint.document_url && (
          <div className="pt-4 border-t mt-4">
            <div className="text-gray-500 mb-1">{t('attached_document') || 'Attached document'}</div>
            <a
              href={complaint.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              {t('view_document') || 'View Document'}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h6m0 0v6m0-6L10 16m-7 4h8a2 2 0 002-2v-8" />
              </svg>
            </a>
          </div>
        )}

        {user && complaint?.can_update && (
          <div className="pt-4">
            <button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 hover:from-blue-600 hover:to-indigo-700"
              onClick={() => navigate(`/complaints/${id}/edit`)}
            >
              {t('edit') || 'Edit'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplaintDetail
