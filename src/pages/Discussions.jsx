import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const Discussions = () => {
  const { t } = useLanguage()
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Mock data for discussions
  const mockDiscussions = [
    {
      id: 1,
      title: 'Improving Public Transportation in Delhi',
      content: 'Let\'s discuss ways to improve public transportation in Delhi. What are your suggestions for better bus services and metro connectivity?',
      author: 'Amit Sharma',
      category: 'Transportation',
      date: '2025-08-14',
      comments: 24,
      likes: 42,
      tags: ['transport', 'delhi', 'metro']
    },
    {
      id: 2,
      title: 'Waste Management Solutions for Residential Areas',
      content: 'How can we improve waste management in our residential areas? Share your ideas on segregation, collection, and recycling.',
      author: 'Priya Patel',
      category: 'Environment',
      date: '2025-08-12',
      comments: 18,
      likes: 35,
      tags: ['waste', 'environment', 'recycling']
    },
    {
      id: 3,
      title: 'Digital Literacy Programs for Senior Citizens',
      content: 'Many senior citizens struggle with digital technologies. What kind of programs can help them adapt to the digital world?',
      author: 'Rajesh Kumar',
      category: 'Education',
      date: '2025-08-10',
      comments: 31,
      likes: 56,
      tags: ['education', 'seniors', 'digital']
    },
    {
      id: 4,
      title: 'Affordable Healthcare Access',
      content: 'Access to affordable healthcare is a major concern. How can we make quality healthcare more accessible to all sections of society?',
      author: 'Dr. Sunita Verma',
      category: 'Healthcare',
      date: '2025-08-08',
      comments: 42,
      likes: 78,
      tags: ['healthcare', 'affordable', 'access']
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDiscussions(mockDiscussions)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredDiscussions = filter === 'all' 
    ? discussions 
    : discussions.filter(discussion => discussion.category === filter)

  const categories = [...new Set(discussions.map(discussion => discussion.category))]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">{t('discussions_loading')}</span>
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
