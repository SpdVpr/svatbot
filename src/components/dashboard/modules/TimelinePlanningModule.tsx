'use client'

import Link from 'next/link'
import { Calendar, CheckCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import NumberCounter from '@/components/animations/NumberCounter'

export default function TimelinePlanningModule() {
  const { stats } = useCalendar()

  return (
    <div className="wedding-card">
      <Link href="/calendar" className="block mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
          <span className="truncate">Kalendář událostí</span>
        </h3>
      </Link>

      <div className="space-y-3 sm:space-y-4">
        {/* Calendar Overview */}
        <div className="bg-primary-50 p-3 rounded-lg glass-morphism">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-primary-900">Celkem událostí</span>
            <span className="text-base sm:text-lg font-bold text-primary-600">
              <NumberCounter end={stats.totalEvents} duration={1800} />
            </span>
          </div>
          <div className="text-xs text-primary-700 mt-1">
            <NumberCounter end={stats.todayEvents} duration={1200} className="inline-block" /> dnes • <NumberCounter end={stats.thisWeekEvents} duration={1200} className="inline-block" /> tento týden
          </div>
        </div>

        {/* Event Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg mx-auto mb-1 float-enhanced">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
            </div>
            <div className="text-sm sm:text-lg font-bold text-gray-900">
              <NumberCounter end={stats.completedEvents} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Hotovo</div>
          </div>
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <div className="text-sm sm:text-lg font-bold text-gray-900">
              <NumberCounter end={stats.upcomingEvents} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Nadcházející</div>
          </div>
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.4s' }}>
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
            </div>
            <div className="text-sm sm:text-lg font-bold text-gray-900">
              <NumberCounter end={stats.overdueEvents} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Po termínu</div>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
        <Link
          href="/calendar"
          className="btn-primary w-full flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <Calendar className="w-4 h-4" />
          <span>Zobrazit kalendář</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
