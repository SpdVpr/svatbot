'use client'

import Link from 'next/link'
import {
  List,
  Users,
  DollarSign,
  Calendar,
  Briefcase,
  Grid3X3,
  Mail,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { useTask } from '@/hooks/useTask'
import { useGuest } from '@/hooks/useGuest'
import { useBudget } from '@/hooks/useBudget'
import { useCalendar } from '@/hooks/useCalendar'
import { useCurrency } from '@/contexts/CurrencyContext'

export default function MainFeaturesModule() {
  const { stats } = useTask()
  const { stats: guestStats } = useGuest()
  const { stats: budgetStats } = useBudget()
  const { stats: calendarStats } = useCalendar()
  const { formatCurrencyShort } = useCurrency()

  const mainFeatures = [
    {
      icon: List,
      title: 'Task Management',
      subtitle: 'Úkoly a plánování',
      description: stats.total > 0 ? `${stats.completed}/${stats.total} dokončeno` : 'Spravujte svatební úkoly',
      value: stats.total > 0 ? `${stats.completionRate}%` : '0%',
      color: 'text-blue-600 bg-blue-100',
      href: '/tasks',
      status: stats.total > 0 ? 'active' : 'empty'
    },
    {
      icon: Users,
      title: 'Guest Management',
      subtitle: 'Správa hostů',
      description: guestStats.total > 0 ? `${guestStats.attending}/${guestStats.total} potvrzeno` : 'Spravujte seznam hostů',
      value: guestStats.total > 0 ? `${guestStats.total}` : '0',
      color: 'text-primary-600 bg-primary-100',
      href: '/guests',
      status: guestStats.total > 0 ? 'active' : 'empty'
    },
    {
      icon: DollarSign,
      title: 'Budget Tracking',
      subtitle: 'Rozpočet svatby',
      description: budgetStats.totalBudget > 0 ? `${budgetStats.budgetUsed}% využito` : 'Sledujte svatební rozpočet',
      value: budgetStats.totalBudget > 0 ? formatCurrencyShort(budgetStats.totalPaid) : formatCurrencyShort(0),
      color: 'text-green-600 bg-green-100',
      href: '/budget',
      status: budgetStats.totalBudget > 0 ? 'active' : 'empty'
    },
    {
      icon: Calendar,
      title: 'Kalendář událostí',
      subtitle: 'Všechny události',
      description: calendarStats.totalEvents > 0 ? `${calendarStats.todayEvents} dnes` : 'Spravujte všechny události',
      value: calendarStats.totalEvents > 0 ? `${calendarStats.totalEvents}` : '0',
      color: 'text-purple-600 bg-purple-100',
      href: '/calendar',
      status: calendarStats.totalEvents > 0 ? 'active' : 'empty'
    },
    {
      icon: Briefcase,
      title: 'Vendor Management',
      subtitle: 'Správa dodavatelů',
      description: '0 dodavatelů',
      value: '0',
      color: 'text-orange-600 bg-orange-100',
      href: '/vendors',
      status: 'empty'
    },
    {
      icon: Grid3X3,
      title: 'Seating Plan',
      subtitle: 'Zasedací pořádek',
      description: 'Uspořádejte stoly a přiřaďte hosty',
      value: 'Vytvořit',
      color: 'text-indigo-600 bg-indigo-100',
      href: '/seating',
      status: 'empty'
    }
  ]

  return (
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Hlavní funkce</h3>
        <div className="text-sm text-gray-500">
          {mainFeatures.filter(f => f.status === 'active').length} aktivních
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mainFeatures.map((feature) => (
          <Link 
            key={feature.title} 
            href={feature.href} 
            className="group p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-500">{feature.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {feature.value}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  feature.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {feature.status === 'active' ? 'Aktivní' : 'Prázdný'}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              {feature.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-600 group-hover:text-primary-700">
                Otevřít modul
              </span>
              <ArrowRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
