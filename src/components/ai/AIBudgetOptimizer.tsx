'use client'

import { useState } from 'react'
import { useAI } from '@/hooks/useAI'
import { useBudget } from '@/hooks/useBudget'
import {
  DollarSign,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  PieChart,
  Target,
  Lightbulb,
  ArrowRight
} from 'lucide-react'

interface AIBudgetOptimizerProps {
  onOptimizationApply?: (optimization: any) => void
  className?: string
}

export default function AIBudgetOptimizer({ 
  onOptimizationApply,
  className = '' 
}: AIBudgetOptimizerProps) {
  const { optimizeBudget, loading, error, clearError } = useAI()
  const { budgetItems, stats, getTotalBudget } = useBudget()
  const totalBudget = getTotalBudget()
  
  const [optimization, setOptimization] = useState<{
    analysis: string
    suggestions: string[]
    optimizedAllocation: Record<string, number>
  } | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleOptimizeBudget = async () => {
    clearError()
    try {
      const result = await optimizeBudget()
      setOptimization(result)
      setHasGenerated(true)
    } catch (err) {
      console.error('Failed to optimize budget:', err)
    }
  }

  const handleRefresh = () => {
    setOptimization(null)
    setHasGenerated(false)
    handleOptimizeBudget()
  }

  const handleApplyOptimization = () => {
    if (optimization) {
      onOptimizationApply?.(optimization)
    }
  }

  const calculateSavings = () => {
    if (!optimization?.optimizedAllocation || !budgetItems) return 0

    const currentTotal = budgetItems.reduce((sum, item) => sum + item.budgetedAmount, 0)
    const optimizedTotal = Object.values(optimization.optimizedAllocation).reduce((sum, amount) => sum + amount, 0)

    return currentTotal - optimizedTotal
  }

  const getSavingsPercentage = () => {
    if (!stats?.totalBudget) return 0
    const savings = calculateSavings()
    return Math.round((savings / stats.totalBudget) * 100)
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Budget Optimizer</h3>
            <p className="text-sm text-gray-500">Inteligentní optimalizace rozpočtu</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          {hasGenerated && (
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Nová optimalizace"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Chyba při optimalizaci</h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              {error.includes('rozpočtové položky') && (
                <div className="mt-3">
                  <a
                    href="/budget"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Přejít na stránku Rozpočet
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Budget Items State */}
      {!budgetItems || budgetItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 bg-blue-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <PieChart className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nejdříve vytvořte rozpočet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Pro optimalizaci rozpočtu potřebujeme alespoň několik rozpočtových položek.
            Přejděte na stránku Rozpočet a vytvořte své první položky.
          </p>
          <a
            href="/budget"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Vytvořit rozpočet
          </a>
        </div>
      ) : stats?.totalBudget === 0 ? (
        <div className="text-center py-12">
          <div className="p-4 bg-yellow-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nastavte celkový rozpočet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Máte rozpočtové položky, ale chybí celkový rozpočet svatby.
            Nastavte ho v sekci Rozpočet pro lepší optimalizaci.
          </p>
          <a
            href="/budget"
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Target className="w-4 h-4 mr-2" />
            Nastavit rozpočet
          </a>
        </div>
      ) : (
        <>

      {/* Current Budget Overview */}
      {budgetItems && budgetItems.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <PieChart className="w-4 h-4 text-gray-600 mr-2" />
            Současný rozpočet
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Celkový rozpočet:</span>
              <span className="font-medium text-gray-900 ml-2">
                {stats?.totalBudget?.toLocaleString()} Kč
              </span>
            </div>
            <div>
              <span className="text-gray-500">Využito:</span>
              <span className="font-medium text-gray-900 ml-2">
                {stats?.totalActual?.toLocaleString()} Kč
              </span>
            </div>
            <div>
              <span className="text-gray-500">Počet položek:</span>
              <span className="font-medium text-gray-900 ml-2">
                {budgetItems.length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Zbývá:</span>
              <span className="font-medium text-green-600 ml-2">
                {stats?.totalRemaining?.toLocaleString()} Kč
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!hasGenerated ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-green-500" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">
            Optimalizujte svůj rozpočet
          </h4>
          <p className="text-sm text-gray-500 mb-6">
            AI analyzuje váš rozpočet a navrhne způsoby, jak ušetřit peníze a lépe rozdělit prostředky
          </p>
          
          {!budgetItems || budgetItems.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <p className="text-sm text-yellow-700">
                  Nejdříve vytvořte rozpočtové položky pro optimalizaci
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleOptimizeBudget}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Optimalizuji rozpočet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Optimalizovat rozpočet</span>
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-green-500 mr-3" />
              <span className="text-gray-600">Analyzuji rozpočet...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {optimization && !loading && (
            <>
              {/* Savings Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-green-900 flex items-center">
                    <TrendingDown className="w-5 h-5 text-green-600 mr-2" />
                    Potenciální úspora
                  </h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {calculateSavings().toLocaleString()} Kč
                    </div>
                    <div className="text-sm text-green-500">
                      {getSavingsPercentage()}% z rozpočtu
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <PieChart className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Analýza rozpočtu</h4>
                    <p className="text-sm text-blue-700">{optimization.analysis}</p>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                  Doporučení pro optimalizaci
                </h4>
                
                <div className="space-y-3">
                  {optimization.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-yellow-800">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimized Allocation */}
              {Object.keys(optimization.optimizedAllocation).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Target className="w-4 h-4 text-purple-500 mr-2" />
                    Optimalizované rozdělení
                  </h4>
                  
                  <div className="space-y-3">
                    {Object.entries(optimization.optimizedAllocation).map(([category, amount]) => {
                      const currentItem = budgetItems?.find(item => 
                        item.category.toLowerCase().includes(category.toLowerCase())
                      )
                      const currentAmount = currentItem?.budgetedAmount || 0
                      const difference = amount - currentAmount
                      
                      return (
                        <div
                          key={category}
                          className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium text-purple-900">{category}</h5>
                            <div className="flex items-center space-x-2 text-sm text-purple-600">
                              <span>{currentAmount.toLocaleString()} Kč</span>
                              <ArrowRight className="w-3 h-3" />
                              <span className="font-medium">{amount.toLocaleString()} Kč</span>
                            </div>
                          </div>
                          
                          <div className={`flex items-center space-x-1 text-sm font-medium ${
                            difference > 0 ? 'text-red-600' : difference < 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {difference > 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : difference < 0 ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : null}
                            <span>
                              {difference > 0 ? '+' : ''}{difference.toLocaleString()} Kč
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="btn-outline flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Nová optimalizace</span>
                </button>
                
                <button
                  onClick={handleApplyOptimization}
                  className="btn-primary flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Aplikovat optimalizaci</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
      </>
      )}
    </div>
  )
}
