'use client'

import { useState } from 'react'
import { Milestone, TimelineFilters, TimelineViewOptions, MILESTONE_TYPES } from '@/types/timeline'
import { useTimeline } from '@/hooks/useTimeline'
import {
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  Target,
  Flag
} from 'lucide-react'

interface TimelineViewProps {
  showHeader?: boolean
  showFilters?: boolean
  maxHeight?: string
  compact?: boolean
  viewMode?: 'timeline' | 'list'
  onCreateMilestone?: () => void
  onEditMilestone?: (milestone: Milestone) => void
}

export default function TimelineView({
  showHeader = true,
  showFilters = true,
  maxHeight = '600px',
  compact = false,
  viewMode = 'timeline',
  onCreateMilestone,
  onEditMilestone
}: TimelineViewProps) {
  const {
    milestones,
    loading,
    error,
    stats,
    completeMilestone,
    deleteMilestone,
    getDaysUntilWedding,
    clearError
  } = useTimeline()

  const [filters, setFilters] = useState<TimelineFilters>({})
  const [viewOptions, setViewOptions] = useState<TimelineViewOptions>({
    groupBy: 'period',
    sortBy: 'date',
    sortOrder: 'asc',
    viewType: 'timeline',
    showDependencies: false,
    showProgress: true,
    timeRange: 'all'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([])

  // Filter and sort milestones
  const filteredMilestones = milestones.filter(milestone => {
    // Search filter
    if (searchTerm && !milestone.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Type filter
    if (filters.type && !filters.type.includes(milestone.type)) {
      return false
    }

    // Status filter
    if (filters.status && !filters.status.includes(milestone.status)) {
      return false
    }

    // Priority filter
    if (filters.priority && !filters.priority.includes(milestone.priority)) {
      return false
    }

    // Show completed filter
    if (filters.showCompleted === false && milestone.status === 'completed') {
      return false
    }

    return true
  })

  // Group milestones by period
  const groupedMilestones = groupMilestonesByPeriod(filteredMilestones)

  // Get milestone status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Dokončeno' }
      case 'in-progress':
        return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Probíhá' }
      case 'overdue':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', label: 'Po termínu' }
      case 'upcoming':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Nadchází' }
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Naplánováno' }
    }
  }

  // Get priority display
  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { color: 'text-red-600', bg: 'bg-red-100', label: 'Kritická' }
      case 'high':
        return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Vysoká' }
      case 'medium':
        return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Střední' }
      case 'low':
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Nízká' }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Střední' }
    }
  }

  // Get period display name
  const getPeriodName = (period: string) => {
    const periodNames = {
      '12-months': '12+ měsíců před',
      '9-months': '9 měsíců před',
      '6-months': '6 měsíců před',
      '3-months': '3 měsíce před',
      '1-month': '1 měsíc před',
      '2-weeks': '2 týdny před',
      '1-week': '1 týden před',
      'wedding-day': 'Den svatby',
      'after-wedding': 'Po svatbě',
      'custom': 'Vlastní'
    }
    return periodNames[period as keyof typeof periodNames] || period
  }

  // Handle milestone completion
  const handleCompleteMilestone = async (milestoneId: string) => {
    try {
      await completeMilestone(milestoneId)
    } catch (error) {
      console.error('Error completing milestone:', error)
    }
  }

  // Handle milestone deletion
  const handleDeleteMilestone = async (milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId)
    if (!milestone) return

    if (window.confirm(`Opravdu chcete smazat milník "${milestone.title}"?`)) {
      try {
        await deleteMilestone(milestoneId)
      } catch (error) {
        console.error('Error deleting milestone:', error)
      }
    }
  }

  // Handle milestone selection
  const toggleMilestoneSelection = (milestoneId: string) => {
    setSelectedMilestones(prev =>
      prev.includes(milestoneId)
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    )
  }

  // Calculate days until milestone
  const getDaysUntilMilestone = (targetDate: Date): number => {
    const now = new Date()
    const diffTime = targetDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 loading-spinner" />
          <span className="text-text-muted">Načítání timeline...</span>
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
            <h2 className="heading-2">Timeline</h2>
            <p className="body-small text-text-muted">
              {stats.completedMilestones} z {stats.totalMilestones} milníků dokončeno
              {getDaysUntilWedding() > 0 && (
                <span className="ml-2">• {getDaysUntilWedding()} dní do svatby</span>
              )}
            </p>
          </div>
          {onCreateMilestone && (
            <button
              onClick={onCreateMilestone}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat milník</span>
            </button>
          )}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-text-muted">Celkem</p>
              <p className="text-lg font-semibold">{stats.totalMilestones}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-text-muted">Dokončeno</p>
              <p className="text-lg font-semibold">{stats.completedMilestones}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-text-muted">Nadchází</p>
              <p className="text-lg font-semibold">{stats.upcomingMilestones}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-text-muted">Po termínu</p>
              <p className="text-lg font-semibold">{stats.overdueMilestones}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-3">
          {/* Search and filter toggle */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Hledat milníky..."
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
                {/* Type filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ milníku
                  </label>
                  <select
                    value={filters.type?.[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      type: e.target.value ? [e.target.value as any] : undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Všechny typy</option>
                    {Object.entries(MILESTONE_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>

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
                    <option value="upcoming">Nadchází</option>
                    <option value="in-progress">Probíhá</option>
                    <option value="completed">Dokončeno</option>
                    <option value="overdue">Po termínu</option>
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
                    <option value="critical">Kritická</option>
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
                    checked={filters.showCompleted !== false}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      showCompleted: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Zobrazit dokončené</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewOptions.showProgress}
                    onChange={(e) => setViewOptions(prev => ({
                      ...prev,
                      showProgress: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Zobrazit pokrok</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div
        className="space-y-6 overflow-y-auto"
        style={{ maxHeight }}
      >
        {Object.entries(groupedMilestones).map(([period, periodMilestones]) => (
          <div key={period} className="space-y-3">
            {/* Period header */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                {getPeriodName(period)}
              </h3>
              <span className="text-sm text-text-muted">
                {periodMilestones.length} milníků
              </span>
            </div>

            {/* Milestones in period */}
            <div className="space-y-3">
              {periodMilestones.map((milestone, index) => {
                const statusDisplay = getStatusDisplay(milestone.status)
                const priorityDisplay = getPriorityDisplay(milestone.priority)
                const milestoneType = MILESTONE_TYPES[milestone.type as keyof typeof MILESTONE_TYPES]
                const daysUntil = getDaysUntilMilestone(milestone.targetDate)

                return (
                  <div
                    key={milestone.id}
                    className="relative flex items-start space-x-4 p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
                  >
                    {/* Timeline line */}
                    {viewMode === 'timeline' && (
                      <div className="absolute left-8 top-16 bottom-0 w-px bg-gray-200"
                           style={{ display: index === periodMilestones.length - 1 ? 'none' : 'block' }} />
                    )}

                    {/* Milestone icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${milestoneType?.color || 'bg-gray-100'}`}>
                      <span className="text-sm">{milestoneType?.icon || '📋'}</span>
                    </div>

                    {/* Milestone content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {milestone.title}
                              {milestone.isRequired && (
                                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                  Povinný
                                </span>
                              )}
                            </h4>

                            {/* Status */}
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusDisplay.bg}`}>
                              <statusDisplay.icon className={`w-3 h-3 ${statusDisplay.color}`} />
                              <span className={`text-xs font-medium ${statusDisplay.color}`}>
                                {statusDisplay.label}
                              </span>
                            </div>

                            {/* Priority */}
                            <div className={`flex items-center px-2 py-1 rounded-full ${priorityDisplay.bg}`}>
                              <span className={`text-xs font-medium ${priorityDisplay.color}`}>
                                {priorityDisplay.label}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          {milestone.description && (
                            <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                          )}

                          {/* Date and countdown */}
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span>📅 {milestone.targetDate.toLocaleDateString('cs-CZ')}</span>
                            {daysUntil > 0 && milestone.status !== 'completed' && (
                              <span className={`${daysUntil <= 7 ? 'text-red-600 font-medium' : ''}`}>
                                {daysUntil} {daysUntil === 1 ? 'den' : daysUntil < 5 ? 'dny' : 'dní'}
                              </span>
                            )}
                            {daysUntil < 0 && milestone.status !== 'completed' && (
                              <span className="text-red-600 font-medium">
                                {Math.abs(daysUntil)} {Math.abs(daysUntil) === 1 ? 'den' : Math.abs(daysUntil) < 5 ? 'dny' : 'dní'} po termínu
                              </span>
                            )}
                          </div>

                          {/* Progress bar */}
                          {viewOptions.showProgress && milestone.status !== 'completed' && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${milestone.progress}%` }}
                              ></div>
                            </div>
                          )}

                          {/* Tags */}
                          {milestone.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {milestone.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {/* Complete button */}
                          {milestone.status !== 'completed' && (
                            <button
                              onClick={() => handleCompleteMilestone(milestone.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Označit jako dokončeno"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            onClick={() => onEditMilestone?.(milestone)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Upravit milník"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Smazat milník"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredMilestones.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {milestones.length === 0 ? 'Žádné milníky' : 'Žádné milníky nevyhovují filtrům'}
            </h3>
            <p className="text-text-muted">
              {milestones.length === 0
                ? 'Začněte přidáním prvního milníku nebo použijte šablonu.'
                : 'Zkuste upravit filtry nebo vyhledávání.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to group milestones by period
function groupMilestonesByPeriod(milestones: Milestone[]): Record<string, Milestone[]> {
  const grouped: Record<string, Milestone[]> = {}

  milestones.forEach(milestone => {
    const period = milestone.period || 'other'

    if (!grouped[period]) {
      grouped[period] = []
    }
    grouped[period].push(milestone)
  })

  // Sort milestones within each group by target date
  Object.keys(grouped).forEach(period => {
    grouped[period].sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
  })

  return grouped
}
