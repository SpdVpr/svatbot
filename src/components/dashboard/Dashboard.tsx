'use client'

import { useState } from 'react'
import { useWeddingStore } from '@/stores/weddingStore'
import { useAuth } from '@/hooks/useAuth'
import { useTask } from '@/hooks/useTask'
import { useGuest } from '@/hooks/useGuest'
import { useBudget } from '@/hooks/useBudget'
import { useTimeline } from '@/hooks/useTimeline'
import { dateUtils, currencyUtils, weddingUtils } from '@/utils'
import {
  Heart,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  MapPin,
  Camera,
  Music,
  Flower,
  LogOut,
  List,
  ArrowRight,
  Target,
  TrendingUp,
  AlertCircle,
  Star,
  Settings,
  Plus,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Gift,
  Home,
  Phone,
  Mail,
  Edit,
  Eye,
  Download,
  Share2,
  Grid3X3,
  Search
} from 'lucide-react'
import Link from 'next/link'
import WeddingSettings from '@/components/wedding/WeddingSettings'

export default function Dashboard() {
  const { currentWedding } = useWeddingStore()
  const { logout, user } = useAuth()
  const { tasks, stats } = useTask()
  const { guests, stats: guestStats } = useGuest()
  const { budgetItems, stats: budgetStats } = useBudget()
  const { milestones, stats: timelineStats, getDaysUntilWedding } = useTimeline()
  const [showWeddingSettings, setShowWeddingSettings] = useState(false)

  // Create mock wedding if none exists (for demo purposes)
  const wedding = currentWedding || {
    id: 'demo-wedding',
    userId: 'demo-user',
    brideName: 'Jana',
    groomName: 'Petr',
    weddingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    estimatedGuestCount: 85,
    budget: 450000,
    style: 'classic' as const,
    region: 'Praha',
    status: 'planning' as const,
    progress: {
      overall: 73,
      foundation: 100,
      venue: 85,
      guests: 80,
      budget: 65,
      design: 45,
      organization: 30,
      final: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  if (!wedding) {
    return (
      <div className="min-h-screen wedding-gradient flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="heading-3 mb-2">Načítáme vaši svatbu...</h2>
        </div>
      </div>
    )
  }

  const daysUntilWedding = wedding.weddingDate
    ? dateUtils.daysUntilWedding(wedding.weddingDate)
    : null

  // Main feature cards - all implemented phases
  const mainFeatures = [
    {
      icon: List,
      title: 'Task Management',
      subtitle: 'Úkoly a plánování',
      description: stats.total > 0 ? `${stats.completed}/${stats.total} dokončeno` : 'Spravujte svatební úkoly',
      value: stats.total > 0 ? `${stats.completionRate}%` : '0%',
      color: 'text-blue-600 bg-blue-100',
      href: '/tasks',
      status: stats.total > 0 ? 'active' : 'empty',
      features: ['Kategorizace úkolů', 'Prioritní systém', 'Deadline tracking', 'Progress monitoring']
    },
    {
      icon: Users,
      title: 'Guest Management',
      subtitle: 'Správa hostů',
      description: guestStats.total > 0 ? `${guestStats.attending}/${guestStats.total} potvrzeno` : 'Spravujte seznam hostů',
      value: guestStats.total > 0 ? `${guestStats.total}` : '0',
      color: 'text-primary-600 bg-primary-100',
      href: '/guests',
      status: guestStats.total > 0 ? 'active' : 'empty',
      features: ['RSVP systém', 'Kategorie hostů', 'Kontaktní údaje', 'Stravovací preference']
    },
    {
      icon: DollarSign,
      title: 'Budget Tracking',
      subtitle: 'Rozpočet svatby',
      description: budgetStats.totalBudget > 0 ? `${budgetStats.budgetUsed}% využito` : 'Sledujte svatební rozpočet',
      value: budgetStats.totalBudget > 0 ? `${Math.round(budgetStats.totalPaid / 1000)}k Kč` : '0 Kč',
      color: 'text-green-600 bg-green-100',
      href: '/budget',
      status: budgetStats.totalBudget > 0 ? 'active' : 'empty',
      features: ['Kategorie výdajů', 'Platební tracking', 'Budget alerts', 'Expense analytics']
    },
    {
      icon: Calendar,
      title: 'Timeline & Planning',
      subtitle: 'Časový plán',
      description: timelineStats.totalMilestones > 0 ? `${timelineStats.overallProgress}% dokončeno` : 'Plánujte svatební timeline',
      value: timelineStats.totalMilestones > 0 ? `${timelineStats.completedMilestones}/${timelineStats.totalMilestones}` : '0',
      color: 'text-purple-600 bg-purple-100',
      href: '/timeline',
      status: timelineStats.totalMilestones > 0 ? 'active' : 'empty',
      features: ['Milestone tracking', 'Template systém', 'Countdown timer', 'Period grouping']
    },
    {
      icon: Briefcase,
      title: 'Vendor Management',
      subtitle: 'Správa dodavatelů',
      description: '0 dodavatelů', // TODO: Get from vendor stats
      value: '0',
      color: 'text-orange-600 bg-orange-100',
      href: '/vendors',
      status: 'empty', // TODO: Update based on vendor count
      features: ['Kontakty dodavatelů', 'Smlouvy a platby', 'Hodnocení služeb', 'Komunikace']
    },
    {
      icon: Grid3X3,
      title: 'Seating Plan',
      subtitle: 'Rozmístění hostů',
      description: 'Uspořádejte stoly a přiřaďte hosty',
      value: 'Vytvořit',
      color: 'text-indigo-600 bg-indigo-100',
      href: '/seating',
      status: 'empty',
      features: ['Interaktivní editor', 'Auto-rozmístění', 'Drag & drop', 'Export plánů']
    },
    {
      icon: Mail,
      title: 'RSVP System',
      subtitle: 'Správa pozvánek',
      description: 'Odesílejte pozvánky a sledujte odpovědi',
      value: 'Spustit',
      color: 'text-blue-600 bg-blue-100',
      href: '/rsvp',
      status: 'empty',
      features: ['Email pozvánky', 'Auto-připomínky', 'Real-time stats', 'Šablony']
    }
  ]

  // Quick action buttons
  const quickActions = [
    {
      icon: Plus,
      title: 'Přidat úkol',
      description: 'Nový svatební úkol',
      href: '/tasks',
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: Users,
      title: 'Přidat hosta',
      description: 'Nový host na seznam',
      href: '/guests',
      color: 'text-primary-600 bg-primary-50 hover:bg-primary-100'
    },
    {
      icon: DollarSign,
      title: 'Přidar výdaj',
      description: 'Nová položka rozpočtu',
      href: '/budget',
      color: 'text-green-600 bg-green-50 hover:bg-green-100'
    },
    {
      icon: Search,
      title: 'Najít dodavatele',
      description: 'Procházet marketplace',
      href: '/marketplace',
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
    },
    {
      icon: Settings,
      title: 'Integrace',
      description: 'Calendar, email, analytics',
      href: '/integrations',
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
    }
  ]

  // Marketplace quick access
  const marketplaceCategories = [
    {
      icon: '📸',
      title: 'Fotografové',
      href: '/marketplace?category=photographer',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: '🏛️',
      title: 'Místa konání',
      href: '/marketplace?category=venue',
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      icon: '🍽️',
      title: 'Catering',
      href: '/marketplace?category=catering',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: '🎵',
      title: 'Hudba & DJ',
      href: '/marketplace?category=music',
      color: 'text-pink-600 bg-pink-50'
    }
  ]

  // Additional features (future phases)
  const additionalFeatures = [
    {
      icon: Camera,
      title: 'Photo & Video',
      subtitle: 'Foto a video',
      description: 'Galerie a dokumentace',
      status: 'coming-soon',
      color: 'text-pink-600 bg-pink-100'
    },
    {
      icon: Gift,
      title: 'Wedding Registry',
      subtitle: 'Seznam přání',
      description: 'Svatební seznam darů',
      status: 'coming-soon',
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      icon: MapPin,
      title: 'Venue & Logistics',
      subtitle: 'Místa a logistika',
      description: 'Správa míst a dopravy',
      status: 'coming-soon',
      color: 'text-teal-600 bg-teal-100'
    },
    {
      icon: Briefcase,
      title: 'Contract Management',
      subtitle: 'Správa smluv',
      description: 'Pokročilá správa smluv',
      status: 'coming-soon',
      color: 'text-orange-600 bg-orange-100'
    }
  ]

  // Get upcoming tasks from useTask hook
  const upcomingTasks = tasks
    .filter(task => !task.completedAt && task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3) // Show only first 3 upcoming tasks

  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'photography': return Camera
      case 'music': return Music
      case 'flowers': return Flower
      case 'venue': return MapPin
      default: return CheckCircle
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-desktop py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-primary-500" fill="currentColor" />
              <div>
                <button
                  onClick={() => setShowWeddingSettings(true)}
                  className="text-left hover:text-primary-600 transition-colors group"
                  title="Klikněte pro úpravu"
                >
                  <h1 className="heading-4 group-hover:text-primary-600 transition-colors">
                    Svatba {wedding.brideName} & {wedding.groomName}
                    <Edit className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h1>
                  <p className="body-small text-text-muted">
                    {wedding.weddingDate
                      ? `${dateUtils.format(wedding.weddingDate, 'dd. MMMM yyyy')} • Dnes: ${dateUtils.format(new Date(), 'dd. MMMM yyyy')}`
                      : 'Datum zatím nestanoveno - klikněte pro nastavení'
                    }
                  </p>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <p className="body-small text-text-muted">Přihlášen jako</p>
                <p className="body-small font-medium">{user?.displayName || user?.email}</p>
              </div>
              <button
                onClick={() => setShowWeddingSettings(true)}
                className="btn-outline flex items-center space-x-2"
                title="Nastavení svatby"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Nastavení</span>
              </button>
              <button
                onClick={logout}
                className="btn-outline flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Odhlásit</span>
              </button>
              <button className="btn-primary">
                <span className="hidden sm:inline">Pokračovat v plánování</span>
                <span className="sm:hidden">Plánovat</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-desktop py-8">
        <div className="space-y-8">
          {/* Hero Section with Enhanced Stats */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Wedding Countdown */}
            <div className="lg:col-span-2 wedding-card text-center">
              <div className="space-y-6">
                {daysUntilWedding !== null ? (
                  <div>
                    <div className="text-6xl font-bold text-primary-600 mb-2">
                      {daysUntilWedding > 0 ? daysUntilWedding : 0}
                    </div>
                    <p className="heading-4 text-text-primary">
                      {daysUntilWedding > 0
                        ? `dní do svatby`
                        : daysUntilWedding === 0
                          ? 'Svatba je dnes! 🎉'
                          : 'Svatba proběhla'
                      }
                    </p>
                    {daysUntilWedding > 0 && wedding.weddingDate && (
                      <p className="text-sm text-text-muted mt-2">
                        Od {dateUtils.format(new Date(), 'dd.MM.yyyy')} do {dateUtils.format(wedding.weddingDate, 'dd.MM.yyyy')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-4">📅</div>
                    <p className="heading-4 text-text-primary mb-4">
                      Nastavte datum svatby
                    </p>
                    <button
                      onClick={() => setShowWeddingSettings(true)}
                      className="btn-primary flex items-center space-x-2 mx-auto"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Nastavit datum</span>
                    </button>
                  </div>
                )}

                <div className="max-w-md mx-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="body-small text-text-muted">Celkový pokrok</span>
                    <span className="body-small font-semibold">{wedding.progress.overall}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${wedding.progress.overall}%` }}
                    />
                  </div>
                </div>

                <p className="body-normal text-text-secondary">
                  {wedding.progress.overall < 30
                    ? "Skvělý začátek! Pokračujte v základním plánování."
                    : wedding.progress.overall < 70
                      ? "Výborně! Máte za sebou většinu příprav."
                      : "Fantastické! Blížíte se k cíli."
                  }
                </p>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-text-muted">Úkolů</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{guestStats.total}</div>
                    <div className="text-sm text-text-muted">Hostů</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{Math.round(budgetStats.totalBudget / 1000)}k</div>
                    <div className="text-sm text-text-muted">Rozpočet</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{timelineStats.totalMilestones}</div>
                    <div className="text-sm text-text-muted">Milníků</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="wedding-card">
              <h3 className="heading-4 mb-4 flex items-center space-x-2">
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
          </div>

          {/* Main Features - All Implemented Phases */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-3 flex items-center space-x-2">
                <Activity className="w-6 h-6 text-primary-600" />
                <span>Hlavní funkce SvatBot.cz</span>
              </h2>
              <div className="flex items-center space-x-2 text-sm text-text-muted">
                <Award className="w-4 h-4" />
                <span>5 implementovaných modulů</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mainFeatures.map((feature) => (
                <Link key={feature.title} href={feature.href} className="wedding-card card-hover cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl ${feature.color} group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary group-hover:text-primary-600 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-text-muted">{feature.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-text-primary">
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

                  <p className="body-small text-text-muted mb-4">
                    {feature.description}
                  </p>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-2 gap-2">
                    {feature.features.map((featureItem, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs text-text-muted">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{featureItem}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-primary-600 group-hover:text-primary-700">
                      Otevřít modul
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Coming Soon Features */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-3 flex items-center space-x-2">
                <Star className="w-6 h-6 text-orange-600" />
                <span>Připravované funkce</span>
              </h2>
              <div className="flex items-center space-x-2 text-sm text-text-muted">
                <Clock className="w-4 h-4" />
                <span>Fáze 7+</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalFeatures.map((feature) => (
                <div key={feature.title} className="wedding-card opacity-75 cursor-not-allowed">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                      Brzy
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-muted mb-2">{feature.subtitle}</p>
                    <p className="body-small text-text-muted">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Upcoming Tasks */}
            <div className="lg:col-span-2">
              <div className="wedding-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="heading-4">Nadcházející úkoly</h2>
                  <Link href="/tasks" className="body-small text-primary-600 hover:underline">
                    Zobrazit všechny
                  </Link>
                </div>

                <div className="space-y-4">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.map((task) => {
                      const TaskIcon = getTaskIcon(task.category)
                      return (
                        <div
                          key={task.id}
                          className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer"
                        >
                          <div className="p-2 bg-primary-100 rounded-lg">
                            <TaskIcon className="w-5 h-5 text-primary-600" />
                          </div>

                          <div className="flex-1">
                            <h3 className="font-medium text-text-primary">
                              {task.title}
                            </h3>
                            <p className="body-small text-text-muted">
                              Termín: {task.dueDate ? dateUtils.format(new Date(task.dueDate)) : 'Bez termínu'}
                            </p>
                          </div>

                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                          }`}>
                            {task.priority === 'high' ? 'Vysoká' :
                             task.priority === 'medium' ? 'Střední' : 'Nízká'}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Zatím nemáte žádné nadcházející úkoly</p>
                      <Link href="/tasks" className="btn-primary">
                        Přidat první úkol
                      </Link>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link href="/tasks" className="btn-primary w-full block text-center">
                    Spravovat úkoly
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Progress & Stats */}
            <div className="space-y-6">
              {/* Marketplace Quick Access */}
              <div className="wedding-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading-4">Najít dodavatele</h3>
                  <Link href="/marketplace" className="body-small text-primary-600 hover:underline">
                    Zobrazit všechny
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {marketplaceCategories.map((category, index) => (
                    <Link
                      key={index}
                      href={category.href}
                      className={`p-3 rounded-lg transition-colors hover:scale-105 ${category.color}`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{category.icon}</div>
                        <div className="text-xs font-medium">{category.title}</div>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link href="/marketplace" className="btn-outline w-full block text-center">
                  Procházet marketplace
                </Link>
              </div>

              {/* Phase Progress */}
              <div className="wedding-card">
                <h3 className="heading-4 mb-4">Pokrok podle fází</h3>

                <div className="space-y-4">
                  {[
                    { key: 'foundation', label: 'Základy', progress: wedding.progress.foundation },
                    { key: 'venue', label: 'Místo konání', progress: wedding.progress.venue },
                    { key: 'guests', label: 'Hosté', progress: wedding.progress.guests },
                    { key: 'budget', label: 'Rozpočet', progress: wedding.progress.budget },
                    { key: 'design', label: 'Design', progress: wedding.progress.design },
                    { key: 'organization', label: 'Organizace', progress: wedding.progress.organization },
                    { key: 'final', label: 'Finální', progress: wedding.progress.final }
                  ].map((phase) => (
                    <div key={phase.key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="body-small text-text-secondary">
                          {phase.label}
                        </span>
                        <span className="body-small font-medium">
                          {phase.progress}%
                        </span>
                      </div>
                      <div className="progress-bar h-1">
                        <div
                          className="progress-fill h-1"
                          style={{ width: `${phase.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="wedding-card">
                <h3 className="heading-4 mb-4">Rychlé statistiky</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="body-small text-text-muted">Styl svatby</span>
                    <span className="body-small font-medium">
                      {weddingUtils.getWeddingStyleLabel(wedding.style)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="body-small text-text-muted">Rozpočet</span>
                    <span className="body-small font-medium">
                      {currencyUtils.formatShort(wedding.budget)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="body-small text-text-muted">Region</span>
                    <span className="body-small font-medium">
                      {wedding.region}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="body-small text-text-muted">Fáze plánování</span>
                    <span className="body-small font-medium">
                      {wedding.weddingDate
                        ? weddingUtils.getPhaseLabel(dateUtils.getWeddingPhase(wedding.weddingDate))
                        : 'Základy'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Wedding Settings Modal */}
      {showWeddingSettings && (
        <WeddingSettings
          onClose={() => setShowWeddingSettings(false)}
          onSave={() => {
            // Refresh the page or update state as needed
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
