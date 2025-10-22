'use client'

import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import NumberCounter from '@/components/animations/NumberCounter'

export default function MarketplaceModule() {
  const marketplaceCategories = [
    {
      icon: '📸',
      title: 'Fotografové',
      href: '/marketplace?category=photographer',
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: '🏛️',
      title: 'Místa konání',
      href: '/marketplace?category=venue',
      color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
    },
    {
      icon: '🍽️',
      title: 'Catering',
      href: '/marketplace?category=catering',
      color: 'text-green-600 bg-green-50 hover:bg-green-100'
    },
    {
      icon: '🎵',
      title: 'Hudba & DJ',
      href: '/marketplace?category=music',
      color: 'text-pink-600 bg-pink-50 hover:bg-pink-100'
    },
    {
      icon: '💐',
      title: 'Květiny',
      href: '/marketplace?category=flowers',
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
    },
    {
      icon: '🚗',
      title: 'Doprava',
      href: '/marketplace?category=transport',
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
    }
  ]

  return (
    <div className="wedding-card">
      <Link href="/marketplace" className="block mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
          <span className="truncate">Najít dodavatele</span>
        </h3>
      </Link>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {marketplaceCategories.map((category, index) => (
          <Link
            key={index}
            href={category.href}
            className={`p-3 rounded-lg transition-all hover:scale-105 ${category.color}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{category.icon}</div>
              <div className="text-xs font-medium">{category.title}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        <div className="bg-gray-50 p-3 rounded-lg glass-morphism hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Doporučení pro vás</div>
              <div className="text-xs text-gray-500">Založeno na vašem rozpočtu a stylu</div>
            </div>
            <div className="text-lg font-bold text-primary-600">
              <NumberCounter end={12} duration={1500} />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg glass-morphism hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-900">Nové dodavatelé</div>
              <div className="text-xs text-blue-600">Přidáno tento týden</div>
            </div>
            <div className="text-lg font-bold text-blue-600">
              <NumberCounter end={5} duration={1500} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          href="/marketplace" 
          className="btn-outline w-full flex items-center justify-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Procházet marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
