'use client'

import { useState } from 'react'
import { useAnalytics, useInsights } from '@/hooks/useAnalytics'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  Lightbulb,
  Calendar,
  Users,
  DollarSign,
  Clock
} from 'lucide-react'

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'budget' | 'guests' | 'trends'>('overview')
  
  const { 
    analytics, 
    isLoading, 
    error, 
    refreshAnalytics, 
    exportAnalytics 
  } = useAnalytics()
  
  const { insights, recommendations } = useInsights()

  if (isLoading) {
    return (
      <div className="wedding-card">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Načítám analytiku...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="wedding-card">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chyba při načítání analytiky</h3>
          <p className="text-gray-600 mb-4">{error || 'Nepodařilo se načíst data'}</p>
          <button onClick={refreshAnalytics} className="btn-primary">
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Přehled', icon: BarChart3 },
    { id: 'tasks', label: 'Úkoly', icon: CheckCircle },
    { id: 'budget', label: 'Rozpočet', icon: DollarSign },
    { id: 'guests', label: 'Hosté', icon: Users },
    { id: 'trends', label: 'Trendy', icon: TrendingUp }
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="wedding-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="heading-4">Pokročilá analytika</h3>
              <p className="body-small text-text-muted">
                Detailní přehled pokroku vaší svatby
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={refreshAnalytics}
              className="btn-outline flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Aktualizovat</span>
            </button>
            <button
              onClick={exportAnalytics}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Insights & Recommendations */}
      {(insights.length > 0 || recommendations.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights */}
          {insights.length > 0 && (
            <div className="wedding-card">
              <div className="flex items-center space-x-3 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium">Pozorování</h4>
              </div>
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <p className="text-sm text-yellow-800">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="wedding-card">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium">Doporučení</h4>
              </div>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Content */}
      <div className="wedding-card">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h4 className="font-medium">Celkový přehled</h4>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{analytics.overview.totalProgress}%</div>
                <div className="text-sm text-blue-700">Celkový pokrok</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{analytics.overview.daysUntilWedding}</div>
                <div className="text-sm text-green-700">Dní do svatby</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{Math.round(analytics.tasks.completionRate)}%</div>
                <div className="text-sm text-purple-700">Dokončené úkoly</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                <div className="text-3xl font-bold text-pink-600">{Math.round(analytics.guests.responseRate)}%</div>
                <div className="text-sm text-pink-700">Odpovědi hostů</div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
              {analytics.overview.onTrack ? (
                <div className="flex items-center space-x-3 text-green-600">
                  <CheckCircle className="w-8 h-8" />
                  <div>
                    <div className="text-lg font-medium">Jste na dobré cestě!</div>
                    <div className="text-sm">Přípravy probíhají podle plánu</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 text-orange-600">
                  <AlertTriangle className="w-8 h-8" />
                  <div>
                    <div className="text-lg font-medium">Potřebujete zrychlit</div>
                    <div className="text-sm">Některé oblasti vyžadují pozornost</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <h4 className="font-medium">Analýza úkolů</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{analytics.tasks.total}</div>
                <div className="text-sm text-gray-600">Celkem úkolů</div>
              </div>
              <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">{analytics.tasks.completed}</div>
                <div className="text-sm text-green-700">Dokončeno</div>
              </div>
              <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="text-2xl font-bold text-red-600">{analytics.tasks.overdue}</div>
                <div className="text-sm text-red-700">Po termínu</div>
              </div>
              <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="text-2xl font-bold text-yellow-600">{analytics.tasks.upcoming}</div>
                <div className="text-sm text-yellow-700">Nadcházející</div>
              </div>
            </div>

            {/* Task Categories */}
            <div>
              <h5 className="font-medium mb-3">Úkoly podle kategorií</h5>
              <div className="space-y-2">
                {Object.entries(analytics.tasks.byCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="capitalize">{category}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Productivity Score */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Skóre produktivity</span>
                <span className="text-2xl font-bold text-blue-600">{Math.round(analytics.tasks.productivityScore)}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(analytics.tasks.productivityScore, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            <h4 className="font-medium">Analýza rozpočtu</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{analytics.budget.totalBudget.toLocaleString()} Kč</div>
                <div className="text-sm text-gray-600">Celkový rozpočet</div>
              </div>
              <div className="text-center p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="text-lg font-bold text-blue-600">{analytics.budget.totalSpent.toLocaleString()} Kč</div>
                <div className="text-sm text-blue-700">Utraceno</div>
              </div>
              <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="text-lg font-bold text-green-600">{analytics.budget.remaining.toLocaleString()} Kč</div>
                <div className="text-sm text-green-700">Zbývá</div>
              </div>
              <div className="text-center p-4 border border-purple-200 rounded-lg bg-purple-50">
                <div className="text-lg font-bold text-purple-600">{Math.round(analytics.budget.percentageUsed)}%</div>
                <div className="text-sm text-purple-700">Využito</div>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Využití rozpočtu</span>
                <span className="text-sm text-gray-600">{analytics.budget.totalSpent.toLocaleString()} / {analytics.budget.totalBudget.toLocaleString()} Kč</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    analytics.budget.percentageUsed > 90 ? 'bg-red-500' :
                    analytics.budget.percentageUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(analytics.budget.percentageUsed, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Over Budget Categories */}
            {analytics.budget.overBudgetCategories.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h5 className="font-medium text-red-900 mb-2">Překročené kategorie</h5>
                <div className="space-y-1">
                  {analytics.budget.overBudgetCategories.map(category => (
                    <div key={category} className="text-sm text-red-700">• {category}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'guests' && (
          <div className="space-y-6">
            <h4 className="font-medium">Analýza hostů</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{analytics.guests.total}</div>
                <div className="text-sm text-gray-600">Celkem pozvaných</div>
              </div>
              <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">{analytics.guests.attending}</div>
                <div className="text-sm text-green-700">Přijde</div>
              </div>
              <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="text-2xl font-bold text-red-600">{analytics.guests.notAttending}</div>
                <div className="text-sm text-red-700">Nepřijde</div>
              </div>
              <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="text-2xl font-bold text-yellow-600">{analytics.guests.pending}</div>
                <div className="text-sm text-yellow-700">Neodpověděli</div>
              </div>
            </div>

            {/* Response Rate */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Míra odpovědí</span>
                <span className="text-2xl font-bold text-blue-600">{Math.round(analytics.guests.responseRate)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.guests.responseRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <h4 className="font-medium">Trendy a pokrok</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h5 className="font-medium mb-3">Skóre produktivity</h5>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{Math.round(analytics.trends.productivityScore)}</div>
                  <div className="text-sm text-gray-600">ze 100 bodů</div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h5 className="font-medium mb-3">Skóre zapojení</h5>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{Math.round(analytics.trends.engagementScore)}</div>
                  <div className="text-sm text-gray-600">ze 100 bodů</div>
                </div>
              </div>
            </div>

            {/* Weekly Progress Trend */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h5 className="font-medium mb-3">Týdenní pokrok</h5>
              <div className="space-y-2">
                {analytics.trends.weeklyProgress.map((week, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{week.week}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${week.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{week.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
