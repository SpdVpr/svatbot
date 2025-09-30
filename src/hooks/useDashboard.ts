'use client'

import { useState, useEffect } from 'react'
import { DashboardModule, DashboardLayout, DEFAULT_DASHBOARD_MODULES } from '@/types/dashboard'
import { useAuth } from './useAuth'

const DASHBOARD_STORAGE_KEY = 'svatbot-dashboard-layout'

export function useDashboard() {
  const { user } = useAuth()
  const [layout, setLayout] = useState<DashboardLayout>({
    modules: DEFAULT_DASHBOARD_MODULES,
    isEditMode: false,
    isLocked: false
  })
  const [loading, setLoading] = useState(true)

  // Load layout from localStorage on mount
  useEffect(() => {
    if (user) {
      // Check if user is demo user
      const isDemoUser = user.id === 'demo-user-id' || user.email === 'demo@svatbot.cz'

      const savedLayout = localStorage.getItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`)
      if (savedLayout) {
        try {
          const parsedLayout = JSON.parse(savedLayout)

          // Get valid module types from DEFAULT_DASHBOARD_MODULES
          const validModuleTypes = DEFAULT_DASHBOARD_MODULES.map(m => m.type)

          // Filter out invalid/removed modules (like phase-progress, quick-stats)
          let validModules = parsedLayout.modules.filter((m: DashboardModule) =>
            validModuleTypes.includes(m.type)
          )

          // For demo users, hide AI modules
          if (isDemoUser) {
            validModules = validModules.map((m: DashboardModule) => {
              if (m.type === 'ai-timeline' || m.type === 'moodboard') {
                return { ...m, isVisible: false }
              }
              return m
            })
          }

          // Check if we need to add new modules (like ai-timeline)
          const existingModuleTypes = validModules.map((m: DashboardModule) => m.type)
          const newModules = DEFAULT_DASHBOARD_MODULES.filter(
            defaultModule => !existingModuleTypes.includes(defaultModule.type)
          ).map(module => {
            // For demo users, ensure new AI modules are hidden
            if (isDemoUser && (module.type === 'ai-timeline' || module.type === 'moodboard')) {
              return { ...module, isVisible: false }
            }
            return module
          })

          // If there are new modules or we filtered out invalid ones, update the layout
          if (newModules.length > 0 || validModules.length !== parsedLayout.modules.length) {
            if (newModules.length > 0) {
              console.log('Adding new modules to dashboard:', newModules.map(m => m.type))
            }
            if (validModules.length !== parsedLayout.modules.length) {
              console.log('Removed invalid modules from dashboard')
            }
            const updatedLayout = {
              ...parsedLayout,
              modules: [...validModules, ...newModules]
            }
            setLayout(updatedLayout)
          } else {
            setLayout(parsedLayout)
          }
        } catch (error) {
          console.error('Error parsing saved dashboard layout:', error)
          // Use default layout if parsing fails
          setLayout({
            modules: DEFAULT_DASHBOARD_MODULES,
            isEditMode: false,
            isLocked: false
          })
        }
      } else {
        // No saved layout, use default
        let defaultModules = DEFAULT_DASHBOARD_MODULES

        // For demo users, hide AI modules in default layout
        if (isDemoUser) {
          defaultModules = DEFAULT_DASHBOARD_MODULES.map(m => {
            if (m.type === 'ai-timeline' || m.type === 'moodboard') {
              return { ...m, isVisible: false }
            }
            return m
          })
        }

        setLayout({
          modules: defaultModules,
          isEditMode: false,
          isLocked: false
        })
      }
    }
    setLoading(false)
  }, [user])

  // Save layout to localStorage whenever it changes
  useEffect(() => {
    if (user && !loading) {
      localStorage.setItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`, JSON.stringify(layout))
    }
  }, [layout, user, loading])

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

  const resetLayout = () => {
    const newLayout = {
      modules: DEFAULT_DASHBOARD_MODULES,
      isEditMode: false,
      isLocked: false
    }
    setLayout(newLayout)

    // Also clear localStorage to ensure fresh start
    if (user) {
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
    toggleEditMode,
    toggleLock,
    toggleModuleVisibility,
    toggleModuleLock,
    resetLayout,
    getVisibleModules
  }
}
