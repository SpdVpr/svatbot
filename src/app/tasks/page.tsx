'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useTask } from '@/hooks/useTask'
import TaskList from '@/components/tasks/TaskList'
import TaskStats from '@/components/tasks/TaskStats'
import TaskForm from '@/components/tasks/TaskForm'
import ModuleHeader from '@/components/common/ModuleHeader'
import Link from 'next/link'
import logger from '@/lib/logger'
import { TaskFormData, Task } from '@/types/task'
import {
  Plus,
  CheckSquare,
  List,
  Home,
  BarChart3,
  Filter
} from 'lucide-react'

export default function TasksPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const {
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
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskFormLoading, setTaskFormLoading] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Check if user has any tasks
  const hasTasks = tasks.length > 0

  // Handle create task
  const handleCreateTask = async (data: TaskFormData) => {
    try {
      logger.log('🚀 Starting task creation:', data.title)
      logger.log('🚀 Current tasks before creation:', tasks.length)
      setTaskFormLoading(true)
      const newTask = await createTask(data)
      logger.log('✅ Task created successfully:', newTask.title)
      logger.log('✅ Tasks count after creation should be:', tasks.length + 1)
      setShowTaskForm(false)
      setEditingTask(null)
    } catch (error) {
      logger.error('Error creating task:', error)
      throw error // Re-throw to show error in form
    } finally {
      setTaskFormLoading(false)
    }
  }

  // Handle edit task
  const handleEditTask = async (data: TaskFormData) => {
    if (!editingTask) return

    try {
      logger.log('🚀 Starting task update:', data.title)
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
      logger.log('✅ Task updated successfully')
      setShowTaskForm(false)
      setEditingTask(null)
    } catch (error) {
      logger.error('Error updating task:', error)
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
      <ModuleHeader
        icon={CheckSquare}
        title="Úkoly"
        subtitle={`${stats.total} úkolů • ${stats.completed} dokončeno`}
        iconGradient="from-blue-500 to-indigo-500"
        actions={
          <button
            onClick={() => setShowTaskForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nový úkol</span>
            <span className="sm:hidden">Přidat</span>
          </button>
        }
      />

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
                onClick={() => setShowTaskForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Vytvořit úkol</span>
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
              tasks={tasks}
              stats={stats}
              loading={loading}
              error={error}
              toggleTaskStatus={toggleTaskStatus}
              deleteTask={deleteTask}
              clearError={clearError}
            />
          </div>
        )}
      </div>

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
    </div>
  )
}
