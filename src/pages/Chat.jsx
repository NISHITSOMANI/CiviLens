import React, { useState, useEffect, useRef } from 'react'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // Mock chat data
  const mockMessages = [
    {
      id: 1,
      sender: 'Admin',
      content: t('chat_welcome_message'),
      timestamp: '2025-08-14T10:30:00',
      isOwn: false
    },
    {
      id: 2,
      sender: user?.username || 'You',
      content: t('chat_user_complaint_question'),
      timestamp: '2025-08-14T10:32:00',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Admin',
      content: t('chat_admin_response'),
      timestamp: '2025-08-14T10:33:00',
      isOwn: false
    }
  ]

  useEffect(() => {
    // Simulate fetching chat messages
    setTimeout(() => {
      setMessages(mockMessages)
      setLoading(false)
    }, 1000)
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim() === '') return

    const message = {
      id: messages.length + 1,
      sender: user?.username || 'You',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isOwn: true
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate admin response
    setTimeout(() => {
      const adminResponse = {
        id: messages.length + 2,
        sender: 'Admin',
        content: t('chat_auto_response'),
        timestamp: new Date().toISOString(),
        isOwn: false
      }
      setMessages(prev => [...prev, adminResponse])
    }, 2000)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center">
            <div className="relative">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="ml-3">
              <h3 className="font-bold text-gray-800">{t('chat_admin_support')}</h3>
              <p className="text-sm text-green-600">{t('chat_online')}</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2 ${message.isOwn ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
              >
                {!message.isOwn && (
                  <p className="font-bold text-sm mb-1">{message.sender}</p>
                )}
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('chat_type_message')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
