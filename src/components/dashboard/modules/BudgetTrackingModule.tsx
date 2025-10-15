'use client'

import Link from 'next/link'
import { DollarSign, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react'
import { useBudget } from '@/hooks/useBudget'
import { currencyUtils } from '@/utils'
import NumberCounter from '@/components/animations/NumberCounter'

export default function BudgetTrackingModule() {
  const { stats } = useBudget()

  return (
    <div className="wedding-card">
      <Link href="/budget" className="block mb-4">
        <h3 className="text-lg font-semibold flex items-center justify-center space-x-2 hover:text-primary-600 transition-colors">
          <span className="text-green-600 font-bold">Kč</span>
          <span>Rozpočet</span>
        </h3>
      </Link>

      <div className="space-y-4">
        {/* Budget Overview */}
        <div className="bg-green-50 p-4 rounded-lg glass-morphism">
          <div className="text-center mb-3">
            <div className="text-2xl font-bold text-green-600">
              <NumberCounter
                end={Math.round(stats.totalBudget / 1000)}
                duration={2000}
                suffix="k Kč"
                className="inline-block"
              />
            </div>
            <div className="text-sm text-green-700">Celkový rozpočet</div>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-green-700">Využito</span>
            <span className="text-sm font-semibold text-green-900">
              <NumberCounter end={stats.budgetUsed} duration={1500} suffix="%" />
            </span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                stats.budgetUsed > 90 ? 'bg-red-500' :
                stats.budgetUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(stats.budgetUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1 float-enhanced">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">
              <NumberCounter
                end={Math.round(stats.totalPaid / 1000)}
                duration={1800}
                suffix="k Kč"
                className="inline-block"
              />
            </div>
            <div className="text-xs text-gray-500">Zaplaceno</div>
          </div>
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.3s' }}>
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">
              <NumberCounter
                end={Math.round((stats.totalBudget - stats.totalPaid) / 1000)}
                duration={1800}
                suffix="k Kč"
                className="inline-block"
              />
            </div>
            <div className="text-xs text-gray-500">Zbývá</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
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
  )
}
