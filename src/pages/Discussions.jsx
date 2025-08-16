import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import * as discussionsApi from '../services/api/discussions'

const Discussions = () => {
  const { t } = useLanguage()
  const [filter, setFilter] = useState('all')

  const { data: discussionsData, isLoading, isError } = useQuery({
    queryKey: ['discussions'],
    queryFn: discussionsApi.listDiscussions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const discussions = discussionsData || []

  const filteredDiscussions = filter === 'all' 
    ? discussions 
    : discussions.filter(discussion => discussion.category === filter)

  const categories = [...new Set(discussions.map(discussion => discussion.category))]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">{t('discussions_loading')}</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-500 font-bold mb-2">Error Loading Data</div>
        <p className="text-red-700 mb-4">Failed to load discussions data. Please try again later.</p>
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{t('discussions_title')}</h2>
          <p className="text-gray-600 mt-2">{t('discussions_subtitle')}</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
          {t('discussions_start_new')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {t('discussions_all')}
          </button>
          {categories.map((category) => (
            <button 
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg font-medium ${filter === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredDiscussions.map((discussion) => (
            <div key={discussion.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-300">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{discussion.title}</h3>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {discussion.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{discussion.content}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {discussion.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span>👤 {discussion.author}</span>
                    <span>📅 {new Date(discussion.date).toLocaleDateString()}</span>
                    <span>💬 {discussion.comments} {t('discussions_comments')}</span>
                    <span>👍 {discussion.likes} {t('discussions_likes')}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Link 
                    to={`/discussions/${discussion.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 text-center"
                  >
                    {t('discussions_view')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Discussions
