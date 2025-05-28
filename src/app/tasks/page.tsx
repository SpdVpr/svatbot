'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import { useTask } from '@/hooks/useTask'
import TaskList from '@/components/tasks/TaskList'
import TaskStats from '@/components/tasks/TaskStats'
import TaskForm from '@/components/tasks/TaskForm'
import TaskDebug from '@/components/debug/TaskDebug'
import StatsCards from '@/components/shared/StatsCards'
import { TaskFormData } from '@/types/task'
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
  const { initializeTasksFromTemplates, tasks, loading, createTask, error, stats } = useTask()
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'stats'>('list')
  const [showInitializeModal, setShowInitializeModal] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskFormLoading, setTaskFormLoading] = useState(false)

  // Check if user has any tasks
  const hasTasks = tasks.length > 0

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
      setTaskFormLoading(true)
      await createTask(data)
      setShowTaskForm(false)
    } catch (error) {
      console.error('Error creating task:', error)
      throw error // Re-throw to show error in form
    } finally {
      setTaskFormLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Přihlášení vyžadováno
          </h1>
          <p className="text-text-muted">
            Pro přístup k úkolům se musíte přihlásit.
          </p>
        </div>
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Žádná svatba
          </h1>
          <p className="text-text-muted mb-4">
            Nejdříve si vytvořte svatbu v onboarding procesu.
          </p>
          <button className="btn-primary">
            Vytvořit svatbu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Úkoly</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back button and Title */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Zpět na dashboard</span>
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
              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('stats')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'stats'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              {/* Action buttons */}
              <button className="btn-outline flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Nastavení</span>
              </button>

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
          /* Content based on view mode */
          <div className="space-y-8">
            {/* Stats Cards - Always visible */}
            <StatsCards type="tasks" stats={stats} />

            {/* Main content based on view mode */}
            <div className="space-y-6">
              {viewMode === 'stats' && <TaskStats />}

              {(viewMode === 'list' || viewMode === 'grid') && (
                <TaskList onCreateTask={() => setShowTaskForm(true)} />
              )}
            </div>
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
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskForm(false)}
          loading={taskFormLoading}
          error={error || undefined}
        />
      )}

      {/* Debug component for development */}
      <TaskDebug />
    </div>
  )
}
