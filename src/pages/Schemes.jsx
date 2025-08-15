import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const Schemes = () => {
  const { t } = useLanguage()
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [verificationText, setVerificationText] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)

  // Mock data for government schemes
  const mockSchemes = [
    {
      id: 1,
      title: 'Pradhan Mantri Awas Yojana',
      description: 'Affordable housing for all by 2022. Provides financial assistance to eligible beneficiaries for construction of houses.',
      category: 'Housing',
      eligibility: 'EWS and LIG categories',
      benefits: 'Up to ₹2.5 lakh interest subsidy',
      deadline: '2025-12-31',
      status: 'active',
      applicants: 12500
    },
    {
      id: 2,
      title: 'Ayushman Bharat Yojana',
      description: 'Health insurance scheme for poor and vulnerable households. Provides coverage up to ₹5 lakh per family per year.',
      category: 'Healthcare',
      eligibility: 'Families identified by SECC data',
      benefits: '₹5 lakh coverage per family',
      deadline: 'Ongoing',
      status: 'active',
      applicants: 45000
    },
    {
      id: 3,
      title: 'Pradhan Mantri Kisan Samman Nidhi',
      description: 'Income support scheme for small and marginal farmers. Provides ₹6,000 per year in three equal installments.',
      category: 'Agriculture',
      eligibility: 'Small and marginal farmers',
      benefits: '₹6,000 per year',
      deadline: 'Ongoing',
      status: 'active',
      applicants: 85000
    },
    {
      id: 4,
      title: 'Skill India Mission',
      description: 'Training program to develop skilled workforce. Offers various courses in different sectors with placement assistance.',
      category: 'Employment',
      eligibility: 'All Indian citizens',
      benefits: 'Skill development and placement',
      deadline: 'Ongoing',
      status: 'active',
      applicants: 32000
    },
    {
      id: 5,
      title: 'Beti Bachao Beti Padhao',
      description: 'Campaign to generate awareness about declining child sex ratio and importance of girl child education.',
      category: 'Women & Child',
      eligibility: 'All districts in India',
      benefits: 'Cash incentives for girl child education',
      deadline: 'Ongoing',
      status: 'active',
      applicants: 18000
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSchemes(mockSchemes)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredSchemes = filter === 'all' 
    ? schemes 
    : schemes.filter(scheme => scheme.category.toLowerCase() === filter.toLowerCase())

  const handleExportInfographic = (schemeId) => {
    // In a real app, this would generate and download an infographic
    alert(`Infographic export for scheme ${schemeId} would be generated here.`)
    console.log(`Exporting infographic for scheme ${schemeId}`)
  }

  const handleVerifyScheme = () => {
    if (!verificationText.trim()) {
      setVerificationResult({ isFake: null, message: 'Please enter a message to verify.' })
      return
    }

    // Simple fake detection logic (in a real app, this would be more sophisticated)
    const fakeKeywords = ['free money', 'click here', 'urgent', 'limited time', 'act now']
    const isFake = fakeKeywords.some(keyword => 
      verificationText.toLowerCase().includes(keyword)
    )

    if (isFake) {
      setVerificationResult({ 
        isFake: true, 
        message: 'Warning: This message appears to be a fake scheme. Please verify with official sources before taking any action.' 
      })
    } else {
      setVerificationResult({ 
        isFake: false, 
        message: 'This message appears to be legitimate. However, always verify with official government sources before taking any action.' 
      })
    }
  }

  const categories = [...new Set(schemes.map(scheme => scheme.category))]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">{t('schemes_title')}</h2>
        <p className="text-gray-600 mt-2">{t('schemes_subtitle')}</p>
      </div>

      {/* Fake Scheme Detector */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('schemes_fake_detector')}</h3>
        <p className="text-gray-600 mb-4">{t('schemes_fake_detector_placeholder')}</p>
        
        <div className="space-y-4">
          <textarea
            value={verificationText}
            onChange={(e) => setVerificationText(e.target.value)}
            placeholder={t('schemes_fake_detector_placeholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
          />
          
          <button
            onClick={handleVerifyScheme}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 hover:from-blue-600 hover:to-indigo-700"
          >
            {t('schemes_fake_detector_check')}
          </button>
          
          {verificationResult && (
            <div className={`p-4 rounded-lg ${verificationResult.isFake === true ? 'bg-red-50 border border-red-200' : verificationResult.isFake === false ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`font-medium ${verificationResult.isFake === true ? 'text-red-800' : verificationResult.isFake === false ? 'text-green-800' : 'text-yellow-800'}`}>
                {verificationResult.message}
              </p>
            </div>
          )}
        </div>
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
                {t('schemes_category_all')}
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

        {/* Schemes List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {filter === 'all' ? 'All Schemes' : `${filter} Schemes`}
                <span className="text-gray-500 font-normal ml-2">({filteredSchemes.length})</span>
              </h3>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('schemes_search_placeholder')}
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-6">
              {filteredSchemes.length > 0 ? (
                filteredSchemes.map((scheme) => (
                  <div key={scheme.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition duration-300">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-bold text-gray-800">{scheme.title}</h4>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            {scheme.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{scheme.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500 block">Category</span>
                            <span className="font-medium text-gray-800">{scheme.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Eligibility</span>
                            <span className="font-medium text-gray-800">{scheme.eligibility}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Benefits</span>
                            <span className="font-medium text-gray-800">{scheme.benefits}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Deadline</span>
                            <span className="font-medium text-gray-800">{scheme.deadline}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>{scheme.applicants.toLocaleString()} applicants</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 md:items-end">
                        <button
                          onClick={() => handleExportInfographic(scheme.id)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {t('schemes_infographic_export')}
                        </button>
                        <Link
                          to={`/schemes/${scheme.id}`}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 hover:from-blue-600 hover:to-indigo-700 text-center"
                        >
                          {t('view_details')}
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
                  <h4 className="text-lg font-medium text-gray-800 mb-2">No schemes found</h4>
                  <p className="text-gray-600">Try adjusting your filters to see more results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Schemes
