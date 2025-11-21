'use client'

import { RSVPContent } from '@/types/wedding-website'
import { useState, useEffect } from 'react'
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Accommodation } from '@/types'

interface RSVPSectionProps {
  content: RSVPContent
  websiteId: string
}

export default function RSVPSection({ content, websiteId }: RSVPSectionProps) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [accommodationsLoading, setAccommodationsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: '1',
    attending: 'all',
    accommodationId: '',
    roomId: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const rsvpData: any = {
        websiteId,
        name: formData.name,
        email: formData.email,
        guestCount: parseInt(formData.guests),
        attending: formData.attending,
        message: formData.message,
        createdAt: new Date()
      }

      // Add accommodation info if selected
      if (formData.attending !== 'no' && formData.accommodationId && formData.roomId) {
        rsvpData.accommodationId = formData.accommodationId
        rsvpData.roomId = formData.roomId
      }

      await addDoc(collection(db, 'rsvpResponses'), rsvpData)

      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        guests: '1',
        attending: 'all',
        accommodationId: '',
        roomId: '',
        message: ''
      })
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="rsvp"
      className="py-20 relative"
      style={{
        background: 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%)'
      }}
    >
      {/* Decorative Flowers */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-64 opacity-50 hidden lg:block"
        style={{
          backgroundImage: 'url(/templates/pretty/images/rsvp-left-flower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-64 opacity-50 hidden lg:block"
        style={{
          backgroundImage: 'url(/templates/pretty/images/rsvp-right-flower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-8 md:p-12">
          <h3
            className="text-4xl md:text-5xl text-center mb-4 text-gray-800"
            style={{ fontFamily: 'Great Vibes, cursive' }}
          >
            Potvrzení účasti
          </h3>
          <p className="text-center text-gray-600 mb-8">
            {content.deadline 
              ? `Prosím potvrďte svou účast do ${new Date(content.deadline).toLocaleDateString('cs-CZ')}`
              : 'Prosím potvrďte svou účast'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Jméno*"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email*"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="1">1 host</option>
                <option value="2">2 hosté</option>
                <option value="3">3 hosté</option>
                <option value="4">4 hosté</option>
              </select>
            </div>

            <div>
              <select
                value={formData.attending}
                onChange={(e) => setFormData({ ...formData, attending: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-[#b19a56]"
              >
                <option value="all">Zúčastním se</option>
                <option value="no">Nezúčastním se</option>
              </select>
            </div>

            {/* Accommodation Selection - only show if attending */}
            {formData.attending !== 'no' && accommodations.length > 0 && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-800">Ubytování (volitelné)</h4>

                <div>
                  <select
                    value={formData.accommodationId}
                    onChange={(e) => setFormData({ ...formData, accommodationId: e.target.value, roomId: '' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-[#b19a56]"
                  >
                    <option value="">Nevybráno</option>
                    {accommodations.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.accommodationId && availableRooms.length > 0 && (
                  <div>
                    <select
                      value={formData.roomId}
                      onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-[#b19a56]"
                    >
                      <option value="">Vyberte pokoj</option>
                      {availableRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} - {room.capacity} {room.capacity === 1 ? 'osoba' : room.capacity <= 4 ? 'osoby' : 'osob'}
                          {room.pricePerNight && ` - ${room.pricePerNight} Kč/noc`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.accommodationId && availableRooms.length === 0 && (
                  <p className="text-sm text-gray-600">
                    Pro toto ubytování nejsou momentálně dostupné žádné pokoje.
                  </p>
                )}
              </div>
            )}

            <div>
              <textarea
                placeholder="Vaše zpráva"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-[#b19a56] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#b19a56'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#9a8449'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#b19a56'
                }
              }}
            >
              {isSubmitting ? 'Odesílání...' : 'Odeslat potvrzení'}
            </button>

            {submitStatus === 'success' && (
              <div className="text-center text-green-600 font-semibold">
                Děkujeme za potvrzení!
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="text-center text-red-600 font-semibold">
                Došlo k chybě. Zkuste to prosím znovu.
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

