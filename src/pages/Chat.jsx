import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import * as chatApi from '../services/api/chat'

const Chat = () => {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [newMessage, setNewMessage] = useState('')
  const [persistEnabled, setPersistEnabled] = useState(
    (import.meta.env.VITE_CHAT_PERSIST === '1') || false
  )
  const messagesEndRef = useRef(null)
  const queryClient = useQueryClient()
  const userKey = user?._id || user?.id || user?.username || 'anon'
  const quickQuestions = [
    { label: '🎓 Education', full: 'What education schemes are available for students?' },
    { label: '💍 Marriage', full: 'Are there any government schemes for marriage assistance?' },
    { label: '👴 Seniors', full: 'What pension schemes exist for senior citizens?' },
    { label: '🏥 Health', full: 'Tell me about government healthcare insurance schemes.' },
    { label: '🌾 Agriculture', full: 'What agriculture subsidy schemes are available for farmers?' },
    { label: '🚀 Startup', full: 'What startup or entrepreneurship schemes can I apply for?' },
    { label: '👩 Women', full: 'What women empowerment schemes are available?' },
  ]

  const handleQuickAsk = (text) => {
    if (authLoading || !user) return
    setNewMessage(text)
    sendMessageMutation.mutate({ message: text, userId: user?.id })
  }

  // Format AI content: render ordered list when numbered items are detected, otherwise paragraphs
  const renderContent = (text) => {
    const safe = (text || '').toString().trim()
    // Extract numbered items like "1. ... 2. ..."
    const itemRegex = /(?:^|\n)\s*(\d+)\.\s+([\s\S]*?)(?=(?:\n\s*\d+\.)|$)/g
    const items = []
    let match
    while ((match = itemRegex.exec(safe)) !== null) {
      items.push(match[2].trim())
    }
    if (items.length >= 2) {
      return (
        <ol className="list-decimal pl-5 space-y-2 leading-7">
          {items.map((it, i) => {
            const [title, ...rest] = it.split(/:\s*/)
            const hasTitle = rest.length > 0
            const desc = rest.join(': ')
            return (
              <li key={i} className="whitespace-pre-wrap">
                {hasTitle ? (
                  <>
                    <span className="font-semibold">{title}:</span> {desc}
                  </>
                ) : (
                  it
                )}
              </li>
            )
          })}
        </ol>
      )
    }
    // Fallback: split by blank lines or single newlines
    return safe.split(/\n{2,}|\n/).map((line, idx) => (
      <p key={idx} className="mb-1 leading-7 whitespace-pre-wrap">{line}</p>
    ))
  }

  // Fetch chat messages using React Query
  const { data: messages = [], isLoading, isError, error } = useQuery({
    queryKey: ['chatMessages', userKey],
    queryFn: chatApi.getMessages,
    staleTime: 1000 * 60 * 5,
    enabled: !authLoading && !!user && persistEnabled,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onMutate: async (vars) => {
      // Optimistically append the user's message
      const tempId = Date.now()
      const optimisticMsg = {
        id: tempId,
        sender: user?.username || 'You',
        content: vars.message,
        timestamp: new Date().toISOString(),
        isOwn: true,
      }
      await queryClient.cancelQueries({ queryKey: ['chatMessages', userKey] })
      const previous = queryClient.getQueryData(['chatMessages', userKey])
      queryClient.setQueryData(['chatMessages', userKey], (old = []) => [...old, optimisticMsg])
      setNewMessage('')
      return { previous, tempId }
    },
    onSuccess: (newMessageData) => {
      if (newMessageData?.debug) {
        // Surface backend debug info in dev tools to diagnose HF issues
        // eslint-disable-next-line no-console
        console.warn('Chat debug:', newMessageData.debug)
      }
      // Track backend persistence flag so we know whether to refetch later
      if (typeof newMessageData?.persist === 'boolean') {
        setPersistEnabled(!!newMessageData.persist)
      }
      // Append bot reply from API
      const botMsg = {
        id: Date.now() + 1,
        sender: 'CiviLens AI',
        content: newMessageData?.response || '...',
        timestamp: new Date().toISOString(),
        isOwn: false,
      }
      queryClient.setQueryData(['chatMessages', userKey], (old = []) => [...old, botMsg])
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    },
    onError: (err, _vars, context) => {
      // If it's a timeout, suppress alert and keep optimistic message.
      // The backend may still complete; onSettled will refetch messages.
      if (err?.code === 'ECONNABORTED' || (typeof err?.message === 'string' && err.message.includes('timeout'))) {
        // eslint-disable-next-line no-console
        console.warn('Chat timeout: backend still generating; messages will refresh shortly.')
        return
      }
      // For other errors, rollback and alert
      if (context?.previous) {
        queryClient.setQueryData(['chatMessages', userKey], context.previous)
      }
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to send message. Please try again.'
      alert(msg)
    },
    onSettled: () => {
      // Only refetch from server when persistence is enabled.
      if (persistEnabled) {
        queryClient.invalidateQueries({ queryKey: ['chatMessages', userKey] })
      }
    },
  })

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim() === '') return
    
    // Send message using mutation
    sendMessageMutation.mutate({
      message: newMessage,
      userId: user?.id
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (authLoading || isLoading) {
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
        <p className="text-red-700 font-medium">{t('error_loading_chat')}</p>
        <p className="text-red-600 text-sm mt-1">{error?.message || t('try_again_later')}</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['chatMessages', userKey] })}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">{t('chat_title')}</h2>
        <p className="text-gray-600 mt-2">{t('chat_subtitle')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-md flex flex-col h-[calc(100vh-200px)]">
        {/* Chat Header */}
        <div className="border-b border-gray-200 p-3">
          <div className="flex items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl w-12 h-12 border border-blue-200" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="ml-3">
              <h3 className="font-bold text-gray-800">{t('chat_admin_support')}</h3>
              <p className="text-sm text-green-600">{t('chat_online')}</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-white to-blue-50/30">
          {(messages || []).map((m, idx) => {
            const isOwn = typeof m.isOwn === 'boolean' ? m.isOwn : (m.role === 'user')
            const sender = m.sender || (isOwn ? (user?.username || 'You') : 'CiviLens AI')
            const ts = m.timestamp || m.created_at || new Date().toISOString()
            return (
              <div
                key={m.id || idx}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-2xl w-full md:w-auto ${isOwn ? 'pl-10' : 'pr-10'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${isOwn ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}
                  >
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200" />
                        <span className="font-semibold text-sm">{sender}</span>
                      </div>
                    )}
                    <div className={`${isOwn ? '' : 'leading-7'}`}>
                      {isOwn ? (
                        <p className="whitespace-pre-wrap leading-7">{m.content}</p>
                      ) : (
                        renderContent(m.content)
                      )}
                    </div>
                    <p className={`text-xs mt-2 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(ts)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="max-w-2xl bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 animate-pulse shadow-sm">
                <p className="leading-7">Typing…</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions + Message Input */}
        <div className="border-t border-gray-100 p-3 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 rounded-b-2xl space-y-2">
          {/* Quick Questions now just above input */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
            <span className="text-xs text-gray-500 shrink-0">Ask about:</span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickAsk(q.full)}
                className="px-2.5 py-1 text-xs rounded-full border border-blue-200 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors shrink-0"
                disabled={authLoading || !user}
                title={q.full}
              >
                {q.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('chat_type_message')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={authLoading || !user || !newMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat
