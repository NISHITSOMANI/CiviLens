import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Date.now()
    const newToast = { id, ...toast }
    setToasts((prevToasts) => [...prevToasts, newToast])
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  const showToast = (message, type = 'info') => {
    addToast({ message, type })
  }

  const value = {
    toasts,
    showToast,
    removeToast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`toast-base flex items-center justify-between gap-3 animate-page-in ${getToastClass(toast.type)}`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 inline-flex items-center justify-center w-7 h-7 rounded-full/none text-white/90 hover:text-white transition"
              >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const getToastClass = (type) => {
  switch (type) {
    case 'success':
      return 'toast-success shadow-lg rounded-2xl px-4 py-3'
    case 'error':
      return 'toast-error shadow-lg rounded-2xl px-4 py-3'
    case 'warning':
      return 'toast-warning shadow-lg rounded-2xl px-4 py-3'
    case 'info':
    default:
      return 'toast-info shadow-lg rounded-2xl px-4 py-3'
  }
}
