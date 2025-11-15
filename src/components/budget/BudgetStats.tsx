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
    if (percentage <= 95) return 'text-accent-600 bg-accent-100'
    if (percentage <= 100) return 'text-accent-700 bg-accent-100'
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
      {/* Main stats - Mobile: stacked for readability */}
      <div className="space-y-3 md:hidden">
        {/* Total budget */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-primary-100 rounded-lg flex-shrink-0">
              <Target className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-text-muted mb-1">Celkový rozpočet</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalBudget)}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {budgetItems.length} položek
              </p>
            </div>
          </div>
        </div>

        {/* Total actual */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-accent-100 rounded-lg flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-accent-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-text-muted mb-1">Skutečné náklady</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalActual)}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Odhadované:{' '}
                <span className="text-gray-900 font-semibold">
                  {formatCurrency(stats.totalEstimated)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0">
              <CreditCard className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-text-muted mb-1">Platby</p>
              <div className="mb-2">
                <p className="text-xs text-text-muted">Zaplaceno</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Zbývá zaplatit</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(stats.totalActual - stats.totalPaid)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main stats - Tablet/Desktop grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-3 md:gap-6">
        {/* Total budget */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-primary-100 rounded-lg flex-shrink-0">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-muted mb-0.5 md:mb-1">
                Celkový rozpočet
              </p>
              <p className="text-xl md:text-3xl font-bold text-gray-900 truncate">
                {formatCurrency(stats.totalBudget)}
              </p>
              <p className="text-xs text-text-muted mt-1 md:mt-2">
                {budgetItems.length} položek
              </p>
            </div>
          </div>
        </div>

        {/* Total actual with progress */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-2 md:space-x-3 mb-2 md:mb-3">
            <div className="p-1.5 md:p-2 bg-accent-100 rounded-lg flex-shrink-0">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-accent-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-muted mb-0.5 md:mb-1">
                Skutečné
              </p>
              <p className="text-xl md:text-3xl font-bold text-gray-900 truncate">
                {formatCurrency(stats.totalActual)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted truncate">Odhadované</span>
            <span className="font-bold text-gray-900 truncate">
              {formatCurrency(stats.totalEstimated)}
            </span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-2 md:space-x-3 mb-2 md:mb-3">
            <div className="p-1.5 md:p-2 bg-green-100 rounded-lg flex-shrink-0">
              <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-muted mb-0.5 md:mb-1">Zaplaceno</p>
              <p className="text-xl md:text-3xl font-bold text-green-600 truncate">
                {formatCurrency(stats.totalPaid)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted truncate">Zbývá</span>
            <span className="font-bold text-gray-900 truncate">
              {formatCurrency(stats.totalActual - stats.totalPaid)}
            </span>
          </div>
        </div>
      </div>

      {/* Budget progress - Simplified single bar */}
      {showProgress && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Přehled rozpočtu</h3>
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${getBudgetHealthColor(stats.budgetUsed)}
            `}>
              {stats.budgetUsed}% využito
            </span>
          </div>

          {/* Single unified progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
            <div className="flex h-3 rounded-full overflow-hidden">
              <div
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${Math.min((stats.totalPaid / stats.totalBudget) * 100, 100)}%` }}
                title={`Zaplaceno: ${formatCurrency(stats.totalPaid)}`}
              ></div>
              <div
                className={`transition-all duration-500 ${stats.budgetUsed > 100 ? 'bg-red-500' : 'bg-accent-500'}`}
                style={{ width: `${Math.min(((stats.totalActual - stats.totalPaid) / stats.totalBudget) * 100, 100)}%` }}
                title={`Zbývá zaplatit: ${formatCurrency(stats.totalActual - stats.totalPaid)}`}
              ></div>
            </div>
          </div>

          {/* Simplified legend */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-text-muted">Zaplaceno</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${stats.budgetUsed > 100 ? 'bg-red-500' : 'bg-accent-500'}`}></div>
                <span className="text-text-muted">Zbývá zaplatit</span>
              </div>
            </div>
            <div className="text-text-muted">
              {stats.budgetUsed > 100 ? (
                <>
                  Překročení: <span className="font-semibold text-red-600">{formatCurrency(stats.totalActual - stats.totalBudget)}</span>
                </>
              ) : (
                <>
                  Zbývá: <span className="font-semibold text-gray-900">{formatCurrency(stats.totalBudget - stats.totalActual)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Period Statistics - Detailed view */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary-600" />
          <span>Platby podle období</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Before Wedding */}
          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary-500"></div>
              <h4 className="font-medium text-gray-900">Před svatbou</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Plánováno:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(paymentPeriodStats.beforeWedding.planned)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Zaplaceno:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(paymentPeriodStats.beforeWedding.paid)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Zbývá:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(paymentPeriodStats.beforeWedding.planned - paymentPeriodStats.beforeWedding.paid)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-text-muted text-center">
                  {paymentPeriodStats.beforeWedding.count} položek
                </p>
              </div>
            </div>
          </div>

          {/* At Wedding */}
          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary-500"></div>
              <h4 className="font-medium text-gray-900">Na svatbě</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Plánováno:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(paymentPeriodStats.atWedding.planned)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Zaplaceno:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(paymentPeriodStats.atWedding.paid)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Zbývá:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(paymentPeriodStats.atWedding.planned - paymentPeriodStats.atWedding.paid)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-text-muted text-center">
                  {paymentPeriodStats.atWedding.count} položek
                </p>
              </div>
            </div>
          </div>

          {/* After Wedding */}
          <div className="p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary-500"></div>
              <h4 className="font-medium text-gray-900">Po svatbě</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Plánováno:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(paymentPeriodStats.afterWedding.planned)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Zaplaceno:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(paymentPeriodStats.afterWedding.paid)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Zbývá:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(paymentPeriodStats.afterWedding.planned - paymentPeriodStats.afterWedding.paid)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-text-muted text-center">
                  {paymentPeriodStats.afterWedding.count} položek
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown - Two column layout */}
      <div className="hidden md:block bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <span>Rozpočet podle kategorií</span>
        </h3>

        {/* Category Grid - Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {categoryStats.map((stat) => (
            <div
              key={stat.key}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-xl flex-shrink-0">{stat.category.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{stat.category.name}</span>
                    <span className="text-xs text-text-muted flex-shrink-0">({stat.itemCount})</span>
                    {stat.isOverBudget && (
                      <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="flex h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 transition-all duration-500"
                        style={{ width: `${Math.min((stat.paid / stat.budgeted) * 100, 100)}%` }}
                      ></div>
                      <div
                        className={`transition-all duration-500 ${stat.isOverBudget ? "bg-red-500" : "bg-accent-500"}`}
                        style={{ width: `${Math.min(((stat.actual - stat.paid) / stat.budgeted) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(stat.budgeted)}
                </p>
                <p className="text-xs text-text-muted">
                  {formatCurrency(stat.paid)} / {formatCurrency(stat.actual)}
                </p>
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
