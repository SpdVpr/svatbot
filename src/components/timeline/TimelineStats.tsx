'use client'

import { useTimeline } from '@/hooks/useTimeline'
import { useWedding } from '@/hooks/useWedding'
import { MILESTONE_TYPES, Milestone } from '@/types/timeline'
import TimelineView from './TimelineView'
import {
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Flag,
  Heart,
  Zap
} from 'lucide-react'

interface TimelineStatsProps {
  compact?: boolean
  showProgress?: boolean
  showTimelineView?: boolean
  onCreateMilestone?: () => void
  onEditMilestone?: (milestone: Milestone) => void
}

export default function TimelineStats({
  compact = false,
  showProgress = true,
  showTimelineView = true,
  onCreateMilestone,
  onEditMilestone
}: TimelineStatsProps) {
  const { milestones, stats, getDaysUntilWedding, getUpcomingDeadlines } = useTimeline()
  const { wedding } = useWedding()

  // Calculate additional stats
  const upcomingDeadlines = getUpcomingDeadlines(30)
  const criticalMilestones = milestones.filter(m => m.priority === 'critical' && m.status !== 'completed')
  const daysUntilWedding = getDaysUntilWedding()

  // Get milestone type breakdown
  const typeBreakdown = Object.entries(MILESTONE_TYPES).map(([key, type]) => {
    const typeMilestones = milestones.filter(m => m.type === key)
    const completed = typeMilestones.filter(m => m.status === 'completed').length

    return {
      key,
      type,
      total: typeMilestones.length,
      completed,
      percentage: typeMilestones.length > 0 ? Math.round((completed / typeMilestones.length) * 100) : 0
    }
  }).filter(stat => stat.total > 0)

  // Get progress color
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 60) return 'text-blue-600 bg-blue-100'
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Get wedding countdown color
  const getCountdownColor = (days: number) => {
    if (days <= 7) return 'text-red-600 bg-red-100'
    if (days <= 30) return 'text-orange-600 bg-orange-100'
    if (days <= 90) return 'text-yellow-600 bg-yellow-100'
    return 'text-blue-600 bg-blue-100'
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total milestones */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMilestones}</p>
              <p className="text-sm text-text-muted">Milníků</p>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completedMilestones}</p>
              <p className="text-sm text-text-muted">Dokončeno</p>
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.upcomingMilestones}</p>
              <p className="text-sm text-text-muted">Nadchází</p>
            </div>
          </div>
        </div>

        {/* Days until wedding */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <div>
              <p className="text-2xl font-bold text-pink-600">{daysUntilWedding}</p>
              <p className="text-sm text-text-muted">Dní do svatby</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall progress */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Celkový pokrok</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.overallProgress}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600 font-medium">
              {stats.completedMilestones} z {stats.totalMilestones} dokončeno
            </span>
          </div>
        </div>

        {/* Days until wedding */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Do svatby</p>
              <p className="text-3xl font-bold text-pink-600 mt-1">{daysUntilWedding}</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-full">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`font-medium ${getCountdownColor(daysUntilWedding).split(' ')[0]}`}>
              {daysUntilWedding <= 30 ? 'Blíží se!' : 'Máte čas'}
            </span>
          </div>
        </div>

        {/* Critical milestones */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Kritické milníky</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{criticalMilestones.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Flag className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {criticalMilestones.length > 0 ? (
              <span className="text-red-600">Vyžaduje pozornost</span>
            ) : (
              <span className="text-green-600">Vše pod kontrolou</span>
            )}
          </div>
        </div>

        {/* Upcoming deadlines */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Nadcházející termíny</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{upcomingDeadlines.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-orange-600">Příštích 30 dní</span>
          </div>
        </div>
      </div>

      {/* Progress overview */}
      {showProgress && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pokrok plánování</h3>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${getProgressColor(stats.overallProgress)}
            `}>
              {stats.overallProgress}% dokončeno
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div className="flex h-4 rounded-full overflow-hidden">
              <div
                className="bg-green-500"
                style={{ width: `${(stats.completedMilestones / stats.totalMilestones) * 100}%` }}
                title={`Dokončeno: ${stats.completedMilestones}`}
              ></div>
              <div
                className="bg-yellow-500"
                style={{ width: `${(stats.upcomingMilestones / stats.totalMilestones) * 100}%` }}
                title={`Nadchází: ${stats.upcomingMilestones}`}
              ></div>
              <div
                className="bg-red-500"
                style={{ width: `${(stats.overdueMilestones / stats.totalMilestones) * 100}%` }}
                title={`Po termínu: ${stats.overdueMilestones}`}
              ></div>
            </div>
          </div>

          {/* Progress breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-green-600">{stats.completedMilestones}</p>
              <p className="text-text-muted">Dokončeno</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-yellow-600">{stats.upcomingMilestones}</p>
              <p className="text-text-muted">Nadchází</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-red-600">{stats.overdueMilestones}</p>
              <p className="text-text-muted">Po termínu</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-blue-600">{stats.onTrackPercentage}%</p>
              <p className="text-text-muted">V termínu</p>
            </div>
          </div>
        </div>
      )}

      {/* Milestone type breakdown */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>Milníky podle typu</span>
        </h3>

        <div className="space-y-4">
          {typeBreakdown.map((stat) => (
            <div key={stat.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{stat.type.icon}</span>
                  <span className="font-medium text-gray-900">{stat.type.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {stat.completed} / {stat.total}
                  </p>
                  <p className="text-sm text-text-muted">
                    {stat.percentage}% dokončeno
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Nadcházející termíny</span>
          </h3>

          <div className="space-y-3">
            {upcomingDeadlines.slice(0, 5).map((milestone) => {
              const daysUntil = Math.ceil((milestone.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              const milestoneType = MILESTONE_TYPES[milestone.type as keyof typeof MILESTONE_TYPES]

              return (
                <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{milestoneType?.icon || '📋'}</span>
                    <div>
                      <p className="font-medium text-gray-900">{milestone.title}</p>
                      <p className="text-sm text-gray-600">
                        {milestone.targetDate.toLocaleDateString('cs-CZ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${daysUntil <= 7 ? 'text-red-600' : 'text-orange-600'}`}>
                      {daysUntil} {daysUntil === 1 ? 'den' : daysUntil < 5 ? 'dny' : 'dní'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {milestone.priority === 'critical' ? 'Kritický' : 'Důležitý'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}



      {/* Timeline View */}
      {showTimelineView && (
        <div className="mt-8">
          <TimelineView
            showHeader={false}
            showFilters={true}
            maxHeight="800px"
            compact={false}
            viewMode="timeline"
            onCreateMilestone={onCreateMilestone}
            onEditMilestone={onEditMilestone}
          />
        </div>
      )}
    </div>
  )
}
