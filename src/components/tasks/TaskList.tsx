'use client'

import { useState } from 'react'
import { Task, TaskFilters, TaskViewOptions } from '@/types/task'
import { useTask } from '@/hooks/useTask'
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  Flag
} from 'lucide-react'

interface TaskListProps {
  showHeader?: boolean
  showFilters?: boolean
  maxHeight?: string
  compact?: boolean
  onCreateTask?: () => void
  tasks?: Task[] // Optional - if not provided, will use useTask hook
  loading?: boolean
  error?: string | null
  stats?: any
  toggleTaskStatus?: (taskId: string) => Promise<void>
  deleteTask?: (taskId: string) => Promise<void>
  clearError?: () => void
}

export default function TaskList({
  showHeader = true,
  showFilters = true,
  maxHeight = '600px',
  compact = false,
  onCreateTask,
  tasks: propTasks,
  loading: propLoading,
  error: propError,
  stats: propStats,
  toggleTaskStatus: propToggleTaskStatus,
  deleteTask: propDeleteTask,
  clearError: propClearError
}: TaskListProps) {
  const hookData = useTask()

  // Check if this is a demo user - if so, use props, otherwise use hook data
  const isDemoUser = hookData.tasks.length > 0 && hookData.tasks[0]?.weddingId === 'demo-wedding'

  // Use props for demo users, hook data for normal users
  const tasks = isDemoUser && propTasks ? propTasks : hookData.tasks
  const loading = isDemoUser && propLoading !== undefined ? propLoading : hookData.loading
  const error = isDemoUser && propError !== undefined ? propError : hookData.error
  const stats = isDemoUser && propStats ? propStats : hookData.stats
  const toggleTaskStatus = isDemoUser && propToggleTaskStatus ? propToggleTaskStatus : hookData.toggleTaskStatus
  const deleteTask = isDemoUser && propDeleteTask ? propDeleteTask : hookData.deleteTask
  const clearError = isDemoUser && propClearError ? propClearError : hookData.clearError

  // Debug logging
  console.log('📋 TaskList render - tasks:', tasks.length, tasks)
  console.log('📋 TaskList render - isDemoUser:', isDemoUser)
  console.log('📋 TaskList render - using props:', isDemoUser && !!propTasks)

  const [filters, setFilters] = useState<TaskFilters>({})
  const [viewOptions, setViewOptions] = useState<TaskViewOptions>({
    groupBy: 'category',
    sortBy: 'due-date',
    sortOrder: 'asc',
    showCompleted: true,
    showTemplates: false
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Status filter
    if (filters.status && !filters.status.includes(task.status)) {
      return false
    }

    // Category filter
    if (filters.category && !filters.category.includes(task.category)) {
      return false
    }

    // Priority filter
    if (filters.priority && !filters.priority.includes(task.priority)) {
      return false
    }

    // Show completed filter
    if (!viewOptions.showCompleted && task.status === 'completed') {
      return false
    }

    return true
  })

  // Debug filtering
  console.log('🔍 TaskList filtering:', {
    totalTasks: tasks.length,
    filteredTasks: filteredTasks.length,
    searchTerm,
    filters,
    viewOptions,
    tasks: tasks.map(t => ({ id: t.id, title: t.title, status: t.status, category: t.category }))
  })

  // Group tasks
  const groupedTasks = groupTasksBy(filteredTasks, viewOptions.groupBy)

  // Debug grouping
  console.log('🔍 TaskList grouping:', {
    filteredTasksCount: filteredTasks.length,
    groupedTasks: Object.keys(groupedTasks).map(key => ({
      group: key,
      count: groupedTasks[key].length,
      tasks: groupedTasks[key].map(t => t.title)
    }))
  })

  // Get priority icon and color
  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' }
      case 'high':
        return { icon: Flag, color: 'text-orange-500', bg: 'bg-orange-50' }
      case 'medium':
        return { icon: Flag, color: 'text-yellow-500', bg: 'bg-yellow-50' }
      case 'low':
        return { icon: Flag, color: 'text-gray-400', bg: 'bg-gray-50' }
      default:
        return { icon: Flag, color: 'text-gray-400', bg: 'bg-gray-50' }
    }
  }

  // Get status icon
  const getStatusIcon = (status: string, isOverdue: boolean) => {
    if (status === 'completed') {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
    }
    if (isOverdue) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
    if (status === 'in-progress') {
      return <Clock className="w-5 h-5 text-blue-500" />
    }
    return <Circle className="w-5 h-5 text-gray-400" />
  }

  // Check if task is overdue
  const isTaskOverdue = (task: Task): boolean => {
    return !!(task.dueDate && task.dueDate < new Date() && task.status !== 'completed')
  }

  // Get category display name
  const getCategoryName = (category: string) => {
    const categoryNames = {
      foundation: 'Základy',
      venue: 'Místo konání',
      guests: 'Hosté',
      budget: 'Rozpočet',
      design: 'Design',
      organization: 'Organizace',
      final: 'Finální přípravy',
      custom: 'Vlastní úkoly'
    }
    return categoryNames[category as keyof typeof categoryNames] || category
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 loading-spinner" />
          <span className="text-text-muted">Načítání úkolů...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="heading-2">Úkoly</h2>
            <p className="body-small text-text-muted">
              {stats.completed} z {stats.total} dokončeno ({stats.completionRate}%)
            </p>
          </div>
          {onCreateTask && (
            <button
              onClick={onCreateTask}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nový úkol</span>
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="space-y-3">
          {/* Search and filter toggle */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Hledat úkoly..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`btn-outline flex items-center space-x-2 ${showFiltersPanel ? 'bg-primary-50 border-primary-300' : ''}`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtry</span>
            </button>
          </div>

          {/* Filters panel */}
          {showFiltersPanel && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stav
                  </label>
                  <select
                    value={filters.status?.[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      status: e.target.value ? [e.target.value as any] : undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všechny stavy</option>
                    <option value="pending">Čekající</option>
                    <option value="in-progress">Probíhající</option>
                    <option value="completed">Dokončené</option>
                  </select>
                </div>

                {/* Category filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategorie
                  </label>
                  <select
                    value={filters.category?.[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      category: e.target.value ? [e.target.value as any] : undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všechny kategorie</option>
                    <option value="foundation">Základy</option>
                    <option value="venue">Místo konání</option>
                    <option value="guests">Hosté</option>
                    <option value="budget">Rozpočet</option>
                    <option value="design">Design</option>
                    <option value="organization">Organizace</option>
                    <option value="final">Finální přípravy</option>
                  </select>
                </div>

                {/* Priority filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorita
                  </label>
                  <select
                    value={filters.priority?.[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priority: e.target.value ? [e.target.value as any] : undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všechny priority</option>
                    <option value="urgent">Urgentní</option>
                    <option value="high">Vysoká</option>
                    <option value="medium">Střední</option>
                    <option value="low">Nízká</option>
                  </select>
                </div>
              </div>

              {/* View options */}
              <div className="flex items-center space-x-4 pt-2 border-t border-gray-200">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewOptions.showCompleted}
                    onChange={(e) => setViewOptions(prev => ({
                      ...prev,
                      showCompleted: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Zobrazit dokončené</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task list */}
      <div
        className="space-y-4 overflow-y-auto"
        style={{ maxHeight }}
      >
        {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => (
          <div key={groupKey} className="space-y-2">
            {/* Group header */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                {viewOptions.groupBy === 'category' ? getCategoryName(groupKey) : groupKey}
              </h3>
              <span className="text-sm text-text-muted">
                {groupTasks.length} úkolů
              </span>
            </div>

            {/* Tasks in group */}
            <div className="space-y-2">
              {groupTasks.map((task) => {
                const isOverdue = isTaskOverdue(task)
                const priorityDisplay = getPriorityDisplay(task.priority)

                return (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
                      task.status === 'completed'
                        ? 'bg-gray-50 border-gray-200'
                        : isOverdue
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Status checkbox */}
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-1 hover:scale-110 transition-transform"
                      >
                        {getStatusIcon(task.status, isOverdue)}
                      </button>

                      {/* Task content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              task.status === 'completed'
                                ? 'text-gray-500 line-through'
                                : 'text-gray-900'
                            }`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-text-muted mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Priority indicator */}
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${priorityDisplay.bg}`}>
                            <priorityDisplay.icon className={`w-3 h-3 ${priorityDisplay.color}`} />
                            <span className={`text-xs font-medium ${priorityDisplay.color}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>

                        {/* Task metadata */}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-text-muted">
                          {task.dueDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                {formatDate(task.dueDate)}
                              </span>
                            </div>
                          )}
                          {task.assignedTo && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{task.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tasks.length === 0 ? 'Žádné úkoly' : 'Žádné úkoly nevyhovují filtrům'}
            </h3>
            <p className="text-text-muted">
              {tasks.length === 0
                ? 'Začněte přidáním prvního úkolu nebo použijte šablony.'
                : 'Zkuste upravit filtry nebo vyhledávání.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to group tasks
function groupTasksBy(tasks: Task[], groupBy: string): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {}

  tasks.forEach(task => {
    let key: string

    switch (groupBy) {
      case 'category':
        key = task.category
        break
      case 'status':
        key = task.status
        break
      case 'priority':
        key = task.priority
        break
      case 'due-date':
        if (!task.dueDate) {
          key = 'Bez termínu'
        } else {
          const today = new Date()
          const diffTime = task.dueDate.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays < 0) {
            key = 'Prošlé'
          } else if (diffDays === 0) {
            key = 'Dnes'
          } else if (diffDays <= 7) {
            key = 'Tento týden'
          } else if (diffDays <= 30) {
            key = 'Tento měsíc'
          } else {
            key = 'Později'
          }
        }
        break
      default:
        key = 'Ostatní'
    }

    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(task)
  })

  // Sort tasks within each group
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      // Sort by due date first, then by priority
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime()
      }
      if (a.dueDate && !b.dueDate) return -1
      if (!a.dueDate && b.dueDate) return 1

      // Then by priority
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority as keyof typeof priorityOrder] -
             priorityOrder[b.priority as keyof typeof priorityOrder]
    })
  })

  return grouped
}
