'use client'

import Link from 'next/link'
import { List, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import { useTask } from '@/hooks/useTask'

export default function TaskManagementModule() {
  const { stats } = useTask()

  return (
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <List className="w-5 h-5 text-blue-600" />
          <span>Správa úkolů</span>
        </h3>
        <Link href="/tasks" className="text-sm text-primary-600 hover:underline">
          Otevřít
        </Link>
      </div>

      <div className="space-y-4">
        {/* Progress Overview */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Celkový pokrok</span>
            <span className="text-lg font-bold text-blue-600">{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <div className="text-xs text-blue-700 mt-1">
            {stats.completed} z {stats.total} úkolů dokončeno
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.completed}</div>
            <div className="text-xs text-gray-500">Dokončeno</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.inProgress}</div>
            <div className="text-xs text-gray-500">Probíhá</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.overdue}</div>
            <div className="text-xs text-gray-500">Po termínu</div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <div className={`text-sm px-3 py-1 rounded-full inline-block ${
            stats.total === 0
              ? 'bg-gray-100 text-gray-600'
              : stats.completionRate < 30
                ? 'bg-red-100 text-red-700'
                : stats.completionRate < 70
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
          }`}>
            {stats.total === 0
              ? 'Žádné úkoly'
              : stats.completionRate < 30
                ? 'Začínáme'
                : stats.completionRate < 70
                  ? 'V pokroku'
                  : 'Téměř hotovo'
            }
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          href="/tasks" 
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <List className="w-4 h-4" />
          <span>Spravovat úkoly</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
