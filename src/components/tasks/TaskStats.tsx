'use client'

import { useTask } from '@/hooks/useTask'
import TaskList from './TaskList'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react'

interface TaskStatsProps {
  compact?: boolean
  showProgress?: boolean
  showTaskList?: boolean
  onCreateTask?: () => void
  onEditTask?: (task: any) => void
  tasks?: any[] // Optional - if not provided, will use useTask hook
  stats?: any
  loading?: boolean
  error?: string | null
  toggleTaskStatus?: (taskId: string) => Promise<void>
  deleteTask?: (taskId: string) => Promise<void>
  clearError?: () => void
}

export default function TaskStats({
  compact = false,
  showProgress = true,
  showTaskList = true,
  onCreateTask,
  onEditTask,
  tasks: propTasks,
  stats: propStats,
  loading: propLoading,
  error: propError,
  toggleTaskStatus: propToggleTaskStatus,
  deleteTask: propDeleteTask,
  clearError: propClearError
}: TaskStatsProps) {
  const hookData = useTask()

  // Check if this is a demo user - if so, use props, otherwise use hook data
  const isDemoUser = hookData.tasks.length > 0 && hookData.tasks[0]?.weddingId === 'demo-wedding'

  // Use props for demo users, hook data for normal users
  const tasks = isDemoUser && propTasks ? propTasks : hookData.tasks
  const stats = isDemoUser && propStats ? propStats : hookData.stats

  // Calculate additional stats
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    const today = new Date()
    return task.dueDate.toDateString() === today.toDateString()
  })

  const thisWeekTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    const today = new Date()
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return task.dueDate >= today && task.dueDate <= weekFromNow
  })

  const urgentTasks = tasks.filter(task => 
    task.priority === 'urgent' && task.status !== 'completed'
  )

  // Get progress color
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 60) return 'text-blue-600 bg-blue-100'
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total tasks */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Circle className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-text-muted">Celkem</p>
            </div>
          </div>
        </div>

        {/* Completed tasks */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-text-muted">Dokončeno</p>
            </div>
          </div>
        </div>

        {/* Overdue tasks */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-sm text-text-muted">Po termínu</p>
            </div>
          </div>
        </div>

        {/* Completion rate */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.completionRate}%</p>
              <p className="text-sm text-text-muted">Úspěšnost</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main stats grid - Mobile optimized */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Total tasks */}
        <div className="bg-white p-3 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-text-muted">Celkem</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 md:mt-1">{stats.total}</p>
            </div>
            <div className="hidden md:block p-3 bg-gray-100 rounded-full">
              <Circle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
            <span className="text-text-muted truncate">
              {stats.pending} aktivních
            </span>
          </div>
        </div>

        {/* Completed tasks */}
        <div className="bg-white p-3 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-text-muted">Hotovo</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600 mt-0.5 md:mt-1">{stats.completed}</p>
            </div>
            <div className="hidden md:block p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">{stats.completionRate}%</span>
          </div>
        </div>

        {/* Overdue tasks */}
        <div className="bg-white p-3 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-text-muted">Po termínu</p>
              <p className="text-2xl md:text-3xl font-bold text-red-600 mt-0.5 md:mt-1">{stats.overdue}</p>
            </div>
            <div className="hidden md:block p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
            {stats.overdue > 0 ? (
              <span className="text-red-600 truncate">Vyžaduje</span>
            ) : (
              <span className="text-green-600 truncate">V termínu</span>
            )}
          </div>
        </div>

        {/* Urgent tasks */}
        <div className="bg-white p-3 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-text-muted">Urgentní</p>
              <p className="text-2xl md:text-3xl font-bold text-orange-600 mt-0.5 md:mt-1">{urgentTasks.length}</p>
            </div>
            <div className="hidden md:block p-3 bg-orange-100 rounded-full">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
            {urgentTasks.length > 0 ? (
              <span className="text-orange-600 truncate">Prioritní</span>
            ) : (
              <span className="text-green-600 truncate">Žádné</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress overview */}
      {showProgress && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Celkový pokrok</h3>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${getProgressColor(stats.completionRate)}
            `}>
              {stats.completionRate}% dokončeno
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>

          {/* Progress breakdown */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-gray-900">{stats.completed}</p>
              <p className="text-text-muted">Dokončeno</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-600">{stats.pending}</p>
              <p className="text-text-muted">Probíhá</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-red-600">{stats.overdue}</p>
              <p className="text-text-muted">Po termínu</p>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      {showTaskList && (
        <div className="mt-8">
          <TaskList
            showHeader={false}
            showFilters={true}
            compact={false}
            onCreateTask={onCreateTask}
            onEditTask={onEditTask}
            tasks={isDemoUser ? tasks : undefined}
            loading={isDemoUser ? propLoading : undefined}
            error={isDemoUser ? propError : undefined}
            stats={isDemoUser ? stats : undefined}
            toggleTaskStatus={isDemoUser ? propToggleTaskStatus : undefined}
            deleteTask={isDemoUser ? propDeleteTask : undefined}
            clearError={isDemoUser ? propClearError : undefined}
          />
        </div>
      )}
    </div>
  )
}
