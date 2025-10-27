'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAI } from '@/hooks/useAI'
import { useAICoach } from '@/hooks/useAICoach'
import { useAILimits } from '@/hooks/useAILimits'
import { useSubscription } from '@/hooks/useSubscription'
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
  Lightbulb,
  Heart,
  Crown,
  AlertCircle
} from 'lucide-react'
import AISourcesList, { AIProviderBadge } from './AISourcesList'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

interface AIAssistantProps {
  className?: string
  compact?: boolean
  defaultOpen?: boolean
  prefilledQuestion?: string | null
  onQuestionSent?: () => void
}

export default function AIAssistant({
  className = '',
  compact = false,
  defaultOpen = false,
  prefilledQuestion = null,
  onQuestionSent
}: AIAssistantProps) {
  const {
    loading,
    error,
    chatHistory,
    askAssistant,
    askHybrid,
    getQuickSuggestions,
    clearError,
    clearChat
  } = useAI()

  const { svatbot } = useAICoach()
  const { limitsInfo, getLimitMessage, canUseFeature } = useAILimits()
  const { hasPremiumAccess } = useSubscription()

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

  const handleSendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || message.trim()
    if (!textToSend || loading) return

    setMessage('')
    clearError()

    try {
      // Use hybrid AI for better results (GPT + Perplexity)
      await askHybrid(textToSend)
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }, [message, loading, askHybrid, clearError])

  // Handle prefilled question
  useEffect(() => {
    if (prefilledQuestion && isOpen) {
      setMessage(prefilledQuestion)
      // Auto-send the question
      const timer = setTimeout(() => {
        handleSendMessage(prefilledQuestion)
        onQuestionSent?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [prefilledQuestion, isOpen, handleSendMessage, onQuestionSent])

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
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-br from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 text-white rounded-full p-5 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-primary-500/50 group ${className}`}
        title={`${svatbot.name} - ${svatbot.tagline}`}
      >
        <div className="text-2xl group-hover:scale-110 transition-transform duration-300">🤖</div>
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
          className={`fixed bottom-6 right-6 z-50 bg-gradient-to-br from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 text-white rounded-full p-5 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-primary-500/50 group ${isOpen ? 'scale-0' : 'scale-100'}`}
          title={`${svatbot.name} - ${svatbot.tagline}`}
        >
          <div className="text-2xl group-hover:scale-110 transition-transform duration-300">🤖</div>
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
            ? 'fixed bottom-2 right-2 left-2 sm:bottom-6 sm:right-6 sm:left-auto z-40 sm:w-96 h-[85vh] sm:h-[600px]'
            : 'w-full h-full'
          }
          bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col
          ${isMinimized ? 'h-16' : ''}
          ${className}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-pink-50">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-lg sm:text-xl">🤖</span>
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">{svatbot.name}</h3>
                <p className="text-xs text-gray-600 truncate hidden sm:block">{svatbot.tagline}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
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
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors hidden sm:block"
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
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-4 sm:py-8">
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary-300 mx-auto mb-3 sm:mb-4" />
                    <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-2">Vítejte u AI asistenta!</h4>
                    <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 px-4">
                      Zeptejte se mě na cokoliv ohledně plánování vaší svatby
                    </p>

                    {/* Quick Suggestions */}
                    {loadingSuggestions ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                        <span className="ml-2 text-xs sm:text-sm text-gray-500">Načítám návrhy...</span>
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
                            className="block w-full text-left p-2 sm:p-3 text-xs sm:text-sm bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-200"
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
                          max-w-[85%] sm:max-w-[80%] space-y-2
                        `}>
                          <div className={`
                            p-2 sm:p-3 rounded-lg
                            ${msg.role === 'user'
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                            }
                          `}>
                            {msg.role === 'user' ? (
                              <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                              <div className="text-xs sm:text-sm prose prose-sm max-w-none
                                prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1.5
                                prose-h3:text-sm prose-h3:flex prose-h3:items-center prose-h3:gap-2
                                prose-p:text-gray-700 prose-p:my-1.5
                                prose-strong:text-gray-900 prose-strong:font-semibold
                                prose-ul:my-1.5 prose-ul:list-none prose-ul:pl-0
                                prose-li:text-gray-700 prose-li:my-0.5 prose-li:pl-0
                                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                              ">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                              <p className={`text-xs ${
                                msg.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                              }`}>
                                {msg.timestamp.toLocaleTimeString('cs-CZ', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {msg.role === 'assistant' && msg.provider && (
                                <AIProviderBadge provider={msg.provider} />
                              )}
                            </div>
                          </div>

                          {/* Show sources for assistant messages */}
                          {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                            <div className="ml-1 sm:ml-2">
                              <AISourcesList
                                sources={msg.sources}
                                compact={true}
                              />
                            </div>
                          )}
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

              {/* AI Limits Info */}
              {!hasPremiumAccess && (
                <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-800">
                        {getLimitMessage('chat')}
                      </span>
                    </div>
                    {limitsInfo.chatQueriesRemaining === 0 && (
                      <Link
                        href="/account?tab=subscription"
                        className="flex items-center space-x-1 text-amber-700 hover:text-amber-900 font-medium"
                      >
                        <Crown className="w-3 h-3" />
                        <span>Upgrade</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 sm:p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={canUseFeature('chat') ? "Zeptejte se..." : "Dosáhli jste denního limitu"}
                    className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs sm:text-sm disabled:bg-gray-100"
                    disabled={loading || !canUseFeature('chat')}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!message.trim() || loading || !canUseFeature('chat')}
                    className="px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
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
