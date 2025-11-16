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
    <div className="wedding-card h-[353px] flex flex-col">
      <Link href="/seating" className="block mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
          <span className="truncate">Zasedací pořádek</span>
        </h3>
      </Link>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="space-y-3">
          {/* Seating Overview */}
          <div className="bg-primary-50 p-3 rounded-lg text-center glass-morphism">
            <div className="text-2xl font-bold text-primary-600">
              <NumberCounter end={seatingStats.totalTables} duration={1800} />
            </div>
            <div className="text-sm text-primary-700">Stolů naplánováno</div>
          </div>

          {/* Assignment Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-1 float-enhanced">
                <Users className="w-4 h-4 text-primary-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter end={seatingStats.assignedGuests} duration={1500} />
              </div>
              <div className="text-xs text-gray-500">Přiřazeno</div>
            </div>
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
                <Table className="w-4 h-4 text-primary-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter end={seatingStats.unassignedGuests} duration={1500} />
              </div>
              <div className="text-xs text-gray-500">Nepřiřazeno</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex-shrink-0">
          <Link
            href="/seating"
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Vytvořit plán</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
