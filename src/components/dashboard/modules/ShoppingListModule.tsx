'use client'

import Link from 'next/link'
import { ShoppingCart, Package, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { useShopping } from '@/hooks/useShopping'
import { currencyUtils } from '@/utils'
import NumberCounter from '@/components/animations/NumberCounter'

export default function ShoppingListModule() {
  const { stats } = useShopping()

  return (
    <div className="wedding-card h-[353px] flex flex-col">
      <Link href="/shopping" className="block mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
          <span className="truncate">Nákupní seznam</span>
        </h3>
      </Link>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="space-y-3">
          {/* Shopping Overview */}
          <div className="bg-primary-50 p-3 rounded-lg glass-morphism">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                <NumberCounter end={stats.totalItems} duration={1800} />
              </div>
              <div className="text-sm text-primary-700">Produktů celkem</div>
            </div>
          </div>

          {/* Shopping Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-1 float-enhanced">
                <CheckCircle className="w-4 h-4 text-primary-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter end={stats.purchasedItems} duration={1500} />
              </div>
              <div className="text-xs text-gray-500">Zakoupeno</div>
            </div>
            <div className="text-center hover-lift">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-1 float-enhanced" style={{ animationDelay: '0.2s' }}>
                <Clock className="w-4 h-4 text-primary-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                <NumberCounter end={stats.pendingItems} duration={1500} />
              </div>
              <div className="text-xs text-gray-500">Zbývá koupit</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex-shrink-0">
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
    </div>
  )
}

