'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Menu, Search } from 'lucide-react'
import {
  CheckSquare,
  Users,
  DollarSign,
  Calendar,
  Briefcase,
  Users2,
  UtensilsCrossed,
  Music,
  Palette,
  ListChecks,
  Globe,
  Building2,
  ShoppingCart,
  MapPin
} from 'lucide-react'
import { getViewTransitionName } from '@/hooks/useViewTransition'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    category: 'Hlavní',
    items: [
      { icon: CheckSquare, label: 'Úkoly', href: '/tasks', color: 'text-blue-600', bg: 'bg-blue-50' },
      { icon: Users, label: 'Hosté', href: '/guests', color: 'text-pink-600', bg: 'bg-pink-50' },
      { icon: DollarSign, label: 'Rozpočet', href: '/budget', color: 'text-green-600', bg: 'bg-green-50' },
      { icon: Calendar, label: 'Kalendář', href: '/calendar', color: 'text-purple-600', bg: 'bg-purple-50' }
    ]
  },
  {
    category: 'Plánování',
    items: [
      { icon: Briefcase, label: 'Dodavatelé', href: '/vendors', color: 'text-orange-600', bg: 'bg-orange-50' },
      { icon: Users2, label: 'Zasedací pořádek', href: '/seating', color: 'text-cyan-600', bg: 'bg-cyan-50' },
      { icon: Calendar, label: 'Svatební den', href: '/svatebni-den', color: 'text-purple-600', bg: 'bg-purple-50' },
      { icon: UtensilsCrossed, label: 'Menu', href: '/menu', color: 'text-red-600', bg: 'bg-red-50' }
    ]
  },
  {
    category: 'Kreativní',
    items: [
      { icon: Music, label: 'Hudba', href: '/music', color: 'text-purple-600', bg: 'bg-purple-50' },
      { icon: Palette, label: 'Moodboard', href: '/moodboard', color: 'text-pink-600', bg: 'bg-pink-50' },
      { icon: Globe, label: 'Svatební web', href: '/wedding-website', color: 'text-purple-600', bg: 'bg-purple-50' }
    ]
  },
  {
    category: 'Organizace',
    items: [
      { icon: ListChecks, label: 'Checklist', href: '/checklist', color: 'text-violet-600', bg: 'bg-violet-50' },
      { icon: Building2, label: 'Ubytování', href: '/accommodation', color: 'text-teal-600', bg: 'bg-teal-50' },
      { icon: ShoppingCart, label: 'Nákupy', href: '/shopping', color: 'text-amber-600', bg: 'bg-amber-50' },
      { icon: MapPin, label: 'Marketplace', href: '/marketplace', color: 'text-primary-600', bg: 'bg-primary-50' }
    ]
  }
]

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter menu items based on search
  const filteredCategories = menuItems.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  // Zabránit scrollování pozadí když je menu otevřené
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with View Transition */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[150] sm:hidden backdrop-blur-sm"
        style={getViewTransitionName('mobile-menu-backdrop')}
        onClick={onClose}
      />

      {/* Slide-in Menu with View Transition */}
      <div
        className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl z-[150] sm:hidden transform transition-transform duration-300 ease-in-out"
        style={getViewTransitionName('mobile-menu-sidebar')}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center space-x-2">
            <Menu className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat modul..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Menu Items - Add padding bottom for last item visibility */}
        <div className="overflow-y-auto h-[calc(100vh-140px)] p-4 pb-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Žádné výsledky pro "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.map((category, idx) => (
                <div key={idx}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {category.category}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map((item, itemIdx) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={itemIdx}
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            {item.label}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

