'use client'

import { useBudget } from '@/hooks/useBudget'
import { BUDGET_CATEGORIES } from '@/types/budget'
import BudgetPieChart from './BudgetPieChart'
import BudgetList from './BudgetList'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PieChart,
  BarChart3,
  Target,
  CreditCard
} from 'lucide-react'

interface BudgetStatsProps {
  compact?: boolean
  showProgress?: boolean
  showBudgetList?: boolean
  onCreateItem?: () => void
  onEditItem?: (item: any) => void
}

export default function BudgetStats({
  compact = false,
  showProgress = true,
  showBudgetList = true,
  onCreateItem,
  onEditItem
}: BudgetStatsProps) {
  const { budgetItems, stats } = useBudget()

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'CZK') => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Calculate category stats
  const categoryStats = Object.entries(BUDGET_CATEGORIES).map(([key, category]) => {
    const categoryItems = budgetItems.filter(item => item.category === key)
    const budgeted = categoryItems.reduce((sum, item) => sum + item.budgetedAmount, 0)
    const actual = categoryItems.reduce((sum, item) => sum + item.actualAmount, 0)
    const paid = categoryItems.reduce((sum, item) => sum + item.paidAmount, 0)

    return {
      key,
      category,
      budgeted,
      actual,
      paid,
      remaining: actual - paid,
      percentage: stats.totalBudget > 0 ? (budgeted / stats.totalBudget) * 100 : 0,
      isOverBudget: actual > budgeted,
      itemCount: categoryItems.length
    }
  }).filter(stat => stat.itemCount > 0 || stat.budgeted > 0)

  // Get budget health color
  const getBudgetHealthColor = (percentage: number) => {
    if (percentage <= 80) return 'text-green-600 bg-green-100'
    if (percentage <= 95) return 'text-yellow-600 bg-yellow-100'
    if (percentage <= 100) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total budget */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
              <p className="text-sm text-text-muted">Předběžná částka</p>
            </div>
          </div>
        </div>

        {/* Total spent */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalActual)}</p>
              <p className="text-sm text-text-muted">Skutečnost</p>
            </div>
          </div>
        </div>

        {/* Total paid */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
              <p className="text-sm text-text-muted">Zaplaceno</p>
            </div>
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRemaining)}</p>
              <p className="text-sm text-text-muted">Zbývá</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total budget */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Celková předběžná částka</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalBudget)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-text-muted">
              {budgetItems.length} položek
            </span>
          </div>
        </div>

        {/* Total actual */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Skutečné náklady</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{formatCurrency(stats.totalActual)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`font-medium ${stats.budgetUsed > 100 ? 'text-red-600' : 'text-orange-600'}`}>
              {stats.budgetUsed}% rozpočtu
            </span>
          </div>
        </div>

        {/* Total paid */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Zaplaceno</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(stats.totalPaid)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">{stats.paidPercentage}% zaplaceno</span>
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Zbývá zaplatit</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {formatCurrency(stats.totalActual - stats.totalPaid)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {stats.itemsPending > 0 ? (
              <span className="text-orange-600">{stats.itemsPending} čeká na platbu</span>
            ) : (
              <span className="text-green-600">Vše zaplaceno</span>
            )}
          </div>
        </div>
      </div>

      {/* Budget progress */}
      {showProgress && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Využití rozpočtu</h3>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${getBudgetHealthColor(stats.budgetUsed)}
            `}>
              {stats.budgetUsed}% využito
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div className="flex h-4 rounded-full overflow-hidden">
              <div
                className="bg-green-500"
                style={{ width: `${Math.min((stats.totalPaid / stats.totalBudget) * 100, 100)}%` }}
                title={`Zaplaceno: ${formatCurrency(stats.totalPaid)}`}
              ></div>
              <div
                className="bg-orange-500"
                style={{ width: `${Math.min(((stats.totalActual - stats.totalPaid) / stats.totalBudget) * 100, 100)}%` }}
                title={`Zbývá zaplatit: ${formatCurrency(stats.totalActual - stats.totalPaid)}`}
              ></div>
              {stats.budgetUsed > 100 && (
                <div
                  className="bg-red-500"
                  style={{ width: `${Math.min(((stats.totalActual - stats.totalBudget) / stats.totalBudget) * 100, 100)}%` }}
                  title={`Překročení: ${formatCurrency(stats.totalActual - stats.totalBudget)}`}
                ></div>
              )}
            </div>
          </div>

          {/* Progress breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-green-600">{formatCurrency(stats.totalPaid)}</p>
              <p className="text-text-muted">Zaplaceno</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-orange-600">{formatCurrency(stats.totalActual - stats.totalPaid)}</p>
              <p className="text-text-muted">Zbývá zaplatit</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-blue-600">{formatCurrency(stats.totalBudget - stats.totalActual)}</p>
              <p className="text-text-muted">Nevyužito</p>
            </div>
            <div className="text-center">
              <p className={`font-medium ${stats.budgetUsed > 100 ? 'text-red-600' : 'text-gray-600'}`}>
                {stats.budgetUsed}%
              </p>
              <p className="text-text-muted">Využití</p>
            </div>
          </div>
        </div>
      )}

      {/* Category breakdown with pie chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <PieChart className="w-5 h-5" />
          <span>Předběžné částky podle kategorií</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="flex justify-center">
            <BudgetPieChart categoryStats={categoryStats} />
          </div>

          {/* Category Details */}
          <div className="space-y-4">
            {categoryStats.map((stat) => (
              <div key={stat.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{stat.category.icon}</span>
                    <span className="font-medium text-gray-900">{stat.category.name}</span>
                    {stat.isOverBudget && (
                      <div title="Překročena předběžná částka">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(stat.actual)} / {formatCurrency(stat.budgeted)}
                    </p>
                    <p className="text-sm text-text-muted">
                      {stat.percentage.toFixed(1)}% rozpočtu
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500"
                      style={{ width: `${Math.min((stat.paid / stat.budgeted) * 100, 100)}%` }}
                    ></div>
                    <div
                      className={stat.isOverBudget ? "bg-red-500" : "bg-orange-500"}
                      style={{ width: `${Math.min(((stat.actual - stat.paid) / stat.budgeted) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-text-muted">
                  <span>Zaplaceno: {formatCurrency(stat.paid)}</span>
                  <span>Zbývá: {formatCurrency(stat.remaining)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment status overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment status */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Stav plateb</span>
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Zaplaceno</span>
              </div>
              <span className="font-medium">{stats.itemsPaid}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-700">Čeká na platbu</span>
              </div>
              <span className="font-medium">{stats.itemsPending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-gray-700">Po splatnosti</span>
              </div>
              <span className="font-medium">{stats.itemsOverdue}</span>
            </div>
          </div>
        </div>

        {/* Budget health */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">Zdraví rozpočtu</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.budgetUsed}%</p>
          <p className="text-sm text-blue-700">
            {stats.budgetUsed <= 80 ? 'Výborně pod kontrolou' :
             stats.budgetUsed <= 95 ? 'Blížíte se limitu' :
             stats.budgetUsed <= 100 ? 'Pozor na překročení' :
             'Předběžná částka překročena'}
          </p>
        </div>

        {/* Quick insights */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-900">Platby</h4>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.paidPercentage}%</p>
          <p className="text-sm text-green-700">
            {stats.paidPercentage >= 80 ? 'Většina zaplacena' :
             stats.paidPercentage >= 50 ? 'Polovina zaplacena' :
             'Začínáte s platbami'}
          </p>
        </div>
      </div>

      {/* Budget Items List */}
      {showBudgetList && (
        <div className="mt-8">
          <BudgetList
            showHeader={false}
            showFilters={true}
            maxHeight="800px"
            compact={false}
            viewMode="list"
            onCreateItem={onCreateItem}
            onEditItem={onEditItem}
          />
        </div>
      )}
    </div>
  )
}
