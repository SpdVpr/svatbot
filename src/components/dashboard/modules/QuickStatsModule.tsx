'use client'

import { BarChart3, Users, DollarSign, CheckCircle, Calendar } from 'lucide-react'
import { useTask } from '@/hooks/useTask'
import { useGuest } from '@/hooks/useGuest'
import { useBudget } from '@/hooks/useBudget'
import { useWeddingStore } from '@/stores/weddingStore'
import { currencyUtils, weddingUtils } from '@/utils'

export default function QuickStatsModule() {
  const { stats } = useTask()
  const { stats: guestStats } = useGuest()
  const { stats: budgetStats } = useBudget()
  const { currentWedding } = useWeddingStore()

  // Create mock wedding if none exists
  const wedding = currentWedding || {
    budget: 450000,
    style: 'classic' as const,
    region: 'Praha'
  }

  const quickStats = [
    {
      icon: CheckCircle,
      label: 'Dokončené úkoly',
      value: `${stats.completed}/${stats.total}`,
      color: 'text-green-600 bg-green-100',
      percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    },
    {
      icon: Users,
      label: 'Potvrzení hosté',
      value: `${guestStats.attending}/${guestStats.total}`,
      color: 'text-blue-600 bg-blue-100',
      percentage: guestStats.total > 0 ? Math.round((guestStats.attending / guestStats.total) * 100) : 0
    },
    {
      icon: DollarSign,
      label: 'Využitý rozpočet',
      value: `${budgetStats.budgetUsed}%`,
      color: 'text-green-600 bg-green-100',
      percentage: budgetStats.budgetUsed
    },
    {
      icon: Calendar,
      label: 'Dnů do svatby',
      value: '180', // Mock value
      color: 'text-primary-600 bg-primary-100',
      percentage: 75 // Mock percentage
    }
  ]

  return (
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <span>Rychlé statistiky</span>
        </h3>
      </div>

      <div className="space-y-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                <span className="text-sm font-bold text-gray-900">{stat.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">Styl svatby</div>
            <div className="text-sm font-medium text-gray-900">
              {weddingUtils.getWeddingStyleLabel(wedding.style)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Rozpočet</div>
            <div className="text-sm font-medium text-gray-900">
              {currencyUtils.formatShort(wedding.budget)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-primary-50 rounded-lg">
        <div className="text-center">
          <div className="text-sm font-medium text-primary-900">Region</div>
          <div className="text-lg font-bold text-primary-600">{wedding.region}</div>
        </div>
      </div>
    </div>
  )
}
