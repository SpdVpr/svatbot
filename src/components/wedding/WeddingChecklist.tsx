'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { WEDDING_CHECKLIST, ChecklistItem, ChecklistPhase } from '@/data/weddingChecklistTemplates'
import { useTask } from '@/hooks/useTask'
import { useWedding } from '@/hooks/useWedding'
import { useAuth } from '@/hooks/useAuth'
import { useDemoLock } from '@/hooks/useDemoLock'
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
  const { createTask, tasks, updateTask, deleteTask } = useTask()
  const { wedding } = useWedding()
  const { user } = useAuth()
  const { withDemoCheck } = useDemoLock()
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]) // Žádná kategorie není automaticky otevřená
  const [addingToTasks, setAddingToTasks] = useState<string | null>(null)
  const [markingComplete, setMarkingComplete] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState<string | null>(null)
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [itemPhaseMap, setItemPhaseMap] = useState<Record<string, string>>({})

  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverPhase, setDragOverPhase] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null)
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const touchMoveDistanceRef = useRef(0)

  // Check if user is demo user
  const isDemoUser = user?.email === 'demo@svatbot.cz'

  // Load completed and hidden items from storage on mount
  useEffect(() => {
    const loadChecklistData = async () => {
      try {
        if (!wedding) {
          setIsLoading(false)
          return
        }

        if (isDemoUser) {
          // Load from sessionStorage for demo user
          const completedKey = `checklist_completed_${wedding.id}`
          const hiddenKey = `checklist_hidden_${wedding.id}`
          const phaseMapKey = `checklist_phasemap_${wedding.id}`

          const storedCompleted = sessionStorage.getItem(completedKey)
          if (storedCompleted) {
            const itemIds = JSON.parse(storedCompleted) as string[]
            setCompletedItems(new Set(itemIds))
          }

          const storedHidden = sessionStorage.getItem(hiddenKey)
          if (storedHidden) {
            const itemIds = JSON.parse(storedHidden) as string[]
            setHiddenItems(new Set(itemIds))
          }

          const storedPhaseMap = sessionStorage.getItem(phaseMapKey)
          if (storedPhaseMap) {
            setItemPhaseMap(JSON.parse(storedPhaseMap))
          }
        } else if (user) {
          // Load from Firestore for real user
          const checklistRef = doc(db, 'checklist_completed', wedding.id)
          const checklistDoc = await getDoc(checklistRef)

          if (checklistDoc.exists()) {
            const data = checklistDoc.data()
            const completedIds = data.completedItems || []
            const hiddenIds = data.hiddenItems || []
            const phaseMap = data.itemPhaseMap || {}
            setCompletedItems(new Set(completedIds))
            setHiddenItems(new Set(hiddenIds))
            setItemPhaseMap(phaseMap)
          }
        }
      } catch (error) {
        console.error('Error loading checklist data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChecklistData()
  }, [wedding, user, isDemoUser])

  // Save completed and hidden items to storage
  const saveChecklistData = async (completed: Set<string>, hidden: Set<string>, phaseMap?: Record<string, string>) => {
    try {
      if (!wedding) return

      const completedArray = Array.from(completed)
      const hiddenArray = Array.from(hidden)
      const phaseMapToSave = phaseMap !== undefined ? phaseMap : itemPhaseMap

      if (isDemoUser) {
        // Save to sessionStorage for demo user
        const completedKey = `checklist_completed_${wedding.id}`
        const hiddenKey = `checklist_hidden_${wedding.id}`
        const phaseMapKey = `checklist_phasemap_${wedding.id}`
        sessionStorage.setItem(completedKey, JSON.stringify(completedArray))
        sessionStorage.setItem(hiddenKey, JSON.stringify(hiddenArray))
        sessionStorage.setItem(phaseMapKey, JSON.stringify(phaseMapToSave))
      } else if (user) {
        // Save to Firestore for real user
        const checklistRef = doc(db, 'checklist_completed', wedding.id)
        await setDoc(checklistRef, {
          weddingId: wedding.id,
          userId: user.id,
          completedItems: completedArray,
          hiddenItems: hiddenArray,
          itemPhaseMap: phaseMapToSave,
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

  // Check if item is completed - check task status if item is in tasks, otherwise check local state
  const isItemCompleted = useCallback((item: ChecklistItem): boolean => {
    // First check if this item has a corresponding task
    const correspondingTask = tasks.find(task =>
      task.checklistItemId === item.id ||
      task.title.toLowerCase() === item.title.toLowerCase()
    )

    // If task exists, use its completion status
    if (correspondingTask) {
      return correspondingTask.status === 'completed'
    }

    // Otherwise, check local checklist completion state
    return completedItems.has(item.id)
  }, [completedItems, tasks])

  // Check if item is hidden
  const isItemHidden = useCallback((item: ChecklistItem): boolean => {
    return hiddenItems.has(item.id)
  }, [hiddenItems])

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

      // All checklist items go to "Bez kategorie" (uncategorized)
      const taskData: TaskFormData = {
        title: item.title,
        description: '',
        category: 'uncategorized',
        priority: undefined,
        dueDate: undefined,
        notes: item.tips?.join('\n') || '',
        checklistItemId: item.id // Link task to checklist item
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

  // Remove checklist item from tasks
  const handleRemoveFromTasks = async (item: ChecklistItem) => {
    const taskInList = tasks.find(
      task =>
        task.title.toLowerCase() === item.title.toLowerCase() ||
        task.description?.toLowerCase().includes(item.title.toLowerCase())
    )

    if (!taskInList) {
      alert('Úkol nebyl nalezen v seznamu úkolů')
      return
    }

    try {
      setAddingToTasks(item.id) // Reuse the same loading state
      await deleteTask(taskInList.id)
    } catch (error) {
      console.error('Error removing from tasks:', error)
      alert('Chyba při odstraňování úkolu')
    } finally {
      setAddingToTasks(null)
    }
  }

  // Hide item
  const handleHideItem = async (item: ChecklistItem) => {
    return withDemoCheck(async () => {
      try {
        const newHiddenItems = new Set(hiddenItems).add(item.id)
        setHiddenItems(newHiddenItems)
        await saveChecklistData(completedItems, newHiddenItems)
      } catch (error) {
        console.error('Error hiding item:', error)
      }
    })
  }

  // Unhide item
  const handleUnhideItem = async (item: ChecklistItem) => {
    return withDemoCheck(async () => {
      try {
        const newHiddenItems = new Set(hiddenItems)
        newHiddenItems.delete(item.id)
        setHiddenItems(newHiddenItems)
        await saveChecklistData(completedItems, newHiddenItems)
      } catch (error) {
        console.error('Error unhiding item:', error)
      }
    })
  }

  // Mark item as complete
  const handleMarkComplete = async (item: ChecklistItem) => {
    return withDemoCheck(async () => {
      try {
        setMarkingComplete(item.id)

        // Check if this item has a corresponding task
        const correspondingTask = tasks.find(task =>
          task.checklistItemId === item.id ||
          task.title.toLowerCase() === item.title.toLowerCase()
        )

        if (correspondingTask && correspondingTask.status !== 'completed') {
          // If task exists and is not completed, mark it as completed
          await updateTask(correspondingTask.id, {
            status: 'completed',
            completedAt: new Date()
          })
        } else {
          // If no task exists, update local checklist state
          const newCompletedItems = new Set(completedItems).add(item.id)
          setCompletedItems(newCompletedItems)
          await saveChecklistData(newCompletedItems, hiddenItems)
        }

        // Show success message
        setShowSuccess(item.id)
        setTimeout(() => setShowSuccess(null), 2000)
      } catch (error) {
        console.error('Error marking complete:', error)
        alert('Chyba při označování jako hotovo')
        // Revert local state on error if we updated it
        const correspondingTask = tasks.find(task =>
          task.checklistItemId === item.id ||
          task.title.toLowerCase() === item.title.toLowerCase()
        )
        if (!correspondingTask) {
          setCompletedItems(prev => {
            const newSet = new Set(prev)
            newSet.delete(item.id)
            return newSet
          })
        }
      } finally {
        setMarkingComplete(null)
      }
    })
  }

  // Unmark item as complete
  const handleUnmarkComplete = async (item: ChecklistItem) => {
    return withDemoCheck(async () => {
      try {
        setMarkingComplete(item.id)

        // Check if this item has a corresponding task
        const correspondingTask = tasks.find(task =>
          task.checklistItemId === item.id ||
          task.title.toLowerCase() === item.title.toLowerCase()
        )

        if (correspondingTask && correspondingTask.status === 'completed') {
          // If task exists and is completed, mark it as pending
          await updateTask(correspondingTask.id, {
            status: 'pending',
            completedAt: undefined
          })
        } else {
          // If no task exists, update local checklist state
          const newCompletedItems = new Set(completedItems)
          newCompletedItems.delete(item.id)
          setCompletedItems(newCompletedItems)
          await saveChecklistData(newCompletedItems, hiddenItems)
        }
      } catch (error) {
        console.error('Error unmarking complete:', error)
        alert('Chyba při rušení dokončení')
        // Revert local state on error if we updated it
        const correspondingTask = tasks.find(task =>
          task.checklistItemId === item.id ||
          task.title.toLowerCase() === item.title.toLowerCase()
        )
        if (!correspondingTask) {
          setCompletedItems(prev => new Set(prev).add(item.id))
        }
      } finally {
        setMarkingComplete(null)
      }
    })
  }

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string, phaseId: string) => {
    setDraggedItem(itemId)
    setIsDragging(true)
    setDragOverPhase(null)

    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', `${itemId}|${phaseId}`)

    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    dragTimeoutRef.current = setTimeout(() => {
      setDraggedItem(null)
      setDragOverPhase(null)
      setIsDragging(false)
    }, 50)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, phaseId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedItem || !isDragging) {
      return
    }

    e.dataTransfer.dropEffect = 'move'

    if (dragOverPhase !== phaseId) {
      setDragOverPhase(phaseId)
    }
  }, [draggedItem, isDragging, dragOverPhase])

  const handleDrop = useCallback(async (e: React.DragEvent, targetPhaseId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedItem || !isDragging) {
      return
    }

    const data = e.dataTransfer.getData('text/plain')
    const [itemId, sourcePhaseId] = data.split('|')

    if (sourcePhaseId === targetPhaseId) {
      setDraggedItem(null)
      setDragOverPhase(null)
      setIsDragging(false)
      return
    }

    const sourcePhase = WEDDING_CHECKLIST.find(p => p.id === sourcePhaseId)
    const item = sourcePhase?.items.find(i => i.id === itemId)

    if (!item) {
      setDraggedItem(null)
      setDragOverPhase(null)
      setIsDragging(false)
      return
    }

    try {
      await withDemoCheck(async () => {
        const newPhaseMap = { ...itemPhaseMap, [itemId]: targetPhaseId }
        setItemPhaseMap(newPhaseMap)
        await saveChecklistData(completedItems, hiddenItems, newPhaseMap)

        setShowSuccess(itemId)
        setTimeout(() => setShowSuccess(null), 2000)
      })
    } catch (error) {
      console.error('Error moving item:', error)
    } finally {
      setDraggedItem(null)
      setDragOverPhase(null)
      setIsDragging(false)

      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
    }
  }, [draggedItem, isDragging, itemPhaseMap, completedItems, hiddenItems, withDemoCheck])

  // Touch handlers for mobile with long press detection
  const handleTouchStart = useCallback((e: React.TouchEvent, itemId: string, phaseId: string) => {
    const touch = e.touches[0]
    setTouchStartY(touch.clientY)
    setTouchCurrentY(touch.clientY)
    touchMoveDistanceRef.current = 0

    longPressTimerRef.current = setTimeout(() => {
      if (touchMoveDistanceRef.current < 10) {
        setDraggedItem(itemId)
        setIsDragging(true)

        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }

        const element = e.currentTarget as HTMLElement
        element.classList.add('haptic-feedback')
        setTimeout(() => {
          element.classList.remove('haptic-feedback')
        }, 100)
      }
    }, 500)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]

    if (touchStartY) {
      touchMoveDistanceRef.current = Math.abs(touch.clientY - touchStartY)
    }

    if (touchMoveDistanceRef.current > 10 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
      return
    }

    if (!draggedItem || !touchStartY || !isDragging) return

    e.preventDefault()
    setTouchCurrentY(touch.clientY)

    const elements = document.querySelectorAll('[data-phase-id]')
    let newDragOverPhase = null

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        newDragOverPhase = element.getAttribute('data-phase-id')
      }
    })

    if (newDragOverPhase !== null && newDragOverPhase !== dragOverPhase) {
      setDragOverPhase(newDragOverPhase)
    }
  }, [draggedItem, touchStartY, dragOverPhase, isDragging])

  const handleTouchEnd = useCallback(async (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    if (!draggedItem) {
      setDraggedItem(null)
      setIsDragging(false)
      setDragOverPhase(null)
      setTouchStartY(null)
      setTouchCurrentY(null)
      return
    }

    if (isDragging && dragOverPhase) {
      const currentPhase = itemPhaseMap[draggedItem] || WEDDING_CHECKLIST.find(phase => 
        phase.items.some(item => item.id === draggedItem)
      )?.id

      if (currentPhase !== dragOverPhase) {
        try {
          await withDemoCheck(async () => {
            const newPhaseMap = { ...itemPhaseMap, [draggedItem]: dragOverPhase }
            setItemPhaseMap(newPhaseMap)
            await saveChecklistData(completedItems, hiddenItems, newPhaseMap)

            if ('vibrate' in navigator) {
              navigator.vibrate([50, 50, 50])
            }

            setShowSuccess(draggedItem)
            setTimeout(() => setShowSuccess(null), 2000)
          })
        } catch (error) {
          console.error('Error moving item:', error)
        }
      }
    }

    setDraggedItem(null)
    setDragOverPhase(null)
    setIsDragging(false)
    setTouchStartY(null)
    setTouchCurrentY(null)
  }, [draggedItem, isDragging, dragOverPhase, itemPhaseMap, completedItems, hiddenItems, withDemoCheck])

  // Get organized checklist with items moved to custom phases
  const organizedChecklist = useMemo((): ChecklistPhase[] => {
    const organized = WEDDING_CHECKLIST.map(phase => ({
      ...phase,
      items: [] as ChecklistItem[]
    }))

    WEDDING_CHECKLIST.forEach(originalPhase => {
      originalPhase.items.forEach(item => {
        const targetPhaseId = itemPhaseMap[item.id] || originalPhase.id
        const targetPhase = organized.find(p => p.id === targetPhaseId)
        if (targetPhase) {
          targetPhase.items.push(item)
        }
      })
    })

    return organized
  }, [itemPhaseMap])

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
    const totalItems = organizedChecklist.reduce((sum, phase) => sum + phase.items.length, 0)
    const completedCount = organizedChecklist.reduce((sum, phase) =>
      sum + phase.items.filter(item => isItemCompleted(item)).length, 0
    )
    const overallPercentage = Math.round((completedCount / totalItems) * 100)

    // Compact view for dashboard module - show categories with statistics
    return (
      <div className="space-y-4">
        {/* Overall statistics */}
        <div className="p-3 rounded-lg glass-morphism bg-primary-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {completedCount} / {totalItems}
            </div>
            <div className="text-sm text-primary-700">Celkový pokrok</div>
          </div>
        </div>

        {/* Phase categories with statistics */}
        <div className="space-y-2.5">
          {organizedChecklist.map((phase) => {
            const itemsCompleted = phase.items.filter(item => isItemCompleted(item)).length
            const totalPhaseItems = phase.items.length
            const phasePercentage = Math.round((itemsCompleted / totalPhaseItems) * 100)

            return (
              <div
                key={phase.id}
                className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{phase.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {phase.title}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {itemsCompleted}/{totalPhaseItems}
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
  const totalItems = organizedChecklist.reduce((sum, phase) => sum + phase.items.length, 0)
  const completedCount = organizedChecklist.reduce((sum, phase) =>
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
    <div className={`space-y-6 ${isDragging ? 'dragging-active' : ''}`}>
      {/* Header info */}
      <div className="p-4 rounded-lg border" style={{ background: `linear-gradient(to right, var(--color-primary-50), var(--color-primary-100))`, borderColor: 'var(--color-primary-200)' }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Předpřipravené úkoly pro vaši svatbu. Úkoly můžete přesouvat mezi kategoriemi, označit jako hotové nebo přidat do modulu Úkoly.
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-bold text-green-600">
              {completedCount} / {totalItems}
            </div>
            <div className="text-xs text-gray-600">
              {overallPercentage}% dokončeno
            </div>
          </div>
        </div>
      </div>

      {/* Checklist phases */}
      <div className="space-y-4">
        {organizedChecklist.map((phase) => {
          const isExpanded = expandedPhases.includes(phase.id)
          const itemsCompleted = phase.items.filter(item => isItemCompleted(item)).length
          const itemsInTasks = phase.items.filter(item => isItemInTasks(item)).length
          const totalItems = phase.items.length
          const completionPercentage = Math.round((itemsCompleted / totalItems) * 100)

          const isDragOverPhase = dragOverPhase === phase.id

          return (
            <div
              key={phase.id}
              data-phase-id={phase.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                isDragOverPhase
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200'
              }`}
              onDragOver={(e) => handleDragOver(e, phase.id)}
              onDrop={(e) => handleDrop(e, phase.id)}
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
                  {phase.items.filter(item => !isItemHidden(item)).map((item) => {
                    const inTasks = isItemInTasks(item)
                    const isCompleted = isItemCompleted(item)
                    const isAdding = addingToTasks === item.id
                    const justAdded = showSuccess === item.id
                    const isDraggedItem = draggedItem === item.id

                    return (
                      <div
                        key={item.id}
                        className={`p-3 sm:p-4 rounded-lg border transition-all touch-drag-item cursor-move select-none ${
                          isDraggedItem
                            ? 'dragging'
                            : isCompleted
                            ? 'bg-green-50 border-green-200'
                            : inTasks
                            ? 'bg-blue-50 border-blue-200'
                            : justAdded
                            ? 'bg-primary-50 border-primary-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, item.id, phase.id)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, item.id, phase.id)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        {/* Mobile: Stack layout, Desktop: Horizontal */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                          {/* Icon and Title */}
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <span className="text-xl sm:text-2xl flex-shrink-0">{item.icon}</span>
                            <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">{item.title}</h4>
                          </div>

                          {/* Action buttons - Stack on mobile, side by side on desktop */}
                          <div className="flex-shrink-0 w-full sm:w-auto">
                            {isItemCompleted(item) ? (
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                {/* Hotovo badge */}
                                <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-100 px-3 py-2 rounded-lg">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span className="text-xs sm:text-sm font-medium">Hotovo</span>
                                </div>
                                {/* Zrušit button */}
                                <button
                                  onClick={() => handleUnmarkComplete(item)}
                                  disabled={markingComplete === item.id}
                                  className="flex items-center justify-center space-x-1 px-3 py-2 text-xs sm:text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>Zrušit</span>
                                </button>
                              </div>
                            ) : justAdded ? (
                              <div className="flex items-center justify-center space-x-2 text-primary-600 bg-primary-100 px-3 py-2 rounded-lg">
                                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm font-medium">Přidáno!</span>
                              </div>
                            ) : inTasks ? (
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                {/* V úkolech badge */}
                                <div className="flex items-center justify-center space-x-2 text-primary-600 bg-primary-100 px-3 py-2 rounded-lg">
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span className="text-xs sm:text-sm font-medium">V úkolech</span>
                                </div>
                                {/* Vrátit zpět button */}
                                <button
                                  onClick={() => handleRemoveFromTasks(item)}
                                  disabled={isAdding}
                                  className="flex items-center justify-center space-x-1 px-3 py-2 text-xs sm:text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isAdding ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                                      <span>Odstraňuji...</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3" />
                                      <span>Vrátit zpět</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                {/* Hotovo button */}
                                <button
                                  onClick={() => handleMarkComplete(item)}
                                  disabled={markingComplete === item.id}
                                  className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {markingComplete === item.id ? (
                                    <>
                                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      <span className="text-xs sm:text-sm font-medium">Označuji...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span className="text-xs sm:text-sm font-medium">Hotovo</span>
                                    </>
                                  )}
                                </button>

                                {/* Do úkolů button */}
                                <button
                                  onClick={() => handleAddToTasks(item)}
                                  disabled={isAdding}
                                  className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isAdding ? (
                                    <>
                                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      <span className="text-xs sm:text-sm font-medium">Přidávám...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                      <span className="text-xs sm:text-sm font-medium">Do úkolů</span>
                                    </>
                                  )}
                                </button>

                                {/* Skrýt button */}
                                <button
                                  onClick={() => handleHideItem(item)}
                                  className="flex items-center justify-center space-x-1 px-3 py-2 text-xs sm:text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                  title="Skrýt tento úkol"
                                >
                                  <X className="w-4 h-4" />
                                  <span>Skrýt</span>
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

      {/* Hidden items section */}
      {hiddenItems.size > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Skryté úkoly ({hiddenItems.size})
          </h3>
          <div className="space-y-2">
            {organizedChecklist.flatMap(phase =>
              phase.items.filter(item => isItemHidden(item))
            ).map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-gray-700">{item.title}</span>
                </div>
                <button
                  onClick={() => handleUnhideItem(item)}
                  className="flex items-center space-x-1 px-3 py-1 text-xs text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Zobrazit</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

