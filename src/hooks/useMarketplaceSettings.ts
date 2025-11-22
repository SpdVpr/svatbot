'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface MarketplaceSettings {
  enablePhysicsAnimation: boolean
  lastModified: Date
  modifiedBy?: string
}

const SETTINGS_DOC_ID = 'marketplace-config'

export function useMarketplaceSettings() {
  // Initialize with default settings to avoid flash of static image
  const [settings, setSettings] = useState<MarketplaceSettings | null>({
    enablePhysicsAnimation: true,
    lastModified: new Date()
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real-time listener for marketplace settings
  useEffect(() => {
    const docRef = doc(db, 'marketplaceSettings', SETTINGS_DOC_ID)
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setSettings({
            enablePhysicsAnimation: data.enablePhysicsAnimation ?? true,
            lastModified: data.lastModified?.toDate() || new Date(),
            modifiedBy: data.modifiedBy
          })
        } else {
          // Initialize with default settings if doesn't exist
          const defaultSettings: MarketplaceSettings = {
            enablePhysicsAnimation: true,
            lastModified: new Date()
          }
          setSettings(defaultSettings)
        }
        setLoading(false)
      },
      (err) => {
        console.error('Error loading marketplace settings:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Update settings
  const updateSettings = async (updates: Partial<MarketplaceSettings>, userId?: string) => {
    try {
      const docRef = doc(db, 'marketplaceSettings', SETTINGS_DOC_ID)
      await setDoc(docRef, {
        ...updates,
        lastModified: new Date(),
        modifiedBy: userId
      }, { merge: true })
      return { success: true }
    } catch (err: any) {
      console.error('Error updating marketplace settings:', err)
      return { success: false, error: err.message }
    }
  }

  // Toggle physics animation
  const togglePhysicsAnimation = async (userId?: string) => {
    // If settings not loaded yet, default to true (enabled)
    const currentState = settings?.enablePhysicsAnimation ?? true

    return updateSettings({
      enablePhysicsAnimation: !currentState
    }, userId)
  }

  return {
    settings,
    loading,
    error,
    updateSettings,
    togglePhysicsAnimation
  }
}

