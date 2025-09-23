'use client'

import { useEffect, useState } from 'react'
import { PieChart as PieChartIcon } from 'lucide-react'
import { BUDGET_CATEGORIES } from '@/types/budget'

interface CategoryStat {
  key: string
  category: {
    name: string
    icon: string
    color: string
    defaultPercentage: number
    priority: string
  }
  budgeted: number
  actual: number
  paid: number
  remaining: number
  percentage: number
  isOverBudget: boolean
  itemCount: number
}

interface BudgetPieChartProps {
  categoryStats: CategoryStat[]
}

// Definice barev pro koláčový graf - inspirováno obrázkem
const CHART_COLORS = [
  '#F8BBD9', // světle růžová - největší segment (místo konání/catering)
  '#E4A853', // zlatá/oranžová
  '#F4A6A6', // světle červená/růžová
  '#D4A5A5', // tmavší růžová
  '#C8A2C8', // fialová
  '#B8B8B8', // šedá
  '#A8C8A8', // světle zelená
  '#98B8D8', // světle modrá
  '#E8C8A8', // béžová
  '#D8B8C8', // světle fialová
  '#C8D8B8', // světle zelená
  '#B8C8D8', // světle modrá
  '#F8D8B8', // světle oranžová
  '#D8C8B8', // béžová
  '#C8B8D8', // světle fialová
  '#B8D8C8', // světle zelená
  '#A8B8C8'  // světle modrá
]

export default function BudgetPieChart({ categoryStats }: BudgetPieChartProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Formátování měny
  const formatCurrency = (amount: number, currency: string = 'CZK') => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Příprava dat pro graf - používáme skutečné náklady (actual)
  const chartData = categoryStats
    .filter(stat => stat.actual > 0) // Zobrazujeme pouze kategorie s náklady
    .map((stat, index) => ({
      name: stat.category.name,
      value: stat.actual,
      percentage: stat.percentage,
      icon: stat.category.icon,
      color: CHART_COLORS[index % CHART_COLORS.length],
      paid: stat.paid,
      remaining: stat.remaining,
      isOverBudget: stat.isOverBudget
    }))
    .sort((a, b) => b.value - a.value) // Seřadíme podle hodnoty (největší první)

  // Pokud nejsou žádná data
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <PieChartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Žádná data pro zobrazení</p>
          <p className="text-sm">Přidejte položky do rozpočtu</p>
        </div>
      </div>
    )
  }

  // Výpočet úhlů pro SVG koláčový graf
  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  const slices = chartData.map((item, index) => {
    const percentage = (item.value / total) * 100
    const startAngle = cumulativePercentage * 3.6 // převod na stupně
    const endAngle = (cumulativePercentage + percentage) * 3.6

    cumulativePercentage += percentage

    // Výpočet SVG path pro segment
    const radius = 80
    const centerX = 100
    const centerY = 100

    const startAngleRad = (startAngle - 90) * (Math.PI / 180)
    const endAngleRad = (endAngle - 90) * (Math.PI / 180)

    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)

    const largeArcFlag = percentage > 50 ? 1 : 0

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')

    return {
      ...item,
      pathData,
      percentage: percentage.toFixed(1)
    }
  })

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <PieChartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Načítání grafu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">

      {/* SVG Koláčový graf */}
      <div className="flex justify-center mb-6">
        <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-sm">
          {slices.map((slice, index) => (
            <g key={index}>
              <path
                d={slice.pathData}
                fill={slice.color}
                stroke="#fff"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"

              />
            </g>
          ))}
        </svg>
      </div>

      {/* Legenda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-lg flex-shrink-0">{slice.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{slice.name}</p>
              <p className="text-xs text-gray-600">
                {formatCurrency(slice.value)} ({slice.percentage}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
