'use client'

import Link from 'next/link'
import { Calendar, CheckCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'

export default function TimelinePlanningModule() {
  const { stats } = useCalendar()

  return (
    <div className="wedding-card">
      <Link href="/calendar" className="block mb-4">
        <h3 className="text-lg font-semibold flex items-center justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Calendar className="w-5 h-5 text-purple-600" />
          <span>Kalendář událostí</span>
        </h3>
      </Link>

      <div className="space-y-4">
        {/* Calendar Overview */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Celkem událostí</span>
            <span className="text-lg font-bold text-purple-600">{stats.totalEvents}</span>
          </div>
          <div className="text-xs text-purple-700 mt-1">
            {stats.todayEvents} dnes • {stats.thisWeekEvents} tento týden
          </div>
        </div>

        {/* Event Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.completedEvents}</div>
            <div className="text-xs text-gray-500">Hotovo</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.upcomingEvents}</div>
            <div className="text-xs text-gray-500">Nadcházející</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.overdueEvents}</div>
            <div className="text-xs text-gray-500">Po termínu</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          href="/calendar" 
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Zobrazit kalendář</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
