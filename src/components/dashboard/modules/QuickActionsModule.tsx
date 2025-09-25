'use client'

import Link from 'next/link'
import { Zap, Plus, Users, DollarSign, Search, Bot } from 'lucide-react'

export default function QuickActionsModule() {
  const quickActions = [
    {
      icon: Plus,
      title: 'Přidat úkol',
      description: 'Nový svatební úkol',
      href: '/tasks',
      color: 'text-white bg-blue-600 hover:bg-blue-500'
    },
    {
      icon: Users,
      title: 'Přidat hosta',
      description: 'Nový host na seznam',
      href: '/guests',
      color: 'text-white bg-primary-600 hover:bg-primary-500'
    },
    {
      icon: DollarSign,
      title: 'Přidat výdaj',
      description: 'Nová položka rozpočtu',
      href: '/budget',
      color: 'text-white bg-green-600 hover:bg-green-500'
    },
    {
      icon: Search,
      title: 'Najít dodavatele',
      description: 'Procházet marketplace',
      href: '/marketplace',
      color: 'text-white bg-purple-600 hover:bg-purple-500'
    },
    {
      icon: Bot,
      title: 'AI Asistent',
      description: 'Inteligentní pomoc',
      href: '/ai',
      color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
    }
  ]

  return (
    <div className="wedding-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <Zap className="w-5 h-5 text-primary-600" />
        <span>Rychlé akce</span>
      </h3>
      <div className="space-y-3">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${action.color}`}
          >
            <action.icon className="w-5 h-5" />
            <div>
              <div className="font-medium text-sm">{action.title}</div>
              <div className="text-xs opacity-75">{action.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
