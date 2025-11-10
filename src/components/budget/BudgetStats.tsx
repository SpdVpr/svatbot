'use client'

import { useBudget } from '@/hooks/useBudget'
import { BUDGET_CATEGORIES } from '@/types/budget'
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
  CreditCard,
  Coins
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

  // Calculate payment period statistics
  const paymentPeriodStats = {
    beforeWedding: {
      planned: budgetItems
        .filter(item => item.paymentPeriod === 'before-wedding')
        .reduce((sum, item) => sum + item.actualAmount, 0),
      paid: budgetItems
        .filter(item => item.paymentPeriod === 'before-wedding')
        .reduce((sum, item) => sum + item.paidAmount, 0),
      count: budgetItems.filter(item => item.paymentPeriod === 'before-wedding').length
    },
    atWedding: {
      planned: budgetItems
        .filter(item => item.paymentPeriod === 'at-wedding')
        .reduce((sum, item) => sum + item.actualAmount, 0),
      paid: budgetItems
        .filter(item => item.paymentPeriod === 'at-wedding')
        .reduce((sum, item) => sum + item.paidAmount, 0),
      count: budgetItems.filter(item => item.paymentPeriod === 'at-wedding').length
    },
    afterWedding: {
      planned: budgetItems
        .filter(item => item.paymentPeriod === 'after-wedding')
        .reduce((sum, item) => sum + item.actualAmount, 0),
      paid: budgetItems
        .filter(item => item.paymentPeriod === 'after-wedding')
        .reduce((sum, item) => sum + item.paidAmount, 0),
      count: budgetItems.filter(item => item.paymentPeriod === 'after-wedding').length
    }
  }

  // Get budget health color
  const getBudgetHealthColor = (percentage: number) => {
    if (percentage <= 80) return 'text-green-600 bg-green-100'
    if (percentage <= 95) return 'text-yellow-600 bg-yellow-100'
    if (percentage <= 100) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total budget */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
              <p className="text-sm text-text-muted">Celkový budget</p>
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

        {/* Payment Status */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <CreditCard className="w-5 h-5 text-green-500" />
            <div className="text-sm text-text-muted">Platby</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Zaplaceno</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(stats.totalPaid)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-600">Zbývá</span>
              <span className="text-lg font-bold text-orange-600">
                {formatCurrency(stats.totalActual - stats.totalPaid)}
              </span>
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
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-muted mb-1">Celkový budget</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
              <p className="text-xs text-text-muted mt-1">{budgetItems.length} položek</p>
            </div>
          </div>
        </div>

        {/* Total budgeted */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
              <Coins className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-muted mb-1">Předběžné náklady</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(budgetItems.reduce((sum, item) => sum + item.budgetedAmount, 0))}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                {stats.totalBudget > 0 ? Math.round((budgetItems.reduce((sum, item) => sum + item.budgetedAmount, 0) / stats.totalBudget) * 100) : 0}% z budgetu
              </p>
            </div>
          </div>
        </div>

        {/* Total actual */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-muted mb-1">Skutečné náklady</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalActual)}</p>
              <p className={`text-xs font-medium mt-1 ${stats.budgetUsed > 100 ? 'text-red-600' : 'text-orange-600'}`}>
                {stats.budgetUsed}% rozpočtu
              </p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-muted mb-1">Stav plateb</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
              <p className="text-xs text-green-600 font-medium mt-1">Zaplaceno {stats.paidPercentage}%</p>
            </div>
          </div>

          {/* Remaining amount */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Zbývá zaplatit</span>
            <span className="font-bold text-orange-600">
              {formatCurrency(stats.totalActual - stats.totalPaid)}
            </span>
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

      {/* Payment Period Statistics */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Platby podle období</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Before Wedding */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h4 className="font-medium text-gray-900">Před svatbou</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Plánováno:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(paymentPeriodStats.beforeWedding.planned)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Zaplaceno:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(paymentPeriodStats.beforeWedding.paid)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Zbývá:</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(paymentPeriodStats.beforeWedding.planned - paymentPeriodStats.beforeWedding.paid)}
                </span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${paymentPeriodStats.beforeWedding.planned > 0
                      ? (paymentPeriodStats.beforeWedding.paid / paymentPeriodStats.beforeWedding.planned) * 100
                      : 0}%`
                  }}
                ></div>
              </div>
              <p className="text-xs text-text-muted text-center">
                {paymentPeriodStats.beforeWedding.count} položek
              </p>
            </div>
          </div>

          {/* At Wedding */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <h4 className="font-medium text-gray-900">Na svatbě</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Plánováno:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(paymentPeriodStats.atWedding.planned)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Zaplaceno:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(paymentPeriodStats.atWedding.paid)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Zbývá:</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(paymentPeriodStats.atWedding.planned - paymentPeriodStats.atWedding.paid)}
                </span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${paymentPeriodStats.atWedding.planned > 0
                      ? (paymentPeriodStats.atWedding.paid / paymentPeriodStats.atWedding.planned) * 100
                      : 0}%`
                  }}
                ></div>
              </div>
              <p className="text-xs text-text-muted text-center">
                {paymentPeriodStats.atWedding.count} položek
              </p>
            </div>
          </div>

          {/* After Wedding */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <h4 className="font-medium text-gray-900">Po svatbě</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Plánováno:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(paymentPeriodStats.afterWedding.planned)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Zaplaceno:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(paymentPeriodStats.afterWedding.paid)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Zbývá:</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(paymentPeriodStats.afterWedding.planned - paymentPeriodStats.afterWedding.paid)}
                </span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${paymentPeriodStats.afterWedding.planned > 0
                      ? (paymentPeriodStats.afterWedding.paid / paymentPeriodStats.afterWedding.planned) * 100
                      : 0}%`
                  }}
                ></div>
              </div>
              <p className="text-xs text-text-muted text-center">
                {paymentPeriodStats.afterWedding.count} položek
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown - Compact version */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Rozpočet podle kategorií</span>
        </h3>

        {/* Category Grid - Full Width Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map((stat) => (
            <div
              key={stat.key}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{stat.category.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{stat.category.name}</span>
                  {stat.isOverBudget && (
                    <div title="Překročen rozpočet">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-text-muted">{stat.itemCount}×</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-text-muted">Rozpočet:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(stat.budgeted)}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500"
                      style={{ width: `${Math.min((stat.paid / stat.budgeted) * 100, 100)}%` }}
                      title={`Zaplaceno: ${formatCurrency(stat.paid)}`}
                    ></div>
                    <div
                      className={stat.isOverBudget ? "bg-red-500" : "bg-orange-500"}
                      style={{ width: `${Math.min(((stat.actual - stat.paid) / stat.budgeted) * 100, 100)}%` }}
                      title={`Nezaplaceno: ${formatCurrency(stat.actual - stat.paid)}`}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-green-600">✓ {formatCurrency(stat.paid)}</span>
                  <span className={stat.isOverBudget ? "text-red-600" : "text-orange-600"}>
                    ⏳ {formatCurrency(stat.remaining)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Items List */}
      {showBudgetList && (
        <div className="mt-8">
          <BudgetList
            showHeader={false}
            showFilters={true}
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
