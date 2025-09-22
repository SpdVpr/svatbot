'use client'

import Link from 'next/link'
import { Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { useTimeline } from '@/hooks/useTimeline'

export default function TimelinePlanningModule() {
  const { stats } = useTimeline()

  return (
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <span>Časový plán</span>
        </h3>
        <Link href="/timeline" className="text-sm text-primary-600 hover:underline">
          Otevřít
        </Link>
      </div>

      <div className="space-y-4">
        {/* Timeline Progress */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Pokrok milníků</span>
            <span className="text-lg font-bold text-purple-600">{stats.overallProgress}%</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
          <div className="text-xs text-purple-700 mt-1">
            {stats.completedMilestones} z {stats.totalMilestones} milníků dokončeno
          </div>
        </div>

        {/* Milestone Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.completedMilestones}</div>
            <div className="text-xs text-gray-500">Dokončeno</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.totalMilestones - stats.completedMilestones}</div>
            <div className="text-xs text-gray-500">Zbývá</div>
          </div>
        </div>

        {/* Current Phase */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-1">Aktuální fáze</div>
          <div className="text-xs text-gray-600">
            {stats.totalMilestones === 0
              ? 'Žádné milníky'
              : stats.overallProgress < 20
                ? 'Základní plánování'
                : stats.overallProgress < 50
                  ? 'Hlavní přípravy'
                  : stats.overallProgress < 80
                    ? 'Finální detaily'
                    : 'Dokončování'
            }
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <div className={`text-sm px-3 py-1 rounded-full inline-block ${
            stats.totalMilestones === 0
              ? 'bg-gray-100 text-gray-600'
              : stats.overallProgress < 30
                ? 'bg-red-100 text-red-700'
                : stats.overallProgress < 70
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
          }`}>
            {stats.totalMilestones === 0
              ? 'Naplánováno'
              : stats.overallProgress < 30
                ? 'Začínáme'
                : stats.overallProgress < 70
                  ? 'Pokračujeme'
                  : 'Téměř hotovo'
            }
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          href="/timeline" 
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Spravovat timeline</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
