'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { WEDDING_CHECKLIST, ChecklistItem, ChecklistPhase } from '@/data/weddingChecklistTemplates'
import { useTask } from '@/hooks/useTask'
import { useWedding } from '@/hooks/useWedding'
import { useAuth } from '@/hooks/useAuth'
import { TaskFormData } from '@/types/task'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import {
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react'

interface WeddingChecklistProps {
  compact?: boolean
}

export default function WeddingChecklist({ compact = false }: WeddingChecklistProps) {
  const { createTask, tasks, updateTask } = useTask()
  const { wedding } = useWedding()
  const { user } = useAuth()
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['1-week-before'])
  const [addingToTasks, setAddingToTasks] = useState<string | null>(null)
  const [markingComplete, setMarkingComplete] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState<string | null>(null)
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is demo user
  const isDemoUser = user?.email === 'demo@svatbot.cz'

  // Load completed items from storage on mount
  useEffect(() => {
    const loadCompletedItems = async () => {
      try {
        if (!wedding) {
          setIsLoading(false)
          return
        }

        if (isDemoUser) {
          // Load from sessionStorage for demo user
          const storageKey = `checklist_completed_${wedding.id}`
          const stored = sessionStorage.getItem(storageKey)
          if (stored) {
            const itemIds = JSON.parse(stored) as string[]
            setCompletedItems(new Set(itemIds))
          }
        } else if (user) {
          // Load from Firestore for real user
          const checklistRef = doc(db, 'checklist_completed', wedding.id)
          const checklistDoc = await getDoc(checklistRef)

          if (checklistDoc.exists()) {
            const data = checklistDoc.data()
            const itemIds = data.completedItems || []
            setCompletedItems(new Set(itemIds))
          }
        }
      } catch (error) {
        console.error('Error loading completed items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCompletedItems()
  }, [wedding, user, isDemoUser])

  // Save completed items to storage
  const saveCompletedItems = async (items: Set<string>) => {
    try {
      if (!wedding) return

      const itemsArray = Array.from(items)

      if (isDemoUser) {
        // Save to sessionStorage for demo user
        const storageKey = `checklist_completed_${wedding.id}`
        sessionStorage.setItem(storageKey, JSON.stringify(itemsArray))
      } else if (user) {
        // Save to Firestore for real user
        const checklistRef = doc(db, 'checklist_completed', wedding.id)
        await setDoc(checklistRef, {
          weddingId: wedding.id,
          userId: user.id,
          completedItems: itemsArray,
          updatedAt: new Date()
        })
      }
    } catch (error) {
      console.error('Error saving completed items:', error)
      throw error
    }
  }

  // Toggle phase expansion
  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    )
  }

  // Check if item is already in tasks - memoized to update when tasks change
  const isItemInTasks = useCallback((item: ChecklistItem): boolean => {
    return tasks.some(task =>
      task.title.toLowerCase() === item.title.toLowerCase() ||
      task.description?.toLowerCase().includes(item.title.toLowerCase())
    )
  }, [tasks])

  // Check if item is completed - only check local state (not tasks database)
  const isItemCompleted = useCallback((item: ChecklistItem): boolean => {
    return completedItems.has(item.id)
  }, [completedItems])

  // Get task for item - memoized to update when tasks change
  const getTaskForItem = useCallback((item: ChecklistItem) => {
    return tasks.find(task =>
      task.title.toLowerCase() === item.title.toLowerCase() ||
      task.description?.toLowerCase().includes(item.title.toLowerCase())
    )
  }, [tasks])

  // Add checklist item to tasks
  const handleAddToTasks = async (item: ChecklistItem) => {
    if (!wedding) {
      alert('Nejdříve si vytvořte svatbu')
      return
    }

    try {
      setAddingToTasks(item.id)

      // Map checklist category to task category
      const categoryMap: Record<ChecklistItem['category'], TaskFormData['category']> = {
        'beauty': 'beauty',
        'preparation': 'organization',
        'post-wedding': 'custom',
        'legal': 'custom',
        'other': 'custom'
      }

      // Calculate due date based on phase
      let dueDate: Date | undefined
      if (wedding.weddingDate) {
        const weddingDate = new Date(wedding.weddingDate)
        switch (item.phase) {
          case '1-week-before':
            dueDate = new Date(weddingDate)
            dueDate.setDate(dueDate.getDate() - 7)
            break
          case '1-day-before':
            dueDate = new Date(weddingDate)
            dueDate.setDate(dueDate.getDate() - 1)
            break
          case 'wedding-day':
            dueDate = new Date(weddingDate)
            break
          case 'after-wedding':
            dueDate = new Date(weddingDate)
            dueDate.setDate(dueDate.getDate() + 7)
            break
          default:
            dueDate = new Date(weddingDate)
            dueDate.setDate(dueDate.getDate() - 14)
        }
      }

      const taskData: TaskFormData = {
        title: item.title,
        description: item.description || '',
        category: categoryMap[item.category],
        priority: item.priority as TaskFormData['priority'],
        dueDate,
        notes: item.tips?.join('\n') || ''
      }

      await createTask(taskData)

      // Show success message
      setShowSuccess(item.id)
      setTimeout(() => setShowSuccess(null), 3000)
    } catch (error) {
      console.error('Error adding to tasks:', error)
      alert('Chyba při přidávání úkolu')
    } finally {
      setAddingToTasks(null)
    }
  }

  // Mark item as complete
  const handleMarkComplete = async (item: ChecklistItem) => {
    try {
      setMarkingComplete(item.id)

      // Update local state immediately for instant UI feedback
      const newCompletedItems = new Set(completedItems).add(item.id)
      setCompletedItems(newCompletedItems)

      // Save to storage (Firebase or sessionStorage)
      await saveCompletedItems(newCompletedItems)

      // Show success message
      setShowSuccess(item.id)
      setTimeout(() => setShowSuccess(null), 2000)
    } catch (error) {
      console.error('Error marking complete:', error)
      alert('Chyba při označování jako hotovo')
      // Revert local state on error
      setCompletedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(item.id)
        return newSet
      })
    } finally {
      setMarkingComplete(null)
    }
  }

  // Unmark item as complete
  const handleUnmarkComplete = async (item: ChecklistItem) => {
    try {
      setMarkingComplete(item.id)

      // Update local state immediately for instant UI feedback
      const newCompletedItems = new Set(completedItems)
      newCompletedItems.delete(item.id)
      setCompletedItems(newCompletedItems)

      // Save to storage (Firebase or sessionStorage)
      await saveCompletedItems(newCompletedItems)
    } catch (error) {
      console.error('Error unmarking complete:', error)
      alert('Chyba při rušení dokončení')
      // Revert local state on error
      setCompletedItems(prev => new Set(prev).add(item.id))
    } finally {
      setMarkingComplete(null)
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50'
      case 'high':
        return 'text-orange-600 bg-orange-50'
      case 'medium':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // Get priority label
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgentní'
      case 'high':
        return 'Vysoká'
      case 'medium':
        return 'Střední'
      default:
        return 'Nízká'
    }
  }

  if (compact) {
    // Calculate overall statistics
    const totalItems = WEDDING_CHECKLIST.reduce((sum, phase) => sum + phase.items.length, 0)
    const completedCount = WEDDING_CHECKLIST.reduce((sum, phase) =>
      sum + phase.items.filter(item => isItemCompleted(item)).length, 0
    )
    const overallPercentage = Math.round((completedCount / totalItems) * 100)

    // Compact view for dashboard module - show categories with statistics
    return (
      <div className="space-y-4">
        {/* Overall statistics */}
        <div className="bg-gradient-to-r from-primary-50 to-pink-50 p-4 rounded-lg border border-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Celkový pokrok</div>
              <div className="text-2xl font-bold text-primary-600">
                {completedCount} / {totalItems}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {overallPercentage}%
              </div>
              <div className="text-xs text-gray-600">dokončeno</div>
            </div>
          </div>
        </div>

        {/* Phase categories with statistics */}
        <div className="space-y-2">
          {WEDDING_CHECKLIST.map((phase) => {
            const itemsCompleted = phase.items.filter(item => isItemCompleted(item)).length
            const totalPhaseItems = phase.items.length
            const phasePercentage = Math.round((itemsCompleted / totalPhaseItems) * 100)

            return (
              <div
                key={phase.id}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{phase.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {phase.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {phase.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {itemsCompleted} / {totalPhaseItems}
                    </div>
                    <div className="text-xs text-gray-500">
                      {phasePercentage}%
                    </div>
                  </div>
                  {itemsCompleted === totalPhaseItems ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Calculate overall statistics
  const totalItems = WEDDING_CHECKLIST.reduce((sum, phase) => sum + phase.items.length, 0)
  const completedCount = WEDDING_CHECKLIST.reduce((sum, phase) =>
    sum + phase.items.filter(item => isItemCompleted(item)).length, 0
  )
  const overallPercentage = Math.round((completedCount / totalItems) * 100)

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Full view for dedicated page
  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="bg-gradient-to-r from-primary-50 to-pink-50 p-6 rounded-xl border border-primary-100">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Svatební checklist
              </h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {completedCount} / {totalItems}
                </div>
                <div className="text-xs text-gray-600">
                  {overallPercentage}% dokončeno
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-3">
              Předpřipravené úkoly pro vaši svatbu. Můžete je rychle označit jako hotové nebo přidat do modulu Úkoly pro detailní sledování.
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span><strong>Hotovo:</strong> Rychle označí úkol jako dokončený (zůstane jen v checklistu)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span><strong>Do úkolů:</strong> Přidá úkol do modulu Úkoly s datem a upozorněním</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist phases */}
      <div className="space-y-4">
        {WEDDING_CHECKLIST.map((phase) => {
          const isExpanded = expandedPhases.includes(phase.id)
          const itemsCompleted = phase.items.filter(item => isItemCompleted(item)).length
          const itemsInTasks = phase.items.filter(item => isItemInTasks(item)).length
          const totalItems = phase.items.length
          const completionPercentage = Math.round((itemsCompleted / totalItems) * 100)

          return (
            <div
              key={phase.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{phase.icon}</span>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {phase.title}
                    </h3>
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {itemsCompleted} / {totalItems} hotovo
                    </div>
                    <div className="text-xs text-gray-500">
                      {completionPercentage}% dokončeno
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Phase items */}
              {isExpanded && (
                <div className="px-6 pb-4 space-y-3">
                  {phase.items.map((item) => {
                    const inTasks = isItemInTasks(item)
                    const isCompleted = isItemCompleted(item)
                    const isAdding = addingToTasks === item.id
                    const justAdded = showSuccess === item.id

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border transition-all ${
                          isCompleted
                            ? 'bg-green-50 border-green-200'
                            : inTasks
                            ? 'bg-blue-50 border-blue-200'
                            : justAdded
                            ? 'bg-primary-50 border-primary-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between space-x-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-2xl flex-shrink-0">{item.icon}</span>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900">{item.title}</h4>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Item details */}
                            <div className="flex flex-wrap items-center gap-2 ml-11">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                                  item.priority
                                )}`}
                              >
                                {getPriorityLabel(item.priority)}
                              </span>
                              {item.estimatedDuration && (
                                <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-200">
                                  ⏱️ {item.estimatedDuration}
                                </span>
                              )}
                            </div>

                            {/* Tips */}
                            {item.tips && item.tips.length > 0 && (
                              <div className="ml-11 mt-3 text-xs text-gray-600 space-y-1">
                                {item.tips.map((tip, index) => (
                                  <div key={index} className="flex items-start space-x-2">
                                    <span className="text-primary-500 mt-0.5">•</span>
                                    <span>{tip}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex-shrink-0">
                            {isItemCompleted(item) ? (
                              <div className="flex flex-col space-y-2">
                                {/* Hotovo badge */}
                                <div className="flex items-center space-x-2 text-green-600 bg-green-100 px-3 py-2 rounded-lg">
                                  <Check className="w-5 h-5" />
                                  <span className="text-sm font-medium">Hotovo</span>
                                </div>
                                {/* Zrušit button */}
                                <button
                                  onClick={() => handleUnmarkComplete(item)}
                                  disabled={markingComplete === item.id}
                                  className="flex items-center justify-center space-x-1 px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Zrušit</span>
                                </button>
                              </div>
                            ) : justAdded ? (
                              <div className="flex items-center space-x-2 text-primary-600 bg-primary-100 px-3 py-2 rounded-lg">
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">Přidáno!</span>
                              </div>
                            ) : (
                              <div className="flex flex-col space-y-2">
                                {/* Hotovo button */}
                                <button
                                  onClick={() => handleMarkComplete(item)}
                                  disabled={markingComplete === item.id}
                                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {markingComplete === item.id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      <span className="text-sm font-medium">Označuji...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4" />
                                      <span className="text-sm font-medium">Hotovo</span>
                                    </>
                                  )}
                                </button>

                                {/* Do úkolů button */}
                                <button
                                  onClick={() => handleAddToTasks(item)}
                                  disabled={isAdding || inTasks}
                                  className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    inTasks
                                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                      : 'bg-primary-600 text-white hover:bg-primary-700'
                                  }`}
                                >
                                  {isAdding ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      <span className="text-sm font-medium">Přidávám...</span>
                                    </>
                                  ) : inTasks ? (
                                    <>
                                      <Check className="w-4 h-4" />
                                      <span className="text-sm font-medium">V úkolech</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4" />
                                      <span className="text-sm font-medium">Do úkolů</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

