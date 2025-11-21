'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'
import { useAuthStore } from '@/stores/authStore'
import { useWeddingStore } from '@/stores/weddingStore'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { ArrowLeft, CheckCircle, XCircle, Clock, Users, Mail, Phone, Utensils, Music, MessageSquare, Calendar, Globe } from 'lucide-react'
import Link from 'next/link'
import ModuleHeader from '@/components/common/ModuleHeader'
import type { RSVP } from '@/types/wedding-website'

export default function RSVPManagementPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentWedding: wedding } = useWeddingStore()
  const { website, loading: websiteLoading } = useWeddingWebsite()
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'attending' | 'declined' | 'maybe'>('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (!website) {
      setLoading(false)
      return
    }

    // Load RSVPs from Firestore (rsvpResponses collection)
    // Note: We don't use orderBy here to avoid requiring a composite index
    // Instead, we sort the data on the client side
    const rsvpsQuery = query(
      collection(db, 'rsvpResponses'),
      where('websiteId', '==', website.id)
    )

    const unsubscribe = onSnapshot(
      rsvpsQuery,
      (snapshot) => {
        const rsvpData = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            websiteId: data.websiteId,
            weddingId: wedding?.id || '',
            name: data.name,
            email: data.email,
            guestCount: data.guestCount,
            status: data.attending === 'attending' ? 'attending' : 'declined',
            message: data.message || '',
            accommodationId: data.accommodationId || null,
            roomId: data.roomId || null,
            confirmed: false,
            submittedAt: data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : new Date(data.createdAt)
          } as RSVP
        })

        // Sort by submittedAt descending (newest first) on the client side
        rsvpData.sort((a, b) => {
          const dateA = a.submittedAt instanceof Date ? a.submittedAt.getTime() : 0
          const dateB = b.submittedAt instanceof Date ? b.submittedAt.getTime() : 0
          return dateB - dateA
        })

        console.log('📋 Loaded RSVP responses:', rsvpData.length)
        setRsvps(rsvpData)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading RSVPs:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [website])

  if (websiteLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  if (!website) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Žádný svatební web
            </h1>
            <p className="text-gray-600 mb-4">
              Nejdříve si vytvořte svatební web.
            </p>
            <Link href="/wedding-website" className="btn-primary">
              Zpět na svatební web
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Filter RSVPs
  const filteredRsvps = rsvps.filter(rsvp => {
    if (filter === 'all') return true
    return rsvp.status === filter
  })

  // Calculate stats
  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.status === 'attending').length,
    declined: rsvps.filter(r => r.status === 'declined').length,
    maybe: rsvps.filter(r => r.status === 'maybe').length,
    totalGuests: rsvps.filter(r => r.status === 'attending').reduce((sum, r) => sum + r.guestCount, 0)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <ModuleHeader
        icon={Globe}
        title="RSVP odpovědi"
        subtitle={`${website.customUrl}.svatbot.cz • Správa potvrzení účasti`}
        iconGradient="from-pink-500 to-purple-500"
        hideBackButton={true}
        actions={
          <Link
            href="/wedding-website"
            className="btn-primary flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zpět</span>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Celkem odpovědí</span>
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Přijde</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {stats.attending}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Nepřijde</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">
              {stats.declined}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Možná</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.maybe}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Celkem hostů</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalGuests}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Všechny ({stats.total})
            </button>
            <button
              onClick={() => setFilter('attending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'attending'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Přijde ({stats.attending})
            </button>
            <button
              onClick={() => setFilter('declined')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'declined'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nepřijde ({stats.declined})
            </button>
            <button
              onClick={() => setFilter('maybe')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'maybe'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Možná ({stats.maybe})
            </button>
          </div>
        </div>

        {/* RSVP List */}
        {filteredRsvps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Zatím žádné odpovědi
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Jakmile hosté vyplní RSVP formulář na vašem webu, zobrazí se zde.'
                : 'Žádné odpovědi v této kategorii.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRsvps.map(rsvp => (
              <div key={rsvp.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {rsvp.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        rsvp.status === 'attending' 
                          ? 'bg-green-100 text-green-800'
                          : rsvp.status === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rsvp.status === 'attending' && <CheckCircle className="w-3 h-3" />}
                        {rsvp.status === 'declined' && <XCircle className="w-3 h-3" />}
                        {rsvp.status === 'maybe' && <Clock className="w-3 h-3" />}
                        {rsvp.status === 'attending' ? 'Přijde' : rsvp.status === 'declined' ? 'Nepřijde' : 'Možná'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {rsvp.email}
                      </div>
                      
                      {rsvp.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {rsvp.phone}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        Počet osob: {rsvp.guestCount}
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {rsvp.submittedAt.toLocaleDateString('cs-CZ', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional info */}
                {(rsvp.mealChoice || rsvp.dietaryRestrictions || rsvp.songRequest || rsvp.message) && (
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                    {rsvp.mealChoice && (
                      <div className="flex items-start gap-2 text-sm">
                        <Utensils className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700">Výběr jídla:</span>
                          <span className="text-gray-600 ml-2">{rsvp.mealChoice}</span>
                        </div>
                      </div>
                    )}
                    
                    {rsvp.dietaryRestrictions && (
                      <div className="flex items-start gap-2 text-sm">
                        <Utensils className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700">Dietní omezení:</span>
                          <span className="text-gray-600 ml-2">{rsvp.dietaryRestrictions}</span>
                        </div>
                      </div>
                    )}
                    
                    {rsvp.songRequest && (
                      <div className="flex items-start gap-2 text-sm">
                        <Music className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700">Přání písničky:</span>
                          <span className="text-gray-600 ml-2">{rsvp.songRequest}</span>
                        </div>
                      </div>
                    )}
                    
                    {rsvp.message && (
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700">Vzkaz:</span>
                          <p className="text-gray-600 ml-2">{rsvp.message}</p>
                        </div>
                      </div>
                    )}
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

