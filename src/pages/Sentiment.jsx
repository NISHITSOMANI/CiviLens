import React, { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const Sentiment = () => {
  const { t } = useLanguage()
  const [sentimentData, setSentimentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week')

  // Mock data for sentiment analysis
  const mockSentimentData = {
    overall: {
      positive: 65,
      neutral: 20,
      negative: 15
    },
    trends: [
      { date: '2025-08-08', positive: 60, neutral: 25, negative: 15 },
      { date: '2025-08-09', positive: 62, neutral: 22, negative: 16 },
      { date: '2025-08-10', positive: 58, neutral: 24, negative: 18 },
      { date: '2025-08-11', positive: 64, neutral: 20, negative: 16 },
      { date: '2025-08-12', positive: 67, neutral: 18, negative: 15 },
      { date: '2025-08-13', positive: 63, neutral: 21, negative: 16 },
      { date: '2025-08-14', positive: 65, neutral: 20, negative: 15 }
    ],
    categories: [
      { name: 'Public Transport', positive: 72, neutral: 18, negative: 10 },
      { name: 'Healthcare', positive: 58, neutral: 25, negative: 17 },
      { name: 'Education', positive: 68, neutral: 20, negative: 12 },
      { name: 'Infrastructure', positive: 55, neutral: 30, negative: 15 },
      { name: 'Utilities', positive: 62, neutral: 22, negative: 16 }
    ],
    keywords: [
      { word: 'improvement', count: 1240, sentiment: 'positive' },
      { word: 'delay', count: 890, sentiment: 'negative' },
      { word: 'satisfied', count: 760, sentiment: 'positive' },
      { word: 'issue', count: 720, sentiment: 'negative' },
      { word: 'efficient', count: 680, sentiment: 'positive' },
      { word: 'corruption', count: 540, sentiment: 'negative' }
    ]
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSentimentData(mockSentimentData)
      setLoading(false)
    }, 1000)
  }, [])

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500'
      case 'negative': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSentimentBg = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!sentimentData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('sentiment.dataNotAvailable')}</h2>
        <p className="text-gray-600">{t('sentiment.unableToLoad')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{t('sentiment.title')}</h2>
          <p className="text-gray-600 mt-2">{t('sentiment.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {t('sentiment.timeRange.week')}
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {t('sentiment.timeRange.month')}
          </button>
          <button 
            onClick={() => setTimeRange('quarter')}
            className={`px-4 py-2 rounded-lg font-medium ${timeRange === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {t('sentiment.timeRange.quarter')}
          </button>
        </div>
      </div>

      {/* Overall Sentiment */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('sentiment.overall.title')}</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Positive</span>
                  <span className="text-sm font-medium text-green-600">{sentimentData.overall.positive}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-green-500 h-4 rounded-full" style={{ width: `${sentimentData.overall.positive}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Neutral</span>
                  <span className="text-sm font-medium text-gray-600">{sentimentData.overall.neutral}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-gray-500 h-4 rounded-full" style={{ width: `${sentimentData.overall.neutral}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Negative</span>
                  <span className="text-sm font-medium text-red-600">{sentimentData.overall.negative}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-red-500 h-4 rounded-full" style={{ width: `${sentimentData.overall.negative}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">{sentimentData.overall.positive}%</div>
                <div className="text-lg text-gray-600">{t('sentiment.overall.positiveLabel')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Trends */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('sentiment.trends.title')}</h3>
        <div className="h-64 flex items-end space-x-2 justify-center">
          {sentimentData.trends.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1 max-w-[40px]">
              <div className="flex flex-col-reverse h-40 w-full justify-end space-y-1">
                <div 
                  className="bg-red-500 rounded-t"
                  style={{ height: `${day.negative}%` }}
                  title={`Negative: ${day.negative}%`}
                ></div>
                <div 
                  className="bg-gray-500"
                  style={{ height: `${day.neutral}%` }}
                  title={`Neutral: ${day.neutral}%`}
                ></div>
                <div 
                  className="bg-green-500 rounded-t"
                  style={{ height: `${day.positive}%` }}
                  title={`Positive: ${day.positive}%`}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">{t('sentiment.category.title')}</h3>
          <div className="space-y-4">
            {sentimentData.categories.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <span className="text-sm font-medium text-green-600">{category.positive}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${category.positive}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Keywords */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">{t('sentiment.keywords.title')}</h3>
          <div className="flex flex-wrap gap-2">
            {sentimentData.keywords.map((keyword, index) => (
              <span 
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentBg(keyword.sentiment)}`}
              >
                {keyword.word} ({keyword.count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sentiment
