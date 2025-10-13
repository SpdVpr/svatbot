'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardModule, DashboardLayout, DEFAULT_DASHBOARD_MODULES } from '@/types/dashboard'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'

const DASHBOARD_STORAGE_KEY = 'svatbot-dashboard-layout'

export function useDashboard() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [layout, setLayout] = useState<DashboardLayout>({
    modules: DEFAULT_DASHBOARD_MODULES,
    isEditMode: false,
    isLocked: false
  })
  const [loading, setLoading] = useState(true)
  const isSavingRef = useRef(false)
  const lastFirebaseDataRef = useRef<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Load layout from Firebase on mount
  useEffect(() => {
    if (!user || !wedding?.id) {
      setLoading(false)
      return
    }

    console.log('🔄 Loading dashboard layout from Firebase for wedding:', wedding.id)
    setLoading(true)

    // Setup Firebase listener
    import('@/config/firebase').then(({ db }) => {
      import('firebase/firestore').then(({ doc, onSnapshot, getDoc }) => {
        const dashboardRef = doc(db, 'dashboards', `${user.id}_${wedding.id}`)

        // Setup real-time listener
        const unsubscribe = onSnapshot(
          dashboardRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data()
              console.log('🔥 Dashboard layout loaded from Firebase')
              console.log('📦 Modules with positions:', data.modules?.filter((m: any) => m.position).map((m: any) => ({ id: m.id, position: m.position })))

              // Store the Firebase data as JSON string for comparison
              const firebaseDataString = JSON.stringify({
                modules: data.modules,
                isLocked: data.isLocked,
                layoutMode: data.layoutMode
              })
              lastFirebaseDataRef.current = firebaseDataString

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
                  console.log('Adding new modules to dashboard:', newModules.map(m => m.type))
                }
                if (validModules.length !== (data.modules || []).length) {
                  console.log('Removed invalid modules from dashboard')
                }
                const updatedLayout = {
                  modules: [...validModules, ...newModules],
                  isEditMode: data.isEditMode || false,
                  isLocked: data.isLocked || false,
                  layoutMode: data.layoutMode || 'grid'
                }

                // Update the ref with the new layout
                lastFirebaseDataRef.current = JSON.stringify({
                  modules: updatedLayout.modules,
                  isEditMode: updatedLayout.isEditMode,
                  isLocked: updatedLayout.isLocked,
                  layoutMode: updatedLayout.layoutMode
                })

                setLayout(updatedLayout)
              } else {
                setLayout({
                  modules: validModules,
                  isEditMode: data.isEditMode || false,
                  isLocked: data.isLocked || false,
                  layoutMode: data.layoutMode || 'grid'
                })
              }
            } else {
              console.log('📦 No saved layout found, using default')
              lastFirebaseDataRef.current = null
              setLayout({
                modules: DEFAULT_DASHBOARD_MODULES,
                isEditMode: false,
                isLocked: false,
                layoutMode: 'grid'
              })
            }
            setLoading(false)
          },
          (error) => {
            console.warn('⚠️ Firebase listener error:', error.message)
            // Fallback to localStorage
            const savedLayout = localStorage.getItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`)
            if (savedLayout) {
              try {
                const parsedLayout = JSON.parse(savedLayout)
                setLayout(parsedLayout)
              } catch (e) {
                console.error('Error parsing localStorage layout:', e)
                setLayout({
                  modules: DEFAULT_DASHBOARD_MODULES,
                  isEditMode: false,
                  isLocked: false
                })
              }
            } else {
              setLayout({
                modules: DEFAULT_DASHBOARD_MODULES,
                isEditMode: false,
                isLocked: false
              })
            }
            setLoading(false)
          }
        )

        unsubscribeRef.current = unsubscribe
      })
    }).catch((error) => {
      console.warn('⚠️ Failed to load Firebase modules:', error)
      setLoading(false)
    })

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
    // Don't save if we're loading or already saving
    if (!user || !wedding?.id || loading || isSavingRef.current) {
      return
    }

    // Compare current layout with last Firebase data to prevent loops
    const currentDataString = JSON.stringify({
      modules: layout.modules,
      isEditMode: layout.isEditMode,
      isLocked: layout.isLocked,
      layoutMode: layout.layoutMode
    })

    // If the current data matches what we last loaded from Firebase, don't save
    if (lastFirebaseDataRef.current === currentDataString) {
      console.log('⏭️ Skipping save - data matches Firebase')
      return
    }

    console.log('💾 Saving dashboard layout to Firebase...')
    isSavingRef.current = true

    // Save to Firebase
    import('@/config/firebase').then(({ db }) => {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        const dashboardRef = doc(db, 'dashboards', `${user.id}_${wedding.id}`)

        const layoutData = {
          modules: layout.modules,
          isEditMode: layout.isEditMode,
          isLocked: layout.isLocked,
          layoutMode: layout.layoutMode || 'grid',
          userId: user.id,
          weddingId: wedding.id,
          updatedAt: new Date()
        }

        console.log('💾 Saving modules with positions:', layout.modules.filter(m => m.position).map(m => ({ id: m.id, position: m.position })))

        setDoc(dashboardRef, layoutData, { merge: true })
          .then(() => {
            console.log('✅ Dashboard layout saved to Firebase')
            // Update the ref with the saved data
            lastFirebaseDataRef.current = currentDataString
            // Also save to localStorage as backup
            localStorage.setItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`, JSON.stringify(layout))
            setTimeout(() => {
              isSavingRef.current = false
            }, 500)
          })
          .catch((error) => {
            console.warn('⚠️ Firebase save failed:', error.message)
            // Fallback to localStorage
            localStorage.setItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`, JSON.stringify(layout))
            isSavingRef.current = false
          })
      })
    }).catch((error) => {
      console.warn('⚠️ Failed to load Firebase modules:', error)
      // Fallback to localStorage
      localStorage.setItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`, JSON.stringify(layout))
      isSavingRef.current = false
    })
  }, [layout, user?.id, wedding?.id, loading])

  const updateModuleOrder = (modules: DashboardModule[]) => {
    setLayout(prev => ({
      ...prev,
      modules: modules.map((module, index) => ({
        ...module,
        order: index
      }))
    }))
  }

  const toggleEditMode = () => {
    setLayout(prev => ({
      ...prev,
      isEditMode: !prev.isEditMode
    }))
  }

  const toggleLock = () => {
    setLayout(prev => ({
      ...prev,
      isLocked: !prev.isLocked
    }))
  }

  const toggleModuleVisibility = (moduleId: string) => {
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
    console.log('📍 Updating module position:', moduleId, position)
    setLayout(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, position }
          : module
      )
    }))
  }

  const setLayoutMode = (mode: 'grid' | 'free') => {
    console.log('🔄 Changing layout mode to:', mode)
    setLayout(prev => ({
      ...prev,
      layoutMode: mode
    }))
  }

  const toggleModuleLock = (moduleId: string) => {
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
    const newLayout = {
      modules: DEFAULT_DASHBOARD_MODULES,
      isEditMode: false,
      isLocked: false
    }
    setLayout(newLayout)

    // Clear from Firebase and localStorage
    if (user && wedding?.id) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore')
        const { db } = await import('@/config/firebase')

        const dashboardRef = doc(db, 'dashboards', `${user.id}_${wedding.id}`)
        await deleteDoc(dashboardRef)
        console.log('✅ Dashboard layout reset in Firebase')
      } catch (error) {
        console.warn('⚠️ Failed to reset Firebase layout:', error)
      }

      // Also clear localStorage
      localStorage.removeItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`)
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
    updateModuleOrder,
    updateModulePosition,
    setLayoutMode,
    toggleEditMode,
    toggleLock,
    toggleModuleVisibility,
    toggleModuleLock,
    resetLayout,
    getVisibleModules
  }
}
