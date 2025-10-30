'use client'

import Link from 'next/link'
import { UtensilsCrossed, Wine, CheckCircle, Clock, ArrowRight, Leaf, Wheat } from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'
import { currencyUtils } from '@/utils'

export default function FoodDrinksModule() {
  const { stats } = useMenu()

  return (
    <div className="wedding-card">
      <Link href="/menu" className="block mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 flex-shrink-0" />
          <span className="truncate">Jídlo a Pití</span>
        </h3>
      </Link>

      <div className="space-y-4">
        {/* Cost Overview */}
        <div className="bg-primary-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary-600 mb-1">
            {currencyUtils.formatShort(stats.totalEstimatedCost)}
          </div>
          <div className="text-sm text-primary-700">Odhadované náklady</div>
        </div>

        {/* Items Count */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-1">
              <UtensilsCrossed className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.totalMenuItems}</div>
            <div className="text-xs text-gray-500">Jídel</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-1">
              <Wine className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.totalDrinkItems}</div>
            <div className="text-xs text-gray-500">Nápojů</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          href="/menu" 
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Spravovat menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

