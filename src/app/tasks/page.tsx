'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useTask } from '@/hooks/useTask'
import TaskList from '@/components/tasks/TaskList'
import TaskStats from '@/components/tasks/TaskStats'
import TaskForm from '@/components/tasks/TaskForm'
import TaskDebug from '@/components/debug/TaskDebug'

import { TaskFormData, Task } from '@/types/task'
import {
  Plus,
  Download,
  Upload,
  Settings,
  BarChart3,
  List,
  Grid3X3,
  Filter,
  ArrowLeft,
  Home
} from 'lucide-react'
import Link from 'next/link'

export default function TasksPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const {
    initializeTasksFromTemplates,
    tasks,
    loading,
    createTask,
    updateTask,
    error,
    stats,
    toggleTaskStatus,
    deleteTask,
    clearError
  } = useTask()
  // Removed viewMode - using stats view as default (most informative)
  const [showInitializeModal, setShowInitializeModal] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskFormLoading, setTaskFormLoading] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Check if user has any tasks
  const hasTasks = tasks.length > 0

  // Check if this is a demo user
  const isDemoUser = user?.email === 'demo@svatbot.cz' || wedding?.id === 'demo-wedding'

  // Debug logging for tasks state
  console.log('🔍 TasksPage render - user:', user?.id, user?.email)
  console.log('🔍 TasksPage render - wedding:', wedding?.id)
  console.log('🔍 TasksPage render - isDemoUser:', isDemoUser)
  console.log('🔍 TasksPage render - tasks count:', tasks.length)
  console.log('🔍 TasksPage render - tasks:', tasks.map(t => ({ id: t.id, title: t.title })))

  // Handle initialize tasks from templates
  const handleInitializeTasks = async () => {
    try {
      await initializeTasksFromTemplates()
      setShowInitializeModal(false)
    } catch (error) {
      console.error('Error initializing tasks:', error)
    }
  }

  // Handle create task
  const handleCreateTask = async (data: TaskFormData) => {
    try {
      console.log('🚀 Starting task creation:', data.title)
      console.log('🚀 Current tasks before creation:', tasks.length)
      setTaskFormLoading(true)
      const newTask = await createTask(data)
      console.log('✅ Task created successfully:', newTask.title)
      console.log('✅ Tasks count after creation should be:', tasks.length + 1)
      setShowTaskForm(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Error creating task:', error)
      throw error // Re-throw to show error in form
    } finally {
      setTaskFormLoading(false)
    }
  }

  // Handle edit task
  const handleEditTask = async (data: TaskFormData) => {
    if (!editingTask) return

    try {
      console.log('🚀 Starting task update:', data.title)
      setTaskFormLoading(true)
      await updateTask(editingTask.id, {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        dueDate: data.dueDate,
        assignedTo: data.assignedTo,
        notes: data.notes
      })
      console.log('✅ Task updated successfully')
      setShowTaskForm(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    } finally {
      setTaskFormLoading(false)
    }
  }

  // Handle open edit modal
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  // Don't show auth check - let AppTemplate handle transitions smoothly
  if (!user || !wedding) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        {/* Breadcrumb - Hidden on mobile */}
        <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Úkoly</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile header */}
          <div className="sm:hidden space-y-4 py-4">
            {/* Top row - Back button and title */}
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Úkoly</h1>
              </div>
            </div>

            {/* Main action button - prominent placement */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowTaskForm(true)}
                className="btn-primary flex items-center space-x-2 px-6 py-3 text-base font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Nový úkol</span>
              </button>
            </div>

            {/* Stats view indicator */}
            <div className="flex items-center justify-center">
              <div className="flex items-center bg-primary-100 rounded-lg px-3 py-2">
                <BarChart3 className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-700">Statistiky a přehled</span>
              </div>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden sm:flex items-center justify-between h-16">
            {/* Back button and Title */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Zpět na dashboard</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">Úkoly</h1>
                <p className="text-sm text-text-muted">
                  Plánování svatby {wedding.brideName} & {wedding.groomName}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTaskForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nový úkol</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 loading-spinner" />
              <span className="text-text-muted">Načítání úkolů...</span>
            </div>
          </div>
        ) : !hasTasks ? (
          /* Empty state */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
              <List className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Začněte s plánováním úkolů
            </h2>
            <p className="text-text-muted mb-8 max-w-md mx-auto">
              Vytvořte si úkoly pro plánování svatby nebo použijte naše předpřipravené šablony
              podle fází svatebního plánování.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowInitializeModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Použít šablony úkolů</span>
              </button>

              <button
                onClick={() => setShowTaskForm(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Vytvořit vlastní úkol</span>
              </button>
            </div>

            {/* Quick navigation */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Zpět na hlavní obrazovku</span>
              </Link>
            </div>

            {/* Features preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <List className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Organizované úkoly</h3>
                <p className="text-sm text-text-muted">
                  Úkoly rozdělené podle fází svatebního plánování
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Sledování pokroku</h3>
                <p className="text-sm text-text-muted">
                  Přehled o tom, co je hotové a co zbývá udělat
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                  <Filter className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Chytré filtry</h3>
                <p className="text-sm text-text-muted">
                  Filtrování podle priority, termínu nebo kategorie
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Stats view - most informative display */
          <div className="space-y-6">
            <TaskStats
              onCreateTask={() => {
                setEditingTask(null)
                setShowTaskForm(true)
              }}
              onEditTask={handleOpenEditModal}
              tasks={isDemoUser ? tasks : undefined}
              stats={isDemoUser ? stats : undefined}
              loading={isDemoUser ? loading : undefined}
              error={isDemoUser ? error : undefined}
              toggleTaskStatus={isDemoUser ? toggleTaskStatus : undefined}
              deleteTask={isDemoUser ? deleteTask : undefined}
              clearError={isDemoUser ? clearError : undefined}
            />
          </div>
        )}
      </div>

      {/* Initialize tasks modal */}
      {showInitializeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Inicializovat úkoly ze šablon
            </h3>
            <p className="text-text-muted mb-6">
              Vytvoříme vám předpřipravené úkoly podle fází svatebního plánování.
              Termíny budou automaticky vypočítány podle data vaší svatby.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Co se vytvoří:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Základní úkoly (datum, rozpočet, hosté)</li>
                <li>• Rezervace míst (obřad, hostina)</li>
                <li>• Organizace hostů (oznámení, RSVP)</li>
                <li>• Dodavatelé (fotograf, hudba, catering)</li>
                <li>• Finální přípravy</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowInitializeModal(false)}
                className="flex-1 btn-outline"
              >
                Zrušit
              </button>
              <button
                onClick={handleInitializeTasks}
                className="flex-1 btn-primary"
              >
                Vytvořit úkoly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          onCancel={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
          loading={taskFormLoading}
          error={error || undefined}
          initialData={editingTask ? {
            title: editingTask.title,
            description: editingTask.description || '',
            category: editingTask.category,
            priority: editingTask.priority,
            dueDate: editingTask.dueDate,
            assignedTo: editingTask.assignedTo,
            notes: editingTask.notes
          } : undefined}
        />
      )}

      {/* Debug component for development */}
      <TaskDebug />
    </div>
  )
}
