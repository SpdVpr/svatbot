'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardModule, DashboardLayout, DEFAULT_DASHBOARD_MODULES } from '@/types/dashboard'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { useIsDemoUser } from './useDemoSettings'
import logger from '@/lib/logger'
import { db } from '@/config/firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

const DASHBOARD_STORAGE_KEY = 'svatbot-dashboard-layout'

export function useDashboard() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { isDemoUser, isLocked: isDemoLocked } = useIsDemoUser(user?.id)

  // Initialize layout with layoutMode from localStorage if available
  const [layout, setLayout] = useState<DashboardLayout>(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const saved = localStorage.getItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return {
            modules: DEFAULT_DASHBOARD_MODULES,
            isEditMode: false,
            isLocked: false,
            layoutMode: parsed.layoutMode || 'grid',
            canvasWidth: parsed.canvasWidth || 'normal'
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    return {
      modules: DEFAULT_DASHBOARD_MODULES,
      isEditMode: false,
      isLocked: false,
      layoutMode: 'grid',
      canvasWidth: 'normal'
    }
  })

  const [loading, setLoading] = useState(true)
  const isSavingRef = useRef(false)
  const isLoadingFromFirebaseRef = useRef(false)
  const hasLoadedFromFirebaseRef = useRef(false) // Track if we've loaded from Firebase at least once
  const lastFirebaseDataRef = useRef<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Load layout from Firebase on mount
  useEffect(() => {
    if (!user || !wedding?.id) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Setup Firebase listener (no dynamic imports - already imported at top)
    const dashboardRef = doc(db, 'dashboards', `${user.id}_${wedding.id}`)
    logger.log('📄 Loading from document ID:', `${user.id}_${wedding.id}`)

    // Setup real-time listener
    const unsubscribe = onSnapshot(
      dashboardRef,
      (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data()

              // Store the Firebase data as JSON string for comparison (include isEditMode)
              const firebaseDataString = JSON.stringify({
                modules: data.modules,
                isEditMode: data.isEditMode,
                isLocked: data.isLocked,
                layoutMode: data.layoutMode
              })

              // Only process if data actually changed
              const dataChanged = lastFirebaseDataRef.current !== firebaseDataString
              if (!dataChanged) {
                logger.log('📥 Firebase data unchanged, skipping update')
                return
              }

              logger.log('📥 Firebase data changed, updating layout')
              isLoadingFromFirebaseRef.current = true

              lastFirebaseDataRef.current = firebaseDataString

              logger.log('📥 Raw Firebase data:', {
                layoutMode: data.layoutMode,
                modulesCount: data.modules?.length,
                sampleModules: data.modules?.slice(0, 3).map((m: DashboardModule) => ({
                  id: m.id,
                  position: m.position
                }))
              })

              // Get valid module types from DEFAULT_DASHBOARD_MODULES
              const validModuleTypes = DEFAULT_DASHBOARD_MODULES.map(m => m.type)

              // Filter out invalid/removed modules
              let validModules = (data.modules || []).filter((m: DashboardModule) =>
                validModuleTypes.includes(m.type)
              )

              // Check if we need to add new modules
              const existingModuleTypes = validModules.map((m: DashboardModule) => m.type)
              const newModules = DEFAULT_DASHBOARD_MODULES.filter(
                defaultModule => !existingModuleTypes.includes(defaultModule.type)
              )

              // If there are new modules or we filtered out invalid ones, update the layout
              if (newModules.length > 0 || validModules.length !== (data.modules || []).length) {
                if (newModules.length > 0) {
                  logger.log('Adding new modules to dashboard:', newModules.map(m => m.type))
                }
                if (validModules.length !== (data.modules || []).length) {
                  logger.log('Removed invalid modules from dashboard')
                }
                const updatedLayout = {
                  modules: [...validModules, ...newModules],
                  isEditMode: data.isEditMode || false,
                  isLocked: data.isLocked || false,
                  layoutMode: data.layoutMode || 'grid',
                  canvasWidth: data.canvasWidth || 'normal'
                }

                // Update the ref with the new layout
                lastFirebaseDataRef.current = JSON.stringify({
                  modules: updatedLayout.modules,
                  isEditMode: updatedLayout.isEditMode,
                  isLocked: updatedLayout.isLocked,
                  layoutMode: updatedLayout.layoutMode,
                  canvasWidth: updatedLayout.canvasWidth
                })

                setLayout(updatedLayout)
              } else {
                const loadedLayout = {
                  modules: validModules,
                  isEditMode: data.isEditMode || false,
                  isLocked: data.isLocked || false,
                  layoutMode: data.layoutMode || 'grid',
                  canvasWidth: data.canvasWidth || 'normal'
                }
                logger.log('📥 Loading layout from Firebase:', {
                  layoutMode: loadedLayout.layoutMode,
                  canvasWidth: loadedLayout.canvasWidth,
                  modulesCount: loadedLayout.modules.length,
                  isEditMode: loadedLayout.isEditMode,
                  sampleModulePositions: loadedLayout.modules.slice(0, 3).map((m: DashboardModule) => ({
                    id: m.id,
                    position: m.position
                  }))
                })
                setLayout(loadedLayout)
              }
            } else {
              lastFirebaseDataRef.current = null
              setLayout({
                modules: DEFAULT_DASHBOARD_MODULES,
                isEditMode: false,
                isLocked: false,
                layoutMode: 'grid',
                canvasWidth: 'normal'
              })
            }

            // Only set loading to false on first load
            if (!hasLoadedFromFirebaseRef.current) {
              setLoading(false)
            }

            // Mark that we've loaded from Firebase at least once
            hasLoadedFromFirebaseRef.current = true

            // Reset loading flag immediately (no delay needed)
            logger.log('✅ Resetting isLoadingFromFirebase flag')
            isLoadingFromFirebaseRef.current = false
          },
          (error) => {
            logger.warn('⚠️ Firebase listener error:', error.message)

            // Mark that we've "loaded" from Firebase (even if it failed) so we can start saving
            hasLoadedFromFirebaseRef.current = true

            // Fallback to localStorage
            const savedLayout = localStorage.getItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`)
            if (savedLayout) {
              try {
                const parsedLayout = JSON.parse(savedLayout)
                setLayout(parsedLayout)
                logger.log('✅ Loaded layout from localStorage fallback')
              } catch (e) {
                logger.error('Error parsing localStorage layout:', e)
                setLayout({
                  modules: DEFAULT_DASHBOARD_MODULES,
                  isEditMode: false,
                  isLocked: false,
                  layoutMode: 'grid',
                  canvasWidth: 'normal'
                })
              }
            } else {
              // No localStorage data, use defaults
              logger.log('📦 No localStorage data, using defaults')
              setLayout({
                modules: DEFAULT_DASHBOARD_MODULES,
                isEditMode: false,
                isLocked: false,
                layoutMode: 'grid',
                canvasWidth: 'normal'
              })
            }
            setLoading(false)

            // Reset loading flag immediately
            isLoadingFromFirebaseRef.current = false
          }
        )

    unsubscribeRef.current = unsubscribe

    // Cleanup listener on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [user?.id, wedding?.id])

  // Save layout to Firebase whenever it changes
  useEffect(() => {
    // Don't save if we haven't loaded from Firebase yet, we're loading, already saving, or loading from Firebase
    if (!user || !wedding?.id || !hasLoadedFromFirebaseRef.current || loading || isSavingRef.current || isLoadingFromFirebaseRef.current) {
      logger.log('⏭️ Skipping save - conditions not met:', {
        hasUser: !!user,
        hasWedding: !!wedding?.id,
        hasLoadedFromFirebase: hasLoadedFromFirebaseRef.current,
        loading,
        isSaving: isSavingRef.current,
        isLoadingFromFirebase: isLoadingFromFirebaseRef.current
      })
      return
    }

    // Compare current layout with last Firebase data to prevent loops
    const currentDataString = JSON.stringify({
      modules: layout.modules,
      isEditMode: layout.isEditMode,
      isLocked: layout.isLocked,
      layoutMode: layout.layoutMode,
      canvasWidth: layout.canvasWidth
    })

    // If the current data matches what we last loaded from Firebase, don't save
    if (lastFirebaseDataRef.current === currentDataString) {
      logger.log('⏭️ Skipping save - data matches Firebase')
      return
    }

    logger.log('💾 Saving layout to Firebase...')
    isSavingRef.current = true

    // Save to Firebase (no dynamic imports - already imported at top)
    const dashboardRef = doc(db, 'dashboards', `${user.id}_${wedding.id}`)
    logger.log('📄 Saving to document ID:', `${user.id}_${wedding.id}`)

    const layoutData = {
      modules: layout.modules,
      isEditMode: layout.isEditMode,
      isLocked: layout.isLocked,
      layoutMode: layout.layoutMode || 'grid',
      canvasWidth: layout.canvasWidth || 'normal',
      userId: user.id,
      weddingId: wedding.id,
      updatedAt: new Date()
    }

    logger.log('💾 Saving to Firebase:', {
      layoutMode: layoutData.layoutMode,
      canvasWidth: layoutData.canvasWidth,
      isEditMode: layoutData.isEditMode,
      modulesCount: layoutData.modules.length,
      sampleModulePositions: layout.modules.slice(0, 3).map(m => ({ id: m.id, position: m.position }))
    })

    setDoc(dashboardRef, layoutData, { merge: true })
      .then(() => {
        logger.log('✅ Layout saved to Firebase successfully')
        // Update the ref with the saved data
        lastFirebaseDataRef.current = currentDataString
        // Also save to localStorage as backup
        localStorage.setItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`, JSON.stringify(layout))
        setTimeout(() => {
          isSavingRef.current = false
        }, 100)
      })
      .catch((error) => {
        logger.warn('⚠️ Firebase save failed:', error.message)
        // Fallback to localStorage
        localStorage.setItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`, JSON.stringify(layout))
        isSavingRef.current = false
      })
  }, [layout, user?.id, wedding?.id, loading])

  const updateModuleOrder = (modules: DashboardModule[]) => {
    // Block only for locked DEMO account
    if (isDemoUser && isDemoLocked) {
      console.log('🔒 DEMO account is locked - layout editing prevented')
      return
    }

    setLayout(prev => ({
      ...prev,
      modules: modules.map((module, index) => ({
        ...module,
        order: index
      }))
    }))
  }

  const toggleEditMode = () => {
    // Block only for locked DEMO account
    if (isDemoUser && isDemoLocked) {
      console.log('🔒 DEMO account is locked - layout editing prevented')
      return
    }

    setLayout(prev => ({
      ...prev,
      isEditMode: !prev.isEditMode
    }))
  }

  const toggleLock = () => {
    // Block only for locked DEMO account
    if (isDemoUser && isDemoLocked) {
      console.log('🔒 DEMO account is locked - layout editing prevented')
      return
    }

    setLayout(prev => ({
      ...prev,
      isLocked: !prev.isLocked
    }))
  }

  const toggleModuleVisibility = (moduleId: string) => {
    // Block only for locked DEMO account
    if (isDemoUser && isDemoLocked) {
      console.log('🔒 DEMO account is locked - layout editing prevented')
      return
    }

    setLayout(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, isVisible: !module.isVisible }
          : module
      )
    }))
  }

  const updateModulePosition = (moduleId: string, position: { x: number; y: number }) => {
    // Block only for locked DEMO account
    if (isDemoUser && isDemoLocked) {
      console.log('🔒 DEMO account is locked - layout editing prevented')
      return
    }

    logger.log('📍 Updating module position:', moduleId, position)
    setLayout(prev => {
      const updatedModules = prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, position }
          : module
      )
      logger.log('📍 Updated modules:', updatedModules.find(m => m.id === moduleId)?.position)
      return {
        ...prev,
        modules: updatedModules
      }
    })
  }

  const updateModuleSize = (moduleId: string, size: { width: number; height: number }) => {
    // Block only for locked DEMO account
    if (isDemoUser && isDemoLocked) {
      console.log('🔒 DEMO account is locked - layout editing prevented')
      return
    }

    logger.log('📏 Updating module size:', moduleId, size)
    setLayout(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, customSize: size }
          : module
      )
    }))
  }

  const setLayoutMode = (mode: 'grid' | 'free') => {
    // Block only for locked DEMO account
    if (isDemoUser && isDemoLocked) {
      console.log('🔒 DEMO account is locked - layout editing prevented')
      return
    }

    logger.log('🔄 Setting layout mode to:', mode)
    setLayout(prev => ({
      ...prev,
      layoutMode: mode
    }))
  }

  const setCanvasWidth = (width: 'normal' | 'wide' | 'ultra-wide') => {
    // Block only for locked DEMO account
    if (isDemoUser && isDemoLocked) {
      console.log('🔒 DEMO account is locked - layout editing prevented')
      return
    }

    logger.log('📐 Setting canvas width to:', width)
    setLayout(prev => ({
      ...prev,
      canvasWidth: width
    }))
  }

  const toggleModuleLock = (moduleId: string) => {
    // Block only for locked DEMO account
    if (isDemoUser && isDemoLocked) {
      console.log('🔒 DEMO account is locked - layout editing prevented')
      return
    }

    setLayout(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, isLocked: !module.isLocked }
          : module
      )
    }))
  }

  const resetLayout = async () => {
    // Block only for locked DEMO account
    if (isDemoUser && isDemoLocked) {
      console.log('🔒 DEMO account is locked - layout editing prevented')
      return
    }

    // Always reset to grid layout mode
    const newLayout = {
      modules: DEFAULT_DASHBOARD_MODULES,
      isEditMode: false,
      isLocked: false,
      layoutMode: 'grid' as const, // Always reset to grid layout
      canvasWidth: 'normal' as const
    }
    setLayout(newLayout)

    // Save to Firebase with grid layoutMode (no dynamic imports - already imported at top)
    if (user && wedding?.id) {
      try {
        const dashboardRef = doc(db, 'dashboards', `${user.id}_${wedding.id}`)
        await setDoc(dashboardRef, newLayout)
        logger.log('✅ Dashboard layout reset to grid in Firebase')
      } catch (error) {
        logger.warn('⚠️ Failed to reset Firebase layout:', error)
      }

      // Also update localStorage with grid layoutMode
      localStorage.setItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`, JSON.stringify(newLayout))
    }
  }

  const getVisibleModules = () => {
    return layout.modules
      .filter(module => module.isVisible)
      .sort((a, b) => a.order - b.order)
  }

  return {
    layout,
    loading,
    hasLoadedFromFirebase: hasLoadedFromFirebaseRef.current,
    updateModuleOrder,
    updateModulePosition,
    updateModuleSize,
    setLayoutMode,
    setCanvasWidth,
    toggleEditMode,
    toggleLock,
    toggleModuleVisibility,
    toggleModuleLock,
    resetLayout,
    getVisibleModules
  }
}
