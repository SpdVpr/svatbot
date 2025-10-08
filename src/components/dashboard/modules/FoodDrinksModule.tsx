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
        <h3 className="text-lg font-semibold flex items-center justify-center space-x-2 hover:text-primary-600 transition-colors">
          <UtensilsCrossed className="w-5 h-5 text-pink-600" />
          <span>Jídlo a Pití</span>
        </h3>
      </Link>

      <div className="space-y-4">
        {/* Cost Overview */}
        <div className="bg-pink-50 p-4 rounded-lg">
          <div className="text-center mb-3">
            <div className="text-2xl font-bold text-pink-600">
              {currencyUtils.formatShort(stats.totalEstimatedCost)}
            </div>
            <div className="text-sm text-pink-700">Odhadované náklady</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            <div>
              <div className="font-bold text-gray-900">{stats.totalMenuItems}</div>
              <div className="text-xs text-gray-600">Jídel</div>
            </div>
            <div>
              <div className="font-bold text-gray-900">{stats.totalDrinkItems}</div>
              <div className="text-xs text-gray-600">Nápojů</div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-2">Stav příprav</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                Potvrzeno
              </span>
              <span className="font-semibold text-gray-900">{stats.confirmedItems}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 flex items-center">
                <Clock className="w-3 h-3 mr-1 text-yellow-600" />
                Plánováno
              </span>
              <span className="font-semibold text-gray-900">{stats.plannedItems}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="text-center">
          <div className={`text-sm px-3 py-1 rounded-full inline-block ${
            stats.totalMenuItems === 0 && stats.totalDrinkItems === 0
              ? 'bg-gray-100 text-gray-600'
              : stats.confirmedItems === 0
                ? 'bg-yellow-100 text-yellow-700'
                : stats.confirmedItems < (stats.totalMenuItems + stats.totalDrinkItems) / 2
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
          }`}>
            {stats.totalMenuItems === 0 && stats.totalDrinkItems === 0
              ? 'Žádné položky'
              : stats.confirmedItems === 0
                ? 'Plánování menu'
                : stats.confirmedItems < (stats.totalMenuItems + stats.totalDrinkItems) / 2
                  ? 'Probíhá výběr'
                  : 'Menu připraveno'
            }
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

