'use client'

import Link from 'next/link'
import { Grid3X3, Users, Table, ArrowRight } from 'lucide-react'

export default function SeatingPlanModule() {
  // Mock data - replace with real seating hook when implemented
  const seatingStats = {
    totalTables: 0,
    assignedGuests: 0,
    unassignedGuests: 0,
    isComplete: false
  }

  return (
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Grid3X3 className="w-5 h-5 text-indigo-600" />
          <span>Rozmístění hostů</span>
        </h3>
        <Link href="/seating" className="text-sm text-primary-600 hover:underline">
          Otevřít
        </Link>
      </div>

      <div className="space-y-4">
        {/* Seating Overview */}
        <div className="bg-indigo-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-indigo-600 mb-1">{seatingStats.totalTables}</div>
          <div className="text-sm text-indigo-700">Stolů naplánováno</div>
        </div>

        {/* Assignment Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">{seatingStats.assignedGuests}</div>
            <div className="text-xs text-gray-500">Přiřazeno</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-1">
              <Table className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">{seatingStats.unassignedGuests}</div>
            <div className="text-xs text-gray-500">Nepřiřazeno</div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-2">Funkce</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Drag & drop editor</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Automatické rozmístění</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Export plánů</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <div className={`text-sm px-3 py-1 rounded-full inline-block ${
            seatingStats.totalTables === 0
              ? 'bg-gray-100 text-gray-600'
              : seatingStats.isComplete
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
          }`}>
            {seatingStats.totalTables === 0
              ? 'Nevytvořeno'
              : seatingStats.isComplete
                ? 'Dokončeno'
                : 'Rozpracováno'
            }
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
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
  )
}
