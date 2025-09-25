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
      const savedLayout = localStorage.getItem(`${DASHBOARD_STORAGE_KEY}-${user.id}`)
      if (savedLayout) {
        try {
          const parsedLayout = JSON.parse(savedLayout)

          // Check if we need to add new modules (like ai-timeline)
          const existingModuleTypes = parsedLayout.modules.map((m: DashboardModule) => m.type)
          const newModules = DEFAULT_DASHBOARD_MODULES.filter(
            defaultModule => !existingModuleTypes.includes(defaultModule.type)
          )

          // If there are new modules, add them to the layout
          if (newModules.length > 0) {
            console.log('Adding new modules to dashboard:', newModules.map(m => m.type))
            const updatedLayout = {
              ...parsedLayout,
              modules: [...parsedLayout.modules, ...newModules]
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
        setLayout({
          modules: DEFAULT_DASHBOARD_MODULES,
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
