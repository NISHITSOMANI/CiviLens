import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useMutation } from '@tanstack/react-query'
import * as complaintsApi from '../services/api/complaints'
import { toast } from 'react-hot-toast'

const NewComplaint = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
    location: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const categories = [
    'Infrastructure',
    'Utilities',
    'Sanitation',
    'Transportation',
    'Healthcare',
    'Education',
    'Security',
    'Environment',
    'Other'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setComplaint(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  // OCR feature removed for now

  // Submit complaint using React Query mutation
  const { mutate: submitComplaint, isLoading: isSubmitting } = useMutation({
    mutationFn: complaintsApi.createComplaint,
    onSuccess: () => {
      toast.success(t('complaint_submitted_successfully') || 'Complaint submitted successfully!')
      navigate('/complaints')
    },
    onError: (error) => {
      toast.error(t('failed_to_submit_complaint') || 'Failed to submit complaint')
      console.error('Error submitting complaint:', error)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Build multipart FormData so backend accepts file + fields
    const fd = new FormData()
    fd.append('title', complaint.title)
    fd.append('description', complaint.description)
    fd.append('category', complaint.category)
    fd.append('location', complaint.location)
    // Optional: include OCR text if you later want backend to store it
    // fd.append('ocrText', complaint.ocrText || '')
    if (selectedFile) {
      fd.append('document', selectedFile)
    }
    // Submit complaint using React Query mutation
    submitComplaint(fd)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/complaints" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('back_to_complaints')}
        </Link>
        <h2 className="text-3xl font-bold text-gray-800">{t('new_complaint_title')}</h2>
        <p className="text-gray-600 mt-2">{t('new_complaint_subtitle')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Complaint Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={complaint.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('briefly_describe_your_complaint')}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
            <textarea
              id="description"
              name="description"
              value={complaint.description}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('provide_detailed_information_about_your_complaint')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
              <select
                id="category"
                name="category"
                value={complaint.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">{t('location')}</label>
              <input
                type="text"
                id="location"
                name="location"
                value={complaint.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('enter_the_location_of_the_issue')}
              />
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('upload_document') || 'Upload document'}</label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <div className="mb-4">
                    <img src={previewUrl} alt="Preview" className="mx-auto max-h-40" />
                  </div>
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>{t('upload_a_file')}</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                    />
                  </label>
                  <p className="pl-1">{t('or_drag_and_drop')}</p>
                </div>
                <p className="text-xs text-gray-500">{t('png_jpg_pdf_up_to_10mb')}</p>
              </div>
            </div>
            
            {selectedFile && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{selectedFile.name}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  {t('remove')}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 font-bold py-3 px-4 rounded-lg transition duration-300 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('submitting') || 'Submitting...'}
                </div>
              ) : (
                t('submit_complaint') || 'Submit Complaint'
              )}
            </button>
            <Link
              to="/complaints"
              className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewComplaint
