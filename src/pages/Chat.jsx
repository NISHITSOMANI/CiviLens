import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import * as chatApi from '../services/api/chat'

// Inline custom SVG emoji set (solid fills, minimal gradients)
const Emoji = {
  Spark: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2l1.6 4.3L18 8l-4.4 1.7L12 14l-1.6-4.3L6 8l4.4-1.7L12 2z"/>
    </svg>
  ),
  Heartbeat: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 21s-6.5-3.7-9-7.2C1 10.8 2.9 7 6.6 7c2 0 3.1 1 3.9 2 .8-1 1.9-2 3.9-2 3.7 0 5.6 3.8 3.6 6.8-2.5 3.5-9 7.2-9 7.2z"/>
    </svg>
  ),
  Lightbulb: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2a7 7 0 00-4 12.8V18a2 2 0 002 2h4a2 2 0 002-2v-3.2A7 7 0 0012 2z"/>
    </svg>
  ),
  Shield: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2l7 3v6c0 5-3.1 8.7-7 11-3.9-2.3-7-6-7-11V5l7-3z"/>
    </svg>
  ),
  Rocket: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2c3 1 6 5 6 8 0 2-1 4-2 5l-5 5-2-2 2-5c-1-1-3-2-5-2-3 0-7 3-8 6 1-5 6-12 14-15z"/>
    </svg>
  ),
  Leaf: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M21 3c-8 1-14 7-15 15 8-1 14-7 15-15zM6 18c2-4 6-8 10-10-4 4-6 8-10 10z"/>
    </svg>
  ),
}

const Chat = () => {
  const { user, loading: authLoading } = useAuth()
  const [newMessage, setNewMessage] = useState('')
  const [persistEnabled, setPersistEnabled] = useState(
    (import.meta.env.VITE_CHAT_PERSIST === '1') || false
  )
  const messagesEndRef = useRef(null)
  const queryClient = useQueryClient()
  const userKey = user?._id || user?.id || user?.username || 'anon'
  const quickQuestions = [
    { Icon: Emoji.Lightbulb, label: 'Education', full: 'What education schemes are available for students?' },
    { Icon: Emoji.Heartbeat, label: 'Healthcare', full: 'Tell me about government healthcare insurance schemes.' },
    { Icon: Emoji.Leaf, label: 'Agriculture', full: 'What agriculture subsidy schemes are available for farmers?' },
    { Icon: Emoji.Rocket, label: 'Startup', full: 'What startup or entrepreneurship schemes can I apply for?' },
    { Icon: Emoji.Shield, label: 'Pension', full: 'What pension schemes exist for senior citizens?' },
    { Icon: Emoji.Spark, label: 'Women', full: 'What women empowerment schemes are available?' },
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 font-medium">Unable to load chat</p>
        <p className="text-red-600 text-sm mt-1">{error?.message || 'Please try again later.'}</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['chatMessages', userKey] })}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">CiviLens Assistant</h2>
        <p className="text-gray-600 mt-2">Ask anything about schemes, complaints, and services. I’ll guide you.</p>
      </div>

      <div className="rounded-2xl shadow-md flex flex-col h-[calc(100vh-200px)] bg-white">
        {/* Chat Header */}
        <div className="border-b border-slate-200 p-4 bg-white rounded-t-2xl">
          <div className="flex items-center">
            <div className="relative">
              <div className="bg-slate-100 rounded-xl w-12 h-12 border border-slate-200 shadow" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="ml-3">
              <h3 className="font-bold text-gray-800">Assistant Online</h3>
              <p className="text-xs text-emerald-700">Synced</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
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
                    className={`rounded-2xl px-4 py-3 shadow-sm ${isOwn ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-gray-800 rounded-bl-none'}`}
                  >
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200" />
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
                    <p className={`text-xs mt-2 ${isOwn ? 'text-purple-100' : 'text-gray-500'}`}>
                      {formatTime(ts)}
                    </p>

                    {/* Reaction row for bot messages */}
                    {!isOwn && (
                      <div className="mt-2 flex items-center gap-2">
                        <button className="group inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50 transition">
                          <Emoji.Spark className="w-3.5 h-3.5 text-amber-500"/>
                          <span>Helpful</span>
                        </button>
                        <button className="group inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50 transition">
                          <Emoji.Shield className="w-3.5 h-3.5 text-emerald-600"/>
                          <span>Accurate</span>
                        </button>
                        <button className="group inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50 transition">
                          <Emoji.Heartbeat className="w-3.5 h-3.5 text-rose-500"/>
                          <span>Nice</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="max-w-2xl bg-white border border-slate-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:120ms]"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:240ms]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions + Message Input */}
        <div className="border-t border-slate-200 p-4 bg-white rounded-b-2xl space-y-2">
          {/* Quick Questions now just above input */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
            <span className="text-xs text-gray-500 shrink-0">Quick ask:</span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickAsk(q.full)}
                className="px-2.5 py-1 text-xs rounded-full border border-slate-200 bg-white text-gray-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shrink-0 inline-flex items-center gap-1.5"
                disabled={authLoading || !user}
                title={q.full}
              >
                <q.Icon className="w-3.5 h-3.5 text-slate-600"/>
                <span>{q.label}</span>
              </button>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={authLoading || !user || !newMessage.trim()}
              className="bg-slate-900 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <p className="text-[11px] text-gray-500">Tip: Use the quick ask chips to start faster. No personal data required.</p>
        </div>
      </div>
    </div>
  )
}

export default Chat
