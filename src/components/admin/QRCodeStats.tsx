'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Clock,
  BarChart3,
  Eye
} from 'lucide-react'

interface QRVisit {
  id: string
  timestamp: Timestamp
  userAgent?: string
  referrer?: string
  ip?: string
}

interface QRStats {
  totalVisits: number
  todayVisits: number
  weekVisits: number
  monthVisits: number
  uniqueVisitors: number
  recentVisits: QRVisit[]
}

export default function QRCodeStats() {
  const [stats, setStats] = useState<QRStats>({
    totalVisits: 0,
    todayVisits: 0,
    weekVisits: 0,
    monthVisits: 0,
    uniqueVisitors: 0,
    recentVisits: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🎯 QRCodeStats component mounted')
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      console.log('📊 Loading QR code statistics...')

      // Load QR code visits from Firebase
      const visitsRef = collection(db, 'qrCodeVisits')
      const visitsQuery = query(visitsRef, orderBy('timestamp', 'desc'))

      console.log('🔍 Querying qrCodeVisits collection...')
      const visitsSnap = await getDocs(visitsQuery)
      console.log('📦 Retrieved documents:', visitsSnap.size)

      const visits: QRVisit[] = visitsSnap.docs.map(doc => {
        const data = doc.data()
        console.log('📄 Document data:', doc.id, data)
        return {
          id: doc.id,
          ...data
        } as QRVisit
      })

      console.log('✅ Total visits loaded:', visits.length)

      // Calculate time ranges
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      // Calculate stats
      const todayVisits = visits.filter(v =>
        v.timestamp.toDate() >= todayStart
      ).length

      const weekVisits = visits.filter(v =>
        v.timestamp.toDate() >= weekStart
      ).length

      const monthVisits = visits.filter(v =>
        v.timestamp.toDate() >= monthStart
      ).length

      // Calculate unique visitors (simplified - based on IP if available)
      const uniqueIPs = new Set(visits.map(v => v.ip).filter(Boolean))
      const uniqueVisitors = uniqueIPs.size || visits.length

      const statsData = {
        totalVisits: visits.length,
        todayVisits,
        weekVisits,
        monthVisits,
        uniqueVisitors,
        recentVisits: visits.slice(0, 10)
      }

      console.log('📊 Calculated stats:', statsData)
      setStats(statsData)
    } catch (error) {
      console.error('❌ Error loading QR stats:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Celkem návštěv"
          value={stats.totalVisits}
          icon={Eye}
          color="blue"
          subtitle="Všechny návštěvy přes QR"
        />
        
        <StatCard
          title="Dnes"
          value={stats.todayVisits}
          icon={Calendar}
          color="green"
          subtitle="Návštěvy dnes"
        />
        
        <StatCard
          title="Tento týden"
          value={stats.weekVisits}
          icon={TrendingUp}
          color="purple"
          subtitle="Posledních 7 dní"
        />
        
        <StatCard
          title="Tento měsíc"
          value={stats.monthVisits}
          icon={BarChart3}
          color="orange"
          subtitle="Aktuální měsíc"
        />
      </div>

      {/* Recent Visits */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Poslední návštěvy
        </h3>
        
        {stats.recentVisits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Zatím žádné návštěvy přes QR kód</p>
            <p className="text-sm mt-1">Sdílejte QR kód v tištěných materiálech</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recentVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Návštěva z QR kódu
                    </p>
                    <p className="text-xs text-gray-500">
                      {visit.timestamp.toDate().toLocaleString('cs-CZ')}
                    </p>
                  </div>
                </div>
                {visit.userAgent && (
                  <div className="text-xs text-gray-400 max-w-xs truncate">
                    {visit.userAgent.includes('Mobile') ? '📱 Mobil' : '💻 Desktop'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle
}: {
  title: string
  value: number
  icon: any
  color: string
  subtitle?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('cs-CZ')}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

