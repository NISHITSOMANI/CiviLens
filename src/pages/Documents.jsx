import React, { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const Documents = () => {
  const { t } = useLanguage()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  // Mock data for documents
  const mockDocuments = [
    {
      id: 1,
      name: 'ID Proof.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: '2025-08-10',
      category: 'Identity'
    },
    {
      id: 2,
      name: 'Address Proof.jpg',
      type: 'image',
      size: '1.8 MB',
      uploadDate: '2025-08-09',
      category: 'Address'
    },
    {
      id: 3,
      name: 'Income Certificate.pdf',
      type: 'pdf',
      size: '1.2 MB',
      uploadDate: '2025-08-05',
      category: 'Income'
    },
    {
      id: 4,
      name: 'Application Form.docx',
      type: 'document',
      size: '0.8 MB',
      uploadDate: '2025-08-03',
      category: 'Application'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDocuments(mockDocuments)
      setLoading(false)
    }, 1000)
  }, [])

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setUploading(true)
    
    // Simulate file upload
    setTimeout(() => {
      const newDocument = {
        id: documents.length + 1,
        name: selectedFile.name,
        type: selectedFile.type.split('/')[0] || 'document',
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        category: 'Uploaded'
      }
      
      setDocuments([newDocument, ...documents])
      setSelectedFile(null)
      setUploading(false)
    }, 2000)
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return (
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )
      case 'image':
        return (
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">{t('documents_loading')}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{t('documents_title')}</h2>
        <p className="text-gray-600 mt-2">{t('documents_subtitle')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('documents_upload_title')}</h3>
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button 
            type="submit" 
            disabled={!selectedFile || uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? t('documents_uploading') : t('documents_upload')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('documents_your_documents')}</h3>
        
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300">
                <div className="flex items-start gap-4">
                  {getFileIcon(doc.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 truncate">{doc.name}</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>{t('documents_size')}:</span>
                        <span>{doc.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('documents_category')}:</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{doc.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('documents_uploaded')}:</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        {t('documents_view')}
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                        {t('documents_download')}
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        {t('documents_delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('documents_no_documents')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('documents_no_documents_message')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Documents
