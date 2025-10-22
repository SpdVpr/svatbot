'use client'

import Link from 'next/link'
import { ShoppingCart, Package, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { useShopping } from '@/hooks/useShopping'
import { currencyUtils } from '@/utils'
import NumberCounter from '@/components/animations/NumberCounter'

export default function ShoppingListModule() {
  const { stats } = useShopping()

  return (
    <div className="wedding-card">
      <Link href="/shopping" className="block mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
          <span className="truncate">Nákupní seznam</span>
        </h3>
      </Link>

      <div className="space-y-4">
        {/* Shopping Overview */}
        <div className="bg-purple-50 p-4 rounded-lg glass-morphism">
          <div className="text-center mb-3">
            <div className="text-2xl font-bold text-purple-600">
              <NumberCounter end={stats.totalItems} duration={1800} />
            </div>
            <div className="text-sm text-purple-700">Produktů celkem</div>
          </div>

          {stats.totalValue > 0 && (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-purple-700">Zakoupeno</span>
                <span className="text-sm font-semibold text-purple-900">
                  <NumberCounter
                    end={stats.totalItems > 0 ? Math.round((stats.purchasedItems / stats.totalItems) * 100) : 0}
                    duration={1500}
                    suffix="%"
                  />
                </span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-purple-500 transition-all duration-300"
                  style={{
                    width: `${stats.totalItems > 0 ? (stats.purchasedItems / stats.totalItems) * 100 : 0}%`
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Shopping Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1 float-enhanced">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">
              <NumberCounter end={stats.purchasedItems} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Zakoupeno</div>
          </div>
          <div className="text-center hover-lift">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">
              <NumberCounter end={stats.pendingItems} duration={1500} />
            </div>
            <div className="text-xs text-gray-500">Zbývá koupit</div>
          </div>
        </div>

        {/* Price Stats */}
        {stats.totalValue > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-purple-100">
            <div className="text-center hover-lift">
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter
                  end={Math.round(stats.purchasedValue / 1000)}
                  duration={1800}
                  suffix="k Kč"
                />
              </div>
              <div className="text-xs text-gray-500">Zaplaceno</div>
            </div>
            <div className="text-center hover-lift">
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter
                  end={Math.round(stats.pendingValue / 1000)}
                  duration={1800}
                  suffix="k Kč"
                />
              </div>
              <div className="text-xs text-gray-500">Zbývá</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          href="/shopping" 
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Package className="w-4 h-4" />
          <span>Spravovat nákupy</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

