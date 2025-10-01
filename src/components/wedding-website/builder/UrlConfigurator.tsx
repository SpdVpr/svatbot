'use client'

import { useState, useEffect } from 'react'
import { Check, X, Loader2, ExternalLink, Copy, CheckCheck } from 'lucide-react'
import { validateCustomUrl, normalizeCustomUrl, generateCustomUrlSuggestions } from '@/lib/subdomain'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'
import { useWeddingStore } from '@/stores/weddingStore'

interface UrlConfiguratorProps {
  customUrl: string
  onUrlChange: (url: string) => void
}

export default function UrlConfigurator({ customUrl, onUrlChange }: UrlConfiguratorProps) {
  const { currentWedding: wedding } = useWeddingStore()
  const { checkUrlAvailability } = useWeddingWebsite()
  
  const [inputValue, setInputValue] = useState(customUrl)
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  // Generování návrhů při načtení
  useEffect(() => {
    if (wedding) {
      const generatedSuggestions = generateCustomUrlSuggestions(
        wedding.brideName || 'nevesta',
        wedding.groomName || 'zenich',
        wedding.date
      )
      setSuggestions(generatedSuggestions.slice(0, 4))
    }
  }, [wedding])

  // Kontrola dostupnosti URL
  useEffect(() => {
    const checkUrl = async () => {
      if (!inputValue) {
        setIsAvailable(null)
        setValidationError(null)
        return
      }

      // Validace formátu
      const validation = validateCustomUrl(inputValue)
      if (!validation.valid) {
        setValidationError(validation.error || null)
        setIsAvailable(false)
        return
      }

      setValidationError(null)
      setIsChecking(true)

      try {
        const available = await checkUrlAvailability(inputValue)
        setIsAvailable(available)
      } catch (error) {
        console.error('Error checking URL:', error)
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }

    const timeoutId = setTimeout(checkUrl, 500)
    return () => clearTimeout(timeoutId)
  }, [inputValue, checkUrlAvailability])

  const handleInputChange = (value: string) => {
    const normalized = normalizeCustomUrl(value)
    setInputValue(normalized)
    if (isAvailable) {
      onUrlChange(normalized)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    onUrlChange(suggestion)
  }

  const handleCopy = () => {
    const fullUrl = `https://${inputValue}.svatbot.cz`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fullUrl = `https://${inputValue || 'vase-url'}.svatbot.cz`

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nastavte URL adresu
        </h2>
        <p className="text-gray-600">
          Vyberte si jedinečnou URL adresu pro váš svatební web
        </p>
      </div>

      {/* URL Input */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vaše URL adresa
        </label>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-500">https://</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="jana-petr"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <span className="text-gray-500">.svatbot.cz</span>

          {/* Status icon */}
          <div className="w-8 h-8 flex items-center justify-center">
            {isChecking && (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            )}
            {!isChecking && isAvailable === true && (
              <Check className="w-5 h-5 text-green-500" />
            )}
            {!isChecking && isAvailable === false && (
              <X className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>

        {/* Validation message */}
        {validationError && (
          <div className="flex items-center gap-2 text-sm text-red-600 mt-2">
            <X className="w-4 h-4" />
            {validationError}
          </div>
        )}

        {!validationError && isAvailable === true && (
          <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
            <Check className="w-4 h-4" />
            Tato URL je dostupná!
          </div>
        )}

        {!validationError && isAvailable === false && (
          <div className="flex items-center gap-2 text-sm text-red-600 mt-2">
            <X className="w-4 h-4" />
            Tato URL je již obsazená. Zkuste jinou.
          </div>
        )}

        {/* Full URL preview */}
        {inputValue && isAvailable && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-mono text-gray-700">
                  {fullUrl}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    Zkopírováno
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Kopírovat
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Requirements */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Požadavky na URL:
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className={inputValue.length >= 3 ? 'text-green-500' : 'text-gray-400'}>
                {inputValue.length >= 3 ? '✓' : '○'}
              </span>
              Minimálně 3 znaky
            </li>
            <li className="flex items-center gap-2">
              <span className={inputValue.length <= 50 ? 'text-green-500' : 'text-gray-400'}>
                {inputValue.length <= 50 ? '✓' : '○'}
              </span>
              Maximálně 50 znaků
            </li>
            <li className="flex items-center gap-2">
              <span className={/^[a-z0-9-]*$/.test(inputValue) ? 'text-green-500' : 'text-gray-400'}>
                {/^[a-z0-9-]*$/.test(inputValue) ? '✓' : '○'}
              </span>
              Pouze malá písmena, čísla a pomlčky
            </li>
          </ul>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Návrhy URL adres:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  inputValue === suggestion
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 bg-white hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-gray-900">
                    {suggestion}.svatbot.cz
                  </span>
                  {inputValue === suggestion && (
                    <Check className="w-4 h-4 text-pink-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

