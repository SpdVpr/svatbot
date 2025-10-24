'use client'

import Link from 'next/link'
import { Grid3X3, Users, Table, ArrowRight } from 'lucide-react'
import { useSeating } from '@/hooks/useSeating'
import { useGuest } from '@/hooks/useGuest'
import NumberCounter from '@/components/animations/NumberCounter'

export default function SeatingPlanModule() {
  const { tables, seats, chairSeats, stats } = useSeating()
  const { guests } = useGuest()

  // Calculate assigned and unassigned guests - include both table seats and chair seats
  const assignedTableIds = seats.filter(s => s.guestId).map(s => s.guestId)
  const assignedChairIds = (chairSeats || []).filter(s => s.guestId).map(s => s.guestId)
  const assignedGuestIds = new Set([...assignedTableIds, ...assignedChairIds])
  const assignedGuests = assignedGuestIds.size
  const unassignedGuests = guests.filter(g => !assignedGuestIds.has(g.id)).length

  const seatingStats = {
    totalTables: tables.length,
    assignedGuests,
    unassignedGuests,
    isComplete: assignedGuests > 0 && unassignedGuests === 0
  }

  return (
    <div className="wedding-card">
      <Link href="/seating" className="block mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
          <span className="truncate">Zasedací pořádek</span>
        </h3>
      </Link>

      <div className="space-y-3 sm:space-y-4">
        {/* Seating Overview */}
        <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg text-center glass-morphism">
          <div className="text-xl sm:text-2xl font-bold text-indigo-600 mb-1">
            <NumberCounter end={seatingStats.totalTables} duration={1800} />
          </div>
          <div className="text-xs sm:text-sm text-indigo-700">Stolů naplánováno</div>
        </div>

        {/* Assignment Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1 float-enhanced">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">
              <NumberCounter end={seatingStats.assignedGuests} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Přiřazeno</div>
          </div>
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
              <Table className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">
              <NumberCounter end={seatingStats.unassignedGuests} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Nepřiřazeno</div>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
        <Link
          href="/seating"
          className="btn-primary w-full flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <Grid3X3 className="w-4 h-4" />
          <span>Vytvořit plán</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
