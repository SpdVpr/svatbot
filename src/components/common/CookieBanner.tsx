'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, Settings, Check } from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

interface CookiePreferences {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
        loadPreferencesFromFirebase(user.uid)
      } else {
        setUserId(null)
        loadPreferencesFromLocalStorage()
      }
    })

    return () => unsubscribe()
  }, [])

  const loadPreferencesFromFirebase = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid, 'settings', 'cookieConsent')
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const saved = docSnap.data() as CookiePreferences
        setPreferences(saved)
        applyCookiePreferences(saved)
      } else {
        // No preferences saved, show banner
        setTimeout(() => setShowBanner(true), 2000)
      }
    } catch (e) {
      console.error('Error loading cookie preferences from Firebase:', e)
      loadPreferencesFromLocalStorage()
    }
  }

  const loadPreferencesFromLocalStorage = () => {
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 2000)
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(cookieConsent)
        setPreferences(saved)
        applyCookiePreferences(saved)
      } catch (e) {
        console.error('Error loading cookie preferences:', e)
      }
    }
  }

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Apply analytics cookies
    if (prefs.analytics && typeof window !== 'undefined') {
      // Enable Google Analytics
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
        })
      }
    } else if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }

    // Apply marketing cookies
    if (prefs.marketing && typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted'
        })
      }
    } else if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      })
    }
  }

  const savePreferences = async (prefs: CookiePreferences) => {
    // Save to localStorage
    localStorage.setItem('cookieConsent', JSON.stringify(prefs))
    localStorage.setItem('cookieConsentDate', new Date().toISOString())

    // Save to Firebase if user is logged in
    if (userId) {
      try {
        const docRef = doc(db, 'users', userId, 'settings', 'cookieConsent')
        await setDoc(docRef, {
          ...prefs,
          updatedAt: new Date().toISOString()
        })
      } catch (e) {
        console.error('Error saving cookie preferences to Firebase:', e)
      }
    }

    applyCookiePreferences(prefs)
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(allAccepted)
    savePreferences(allAccepted)
  }

  const acceptNecessaryOnly = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    setPreferences(necessaryOnly)
    savePreferences(necessaryOnly)
  }

  const saveCustomPreferences = () => {
    savePreferences(preferences)
  }

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return // Cannot disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Banner - Bottom Right Corner */}
      <div className="fixed bottom-4 right-4 z-[9999] max-w-md">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200">
          {!showSettings ? (
            // Simple Banner
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Cookie className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    Používáme cookies
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Pro základní funkčnost a zlepšení vašeho zážitku.{' '}
                    <Link href="/cookies" className="text-rose-600 hover:text-rose-700 underline">
                      Více info
                    </Link>
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={acceptAll}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                    >
                      Přijmout vše
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={acceptNecessaryOnly}
                        className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Pouze nezbytné
                      </button>
                      <button
                        onClick={() => setShowSettings(true)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all"
                      >
                        Nastavení
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={acceptNecessaryOnly}
                  className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Zavřít"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ) : (
            // Settings Panel
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-rose-500" />
                  Nastavení cookies
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Zavřít nastavení"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                {/* Necessary Cookies */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 mb-1">
                        Nezbytné
                      </h4>
                      <p className="text-xs text-gray-600">
                        Autentifikace a zabezpečení
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-10 h-5 bg-green-500 rounded-full flex items-center justify-end px-0.5">
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                      <p className="text-[10px] text-gray-600 mt-0.5 text-center">Vždy</p>
                    </div>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 mb-1">
                        Funkční
                      </h4>
                      <p className="text-xs text-gray-600">
                        Personalizace a nastavení
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => togglePreference('functional')}
                        className={`w-10 h-5 rounded-full transition-colors ${
                          preferences.functional ? 'bg-rose-500' : 'bg-gray-300'
                        } flex items-center ${preferences.functional ? 'justify-end' : 'justify-start'} px-0.5`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 mb-1">
                        Analytické
                      </h4>
                      <p className="text-xs text-gray-600">
                        Google Analytics (anonymní)
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => togglePreference('analytics')}
                        className={`w-10 h-5 rounded-full transition-colors ${
                          preferences.analytics ? 'bg-rose-500' : 'bg-gray-300'
                        } flex items-center ${preferences.analytics ? 'justify-end' : 'justify-start'} px-0.5`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 mb-1">
                        Marketingové
                      </h4>
                      <p className="text-xs text-gray-600">
                        Nepoužíváme
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => togglePreference('marketing')}
                        className={`w-10 h-5 rounded-full transition-colors ${
                          preferences.marketing ? 'bg-rose-500' : 'bg-gray-300'
                        } flex items-center ${preferences.marketing ? 'justify-end' : 'justify-start'} px-0.5`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={saveCustomPreferences}
                  className="w-full px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                >
                  Uložit nastavení
                </button>
                <button
                  onClick={acceptAll}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Přijmout vše
                </button>
              </div>

              <p className="text-[10px] text-gray-500 text-center mt-3">
                <Link href="/cookies" className="text-rose-600 hover:text-rose-700 underline">
                  Více informací
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

