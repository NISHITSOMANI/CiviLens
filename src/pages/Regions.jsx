import React, { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const Regions = () => {
  const { t } = useLanguage()
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState(null)

  // Mock data for regions
  const mockRegions = [
    {
      id: 1,
      name: 'Delhi-NCR',
      population: '32 million',
      complaints: 12500,
      schemes: 42,
      officials: 120,
      performance: 78,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Mumbai Metropolitan Region',
      population: '25 million',
      complaints: 9800,
      schemes: 38,
      officials: 95,
      performance: 82,
      color: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Bengaluru Urban',
      population: '14 million',
      complaints: 7600,
      schemes: 35,
      officials: 85,
      performance: 75,
      color: 'bg-yellow-500'
    },
    {
      id: 4,
      name: 'Chennai Metropolitan',
      population: '12 million',
      complaints: 6200,
      schemes: 30,
      officials: 75,
      performance: 85,
      color: 'bg-red-500'
    },
    {
      id: 5,
      name: 'Kolkata Urban',
      population: '15 million',
      complaints: 5800,
      schemes: 28,
      officials: 70,
      performance: 72,
      color: 'bg-purple-500'
    },
    {
      id: 6,
      name: 'Hyderabad Urban',
      population: '10 million',
      complaints: 4500,
      schemes: 25,
      officials: 65,
      performance: 88,
      color: 'bg-indigo-500'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRegions(mockRegions)
      setLoading(false)
    }, 1000)
  }, [])

  const getPerformanceColor = (performance) => {
    if (performance >= 85) return 'text-green-600'
    if (performance >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBg = (performance) => {
    if (performance >= 85) return 'bg-green-100'
    if (performance >= 75) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t('regions_loading')}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{t('regions_title')}</h2>
        <p className="text-gray-600 mt-2">{t('regions_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regions.map((region) => (
          <div 
            key={region.id} 
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer"
            onClick={() => setSelectedRegion(region)}
          >
            <div className={`h-2 ${region.color}`}></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{region.name}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('regions_population')}</span>
                  <span className="font-medium">{region.population}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('regions_active_complaints')}</span>
                  <span className="font-medium">{region.complaints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('regions_schemes')}</span>
                  <span className="font-medium">{region.schemes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('regions_officials')}</span>
                  <span className="font-medium">{region.officials}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-600">{t('regions_performance')}</span>
                  <span className={`font-bold ${getPerformanceColor(region.performance)}`}>
                    {region.performance}%
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">{t('regions_performance')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${region.performance >= 85 ? 'bg-green-500' : region.performance >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${region.performance}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRegion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{selectedRegion.name} {t('regions_details')}</h3>
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">{t('regions_population')}</p>
                  <p className="text-2xl font-bold">{selectedRegion.population}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">{t('regions_performance_score')}</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(selectedRegion.performance)}`}>
                    {selectedRegion.performance}%
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium">{t('regions_active_complaints')}</span>
                  <span className="text-xl font-bold text-blue-600">{selectedRegion.complaints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-medium">{t('regions_government_schemes')}</span>
                  <span className="text-xl font-bold text-green-600">{selectedRegion.schemes}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                  <span className="font-medium">{t('regions_government_officials')}</span>
                  <span className="text-xl font-bold text-yellow-600">{selectedRegion.officials}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3">{t('regions_performance_metrics')}</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">{t('regions_complaint_resolution_rate')}</span>
                      <span className="text-sm font-medium">82%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">{t('regions_scheme_implementation')}</span>
                      <span className="text-sm font-medium">76%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">{t('regions_citizen_satisfaction')}</span>
                      <span className="text-sm font-medium">{selectedRegion.performance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${selectedRegion.performance >= 85 ? 'bg-green-500' : selectedRegion.performance >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selectedRegion.performance}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Regions
