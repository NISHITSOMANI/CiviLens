import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import Chat from './pages/Chat'
import Documents from './pages/Documents'
import Regions from './pages/Regions'
import Sentiment from './pages/Sentiment'
import AdminPanel from './pages/AdminPanel'
import ComplaintDetail from './pages/ComplaintDetail'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider, useToast } from './contexts/ToastContext'
import { LanguageProvider } from './contexts/LanguageContext'
import * as healthApi from './services/api/health'
function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

function AppContent() {
  const { addToast } = useToast()

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
    <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/complaints" element={<Complaints />} />
                  <Route path="/complaints/new" element={<NewComplaint />} />
                  <Route path="/complaints/:id" element={<ComplaintDetail />} />
                  <Route path="/schemes" element={<Schemes />} />
                  <Route path="/schemes/:id" element={<SchemeDetail />} />
                  <Route path="/discussions" element={<Discussions />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/regions" element={<Regions />} />
                  <Route path="/sentiment" element={<Sentiment />} />
                  <Route path="/admin" element={<AdminPanel />} />
                </Routes>
              </main>
              <Footer />
            </div>
    </Router>
  )
}

export default App
