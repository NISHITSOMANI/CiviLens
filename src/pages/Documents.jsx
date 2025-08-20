import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import * as documentsApi from '../services/api/documents'
import apiClient from '../services/apiClient'

const Documents = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const queryClient = useQueryClient()

  // Helpers
  const formatBytes = (bytes) => {
    if (bytes === 0 || bytes == null) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (value) => {
    if (!value) return '-'
    try {
      // value can be ISO string or epoch ms
      const d = new Date(isNaN(value) ? value : Number(value))
      if (isNaN(d.getTime())) return '-'
      return d.toLocaleString()
    } catch {
      return '-'
    }
  }

  const { data: documentsData, isLoading, isError } = useQuery({
    queryKey: ['documents', user?.id],
    queryFn: documentsApi.listDocuments,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user,
  })

  const documents = documentsData || []

  const uploadMutation = useMutation({
    mutationFn: documentsApi.uploadDocument,
    onSuccess: () => {
      // Invalidate and refetch documents for this user
      queryClient.invalidateQueries({ queryKey: ['documents', user?.id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: documentsApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', user?.id] })
    },
  })

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    uploadMutation.mutate(selectedFile)
  }

  const handleView = async (doc) => {
    try {
      const response = await apiClient.get(`/documents/${doc.id}/`, {
        responseType: 'blob',
      })
      const contentType = response.headers['content-type'] || 'application/octet-stream'
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: contentType }))
      window.open(blobUrl, '_blank', 'noopener,noreferrer')
      // Optional: revoke later
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (err) {
      console.error('View document failed', err)
      alert('Failed to open document.')
    }
  }

  const handleDownload = async (doc) => {
    try {
      const response = await apiClient.get(`/documents/${doc.id}/download/`, {
        responseType: 'blob',
      })
      const contentType = response.headers['content-type'] || 'application/octet-stream'
      const href = window.URL.createObjectURL(new Blob([response.data], { type: contentType }))
      // Try to extract filename from Content-Disposition
      const cd = response.headers['content-disposition'] || ''
      const match = cd.match(/filename="?([^";]+)"?/i)
      const filename = match ? match[1] : (doc.name || 'document')
      const a = document.createElement('a')
      a.href = href
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(href), 60_000)
    } catch (err) {
      console.error('Download document failed', err)
      alert('Failed to download document.')
    }
  }

  const handleDelete = (doc) => {
    if (!confirm('Delete this document?')) return
    deleteMutation.mutate(doc.id)
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return (
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center ring-1 ring-red-100">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )
      case 'image':
        return (
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center ring-1 ring-green-100">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center ring-1 ring-blue-100">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">{t('documents_loading')}</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-500 font-bold mb-2">Error Loading Data</div>
        <p className="text-red-700 mb-4">Failed to load documents. Please try again later.</p>
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{t('documents_title')}</h2>
        <p className="text-gray-600 mt-2">{t('documents_subtitle')}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
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
            disabled={!selectedFile || uploadMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadMutation.isPending ? t('documents_uploading') : t('documents_upload')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-5">{t('documents_your_documents')}</h3>
        
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => (
              <div key={doc.id} className="rounded-2xl p-4 hover:shadow-md transition duration-300 bg-white ring-1 ring-gray-100">
                <div className="flex items-start gap-4">
                  {getFileIcon(doc.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold text-gray-800 truncate" title={doc.name}>{doc.name}</h4>
                      {doc.category && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
                          {doc.category}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                      <div className="text-gray-500">
                        <div className="uppercase tracking-wide text-[10px] text-gray-400">{t('documents_size')}</div>
                        <div className="font-medium text-gray-700">{formatBytes(doc.size)}</div>
                      </div>
                      <div className="text-gray-500">
                        <div className="uppercase tracking-wide text-[10px] text-gray-400">{t('documents_uploaded')}</div>
                        <div className="font-medium text-gray-700 truncate">{formatDate(doc.uploadDate)}</div>
                      </div>
                      <div className="text-gray-500">
                        <div className="uppercase tracking-wide text-[10px] text-gray-400">Type</div>
                        <div className="font-medium text-gray-700">{doc.type?.toUpperCase() || '-'}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button onClick={() => handleView(doc)} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100">
                        {t('documents_view')}
                      </button>
                      <button onClick={() => handleDownload(doc)} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
                        {t('documents_download')}
                      </button>
                      <button onClick={() => handleDelete(doc)} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100">
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
