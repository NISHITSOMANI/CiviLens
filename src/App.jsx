import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Complaints from './pages/Complaints'
import NewComplaint from './pages/NewComplaint'
import Schemes from './pages/Schemes'
import SchemeDetail from './pages/SchemeDetail'
import Discussions from './pages/Discussions'
import DiscussionDetail from './pages/DiscussionDetail'
import Chat from './pages/Chat'
import Documents from './pages/Documents'
import Regions from './pages/Regions'
import Sentiment from './pages/Sentiment'
import AdminPanel from './pages/AdminPanel'
import ComplaintDetail from './pages/ComplaintDetail'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider, useToast } from './contexts/ToastContext'
import { useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import * as healthApi from './services/api/health'
// Admin-only layout and route guard
import AdminLayout from './layouts/AdminLayout'
import AdminRoute from './components/AdminRoute'
import GovernmentRoute from './components/GovernmentRoute'
import AdminDashboard from './pages/admin/Dashboard'
import AdminSchemes from './pages/admin/Schemes'
import AdminComplaints from './pages/admin/Complaints'
function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

function AppContent() {
  const { addToast } = useToast()
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')
  const { user } = useAuth()
  const isAdmin = !!user && (user.is_staff === true || user.role === 'admin')

  useEffect(() => {
    // Perform health check on app boot
    const performHealthCheck = async () => {
      try {
        await healthApi.checkHealth()
        console.log('Health check passed')
      } catch (error) {
        console.error('Health check failed:', error)
        addToast('Application health check failed. Some features may not work properly.', 'error')
      }
    }

    performHealthCheck()
  }, [addToast])

  return (
      isAdminPath ? (
        // Admin Shell
        <Routes>
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="schemes" element={<AdminSchemes />} />
            <Route path="complaints" element={<AdminComplaints />} />
            {/* Fallback to dashboard */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      ) : (
        // Public Shell
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={isAdmin ? <Navigate to="/admin" replace /> : <Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/complaints/new" element={<NewComplaint />} />
              <Route path="/complaints/:id" element={<ComplaintDetail />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/schemes/:id" element={<SchemeDetail />} />
              <Route path="/discussions" element={<Discussions />} />
              <Route path="/discussions/:id" element={<DiscussionDetail />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/regions" element={<GovernmentRoute><Regions /></GovernmentRoute>} />
              <Route path="/sentiment" element={<GovernmentRoute><Sentiment /></GovernmentRoute>} />
              {/* Legacy admin panel route (optional): redirect to new admin */}
              <Route path="/admin" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )
  )
}

export default App
