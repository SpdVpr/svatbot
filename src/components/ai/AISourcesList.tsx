'use client'

import React from 'react'
import { ExternalLink, Globe, CheckCircle2 } from 'lucide-react'
import { AISource } from '@/lib/ai-client'

/**
 * Compact version for inline display
 */
export function AISourcesCompact({
  sources,
  className = ''
}: {
  sources?: AISource[]
  className?: string
}) {
  if (!sources || sources.length === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-xs text-gray-500">Zdroje:</span>
      {sources.map((source, index) => (
        <a
          key={index}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-1 px-2 py-0.5
            bg-blue-100 hover:bg-blue-200
            text-blue-700 rounded-full text-xs
            transition-colors
          "
          title={source.title}
        >
          <span className="truncate max-w-[200px]">{source.title}</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      ))}
    </div>
  )
}

interface AISourcesListProps {
  sources?: AISource[]
  provider?: 'gpt' | 'perplexity' | 'hybrid'
  reasoning?: string
  className?: string
  compact?: boolean
}

/**
 * AI Sources List Component
 * Displays sources from Perplexity AI with citations
 */
export default function AISourcesList({
  sources,
  provider,
  reasoning,
  className = '',
  compact = false
}: AISourcesListProps) {
  if (!sources || sources.length === 0) {
    return null
  }

  // Use compact version if requested
  if (compact) {
    return <AISourcesCompact sources={sources} className={className} />
  }

  return (
    <div className={`mt-4 ${className}`}>
      {/* Provider Badge */}
      {provider && (
        <div className="flex items-center gap-2 mb-3">
          <div className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
            ${provider === 'perplexity' ? 'bg-blue-100 text-blue-700' : ''}
            ${provider === 'hybrid' ? 'bg-purple-100 text-purple-700' : ''}
            ${provider === 'gpt' ? 'bg-green-100 text-green-700' : ''}
          `}>
            {provider === 'perplexity' && (
              <>
                <Globe className="w-3 h-3" />
                <span>Aktuální informace z internetu</span>
              </>
            )}
            {provider === 'hybrid' && (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Kombinace AI + aktuální data</span>
              </>
            )}
            {provider === 'gpt' && (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Personalizovaná odpověď</span>
              </>
            )}
          </div>
          
          {reasoning && (
            <span className="text-xs text-gray-500">
              {reasoning}
            </span>
          )}
        </div>
      )}

      {/* Sources List */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-gray-900">
            Zdroje informací
          </h4>
          <span className="text-xs text-gray-500">
            ({sources.length})
          </span>
        </div>

        <div className="space-y-2">
          {sources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                block p-3 bg-white rounded-lg border border-blue-200
                hover:border-blue-400 hover:shadow-md
                transition-all duration-200
                group
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-600">
                      [{index + 1}]
                    </span>
                    <h5 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {source.title}
                    </h5>
                  </div>
                  
                  {source.snippet && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                      {source.snippet}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500 truncate">
                    {source.url}
                  </p>
                </div>

                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-0.5" />
              </div>
            </a>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span>
              Informace ověřeny z aktuálních internetových zdrojů
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Badge showing provider type
 */
export function AIProviderBadge({
  provider,
  className = ''
}: {
  provider?: 'gpt' | 'perplexity' | 'hybrid'
  className?: string
}) {
  if (!provider) return null

  const config = {
    perplexity: {
      icon: Globe,
      label: 'Real-time',
      color: 'bg-blue-100 text-blue-700'
    },
    hybrid: {
      icon: CheckCircle2,
      label: 'Hybrid AI',
      color: 'bg-purple-100 text-purple-700'
    },
    gpt: {
      icon: CheckCircle2,
      label: 'AI',
      color: 'bg-green-100 text-green-700'
    }
  }

  const { icon: Icon, label, color } = config[provider]

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  )
}

