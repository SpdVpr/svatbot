'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  Timestamp,
  deleteField
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import {
  Task,
  TaskFormData,
  TaskFilters,
  TaskStats,
  TaskProgress,
  TaskTemplate,
  CreateTaskFromTemplate,
  BulkTaskOperation
} from '@/types/task'
import { taskTemplates } from '@/data/taskTemplates'

interface UseTaskReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  stats: TaskStats
  createTask: (data: TaskFormData) => Promise<Task>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  toggleTaskStatus: (taskId: string) => Promise<void>
  createFromTemplate: (data: CreateTaskFromTemplate) => Promise<Task>
  bulkOperation: (operation: BulkTaskOperation) => Promise<void>
  getFilteredTasks: (filters: TaskFilters) => Task[]
  getTasksByCategory: (category: string) => Task[]
  initializeTasksFromTemplates: () => Promise<void>
  clearError: () => void
}

export function useTask(): UseTaskReturn {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert Firestore data to Task
  const convertFirestoreTask = (id: string, data: any): Task => {
    return {
      id,
      weddingId: data.weddingId,
      title: data.title,
      description: data.description || '',
      category: data.category,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate?.toDate() || undefined,
      completedAt: data.completedAt?.toDate() || undefined,
      assignedTo: data.assignedTo,
      notes: data.notes || '',
      isTemplate: data.isTemplate || false,
      templateId: data.templateId,
      order: data.order || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    }
  }

  // Convert Task to Firestore data
  const convertToFirestoreData = (task: Omit<Task, 'id'>): any => {
    return {
      weddingId: task.weddingId,
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
      completedAt: task.completedAt ? Timestamp.fromDate(task.completedAt) : null,
      assignedTo: task.assignedTo || null,
      notes: task.notes,
      isTemplate: task.isTemplate,
      templateId: task.templateId || null,
      order: task.order,
      createdAt: Timestamp.fromDate(task.createdAt),
      updatedAt: Timestamp.fromDate(task.updatedAt)
    }
  }

  // Create new task
  const createTask = async (data: TaskFormData): Promise<Task> => {
    if (!wedding) {
      throw new Error('Žádná svatba není vybrána')
    }

    // Check if this is a demo user - use sessionStorage instead of Firestore
    const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding.id === 'demo-wedding'

    try {
      setError(null)
      setLoading(true)

      const taskData: Omit<Task, 'id'> = {
        weddingId: wedding.id,
        title: data.title,
        description: data.description,
        category: data.category,
        status: 'pending',
        priority: data.priority,
        dueDate: data.dueDate,
        assignedTo: data.assignedTo,
        notes: data.notes,
        isTemplate: false,
        order: tasks.filter(t => t.category === data.category).length,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (isDemoUser) {
        console.log('🎭 Demo user detected - using sessionStorage for task creation')

        // Create task with local ID for demo user
        const localId = `demo-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newTask: Task = { id: localId, ...taskData }

        // Save to sessionStorage for demo user
        const sessionKey = `demo_tasks_${wedding.id}`
        const savedTasks = sessionStorage.getItem(sessionKey) || '[]'
        const existingTasks = JSON.parse(savedTasks)
        existingTasks.push(newTask)
        sessionStorage.setItem(sessionKey, JSON.stringify(existingTasks))

        console.log('✅ Demo task created in sessionStorage:', newTask)

        // Update local state immediately
        setTasks(prev => {
          const updated = [...prev, newTask]
          console.log('📝 Updated demo tasks state:', updated.length, updated)
          console.log('📝 Previous tasks:', prev.length, prev.map(t => t.title))
          console.log('📝 New task added:', newTask.title)
          console.log('📝 Updated tasks:', updated.map(t => t.title))
          return updated
        })

        return newTask
      }

      try {
        // Try to save to Firestore for real users
        const docRef = await addDoc(collection(db, 'tasks'), convertToFirestoreData(taskData))
        const newTask: Task = { id: docRef.id, ...taskData }

        console.log('✅ Task created in Firestore:', newTask)

        // Don't update state here - let Firestore listener handle it
        // This ensures consistency with the database

        return newTask
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, using localStorage fallback')
        // Create task with local ID
        const localId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newTask: Task = { id: localId, ...taskData }

        // Save to localStorage as fallback
        const savedTasks = localStorage.getItem(`tasks_${wedding.id}`) || '[]'
        const existingTasks = JSON.parse(savedTasks)
        existingTasks.push(newTask)
        localStorage.setItem(`tasks_${wedding.id}`, JSON.stringify(existingTasks))
        console.log('💾 Task saved to localStorage (fallback)')

        // Update local state immediately for localStorage fallback
        setTasks(prev => {
          const updated = [...prev, newTask]
          console.log('📝 Updated local tasks state (localStorage):', updated.length, updated)
          return updated
        })

        return newTask
      }
    } catch (error: any) {
      console.error('Error creating task:', error)
      setError('Chyba při vytváření úkolu')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update task
  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
    if (!wedding) return

    // Check if this is a demo user - use sessionStorage instead of Firestore
    const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding.id === 'demo-wedding'

    try {
      setError(null)

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      if (isDemoUser) {
        console.log('🎭 Demo user detected - updating task in sessionStorage:', taskId, updatedData)

        // Update in sessionStorage for demo user
        const sessionKey = `demo_tasks_${wedding.id}`
        const savedTasks = sessionStorage.getItem(sessionKey) || '[]'
        const existingTasks = JSON.parse(savedTasks)
        const taskIndex = existingTasks.findIndex((t: Task) => t.id === taskId)
        if (taskIndex !== -1) {
          existingTasks[taskIndex] = { ...existingTasks[taskIndex], ...updatedData }
          sessionStorage.setItem(sessionKey, JSON.stringify(existingTasks))
          console.log('✅ Demo task updated in sessionStorage')
        }
      } else {
        try {
          // Try to update in Firestore for real users
          const taskRef = doc(db, 'tasks', taskId)

          // Prepare Firestore update data
          const firestoreUpdates: any = {}

          // Handle each field properly
          if (updates.status !== undefined) firestoreUpdates.status = updates.status
          if (updates.title !== undefined) firestoreUpdates.title = updates.title
          if (updates.description !== undefined) firestoreUpdates.description = updates.description
          if (updates.category !== undefined) firestoreUpdates.category = updates.category
          if (updates.priority !== undefined) firestoreUpdates.priority = updates.priority
          if (updates.assignedTo !== undefined) firestoreUpdates.assignedTo = updates.assignedTo
          if (updates.notes !== undefined) firestoreUpdates.notes = updates.notes
          if (updates.isTemplate !== undefined) firestoreUpdates.isTemplate = updates.isTemplate
          if (updates.templateId !== undefined) firestoreUpdates.templateId = updates.templateId
          if (updates.order !== undefined) firestoreUpdates.order = updates.order

          // Handle dates - convert to Timestamp or delete field
          if (updates.dueDate !== undefined) {
            firestoreUpdates.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null
          }

          // Handle completedAt - if undefined, delete the field
          if ('completedAt' in updates) {
            if (updates.completedAt === undefined || updates.completedAt === null) {
              firestoreUpdates.completedAt = deleteField()
            } else {
              firestoreUpdates.completedAt = Timestamp.fromDate(updates.completedAt)
            }
          }

          // Always update updatedAt
          firestoreUpdates.updatedAt = Timestamp.fromDate(new Date())

          await updateDoc(taskRef, firestoreUpdates)
          console.log('✅ Task updated in Firestore:', taskId, firestoreUpdates)
          // Don't update state here - let Firestore listener handle it
          return
        } catch (firestoreError) {
          console.warn('⚠️ Firestore not available, updating localStorage fallback', firestoreError)
          if (wedding) {
            const savedTasks = localStorage.getItem(`tasks_${wedding.id}`) || '[]'
            const existingTasks = JSON.parse(savedTasks)
            const taskIndex = existingTasks.findIndex((t: Task) => t.id === taskId)
            if (taskIndex !== -1) {
              existingTasks[taskIndex] = { ...existingTasks[taskIndex], ...updatedData }
              localStorage.setItem(`tasks_${wedding.id}`, JSON.stringify(existingTasks))
              console.log('💾 Task updated in localStorage (fallback)')
            }
          }
          // Update local state only for localStorage fallback
          setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, ...updatedData } : task
          ))
        }
      }

      // Update local state for demo users
      if (isDemoUser) {
        setTasks(prev => prev.map(task =>
          task.id === taskId ? { ...task, ...updatedData } : task
        ))
      }
    } catch (error: any) {
      console.error('Error updating task:', error)
      setError('Chyba při aktualizaci úkolu')
      throw error
    }
  }

  // Delete task
  const deleteTask = async (taskId: string): Promise<void> => {
    if (!wedding) return

    // Check if this is a demo user - use sessionStorage instead of Firestore
    const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding.id === 'demo-wedding'

    try {
      setError(null)

      if (isDemoUser) {
        console.log('🎭 Demo user detected - deleting task from sessionStorage:', taskId)

        // Delete from sessionStorage for demo user
        const sessionKey = `demo_tasks_${wedding.id}`
        const savedTasks = sessionStorage.getItem(sessionKey) || '[]'
        const existingTasks = JSON.parse(savedTasks)
        const filteredTasks = existingTasks.filter((t: Task) => t.id !== taskId)
        sessionStorage.setItem(sessionKey, JSON.stringify(filteredTasks))
        console.log('✅ Demo task deleted from sessionStorage')
      } else {
        try {
          // Try to delete from Firestore for real users
          await deleteDoc(doc(db, 'tasks', taskId))
          console.log('✅ Task deleted from Firestore:', taskId)
          // Don't update state here - let Firestore listener handle it
          return
        } catch (firestoreError) {
          console.warn('⚠️ Firestore not available, deleting from localStorage fallback')
          const savedTasks = localStorage.getItem(`tasks_${wedding.id}`) || '[]'
          const existingTasks = JSON.parse(savedTasks)
          const filteredTasks = existingTasks.filter((t: Task) => t.id !== taskId)
          localStorage.setItem(`tasks_${wedding.id}`, JSON.stringify(filteredTasks))
          console.log('💾 Task deleted from localStorage (fallback)')
          // Update local state only for localStorage fallback
          setTasks(prev => prev.filter(task => task.id !== taskId))
        }
      }

      // Update local state for demo users
      if (isDemoUser) {
        setTasks(prev => prev.filter(task => task.id !== taskId))
      }
    } catch (error: any) {
      console.error('Error deleting task:', error)
      setError('Chyba při mazání úkolu')
      throw error
    }
  }

  // Toggle task status (pending <-> completed)
  const toggleTaskStatus = async (taskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const updates: Partial<Task> = {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : undefined
    }

    await updateTask(taskId, updates)
  }

  // Create task from template
  const createFromTemplate = async (data: CreateTaskFromTemplate): Promise<Task> => {
    const template = taskTemplates.find(t => t.id === data.templateId)
    if (!template) {
      throw new Error('Template not found')
    }

    const taskData: TaskFormData = {
      title: data.customTitle || template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      dueDate: data.customDueDate,
      assignedTo: data.assignedTo,
      notes: data.notes || template.tips?.join('\n')
    }

    const task = await createTask(taskData)

    // Update with template reference
    await updateTask(task.id, {
      templateId: template.id,
      isTemplate: false
    })

    return task
  }

  // Bulk operations
  const bulkOperation = async (operation: BulkTaskOperation): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      for (const taskId of operation.taskIds) {
        switch (operation.operation) {
          case 'complete':
            await toggleTaskStatus(taskId)
            break
          case 'delete':
            await deleteTask(taskId)
            break
          case 'update-status':
          case 'update-category':
          case 'update-priority':
            if (operation.data) {
              await updateTask(taskId, operation.data)
            }
            break
        }
      }
    } catch (error: any) {
      console.error('Error in bulk operation:', error)
      setError('Chyba při hromadné operaci')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Filter tasks
  const getFilteredTasks = (filters: TaskFilters): Task[] => {
    return tasks.filter(task => {
      if (filters.status && !filters.status.includes(task.status)) return false
      if (filters.category && !filters.category.includes(task.category)) return false
      if (filters.priority && !filters.priority.includes(task.priority)) return false
      if (filters.assignedTo && task.assignedTo !== filters.assignedTo) return false
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.dueDateFrom && task.dueDate && task.dueDate < filters.dueDateFrom) return false
      if (filters.dueDateTo && task.dueDate && task.dueDate > filters.dueDateTo) return false
      return true
    })
  }

  // Get tasks by category
  const getTasksByCategory = (category: string): Task[] => {
    return tasks.filter(task => task.category === category)
      .sort((a, b) => a.order - b.order)
  }

  // Initialize tasks from templates
  const initializeTasksFromTemplates = async (): Promise<void> => {
    if (!wedding) return

    try {
      setLoading(true)

      // Get wedding date to calculate due dates
      const weddingDate = wedding.weddingDate
      if (!weddingDate) return

      // Create tasks from required templates
      const requiredTemplates = taskTemplates.filter(t => t.isRequired)

      for (const template of requiredTemplates) {
        // Calculate due date
        const dueDate = new Date(weddingDate)
        dueDate.setDate(dueDate.getDate() - (template.recommendedWeeksBefore * 7))

        await createFromTemplate({
          templateId: template.id,
          weddingId: wedding.id,
          customDueDate: dueDate
        })
      }
    } catch (error: any) {
      console.error('Error initializing tasks:', error)
      setError('Chyba při vytváření úkolů ze šablon')
    } finally {
      setLoading(false)
    }
  }

  // Calculate task statistics
  const stats: TaskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t =>
      t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
    ).length,
    upcoming: tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return t.dueDate >= now && t.dueDate <= weekFromNow
    }).length,
    completionRate: tasks.length > 0 ?
      Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
    progressByCategory: [] // Will be calculated separately
  }

  // Load tasks when wedding changes
  useEffect(() => {
    if (!wedding?.id) {
      setTasks([])
      return
    }

    let unsubscribe: (() => void) | null = null

    const loadTasks = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if this is a demo user
        const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding.id === 'demo-wedding'

        // Only log once per wedding change
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Loading tasks for wedding:', wedding.id, 'isDemoUser:', isDemoUser)
        }

        if (isDemoUser) {
          // Try to load existing demo tasks from sessionStorage first
          const sessionKey = `demo_tasks_${wedding.id}`
          const savedDemoTasks = sessionStorage.getItem(sessionKey)

          if (savedDemoTasks) {
            const parsedTasks = JSON.parse(savedDemoTasks).map((task: any) => ({
              ...task,
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt)
            }))
            setTasks(parsedTasks)
            return
          }

          // If no session data exists, create fresh demo tasks
          const demoTasks: Task[] = [
            {
              id: 'demo-task-1',
              weddingId: wedding.id,
              title: 'Rezervovat místo konání',
              description: 'Najít a rezervovat místo pro svatební obřad a hostinu',
              category: 'venue',
              priority: 'high',
              status: 'completed',
              dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
              completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
              isTemplate: false,
              order: 1,
              createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
            },
            {
              id: 'demo-task-2',
              weddingId: wedding.id,
              title: 'Objednat svatební fotografa',
              description: 'Najít a objednat profesionálního svatebního fotografa',
              category: 'organization',
              priority: 'high',
              status: 'in-progress',
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
              isTemplate: false,
              order: 1,
              createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            },
            {
              id: 'demo-task-3',
              weddingId: wedding.id,
              title: 'Vybrat svatební šaty',
              description: 'Najít a objednat svatební šaty včetně úprav',
              category: 'design',
              priority: 'medium',
              status: 'pending',
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              isTemplate: false,
              order: 1,
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            },
            {
              id: 'demo-task-4',
              weddingId: wedding.id,
              title: 'Rezervovat hudbu/DJ',
              description: 'Zajistit hudební doprovod pro obřad a hostinu',
              category: 'organization',
              priority: 'high',
              status: 'pending',
              dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
              isTemplate: false,
              order: 1,
              createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
            },
            {
              id: 'demo-task-5',
              weddingId: wedding.id,
              title: 'Objednat svatební dort',
              description: 'Vybrat a objednat svatební dort podle počtu hostů',
              category: 'budget',
              priority: 'medium',
              status: 'completed',
              dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
              completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
              isTemplate: false,
              order: 1,
              createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
            }
          ]

          // Save fresh demo tasks to sessionStorage
          sessionStorage.setItem(sessionKey, JSON.stringify(demoTasks))
          setTasks(demoTasks)
          return
        }

        try {
          // Try to load from Firestore first for normal users
          const tasksQuery = query(
            collection(db, 'tasks'),
            where('weddingId', '==', wedding.id)
          )

          unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
            const loadedTasks = snapshot.docs.map(doc =>
              convertFirestoreTask(doc.id, doc.data())
            )
            if (process.env.NODE_ENV === 'development') {
              console.log('📝 Loaded tasks from Firestore:', loadedTasks.length)
            }
            setTasks(loadedTasks)

            // Clear localStorage when Firestore loads successfully
            localStorage.removeItem(`tasks_${wedding.id}`)
          }, (error) => {
            console.warn('Firestore snapshot error, using localStorage fallback:', error)
            // Load from localStorage fallback
            const savedTasks = localStorage.getItem(`tasks_${wedding.id}`)
            if (savedTasks) {
              const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
                ...task,
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt)
              }))
              console.log('📦 Loaded tasks from localStorage (error fallback):', parsedTasks.length, parsedTasks)
              setTasks(parsedTasks)
            } else {
              console.log('📦 No tasks in localStorage for wedding:', wedding.id)
              setTasks([])
            }
          })

          return unsubscribe
        } catch (firestoreError) {
          console.warn('⚠️ Firestore not available, loading from localStorage')
          const savedTasks = localStorage.getItem(`tasks_${wedding.id}`)
          if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
              ...task,
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt)
            }))
            console.log('📦 Loaded tasks from localStorage (catch):', parsedTasks.length, parsedTasks)
            setTasks(parsedTasks)
          } else {
            console.log('📦 No tasks in localStorage (catch) for wedding:', wedding.id)
            setTasks([])
          }
        }
      } catch (error: any) {
        console.error('Error loading tasks:', error)
        setError('Chyba při načítání úkolů')
      } finally {
        setLoading(false)
      }
    }

    loadTasks()

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [wedding?.id]) // Only depend on wedding.id, not user changes

  // Clear error
  const clearError = () => setError(null)

  return {
    tasks,
    loading,
    error,
    stats,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    createFromTemplate,
    bulkOperation,
    getFilteredTasks,
    getTasksByCategory,
    initializeTasksFromTemplates,
    clearError
  }
}
