'use client'

import Link from 'next/link'
import { List, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import { useTask } from '@/hooks/useTask'
import NumberCounter from '@/components/animations/NumberCounter'

export default function TaskManagementModule() {
  const { stats } = useTask()

  return (
    <div className="wedding-card">
      <Link href="/tasks" className="block mb-4">
        <h3 className="text-lg font-semibold flex items-center justify-center space-x-2 hover:text-primary-600 transition-colors">
          <List className="w-5 h-5 text-blue-600" />
          <span>Správa úkolů</span>
        </h3>
      </Link>

      <div className="space-y-4">
        {/* Progress Overview */}
        <div className="bg-blue-50 p-4 rounded-lg glass-morphism">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Celkový pokrok</span>
            <span className="text-lg font-bold text-blue-600">
              <NumberCounter end={stats.completionRate} duration={1500} suffix="%" />
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <div className="text-xs text-blue-700 mt-1">
            <NumberCounter end={stats.completed} duration={1200} className="inline-block" /> z <NumberCounter end={stats.total} duration={1200} className="inline-block" /> úkolů dokončeno
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1 float-enhanced">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              <NumberCounter end={stats.completed} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Dokončeno</div>
          </div>
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              <NumberCounter end={stats.inProgress} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Probíhá</div>
          </div>
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.4s' }}>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              <NumberCounter end={stats.overdue} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Po termínu</div>
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
