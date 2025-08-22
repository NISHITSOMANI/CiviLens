import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useLanguage } from '../contexts/LanguageContext'
import * as authApi from '../services/api/auth'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  })

  const { user, getProfile } = useAuth()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const queryClient = useQueryClient()

  // Fetch profile data using React Query (scoped per user)
  const { data: profileData, isLoading, isError, error } = useQuery({
    queryKey: ['profile', user?.id || user?.username],
    enabled: !!user,
    queryFn: async () => {
      const response = await authApi.getProfile()
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error?.message || 'Failed to fetch profile')
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Keep form data in sync with fetched profile when not editing
  useEffect(() => {
    if (profileData && !isEditing) {
      setFormData({
        username: profileData.username || '',
        email: profileData.email || '',
        role: profileData.role || '',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone || '',
        address: profileData.address || ''
      })
    }
  }, [profileData, isEditing])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: async (response) => {
      if (response.success) {
        // Update the profile cache for current user
        queryClient.setQueryData(['profile', user?.id || user?.username], response.data)
        
        // Update form data
        setFormData({
          username: response.data.username || '',
          email: response.data.email || '',
          role: response.data.role || '',
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          phone: response.data.phone || '',
          address: response.data.address || ''
        })
        
        // Ensure AuthContext/localStorage reflect latest profile
        try {
          await getProfile()
        } catch (_) {
          // no-op; Profile page still has fresh cache
        }

        setIsEditing(false)
        showToast(t('profile_updated_successfully'), 'success')
      } else {
        showToast(response.error?.message || t('failed_to_update_profile'), 'error')
      }
    },
    onError: (error) => {
      showToast(error.message || t('failed_to_update_profile'), 'error')
    }
  })

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data to original values
    setFormData({
      username: profileData.username || '',
      email: profileData.email || '',
      role: profileData.role || '',
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      phone: profileData.phone || '',
      address: profileData.address || ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Send updated data to the backend using mutation
    updateProfileMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t('loading')}</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 font-medium">{t('error_loading_profile')}</p>
        <p className="text-red-600 text-sm mt-1">{error?.message || t('try_again_later')}</p>
        <button 
          onClick={() => queryClient.invalidateQueries(['profile'])}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('retry')}
        </button>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('profile_not_found')}</h2>
        <p className="text-gray-600">{t('unable_to_load_profile_data')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">User Profile</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">{t('username')}</label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">{t('first_name')}</label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">{t('last_name')}</label>
              <input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">{t('role')}</label>
              <input
                id="role"
                type="text"
                value={formData.role}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              {t('save_changes')}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('personal_information')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">{t('username')}</p>
                  <p className="font-medium">{profileData.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('email')}</p>
                  <p className="font-medium">{profileData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('full_name')}</p>
                  <p className="font-medium">
                    {profileData.first_name} {profileData.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('phone')}</p>
                  <p className="font-medium">
                    {profileData.phone || t('not_provided')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('account_information')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">{t('role')}</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${profileData.role === 'admin' ? 'bg-red-100 text-red-800' : profileData.role === 'official' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {profileData.role}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('address')}</h3>
            <p className="font-medium">
              {profileData.address || t('not_provided')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
