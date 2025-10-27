'use client'

import { useState } from 'react'
import { Calendar, CheckCircle, Wallet, UserPlus, Store, TrendingUp, Grip, GripVertical } from 'lucide-react'
import NumberCounter from '@/components/animations/NumberCounter'

interface DashboardModule {
  id: string
  title: string
  icon: any
  iconColor: string
  content: React.ReactNode
}

export default function InteractiveDashboardDemo() {
  const [modules, setModules] = useState<DashboardModule[]>([
    {
      id: 'countdown',
      title: 'Odpočet do svatby',
      icon: Calendar,
      iconColor: 'text-rose-500',
      content: (
        <div className="text-center">
          <div className="text-4xl font-bold text-rose-600 mb-1">
            <NumberCounter end={180} duration={2500} />
          </div>
          <div className="text-md text-gray-500">dní do velkého dne!</div>
        </div>
      )
    },
    {
      id: 'tasks',
      title: 'Pokrok úkolů',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-md text-gray-600">Dokončeno</span>
            <span className="text-md font-semibold text-emerald-600">
              <NumberCounter end={24} duration={2000} />/30
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
          </div>
        </div>
      )
    },
    {
      id: 'budget',
      title: 'Přehled rozpočtu',
      icon: Wallet,
      iconColor: 'text-orange-500',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-md text-gray-600">Utraceno</span>
            <span className="text-md font-semibold text-orange-600">420 000 Kč</span>
          </div>
          <div className="text-sm text-gray-500">z 500 000 Kč</div>
        </div>
      )
    },
    {
      id: 'rsvp',
      title: 'RSVP hostů',
      icon: UserPlus,
      iconColor: 'text-blue-500',
      content: (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">85</div>
            <div className="text-xs text-gray-500">Pozváno</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">72</div>
            <div className="text-xs text-gray-500">Potvrzeno</div>
          </div>
        </div>
      )
    },
    {
      id: 'vendors',
      title: 'Dodavatelé',
      icon: Store,
      iconColor: 'text-purple-500',
      content: (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Potvrzeno</span>
            <span className="font-semibold text-purple-600">8/10</span>
          </div>
          <div className="flex gap-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-purple-500 rounded-full"></div>
            ))}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-300 rounded-full"></div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'progress',
      title: 'Celkový pokrok',
      icon: TrendingUp,
      iconColor: 'text-rose-500',
      content: (
        <div className="text-center">
          <div className="text-4xl font-bold text-rose-600 mb-1">68%</div>
          <div className="text-sm text-gray-500">Připraveno na velký den</div>
        </div>
      )
    }
  ])

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    // Add a slight delay to allow the drag image to be set
    setTimeout(() => {
      const target = e.target as HTMLElement
      target.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null)
    setIsDragging(false)
    const target = e.target as HTMLElement
    target.style.opacity = '1'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newModules = [...modules]
    const [draggedModule] = newModules.splice(draggedIndex, 1)
    newModules.splice(dropIndex, 0, draggedModule)
    
    setModules(newModules)
    setDraggedIndex(null)
    setIsDragging(false)
  }

  return (
    <div className="relative">
      {/* Info banner */}
      <div className="mb-6 bg-gradient-to-r from-rose-50 to-purple-50 border border-rose-200 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Grip className="w-5 h-5 text-rose-600" />
          <span className="font-semibold text-gray-800">Zkuste si přesouvat moduly!</span>
        </div>
        <p className="text-sm text-gray-600">
          Uchopte modul za ikonu <GripVertical className="w-4 h-4 inline text-gray-400" /> a přetáhněte ho na nové místo
        </p>
      </div>

      {/* Dashboard preview */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-purple-500 px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">💍</span>
            </div>
            <span className="font-display text-lg md:text-xl lg:text-2xl font-bold text-white">SvatBot.cz</span>
          </div>
          <div className="text-white text-xs md:text-sm lg:text-lg font-medium hidden sm:block">Anna & Tomáš • 15. června 2025</div>
        </div>

        {/* Modules grid */}
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon
            return (
              <div
                key={module.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-200 cursor-move ${
                  isDragging && draggedIndex === index 
                    ? 'scale-105 shadow-2xl ring-2 ring-rose-400' 
                    : 'hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                {/* Drag handle + Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0" />
                    <h3 className="font-semibold text-gray-800 text-lg">{module.title}</h3>
                  </div>
                  <Icon className={`w-6 h-6 ${module.iconColor} flex-shrink-0`} />
                </div>

                {/* Content */}
                <div>{module.content}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Features below */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-white/50 rounded-lg border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Grip className="w-5 h-5 text-rose-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-1">Drag & Drop</h4>
          <p className="text-xs text-gray-600">Snadno přeuspořádejte moduly</p>
        </div>
        <div className="text-center p-4 bg-white/50 rounded-lg border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-1">Real-time Data</h4>
          <p className="text-xs text-gray-600">Okamžité aktualizace veškerého pokroku</p>
        </div>
        <div className="text-center p-4 bg-white/50 rounded-lg border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-1">Plně přizpůsobitelné</h4>
          <p className="text-xs text-gray-600">Upravte si dashboard podle svých potřeb</p>
        </div>
      </div>

      {/* Decorative badges */}
      <div className="absolute -top-6 -right-6 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm md:text-md font-medium shadow-xl rotate-3 hidden lg:block">
        ✓ Interaktivní demo
      </div>
      <div className="absolute -bottom-6 -left-6 bg-rose-500 text-white px-4 py-2 rounded-full text-sm md:text-md font-medium shadow-xl -rotate-3 hidden lg:block">
        🎯 Zkuste si to!
      </div>
    </div>
  )
}

