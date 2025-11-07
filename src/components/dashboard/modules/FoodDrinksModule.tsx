'use client'

import Link from 'next/link'
import { UtensilsCrossed, Wine, ArrowRight } from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'
import { currencyUtils } from '@/utils'

export default function FoodDrinksModule() {
  const { stats } = useMenu()

  return (
    <div className="wedding-card h-[353px] flex flex-col">
      <Link href="/menu" className="block mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
          <span className="truncate">Jídlo a Pití</span>
        </h3>
      </Link>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="space-y-3">
          {/* Cost Overview */}
          <div className="bg-primary-50 p-3 rounded-lg text-center glass-morphism">
            <div className="text-2xl font-bold text-primary-600">
              {currencyUtils.formatShort(stats.totalEstimatedCost)}
            </div>
            <div className="text-sm text-primary-700">Odhadované náklady</div>
          </div>

          {/* Items Count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-1 float-enhanced">
                <UtensilsCrossed className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">{stats.totalMenuItems}</div>
              <div className="text-xs text-gray-500">Jídel</div>
            </div>
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
                <Wine className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">{stats.totalDrinkItems}</div>
              <div className="text-xs text-gray-500">Nápojů</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex-shrink-0">
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
    </div>
  )
}

