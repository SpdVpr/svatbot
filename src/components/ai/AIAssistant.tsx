'use client'

import { useState, useRef, useEffect } from 'react'
import { useAI } from '@/hooks/useAI'
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Lightbulb
} from 'lucide-react'

interface AIAssistantProps {
  className?: string
  compact?: boolean
  defaultOpen?: boolean
  prefilledQuestion?: string | null
}

export default function AIAssistant({
  className = '',
  compact = false,
  defaultOpen = false,
  prefilledQuestion = null
}: AIAssistantProps) {
  const {
    loading,
    error,
    chatHistory,
    askAssistant,
    getQuickSuggestions,
    clearError,
    clearChat
  } = useAI()

  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // Load quick suggestions on mount
  useEffect(() => {
    if (isOpen && quickSuggestions.length === 0) {
      loadQuickSuggestions()
    }
  }, [isOpen])

  // Handle prefilled question
  useEffect(() => {
    if (prefilledQuestion && isOpen) {
      setMessage(prefilledQuestion)
    }
  }, [prefilledQuestion, isOpen])

  const loadQuickSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      const suggestions = await getQuickSuggestions()
      setQuickSuggestions(suggestions)
    } catch (err) {
      console.error('Failed to load suggestions:', err)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim()
    if (!textToSend || loading) return

    setMessage('')
    clearError()

    try {
      await askAssistant(textToSend)
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleClearChat = () => {
    clearChat()
    loadQuickSuggestions()
  }

  // Compact floating button
  if (compact && !isOpen) {
    return (
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-br from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white rounded-full p-5 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-primary-500/50 group ${className}`}
        title="AI Svatební Asistent"
      >
        <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg" />
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

        {/* Sparkle effect */}
        <Sparkles className="absolute -top-2 -left-2 w-4 h-4 text-yellow-300 animate-pulse" />
      </button>
    )
  }

  return (
    <>
      {/* Floating Toggle Button */}
      {compact && (
        <button
          onClick={toggleOpen}
          className={`fixed bottom-6 right-6 z-50 bg-gradient-to-br from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white rounded-full p-5 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-primary-500/50 group ${isOpen ? 'scale-0' : 'scale-100'}`}
          title="AI Svatební Asistent"
        >
          <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg" />
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

          {/* Sparkle effect */}
          <Sparkles className="absolute -top-2 -left-2 w-4 h-4 text-yellow-300 animate-pulse" />
        </button>
      )}

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className={`
          ${compact 
            ? 'fixed bottom-6 right-6 z-40 w-96 h-[600px]' 
            : 'w-full h-full'
          }
          bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col
          ${isMinimized ? 'h-16' : ''}
          ${className}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="w-6 h-6 text-primary-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Svatební Asistent</h3>
                <p className="text-xs text-gray-500">Váš osobní svatební expert</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {chatHistory.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Vymazat konverzaci"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              
              {compact && (
                <>
                  <button
                    onClick={toggleMinimize}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title={isMinimized ? "Maximalizovat" : "Minimalizovat"}
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleOpen}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Zavřít"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-primary-300 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">Vítejte u AI asistenta!</h4>
                    <p className="text-sm text-gray-500 mb-6">
                      Zeptejte se mě na cokoliv ohledně plánování vaší svatby
                    </p>
                    
                    {/* Quick Suggestions */}
                    {loadingSuggestions ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                        <span className="ml-2 text-sm text-gray-500">Načítám návrhy...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center text-xs text-gray-400 mb-3">
                          <Lightbulb className="w-3 h-3 mr-1" />
                          Rychlé návrhy:
                        </div>
                        {quickSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left p-3 text-sm bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {chatHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`
                          max-w-[80%] p-3 rounded-lg
                          ${msg.role === 'user' 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                          }
                        `}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {msg.timestamp.toLocaleTimeString('cs-CZ', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                            <span className="text-sm text-gray-600">AI přemýšlí...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Error Display */}
              {error && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Zeptejte se na cokoliv o svatbě..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    disabled={loading}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!message.trim() || loading}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
