// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/sentiment/regions/, /api/complaints/heatmap/

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useQuery } from '@tanstack/react-query'
import * as sentimentApi from '../services/api/sentiment'
import * as complaintsApi from '../services/api/complaints'

const Home = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const isGovOfficial = !!user && (
    user.role === 'official' ||
    user.role === 'government' ||
    user.role === 'government_official' ||
    user.role === 'gov' ||
    user.is_staff === true ||
    user.role === 'admin'
  )
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')

  // Fetch sentiment data using React Query
  const { data: sentimentData, isLoading: sentimentLoading, error: sentimentError } = useQuery({
    queryKey: ['sentiment', 'regions'],
    queryFn: sentimentApi.regions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch complaints heatmap data using React Query
  const { data: complaintsData, isLoading: complaintsLoading, error: complaintsError } = useQuery({
    queryKey: ['complaints', 'heatmap'],
    queryFn: complaintsApi.heatmap,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Voice recognition functionality
  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      setIsListening(true)
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        setTranscript(transcript)
      }
      
      recognition.onend = () => {
        setIsListening(false)
        // In a real app, you would send the transcript to your backend
        // to search for relevant schemes
      }
      
      recognition.start()
    } else {
      alert('Speech recognition not supported in this browser. Please try Chrome.')
    }
  }

  // Loading and error states for heatmap
  const isLoading = sentimentLoading || complaintsLoading
  const isError = sentimentError || complaintsError

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-8 md:p-12 shadow-xl">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('home.hero.title')}</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {t('home.hero.subtitle')}
          </p>
          
          {/* Voice-Enabled Scheme Finder */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4">{t('home.hero.voiceFinder.title')}</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button 
                onClick={startVoiceRecognition}
                disabled={isListening}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition duration-300 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {isListening ? t('home.hero.voiceFinder.listening') : t('home.hero.voiceFinder.speak')}
              </button>
              <div className="flex-1 min-w-0 bg-white/30 rounded-lg px-4 py-2">
                <p className="truncate text-white">{transcript || t('home.hero.voiceFinder.placeholder')}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link 
                to="/complaints" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
              >
                {t('home.hero.buttons.fileComplaint')}
              </Link>
            ) : (
              <>
                <Link 
                  to="/signup" 
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
                >
                  {t('home.hero.buttons.getStarted')}
                </Link>
                <Link 
                  to="/login" 
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 font-bold py-3 px-8 rounded-full text-lg transition duration-300"
                >
                  {t('home.hero.buttons.login')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">{t('home.features.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">{t('home.features.complaintManagement.title')}</h3>
            <p className="text-gray-600">{t('home.features.complaintManagement.description')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">{t('home.features.governmentSchemes.title')}</h3>
            <p className="text-gray-600">{t('home.features.governmentSchemes.description')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">{t('home.features.communityDiscussions.title')}</h3>
            <p className="text-gray-600">{t('home.features.communityDiscussions.description')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">{t('home.features.liveChatSupport.title')}</h3>
            <p className="text-gray-600">{t('home.features.liveChatSupport.description')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">{t('home.features.documentManagement.title')}</h3>
            <p className="text-gray-600">{t('home.features.documentManagement.description')}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">{t('home.features.sentimentAnalysis.title')}</h3>
            <p className="text-gray-600">{t('home.features.sentimentAnalysis.description')}</p>
          </div>
        </div>
      </div>

      {/* Live Regional Heatmap Preview (Government officials only) */}
      {isGovOfficial && (
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">{t('home.heatmap.title')}</h2>
        
        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        )}
        
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-500 font-bold mb-2">{t('error_loading_data')}</div>
            <p className="text-red-700 mb-4">{t('failed_to_load_dashboard_data')}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              {t('retry')}
            </button>
          </div>
        )}
        
        {/* Heatmap Content */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-700">{t('home.heatmap.sentimentByRegion')}</h3>
              <div className="space-y-4">
                {sentimentData?.map((region, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 text-gray-600">{region.name}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className="h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" 
                        style={{ width: `${region.sentiment_score}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right font-medium">{region.sentiment_score}%</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-700">{t('home.heatmap.complaintsByRegion')}</h3>
              <div className="space-y-4">
                {complaintsData?.map((region, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 text-gray-600">{region.name}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className="h-4 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" 
                        style={{ width: `${Math.min(region.complaint_count, 150)}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right font-medium">{region.complaint_count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link 
            to="/regions" 
            className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105"
          >
            {t('home.heatmap.viewFullDashboard')}
          </Link>
        </div>
      </div>
      )}

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8 md:p-12 shadow-xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">{t('home.stats.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-lg opacity-90">Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5K+</div>
              <div className="text-lg opacity-90">{t('home.stats.complaintsResolved')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">{t('home.stats.governmentSchemes')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">{t('home.stats.satisfactionRate')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

