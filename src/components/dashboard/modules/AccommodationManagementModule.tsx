'use client'

import Link from 'next/link'
import { Building2, Bed, Users, Calendar, ArrowRight, Plus } from 'lucide-react'
import { useAccommodationWithGuests } from '@/hooks/useAccommodationWithGuests'

export default function AccommodationManagementModule() {
  const { stats, accommodations, loading } = useAccommodationWithGuests()

  if (loading) {
    return (
      <div className="wedding-card">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-6 h-6" />
        </div>
      </div>
    )
  }

  return (
    <div className="wedding-card">
      <Link href="/accommodation" className="block mb-4">
        <h3 className="text-lg font-semibold flex items-center justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Building2 className="w-5 h-5 text-primary-600" />
          <span>Ubytování</span>
        </h3>
      </Link>

      {accommodations.length === 0 ? (
        // Empty state
        <div className="text-center py-6">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
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
        <div className="space-y-4">
          {/* Progress Overview */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary-900">Obsazenost pokojů</span>
              <span className="text-lg font-bold text-primary-600">{stats.occupancyRate}%</span>
            </div>
            <div className="w-full bg-primary-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.occupancyRate}%` }}
              />
            </div>
            <div className="text-xs text-primary-700 mt-1">
              {stats.occupiedRooms} z {stats.totalRooms} pokojů obsazeno
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">{stats.totalAccommodations}</div>
              <div className="text-xs text-gray-500">Ubytování</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
                <Bed className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">{stats.availableRooms}</div>
              <div className="text-xs text-gray-500">Dostupné</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-1">
                <Users className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">{stats.occupiedRooms}</div>
              <div className="text-xs text-gray-500">Obsazené</div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="text-center">
            <div className={`text-sm px-3 py-1 rounded-full inline-block ${
              stats.totalRooms === 0
                ? 'bg-gray-100 text-gray-600'
                : stats.occupancyRate < 30
                  ? 'bg-green-100 text-green-700'
                  : stats.occupancyRate < 70
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
            }`}>
              {stats.totalRooms === 0
                ? 'Žádné pokoje'
                : stats.occupancyRate < 30
                  ? 'Nízká obsazenost'
                  : stats.occupancyRate < 70
                    ? 'Střední obsazenost'
                    : 'Vysoká obsazenost'
              }
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
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
  )
}
