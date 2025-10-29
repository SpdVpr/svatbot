'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface DemoSettings {
  isLocked: boolean
  fixedWeddingDate: Date
  demoUserId: string
  lastModified: Date
}

const DEMO_SETTINGS_DOC_ID = 'demo-config'

export function useDemoSettings() {
  const [settings, setSettings] = useState<DemoSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real-time listener for demo settings
  useEffect(() => {
    const docRef = doc(db, 'demoSettings', DEMO_SETTINGS_DOC_ID)
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setSettings({
            isLocked: data.isLocked || false,
            fixedWeddingDate: data.fixedWeddingDate?.toDate() || new Date(),
            demoUserId: data.demoUserId || '',
            lastModified: data.lastModified?.toDate() || new Date()
          })
        } else {
          // Initialize with default settings if doesn't exist
          const defaultSettings: DemoSettings = {
            isLocked: false,
            fixedWeddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            demoUserId: '',
            lastModified: new Date()
          }
          setSettings(defaultSettings)
        }
        setLoading(false)
      },
      (err) => {
        console.error('Error loading demo settings:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const updateDemoSettings = async (updates: Partial<DemoSettings>) => {
    try {
      const docRef = doc(db, 'demoSettings', DEMO_SETTINGS_DOC_ID)
      
      await setDoc(docRef, {
        ...updates,
        lastModified: new Date()
      }, { merge: true })

      console.log('✅ Demo settings updated:', updates)
      return true
    } catch (err: any) {
      console.error('❌ Error updating demo settings:', err)
      setError(err.message)
      return false
    }
  }

  const toggleLock = async () => {
    if (!settings) return false
    
    const newLockState = !settings.isLocked
    const success = await updateDemoSettings({ isLocked: newLockState })
    
    if (success) {
      console.log(`🔒 Demo account ${newLockState ? 'LOCKED' : 'UNLOCKED'}`)
    }
    
    return success
  }

  const setDemoUserId = async (userId: string) => {
    return await updateDemoSettings({ demoUserId: userId })
  }

  const setFixedWeddingDate = async (date: Date) => {
    return await updateDemoSettings({ fixedWeddingDate: date })
  }

  return {
    settings,
    loading,
    error,
    updateDemoSettings,
    toggleLock,
    setDemoUserId,
    setFixedWeddingDate
  }
}

// Hook to check if current user is demo user
export function useIsDemoUser(userId: string | undefined) {
  const { settings, loading } = useDemoSettings()

  const isDemoUser = userId && settings?.demoUserId === userId

  return {
    isDemoUser,
    isLocked: isDemoUser && settings?.isLocked,
    loading
  }
}

// Hook to get wedding date (fixed for demo, actual for others)
export function useWeddingDate(userId: string | undefined, actualWeddingDate: Date | null) {
  const { settings, loading } = useDemoSettings()

  const isDemoUser = userId && settings?.demoUserId === userId
  const weddingDate = isDemoUser && settings?.fixedWeddingDate
    ? settings.fixedWeddingDate
    : actualWeddingDate

  return {
    weddingDate,
    isDemoUser,
    loading
  }
}

