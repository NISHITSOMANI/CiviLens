import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const Profile = () => {
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const profile = await getProfile()
      
      // If we got a profile, update the state
      if (profile) {
        setProfileData(profile)
        setFormData({
          username: profile.username || '',
          email: profile.email || '',
          role: profile.role || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          address: profile.address || ''
        })
      } else {
        // If no profile data was returned, show an error
        console.error('No profile data received')
        showToast('No profile data available', 'error')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Check if user is still logged in before showing error toast
      const accessToken = localStorage.getItem('accessToken')
      const userData = localStorage.getItem('user')
      
      // Only show error toast if user is still logged in
      if (accessToken && userData) {
        // Don't show the error message if it's just a 401 (handled by AuthContext)
        if (error.message !== 'Request failed with status code 401') {
          showToast(error.message || 'Failed to load profile data', 'error')
        }
      }
      // If user was logged out during the request, don't show error toast
    } finally {
      setLoading(false)
    }
  }

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
    // In a real app, you would send the updated data to the backend
    // For now, we'll just simulate the update
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update profile data
      setProfileData({
        ...profileData,
        ...formData
      })
      
      setIsEditing(false)
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('Failed to update profile', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Not Found</h2>
        <p className="text-gray-600">Unable to load profile data.</p>
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
                <div>
                  <p className="text-sm text-gray-600">{t('member_since')}</p>
                  <p className="font-medium">
                    {profileData.date_joined ? new Date(profileData.date_joined).toLocaleDateString() : t('n_a')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('last_login')}</p>
                  <p className="font-medium">
                    {profileData.last_login ? new Date(profileData.last_login).toLocaleDateString() : t('n_a')}
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
