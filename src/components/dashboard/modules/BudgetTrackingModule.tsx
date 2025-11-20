'use client'

import Link from 'next/link'
import { DollarSign, TrendingUp, AlertCircle, ArrowRight, Coins } from 'lucide-react'
import { useBudget } from '@/hooks/useBudget'
import { useCurrency } from '@/contexts/CurrencyContext'
import NumberCounter from '@/components/animations/NumberCounter'

export default function BudgetTrackingModule() {
  const { stats } = useBudget()
  const { formatCurrencyShort } = useCurrency()

  return (
    <div className="wedding-card h-[353px] flex flex-col">
      <Link href="/budget" className="block mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
          <span className="truncate">Rozpočet</span>
        </h3>
      </Link>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="space-y-3">
          {/* Budget Overview */}
          <div className="bg-primary-50 p-3 rounded-lg glass-morphism">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrencyShort(stats.totalBudget)}
              </div>
              <div className="text-sm text-primary-700">Celkový rozpočet</div>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary-100 rounded-lg mx-auto mb-1 float-enhanced">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" />
              </div>
              <div className="text-sm sm:text-lg font-bold text-gray-900">
                {formatCurrencyShort(stats.totalPaid)}
              </div>
              <div className="text-xs text-gray-500">Zaplaceno</div>
            </div>
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.3s' }}>
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" />
              </div>
              <div className="text-sm sm:text-lg font-bold text-gray-900">
                {formatCurrencyShort(stats.totalBudget - stats.totalPaid)}
              </div>
              <div className="text-xs text-gray-500">Zbývá</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex-shrink-0">
          <Link
            href="/budget"
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <DollarSign className="w-4 h-4" />
            <span>Spravovat rozpočet</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
