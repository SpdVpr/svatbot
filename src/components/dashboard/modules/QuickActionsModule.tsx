'use client'

import Link from 'next/link'
import { Zap, Plus, Users, DollarSign, ListChecks, Music, Briefcase } from 'lucide-react'

export default function QuickActionsModule() {
  const quickActions = [
    {
      icon: ListChecks,
      title: 'Svatební checklist',
      description: 'Předpřipravené úkoly',
      href: '/checklist',
      baseColor: 'bg-primary-400',
      hoverColor: 'hover:bg-primary-300'
    },
    {
      icon: Plus,
      title: 'Přidat úkol',
      description: 'Nový svatební úkol',
      href: '/tasks',
      baseColor: 'bg-primary-500',
      hoverColor: 'hover:bg-primary-400'
    },
    {
      icon: Users,
      title: 'Přidat hosta',
      description: 'Nový host na seznam',
      href: '/guests',
      baseColor: 'bg-primary-600',
      hoverColor: 'hover:bg-primary-500'
    },
    {
      icon: DollarSign,
      title: 'Přidat výdaj',
      description: 'Nová položka rozpočtu',
      href: '/budget',
      baseColor: 'bg-primary-700',
      hoverColor: 'hover:bg-primary-600'
    },
    {
      icon: Music,
      title: 'Přidat hudbu',
      description: 'Nová píseň do playlistu',
      href: '/music',
      baseColor: 'bg-primary-800',
      hoverColor: 'hover:bg-primary-700'
    },
    {
      icon: Briefcase,
      title: 'Přidat dodavatele',
      description: 'Nový dodavatel',
      href: '/vendors',
      baseColor: 'bg-primary-900',
      hoverColor: 'hover:bg-primary-800'
    }
  ]

  return (
    <div className="wedding-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <Zap className="w-5 h-5 text-primary-600" />
        <span>Rychlé akce</span>
      </h3>
      <div className="space-y-3">
        {quickActions.map((action, index) => (
          <Link
            key={action.title}
            href={action.href}
            className={`stagger-item flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md text-white ${action.baseColor} ${action.hoverColor}`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <action.icon className="w-5 h-5 float" />
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
