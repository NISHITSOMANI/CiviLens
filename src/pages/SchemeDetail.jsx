import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useQuery } from '@tanstack/react-query'
import * as schemesApi from '../services/api/schemes'
import { toast } from 'react-hot-toast'

const SchemeDetail = () => {
  const { t } = useLanguage()
  const { id } = useParams()
  const [vote, setVote] = useState(0) // -1 for downvote, 0 for no vote, 1 for upvote

  // Fetch scheme details using React Query
  const { data: scheme, isLoading, isError, refetch } = useQuery({
    queryKey: ['scheme', id],
    queryFn: () => schemesApi.getScheme(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      toast.error(t('scheme_detail_fetch_error') || 'Failed to load scheme details')
      console.error('Error fetching scheme:', error)
    }
  })

  // Initialize vote count from scheme data
  const [voteCount, setVoteCount] = useState({ upvotes: 0, downvotes: 0 })
  
  React.useEffect(() => {
    if (scheme) {
      setVoteCount({
        upvotes: scheme.upvotes || 0,
        downvotes: scheme.downvotes || 0
      })
    }
  }, [scheme])
  
  const handleVote = (voteValue) => {
    // In a real app, this would call an API to record the vote
    // For now, we'll just update the UI
    
    if (vote === voteValue) {
      // If clicking the same vote, remove it
      setVote(0)
      if (voteValue === 1) {
        setVoteCount(prev => ({ ...prev, upvotes: prev.upvotes - 1 }))
      } else {
        setVoteCount(prev => ({ ...prev, downvotes: prev.downvotes - 1 }))
      }
    } else {
      // If changing vote
      if (vote === 1) {
        setVoteCount(prev => ({ ...prev, upvotes: prev.upvotes - 1 }))
      } else if (vote === -1) {
        setVoteCount(prev => ({ ...prev, downvotes: prev.downvotes - 1 }))
      }
      
      setVote(voteValue)
      
      if (voteValue === 1) {
        setVoteCount(prev => ({ ...prev, upvotes: prev.upvotes + 1 }))
      } else {
        setVoteCount(prev => ({ ...prev, downvotes: prev.downvotes + 1 }))
      }
    }
  }

  const exportInfographic = () => {
    // In a real app, this would generate an actual infographic
    // For now, we'll just show an alert
    alert(`Infographic for ${scheme.title} would be generated and downloaded!`)
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
        <p className="text-red-700 mb-4">{t('failed_to_load_scheme_data')}</p>
        <button 
          onClick={() => refetch()} 
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          {t('retry')}
        </button>
      </div>
    )
  }

  if (!scheme) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('scheme_detail_not_found_title')}</h2>
        <p className="text-gray-600 mb-6">{t('scheme_detail_not_found_message')}</p>
        <Link to="/schemes" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300">
          {t('scheme_detail_back_to_schemes')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link to="/schemes" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('scheme_detail_back_to_schemes')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{scheme.title}</h1>
          <div className="flex items-center mt-2">
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mr-3">
              {scheme.status}
            </span>
            <span className="text-gray-600">{scheme.category}</span>
          </div>
        </div>
        <button 
          onClick={exportInfographic}
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t('scheme_detail_export_infographic')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t('scheme_detail_overview')}</h2>
            <p className="text-gray-600">{scheme.description}</p>
          </div>
          
          {/* Voting Section */}
          <div className="mt-4 md:mt-0 flex flex-col items-center bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 mb-2">{t('scheme_detail_rate_scheme')}</h3>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleVote(1)}
                className={`p-2 rounded-full ${vote === 1 ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-green-600'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{voteCount.upvotes - voteCount.downvotes}</div>
                <div className="text-xs text-gray-500">{t('scheme_detail_score')}</div>
              </div>
              <button 
                onClick={() => handleVote(-1)}
                className={`p-2 rounded-full ${vote === -1 ? 'text-red-600 bg-red-100' : 'text-gray-400 hover:text-red-600'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m0 0v9m0-9h2.765a2 2 0 011.789 2.894l-3.5 7A2 2 0 0118.264 15H17m0 0v5m0-5h-2" />
                </svg>
              </button>
            </div>
            <div className="flex mt-2 text-sm text-gray-500">
              <span className="mr-3">{voteCount.upvotes} {t('scheme_detail_upvotes')}</span>
              <span>{voteCount.downvotes} {t('scheme_detail_downvotes')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">{t('scheme_detail_key_details')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">{t('scheme_detail_eligibility')}:</span>
                <span className="font-medium">{scheme.eligibility}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">{t('scheme_detail_benefits')}:</span>
                <span className="font-medium">{scheme.benefits}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">{t('scheme_detail_deadline')}:</span>
                <span className="font-medium">{scheme.deadline}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">{t('scheme_detail_applicants')}:</span>
                <span className="font-medium">{scheme.applicants.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">{t('scheme_detail_objectives')}</h3>
            <ul className="space-y-2">
              {scheme.objectives.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-3">{t('scheme_detail_detailed_overview')}</h3>
          <p className="text-gray-600">{scheme.overview}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">{t('scheme_detail_required_documents')}</h3>
            <ul className="space-y-2">
              {scheme.documents.map((document, index) => (
                <li key={index} className="flex items-center bg-gray-50 rounded-lg p-3">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-gray-700">{document}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">{t('scheme_detail_faq')}</h3>
            <div className="space-y-4">
              {scheme.faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-2">{faq.question}</h4>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 hover:from-blue-600 hover:to-indigo-700">
          {t('scheme_detail_apply_button')}
        </button>
      </div>
    </div>
  )
}

export default SchemeDetail
