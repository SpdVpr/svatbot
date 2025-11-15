'use client'

import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'

export default function MarketplaceModule() {
  const marketplaceCategories = [
    {
      icon: '📸',
      title: 'Fotografové',
      href: '/marketplace?category=photographer'
    },
    {
      icon: '🏛️',
      title: 'Místa konání',
      href: '/marketplace?category=venue'
    },
    {
      icon: '🍽️',
      title: 'Catering',
      href: '/marketplace?category=catering'
    },
    {
      icon: '🎵',
      title: 'Hudba & DJ',
      href: '/marketplace?category=music'
    }
  ]

  return (
    <div className="wedding-card h-[353px] flex flex-col">
      <Link href="/marketplace" className="block mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
          <span className="truncate">Najít dodavatele</span>
        </h3>
      </Link>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="grid grid-cols-2 gap-3">
          {marketplaceCategories.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="p-3 rounded-lg transition-all hover:scale-105 bg-primary-50 text-primary-600 hover:bg-primary-100"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="text-xs font-medium">{category.title}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-200 flex-shrink-0">
          <Link
            href="/marketplace"
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Procházet marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
