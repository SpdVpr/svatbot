'use client'

import Link from 'next/link'
import { Grid3X3, Users, Table, ArrowRight } from 'lucide-react'
import { useSeating } from '@/hooks/useSeating'

export default function SeatingPlanModule() {
  const { tables, seats, stats } = useSeating()

  const seatingStats = {
    totalTables: tables.length,
    assignedGuests: stats.assignedGuests,
    unassignedGuests: stats.unassignedGuests,
    isComplete: stats.assignedGuests > 0 && stats.unassignedGuests === 0
  }

  return (
    <div className="wedding-card">
      <Link href="/seating" className="block mb-4">
        <h3 className="text-lg font-semibold flex items-center justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Grid3X3 className="w-5 h-5 text-indigo-600" />
          <span>Zasedací pořádek</span>
        </h3>
      </Link>

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
