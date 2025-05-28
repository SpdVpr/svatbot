'use client'

import { useState, useEffect, useMemo } from 'react'
import { analyticsService, WeddingAnalytics } from '@/lib/analytics'
import { useWedding } from './useWedding'
import { useTask } from './useTask'
import { useGuest } from './useGuest'
import { useBudget } from './useBudget'
import { useVendor } from './useVendor'

export interface UseAnalyticsReturn {
  analytics: WeddingAnalytics | null
  isLoading: boolean
  error: string | null
  refreshAnalytics: () => void
  getInsights: () => string[]
  getRecommendations: () => string[]
  exportAnalytics: () => void
}

export function useAnalytics(): UseAnalyticsReturn {
  const [analytics, setAnalytics] = useState<WeddingAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { wedding } = useWedding()
  const { tasks } = useTask()
  const { guests } = useGuest()
  const { budgetItems } = useBudget()
  const { vendors } = useVendor()

  // Calculate analytics when data changes
  const calculateAnalytics = useMemo(() => {
    if (!wedding) return null

    try {
      return analyticsService.calculateWeddingAnalytics(
        wedding,
        tasks,
        guests,
        budgetItems,
        vendors
      )
    } catch (err) {
      console.error('Error calculating analytics:', err)
      return null
    }
  }, [wedding, tasks, guests, budgetItems, vendors])

  // Update analytics when calculation changes
  useEffect(() => {
    setIsLoading(true)
    setError(null)

    if (calculateAnalytics) {
      setAnalytics(calculateAnalytics)
    } else if (wedding) {
      setError('Chyba při výpočtu analytiky')
    }

    setIsLoading(false)
  }, [calculateAnalytics, wedding])

  // Refresh analytics manually
  const refreshAnalytics = () => {
    if (wedding) {
      setIsLoading(true)
      // Force recalculation by updating state
      setTimeout(() => {
        if (calculateAnalytics) {
          setAnalytics(calculateAnalytics)
        }
        setIsLoading(false)
      }, 100)
    }
  }

  // Generate insights based on analytics
  const getInsights = (): string[] => {
    if (!analytics) return []

    const insights: string[] = []

    // Task insights
    if (analytics.tasks.overdue > 0) {
      insights.push(`Máte ${analytics.tasks.overdue} úkolů po termínu`)
    }
    if (analytics.tasks.completionRate > 80) {
      insights.push('Skvělá práce! Máte dokončeno více než 80% úkolů')
    }
    if (analytics.tasks.upcoming > 5) {
      insights.push(`Pozor: ${analytics.tasks.upcoming} úkolů má termín do týdne`)
    }

    // Budget insights
    if (analytics.budget.percentageUsed > 90) {
      insights.push('Pozor: Využili jste více než 90% rozpočtu')
    }
    if (analytics.budget.overBudgetCategories.length > 0) {
      insights.push(`Překročili jste rozpočet v kategoriích: ${analytics.budget.overBudgetCategories.join(', ')}`)
    }
    if (analytics.budget.remaining < 0) {
      insights.push('Překročili jste celkový rozpočet')
    }

    // Guest insights
    if (analytics.guests.responseRate < 50) {
      insights.push('Nízká míra odpovědí hostů - zvažte připomínku')
    }
    if (analytics.guests.responseRate > 80) {
      insights.push('Skvělá míra odpovědí hostů!')
    }

    // Vendor insights
    if (analytics.vendors.booked < analytics.vendors.total * 0.5) {
      insights.push('Máte málo potvrzených dodavatelů')
    }
    if (analytics.vendors.averageRating > 4.5) {
      insights.push('Vybrali jste vysoce hodnocené dodavatele!')
    }

    // Timeline insights
    if (analytics.timeline.timelineHealth === 'behind') {
      insights.push('Jste pozadu s přípravami - zvažte urychlení')
    }
    if (analytics.timeline.timelineHealth === 'on-track') {
      insights.push('Jste na dobré cestě s přípravami!')
    }

    // Overall insights
    if (analytics.overview.totalProgress > 75 && analytics.overview.daysUntilWedding > 30) {
      insights.push('Jste velmi dobře připraveni!')
    }
    if (analytics.overview.totalProgress < 50 && analytics.overview.daysUntilWedding < 60) {
      insights.push('Doporučujeme zrychlit přípravu')
    }

    return insights
  }

  // Generate recommendations based on analytics
  const getRecommendations = (): string[] => {
    if (!analytics) return []

    const recommendations: string[] = []

    // Task recommendations
    if (analytics.tasks.overdue > 0) {
      recommendations.push('Dokončete nejdříve úkoly po termínu')
    }
    if (analytics.tasks.byPriority.high > analytics.tasks.byPriority.low) {
      recommendations.push('Zaměřte se na úkoly s vysokou prioritou')
    }

    // Budget recommendations
    if (analytics.budget.percentageUsed > 80) {
      recommendations.push('Zvažte úspory v méně důležitých kategoriích')
    }
    if (analytics.budget.overBudgetCategories.length > 0) {
      recommendations.push('Přehodnoťte rozpočet v překročených kategoriích')
    }

    // Guest recommendations
    if (analytics.guests.responseRate < 70) {
      recommendations.push('Pošlete připomínku hostům, kteří neodpověděli')
    }
    if (analytics.guests.pending > 10) {
      recommendations.push('Kontaktujte hosty s nevyřízenými odpověďmi')
    }

    // Vendor recommendations
    if (analytics.vendors.contacted > analytics.vendors.booked * 2) {
      recommendations.push('Dokončete výběr dodavatelů')
    }
    if (analytics.vendors.total < 5) {
      recommendations.push('Zvažte přidání více dodavatelů pro jistotu')
    }

    // Timeline recommendations
    if (analytics.timeline.upcomingDeadlines > 5) {
      recommendations.push('Naplánujte si čas na nadcházející termíny')
    }
    if (analytics.timeline.timelineHealth === 'at-risk') {
      recommendations.push('Zvažte delegování některých úkolů')
    }

    // General recommendations
    if (analytics.overview.daysUntilWedding < 30 && analytics.overview.totalProgress < 80) {
      recommendations.push('Zaměřte se na nejdůležitější úkoly')
    }
    if (analytics.trends.productivityScore < 60) {
      recommendations.push('Zvažte rozdělení velkých úkolů na menší části')
    }

    return recommendations
  }

  // Export analytics data
  const exportAnalytics = () => {
    if (!analytics) return

    const exportData = {
      generatedAt: new Date().toISOString(),
      wedding: {
        brideName: wedding?.brideName,
        groomName: wedding?.groomName,
        weddingDate: wedding?.weddingDate
      },
      analytics,
      insights: getInsights(),
      recommendations: getRecommendations()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `svatba-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics,
    getInsights,
    getRecommendations,
    exportAnalytics
  }
}

// Helper hook for specific analytics sections
export function useTaskAnalytics() {
  const { analytics } = useAnalytics()
  return analytics?.tasks || null
}

export function useBudgetAnalytics() {
  const { analytics } = useAnalytics()
  return analytics?.budget || null
}

export function useGuestAnalytics() {
  const { analytics } = useAnalytics()
  return analytics?.guests || null
}

export function useVendorAnalytics() {
  const { analytics } = useAnalytics()
  return analytics?.vendors || null
}

export function useTimelineAnalytics() {
  const { analytics } = useAnalytics()
  return analytics?.timeline || null
}

export function useTrendAnalytics() {
  const { analytics } = useAnalytics()
  return analytics?.trends || null
}

// Hook for real-time insights
export function useInsights() {
  const { analytics, getInsights, getRecommendations } = useAnalytics()
  
  const insights = useMemo(() => getInsights(), [analytics])
  const recommendations = useMemo(() => getRecommendations(), [analytics])
  
  return {
    insights,
    recommendations,
    hasInsights: insights.length > 0,
    hasRecommendations: recommendations.length > 0
  }
}
