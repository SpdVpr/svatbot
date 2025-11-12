'use client'

import Link from 'next/link'
import { Building2, Bed, Users, ArrowRight, Plus } from 'lucide-react'
import { useAccommodationWithGuests } from '@/hooks/useAccommodationWithGuests'

export default function AccommodationManagementModule() {
  const { stats, accommodations, loading } = useAccommodationWithGuests()

  return (
    <div className="wedding-card h-[353px] flex flex-col">
      <Link href="/accommodation" className="block mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
          <span className="truncate">Ubytování</span>
        </h3>
      </Link>

      {accommodations.length === 0 ? (
        // Empty state
        <div className="flex-1 flex flex-col justify-center items-center text-center py-6">
          <Building2 className="w-12 h-12 text-gray-300 mb-3" />
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Žádné ubytování
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            Přidejte ubytování pro vaše hosty
          </p>
          <Link
            href="/accommodation"
            className="inline-flex items-center gap-1 bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Přidat ubytování
          </Link>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between min-h-0">
          <div className="space-y-3">
            {/* Progress Overview */}
            <div className="bg-primary-50 p-2 rounded-lg glass-morphism text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary-600 mb-1">
                {stats.occupancyRate}%
              </div>
              <div className="text-xs sm:text-sm text-primary-700">Obsazenost pokojů</div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center hover-lift">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1 float-enhanced">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm font-bold text-gray-900">{stats.totalAccommodations}</div>
                <div className="text-xs text-gray-500">Ubytování</div>
              </div>
              <div className="text-center hover-lift">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
                  <Bed className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-sm font-bold text-gray-900">{stats.availableRooms}</div>
                <div className="text-xs text-gray-500">Dostupné</div>
              </div>
              <div className="text-center hover-lift">
                <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.4s' }}>
                  <Users className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-sm font-bold text-gray-900">{stats.occupiedRooms}</div>
                <div className="text-xs text-gray-500">Obsazené</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex-shrink-0">
            <Link
              href="/accommodation"
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Spravovat ubytování</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

