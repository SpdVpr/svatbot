'use client'

import Link from 'next/link'
import { Users, UserCheck, UserX, Mail, ArrowRight } from 'lucide-react'
import { useGuest } from '@/hooks/useGuest'
import NumberCounter from '@/components/animations/NumberCounter'

export default function GuestManagementModule() {
  const { stats } = useGuest()

  // Calculate response rate from available data
  const responseRate = stats.total > 0
    ? Math.round(((stats.attending + stats.declined + stats.maybe) / stats.total) * 100)
    : 0

  return (
    <div className="wedding-card h-[353px] flex flex-col">
      <Link href="/guests" className="block mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
          <span className="truncate">Správa hostů</span>
        </h3>
      </Link>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="space-y-3">
          {/* Guest Count */}
          <div className="bg-primary-50 p-3 rounded-lg text-center glass-morphism">
            <div className="text-2xl font-bold text-primary-600">
              <NumberCounter end={stats.total} duration={1800} />
            </div>
            <div className="text-sm text-primary-700">Celkem hostů</div>
          </div>

          {/* RSVP Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-1 float-enhanced">
                <UserCheck className="w-4 h-4 text-primary-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter end={stats.attending} duration={1500} />
              </div>
              <div className="text-xs text-gray-500">Přijde</div>
            </div>
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
                <UserX className="w-4 h-4 text-primary-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter end={stats.declined} duration={1500} />
              </div>
              <div className="text-xs text-gray-500">Nepřijde</div>
            </div>
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.4s' }}>
                <Mail className="w-4 h-4 text-primary-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter end={stats.pending} duration={1500} />
              </div>
              <div className="text-xs text-gray-500">Čeká</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex-shrink-0">
          <Link
            href="/guests"
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Spravovat hosty</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
