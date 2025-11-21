'use client'

import { useState, useEffect } from 'react'
import { useColorTheme } from '../ColorThemeContext'
import { RSVPContent } from '@/types/wedding-website'
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Accommodation } from '@/types'

interface RSVPSectionProps {
  content: RSVPContent
  websiteId: string
}

export default function RSVPSection({ content, websiteId }: RSVPSectionProps) {
  const { theme } = useColorTheme()
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [accommodationsLoading, setAccommodationsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: '1',
    attending: 'attending',
    accommodationId: '',
    roomId: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [availableRooms, setAvailableRooms] = useState<any[]>([])

  // Load accommodations for this wedding website (public access)
  useEffect(() => {
    const loadAccommodations = async () => {
      try {
        setAccommodationsLoading(true)

        // First, get the weddingId from the website
        const websiteRef = doc(db, 'weddingWebsites', websiteId)
        const websiteSnap = await getDoc(websiteRef)

        if (!websiteSnap.exists()) {
          console.log('Website not found')
          setAccommodationsLoading(false)
          return
        }

        const weddingId = websiteSnap.data().weddingId

        if (!weddingId) {
          console.log('No weddingId in website')
          setAccommodationsLoading(false)
          return
        }

        // Load accommodations for this wedding
        const accommodationsRef = collection(db, 'accommodations')
        const q = query(accommodationsRef, where('weddingId', '==', weddingId))
        const snapshot = await getDocs(q)

        const accommodationData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Accommodation[]

        console.log('🏨 Loaded accommodations for RSVP:', accommodationData.length)
        setAccommodations(accommodationData)
      } catch (error) {
        console.error('Error loading accommodations:', error)
      } finally {
        setAccommodationsLoading(false)
      }
    }

    if (websiteId) {
      loadAccommodations()
    }
  }, [websiteId])

  // Get available rooms from selected accommodation
  useEffect(() => {
    if (formData.accommodationId && accommodations.length > 0) {
      const selectedAccommodation = accommodations.find(acc => acc.id === formData.accommodationId)
      if (selectedAccommodation && selectedAccommodation.rooms) {
        const available = selectedAccommodation.rooms.filter(room => room.isAvailable)
        setAvailableRooms(available)
      } else {
        setAvailableRooms([])
      }
    } else {
      setAvailableRooms([])
      setFormData(prev => ({ ...prev, roomId: '' }))
    }
  }, [formData.accommodationId, accommodations])

  if (!content.enabled) return null

  const activeAccommodations = accommodations.filter(acc => acc.isActive)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log('RSVP Form Data:', formData)

      // Save RSVP response to Firestore
      await addDoc(collection(db, 'rsvpResponses'), {
        websiteId,
        name: formData.name,
        email: formData.email,
        guestCount: parseInt(formData.guests),
        attending: formData.attending,
        accommodationId: formData.accommodationId || null,
        roomId: formData.roomId || null,
        message: formData.message,
        createdAt: new Date()
      })

      console.log('✅ RSVP response saved to Firestore')
      setSubmitted(true)
    } catch (error) {
      console.error('❌ Error submitting RSVP:', error)
      alert('Chyba při odesílání. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section id="rsvp" className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
              Potvrzení účasti
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white border border-stone-200 rounded-2xl p-12 shadow-lg">
              <div className="text-6xl mb-6">✓</div>
              <h3 className="text-3xl font-serif font-light text-stone-900 mb-4">
                Děkujeme za potvrzení!
              </h3>
              <p className="text-stone-600 text-lg">
                Vaše odpověď byla úspěšně odeslána.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const formatDeadline = (date: Date | any) => {
    if (!date) return ''

    let dateObj: Date
    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'string') {
      dateObj = new Date(date)
    } else if (date.seconds) {
      dateObj = new Date(date.seconds * 1000)
    } else if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate()
    } else {
      return ''
    }

    return dateObj.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <section id="rsvp" className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            Potvrzení účasti
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
          {content.message && (
            <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto mb-4">
              {content.message}
            </p>
          )}
          {content.deadline && (
            <p className="text-stone-700 font-medium text-lg">
              Prosíme o potvrzení do: {formatDeadline(content.deadline)}
            </p>
          )}
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-12 shadow-lg space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Jméno a příjmení *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Počet hostů *
              </label>
              <select
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Účast *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="attending"
                    checked={formData.attending === 'attending'}
                    onChange={(e) => setFormData({ ...formData, attending: e.target.value })}
                    className="mr-2"
                  />
                  <span>Zúčastním se</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="declined"
                    checked={formData.attending === 'declined'}
                    onChange={(e) => setFormData({ ...formData, attending: e.target.value })}
                    className="mr-2"
                  />
                  <span>Bohužel se nezúčastním</span>
                </label>
              </div>
            </div>

            {/* Accommodation Selection */}
            {content.accommodationSelection && formData.attending === 'attending' && activeAccommodations.length > 0 && (
              <div className="border-t border-stone-200 pt-6">
                <h3 className="text-lg font-medium text-stone-900 mb-4">
                  Rezervace ubytování
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Vyberte ubytování
                    </label>
                    <select
                      value={formData.accommodationId}
                      onChange={(e) => setFormData({ ...formData, accommodationId: e.target.value, roomId: '' })}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                    >
                      <option value="">-- Nevybráno --</option>
                      {activeAccommodations.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.accommodationId && availableRooms.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Vyberte pokoj
                      </label>
                      <select
                        value={formData.roomId}
                        onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                      >
                        <option value="">-- Vyberte pokoj --</option>
                        {availableRooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name} - {room.pricePerNight ? `${room.pricePerNight} Kč/noc` : ''} (Kapacita: {room.capacity} {room.capacity === 1 ? 'osoba' : room.capacity <= 4 ? 'osoby' : 'osob'})
                          </option>
                        ))}
                      </select>
                      <p className="text-sm text-stone-500 mt-2">
                        K dispozici {availableRooms.length} {availableRooms.length === 1 ? 'pokoj' : availableRooms.length <= 4 ? 'pokoje' : 'pokojů'}
                      </p>
                    </div>
                  )}

                  {formData.accommodationId && availableRooms.length === 0 && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      Bohužel nejsou k dispozici žádné volné pokoje v tomto ubytování.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Vzkaz pro novomanžele
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Odesílám...' : 'Odeslat potvrzení'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

