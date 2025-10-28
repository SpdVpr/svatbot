'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  BarChart3,
  TrendingUp,
  Monitor,
  Smartphone,
  Globe,
  Target,
  Loader2
} from 'lucide-react'

interface AnalyticsData {
  sources: Record<string, { clicks: number; conversions: number }>
  devices: Record<string, { clicks: number; conversions: number }>
  browsers: Record<string, { clicks: number; conversions: number }>
  landingPages: Record<string, { clicks: number; conversions: number }>
  campaigns: Record<string, { clicks: number; conversions: number }>
}

interface Props {
  affiliateId: string
  days?: number
}

export default function AffiliateAnalytics({ affiliateId, days = 30 }: Props) {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    sources: {},
    devices: {},
    browsers: {},
    landingPages: {},
    campaigns: {}
  })

  useEffect(() => {
    loadAnalytics()
  }, [affiliateId, days])

  const loadAnalytics = async () => {
    try {
      setLoading(true)

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]

      // Query daily stats for the period
      const q = query(
        collection(db, 'affiliateStats'),
        where('affiliateId', '==', affiliateId),
        where('date', '>=', startDateStr),
        orderBy('date', 'desc')
      )

      const snapshot = await getDocs(q)

      // Aggregate data from all days
      const aggregated: AnalyticsData = {
        sources: {},
        devices: {},
        browsers: {},
        landingPages: {},
        campaigns: {}
      }

      snapshot.docs.forEach(doc => {
        const data = doc.data()

        // Aggregate sources
        if (data.sources) {
          Object.entries(data.sources).forEach(([source, stats]: [string, any]) => {
            if (!aggregated.sources[source]) {
              aggregated.sources[source] = { clicks: 0, conversions: 0 }
            }
            aggregated.sources[source].clicks += stats.clicks || 0
            aggregated.sources[source].conversions += stats.conversions || 0
          })
        }

        // Aggregate devices
        if (data.devices) {
          Object.entries(data.devices).forEach(([device, stats]: [string, any]) => {
            if (!aggregated.devices[device]) {
              aggregated.devices[device] = { clicks: 0, conversions: 0 }
            }
            aggregated.devices[device].clicks += stats.clicks || 0
            aggregated.devices[device].conversions += stats.conversions || 0
          })
        }

        // Aggregate browsers
        if (data.browsers) {
          Object.entries(data.browsers).forEach(([browser, stats]: [string, any]) => {
            if (!aggregated.browsers[browser]) {
              aggregated.browsers[browser] = { clicks: 0, conversions: 0 }
            }
            aggregated.browsers[browser].clicks += stats.clicks || 0
            aggregated.browsers[browser].conversions += stats.conversions || 0
          })
        }

        // Aggregate landing pages
        if (data.landingPages) {
          Object.entries(data.landingPages).forEach(([page, stats]: [string, any]) => {
            if (!aggregated.landingPages[page]) {
              aggregated.landingPages[page] = { clicks: 0, conversions: 0 }
            }
            aggregated.landingPages[page].clicks += stats.clicks || 0
            aggregated.landingPages[page].conversions += stats.conversions || 0
          })
        }

        // Aggregate campaigns
        if (data.campaigns) {
          Object.entries(data.campaigns).forEach(([campaign, stats]: [string, any]) => {
            if (!aggregated.campaigns[campaign]) {
              aggregated.campaigns[campaign] = { clicks: 0, conversions: 0 }
            }
            aggregated.campaigns[campaign].clicks += stats.clicks || 0
            aggregated.campaigns[campaign].conversions += stats.conversions || 0
          })
        }
      })

      setAnalytics(aggregated)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  const totalClicks = Object.values(analytics.sources).reduce((sum, s) => sum + s.clicks, 0)

  // If no data at all, show empty state
  if (totalClicks === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 md:p-12 text-center">
        <BarChart3 className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
          Zatím žádná data
        </h3>
        <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto">
          Analytická data se zobrazí, jakmile někdo klikne na váš affiliate odkaz.
          Sdílejte svůj odkaz a sledujte výsledky zde!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Sources */}
      <AnalyticsSection
        title="Zdroje návštěvnosti"
        icon={Globe}
        data={analytics.sources}
        totalClicks={totalClicks}
        color="blue"
        description="Odkud lidé přišli (Google, Facebook, přímý odkaz, atd.)"
      />

      {/* Devices */}
      <AnalyticsSection
        title="Zařízení"
        icon={Monitor}
        data={analytics.devices}
        totalClicks={totalClicks}
        color="purple"
      />

      {/* Browsers */}
      <AnalyticsSection
        title="Prohlížeče"
        icon={BarChart3}
        data={analytics.browsers}
        totalClicks={totalClicks}
        color="green"
      />

      {/* Campaigns */}
      {Object.keys(analytics.campaigns).length > 0 && (
        <AnalyticsSection
          title="Kampaně (UTM)"
          icon={TrendingUp}
          data={analytics.campaigns}
          totalClicks={totalClicks}
          color="pink"
        />
      )}
    </div>
  )
}

interface AnalyticsSectionProps {
  title: string
  icon: any
  data: Record<string, { clicks: number; conversions: number }>
  totalClicks: number
  color: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
  formatLabel?: (key: string) => string
  description?: string
}

function AnalyticsSection({ title, icon: Icon, data, totalClicks, color, formatLabel, description }: AnalyticsSectionProps) {
  // Sort by clicks descending
  const sortedData = Object.entries(data).sort((a, b) => b[1].clicks - a[1].clicks)

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    pink: 'bg-pink-50 border-pink-200 text-pink-600'
  }

  const barColors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500'
  }

  if (sortedData.length === 0) {
    return null
  }

  return (
    <div className={`rounded-lg border p-4 md:p-6 ${colorClasses[color]}`}>
      <div className="mb-4">
        <div className="flex items-center space-x-2 md:space-x-3 mb-1">
          <Icon className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
          <h3 className="text-base md:text-lg font-semibold">{title}</h3>
        </div>
        {description && (
          <p className="text-xs md:text-sm opacity-80 mt-1 ml-7 md:ml-9">{description}</p>
        )}
      </div>

      <div className="space-y-2 md:space-y-3">
        {sortedData.map(([key, stats]) => {
          const percentage = totalClicks > 0 ? (stats.clicks / totalClicks) * 100 : 0
          const label = formatLabel ? formatLabel(key) : key

          return (
            <div key={key} className="bg-white rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="font-medium text-gray-900 capitalize text-sm md:text-base truncate">{label}</span>
                <div className="text-right flex-shrink-0">
                  <span className="font-bold text-gray-900 text-sm md:text-base">{stats.clicks}</span>
                  <span className="text-xs md:text-sm text-gray-600 ml-1 md:ml-2">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 overflow-hidden">
                <div
                  className={`h-1.5 md:h-2 rounded-full ${barColors[color]} transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              {stats.conversions > 0 && (
                <div className="mt-1.5 md:mt-2 text-xs md:text-sm text-gray-600">
                  {stats.conversions} konverzí
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

