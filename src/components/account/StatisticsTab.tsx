'use client'

import React, { memo } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { useGuest } from '@/hooks/useGuest'
import { useTask } from '@/hooks/useTask'
import { useBudget } from '@/hooks/useBudget'
import { useVendor } from '@/hooks/useVendor'
import { StatisticsTabSkeleton } from './TabSkeleton'
import {
  BarChart3,
  Users,
  CheckSquare,
  DollarSign,
  Briefcase,
  TrendingUp,
  Calendar,
  Eye,
  MessageSquare,
  Sparkles
} from 'lucide-react'

interface StatisticsTabProps {
  subscriptionData: ReturnType<typeof useSubscription>
}

function StatisticsTab({ subscriptionData }: StatisticsTabProps) {
  const { usageStats, loading: subscriptionLoading } = subscriptionData
  const { guests, loading: guestsLoading } = useGuest()
  const { tasks, loading: tasksLoading } = useTask()
  const { budgetItems, loading: budgetLoading } = useBudget()
  const { vendors, loading: vendorsLoading } = useVendor()

  // Don't show skeleton - render immediately to prevent flickering
  // const isInitialLoad = !guests && !tasks && !budgetItems && !vendors
  // if (isInitialLoad && (guestsLoading || tasksLoading || budgetLoading || vendorsLoading)) {
  //   return <StatisticsTabSkeleton />
  // }

  const stats = [
    {
      label: 'Celkem hostů',
      value: guests?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Úkolů',
      value: tasks?.length || 0,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Položek rozpočtu',
      value: budgetItems?.length || 0,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      label: 'Dodavatelů',
      value: vendors?.length || 0,
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  const activityStats = [
    {
      label: 'Celkem přihlášení',
      value: usageStats?.totalLogins || 0,
      icon: Calendar,
      color: 'text-indigo-600'
    },
    {
      label: 'Zobrazení svatebního webu',
      value: usageStats?.weddingWebsiteViews || 0,
      icon: Eye,
      color: 'text-pink-600'
    },
    {
      label: 'RSVP odpovědí',
      value: usageStats?.rsvpResponses || 0,
      icon: MessageSquare,
      color: 'text-teal-600'
    },
    {
      label: 'AI dotazů',
      value: usageStats?.aiQueriesCount || 0,
      icon: Sparkles,
      color: 'text-amber-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-6">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <span>Přehled využití</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Activity Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <span>Aktivita</span>
        </h3>

        <div className="space-y-4">
          {activityStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-gray-700">{stat.label}</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {stat.value}
                </span>
              </div>
            )
          })}
        </div>

        {usageStats?.lastLoginAt && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Poslední přihlášení:{' '}
              <span className="font-medium text-gray-900">
                {usageStats.lastLoginAt.toLocaleDateString('cs-CZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Task Completion */}
      {tasks && tasks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dokončení úkolů
          </h3>

          <div className="space-y-4">
            {(() => {
              const completedTasks = tasks.filter(t => t.status === 'completed').length
              const totalTasks = tasks.length
              const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

              return (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Dokončeno</span>
                      <span className="text-sm font-medium text-gray-900">
                        {completedTasks} / {totalTasks} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {completedTasks}
                      </p>
                      <p className="text-xs text-gray-600">Dokončeno</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {tasks.filter(t => t.status === 'in-progress').length}
                      </p>
                      <p className="text-xs text-gray-600">Probíhá</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {tasks.filter(t => t.status === 'pending').length}
                      </p>
                      <p className="text-xs text-gray-600">Nezahájeno</p>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Budget Overview */}
      {budgetItems && budgetItems.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Přehled rozpočtu
          </h3>

          <div className="space-y-4">
            {(() => {
              const totalBudgeted = budgetItems.reduce((sum, item) => sum + (item.budgetedAmount || 0), 0)
              const totalActual = budgetItems.reduce((sum, item) => sum + (item.actualAmount || 0), 0)
              const totalPaid = budgetItems.reduce((sum, item) => sum + (item.paidAmount || 0), 0)
              const percentage = totalBudgeted > 0 ? Math.round((totalActual / totalBudgeted) * 100) : 0

              return (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Využití rozpočtu</span>
                      <span className="text-sm font-medium text-gray-900">
                        {totalActual.toLocaleString('cs-CZ')} / {totalBudgeted.toLocaleString('cs-CZ')} Kč ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          percentage > 100 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {totalBudgeted.toLocaleString('cs-CZ')}
                      </p>
                      <p className="text-xs text-gray-600">Plánováno Kč</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">
                        {totalActual.toLocaleString('cs-CZ')}
                      </p>
                      <p className="text-xs text-gray-600">Skutečnost Kč</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">
                        {totalPaid.toLocaleString('cs-CZ')}
                      </p>
                      <p className="text-xs text-gray-600">Zaplaceno Kč</p>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(StatisticsTab)

