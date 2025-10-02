'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react'

interface DomainStatusProps {
  subdomain: string
  isPublished: boolean
}

interface DomainInfo {
  exists: boolean
  domain: string
  verified?: boolean
  message?: string
  error?: string
}

export default function DomainStatus({ subdomain, isPublished }: DomainStatusProps) {
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const checkDomainStatus = async () => {
    if (!subdomain || !isPublished) {
      setDomainInfo(null)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/vercel/check-domain?subdomain=${subdomain}`)
      const data = await response.json()

      if (response.ok) {
        setDomainInfo(data)
      } else {
        setDomainInfo({
          exists: false,
          domain: `${subdomain}.svatbot.cz`,
          error: data.error || 'Chyba při kontrole domény'
        })
      }
    } catch (error) {
      console.error('Error checking domain status:', error)
      setDomainInfo({
        exists: false,
        domain: `${subdomain}.svatbot.cz`,
        error: 'Chyba při kontrole domény'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDomainStatus()
  }, [subdomain, isPublished])

  if (!isPublished || !subdomain) {
    return null
  }

  const domainUrl = `https://${subdomain}.svatbot.cz`

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white">
          Stav domény
        </h3>
        <button
          onClick={checkDomainStatus}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {loading ? 'Kontroluji...' : 'Obnovit'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4 animate-spin" />
          <span className="text-sm">Kontroluji stav domény...</span>
        </div>
      )}

      {domainInfo && !loading && (
        <div className="space-y-2">
          {/* URL s odkazem */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">URL:</span>
            <a
              href={domainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {domainUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Stav domény */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Stav:</span>
            {domainInfo.error ? (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Chyba</span>
              </div>
            ) : domainInfo.exists ? (
              domainInfo.verified ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Aktivní a ověřená</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Čeká na ověření</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Není nakonfigurována</span>
              </div>
            )}
          </div>

          {/* Chybová zpráva */}
          {domainInfo.error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {domainInfo.error}
            </div>
          )}

          {/* Zpráva o stavu */}
          {domainInfo.message && !domainInfo.error && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {domainInfo.message}
            </div>
          )}

          {/* Nápověda pro neověřenou doménu */}
          {domainInfo.exists && !domainInfo.verified && (
            <div className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
              <p className="font-medium">Doména čeká na ověření</p>
              <p className="mt-1">
                DNS propagace může trvat 5-60 minut. Zkuste obnovit stav za chvíli.
              </p>
            </div>
          )}

          {/* Nápověda pro nenakonfigurovanou doménu */}
          {!domainInfo.exists && !domainInfo.error && (
            <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <p className="font-medium">Doména není nakonfigurována</p>
              <p className="mt-1">
                Zkuste znovu publikovat web nebo kontaktujte podporu.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
