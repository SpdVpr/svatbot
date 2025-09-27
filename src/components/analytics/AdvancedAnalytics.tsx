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
  // Removed activeTab - using overview as default (most comprehensive)
  
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

  // Removed tabs - using overview as default (most comprehensive)

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

        {/* Overview indicator */}
        <div className="flex items-center justify-center bg-primary-100 rounded-lg p-3">
          <BarChart3 className="w-4 h-4 text-primary-600 mr-2" />
          <span className="text-sm font-medium text-primary-700">Přehled</span>
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

      {/* Analytics Content - Overview */}
      <div className="wedding-card">
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
      </div>
    </div>
  )
}
