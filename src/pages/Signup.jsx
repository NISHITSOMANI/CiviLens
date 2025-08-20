// Assumptions:
// - Base URL: import.meta.env.VITE_API_BASE_URL (default http://localhost:8000)
// - Token storage pattern: in-memory access token + localStorage refresh token
// - Endpoints used: /api/auth/register/, /api/regions/

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
// Temporarily disable language context feature
// import { useLanguage } from '../contexts/LanguageContext'
import { useQuery } from '@tanstack/react-query'
import * as regionsApi from '../services/api/regions'

const Signup = () => {
  // Temporarily disable language context feature
  // const { t } = useLanguage()
  const t = (key) => {
    const translations = {
      'signup_title': 'Create Account',
      'signup_subtitle': 'Join our community to make a difference',
      'signup_username': 'Username',
      'signup_username_placeholder': 'Enter your username',
      'signup_email': 'Email',
      'signup_email_placeholder': 'Enter your email',
      'signup_password': 'Password',
      'signup_password_placeholder': 'Enter your password',
      'signup_confirm_password': 'Confirm Password',
      'signup_confirm_password_placeholder': 'Confirm your password',
      'signup_role': 'Role',
      'signup_role_citizen': 'Citizen',
      'signup_role_official': 'Government Official',
      'signup_role_admin': 'Administrator',
      'signup_region': 'Region',
      'signup_region_placeholder': 'Select your region',
      'signup_creating_account': 'Creating Account...',
      'signup_sign_up': 'Sign Up',
      'signup_already_have_account': 'Already have an account?',
      'signup_sign_in': 'Sign In',
      'signup_select_region': 'Please select a region',
      'signup_region_required': 'Region is required'
    }
    return translations[key] || key
  }
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('citizen')
  const [region, setRegion] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  // Fetch regions using React Query
  const { data: regionsData, isLoading: regionsLoading, error: regionsError } = useQuery({
    queryKey: ['regions'],
    queryFn: regionsApi.listRegions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error')
      return
    }

    if (!region) {
      showToast(t('signup_region_required'), 'error')
      return
    }

    setIsLoading(true)

    try {
      // Include region and optional profile fields in registration data
      const result = await register({ 
        username, 
        email, 
        password, 
        role, 
        region,
        first_name: firstName,
        last_name: lastName,
        phone,
        address
      })
      
      if (result.success) {
        showToast('Account created successfully! Please login to continue.', 'success')
        navigate('/login')
      } else {
        showToast(result.error?.message || 'Signup failed', 'error')
      }
    } catch (error) {
      console.error('Signup error:', error)
      showToast('An unexpected error occurred. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{t('signup_title')}</h2>
        <p className="text-gray-600 mt-2">{t('signup_subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">{t('signup_username')}</label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('signup_username_placeholder')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('signup_email')}</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('signup_email_placeholder')}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('signup_password')}</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('signup_password_placeholder')}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">{t('signup_confirm_password')}</label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('signup_confirm_password_placeholder')}
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">{t('signup_role')}</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="citizen">{t('signup_role_citizen')}</option>
            <option value="official">{t('signup_role_official')}</option>
            <option value="admin">{t('signup_role_admin')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">{t('signup_region')}</label>
          {regionsLoading ? (
            <div className="flex items-center justify-center py-2">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2 text-gray-500">Loading regions...</span>
            </div>
          ) : regionsError ? (
            <div className="text-red-500 text-sm py-2">Failed to load regions. Please try again later.</div>
          ) : (
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">{t('signup_select_region')}</option>
              {regionsData?.map((regionItem) => (
                <option key={regionItem.id} value={regionItem.id}>
                  {regionItem.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || regionsLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('signup_creating_account')}
            </span>
          ) : (
            t('signup_sign_up')
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {t('signup_already_have_account')}{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            {t('signup_sign_in')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
