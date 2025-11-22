'use client'

import React, { useState, useEffect } from 'react'
import { Section } from './Section'
import { DisplayText, Paragraph } from './Typography'
import { RSVPContent } from '@/types/wedding-website'
import { collection, addDoc, Timestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
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
    attending: 'attending',
    accommodationId: '',
    roomId: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

        console.log('🏨 Noir & Blanc - Loaded accommodations for RSVP:', accommodationData.length)
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
    setError(null)

    try {
      // Save RSVP to Firestore
      const rsvpData: any = {
        websiteId,
        name: formData.name,
        email: formData.email,
        guests: parseInt(formData.guests),
        status: formData.attending as 'attending' | 'declined' | 'maybe',
        message: formData.message,
        createdAt: Timestamp.now(),
      }

      // Add accommodation info if selected and attending
      if (formData.attending === 'attending' && formData.accommodationId && formData.roomId) {
        rsvpData.accommodationId = formData.accommodationId
        rsvpData.roomId = formData.roomId
      }

      await addDoc(collection(db, 'rsvps'), rsvpData)

      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting RSVP:', err)
      setError('Nepodařilo se odeslat odpověď. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDeadline = (date?: Date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (submitted) {
    return (
      <Section id="rsvp" className="bg-black text-[#f2f0ea] flex flex-col items-center justify-center text-center min-h-[60vh]">
        <DisplayText className="text-[#f2f0ea] mb-8">Děkujeme</DisplayText>
        <Paragraph className="text-[#f2f0ea]/60 max-w-xl mx-auto">
          Vaše odpověď byla úspěšně zaznamenána. Těšíme se na vás.
        </Paragraph>
      </Section>
    )
  }

  return (
    <Section id="rsvp" className="bg-black text-[#f2f0ea]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 border-b border-[#f2f0ea]/20 pb-8">
          <h2 className="font-serif text-6xl md:text-9xl text-[#f2f0ea] mb-4">Potvrzení účasti</h2>
          {content.deadline && (
            <p className="font-sans uppercase tracking-[0.3em] text-[#d4b0aa]">
              Potvrďte účast do {formatDeadline(content.deadline)}
            </p>
          )}
          {content.message && (
            <p className="mt-4 text-[#f2f0ea]/70">{content.message}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="group">
              <label className="block font-sans text-xs uppercase tracking-widest text-[#f2f0ea]/50 mb-2">
                Jméno a Příjmení
              </label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent border-b border-[#f2f0ea]/30 py-4 text-xl font-serif text-[#f2f0ea] focus:border-[#d4b0aa] focus:outline-none transition-colors"
              />
            </div>
            <div className="group">
              <label className="block font-sans text-xs uppercase tracking-widest text-[#f2f0ea]/50 mb-2">
                Email
              </label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-b border-[#f2f0ea]/30 py-4 text-xl font-serif text-[#f2f0ea] focus:border-[#d4b0aa] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <label className="block font-sans text-xs uppercase tracking-widest text-[#f2f0ea]/50 mb-2">
                Počet osob
              </label>
              <select 
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full bg-transparent border-b border-[#f2f0ea]/30 py-4 text-xl font-sans text-[#f2f0ea] focus:border-[#d4b0aa] focus:outline-none appearance-none"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n} className="bg-black">{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-sans text-xs uppercase tracking-widest text-[#f2f0ea]/50 mb-2">
                Účast
              </label>
              <select 
                value={formData.attending}
                onChange={(e) => setFormData({ ...formData, attending: e.target.value })}
                className="w-full bg-transparent border-b border-[#f2f0ea]/30 py-4 text-xl font-sans text-[#f2f0ea] focus:border-[#d4b0aa] focus:outline-none appearance-none"
              >
                <option className="bg-black" value="attending">S radostí dorazím</option>
                <option className="bg-black" value="declined">Bohužel nedorazím</option>
                <option className="bg-black" value="maybe">Zatím nevím</option>
              </select>
            </div>
          </div>

          {/* Accommodation Selection - only show if attending and enabled */}
          {content.accommodationSelection && formData.attending === 'attending' && accommodations.length > 0 && (
            <div className="border-t border-[#f2f0ea]/20 pt-12 space-y-8">
              <h3 className="font-serif text-3xl text-[#f2f0ea] text-center mb-8">Rezervace ubytování (volitelné)</h3>

              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-[#f2f0ea]/50 mb-2">
                  Vyberte ubytování
                </label>
                <select
                  value={formData.accommodationId}
                  onChange={(e) => setFormData({ ...formData, accommodationId: e.target.value, roomId: '' })}
                  className="w-full bg-transparent border-b border-[#f2f0ea]/30 py-4 text-xl font-sans text-[#f2f0ea] focus:border-[#d4b0aa] focus:outline-none appearance-none"
                >
                  <option className="bg-black" value="">Nevybráno</option>
                  {accommodations.map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-black">
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.accommodationId && availableRooms.length > 0 && (
                <div>
                  <label className="block font-sans text-xs uppercase tracking-widest text-[#f2f0ea]/50 mb-2">
                    Vyberte typ pokoje
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full bg-transparent border-b border-[#f2f0ea]/30 py-4 text-xl font-sans text-[#f2f0ea] focus:border-[#d4b0aa] focus:outline-none appearance-none"
                  >
                    <option className="bg-black" value="">Vyberte pokoj</option>
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.id} className="bg-black">
                        {room.type} - {room.price} Kč/noc
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.accommodationId && availableRooms.length === 0 && (
                <p className="text-sm text-[#f2f0ea]/60 text-center">
                  Pro toto ubytování nejsou momentálně dostupné žádné pokoje.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block font-sans text-xs uppercase tracking-widest text-[#f2f0ea]/50 mb-2">
              Vzkaz pro novomanžele (Dieta, Písničky...)
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-transparent border-b border-[#f2f0ea]/30 py-4 text-xl font-serif text-[#f2f0ea] focus:border-[#d4b0aa] focus:outline-none resize-none"
            />
          </div>

          {error && (
            <div className="text-red-400 text-center">{error}</div>
          )}

          <div className="text-center pt-8">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-16 py-4 bg-[#f2f0ea] text-black font-sans uppercase tracking-widest hover:bg-[#d4b0aa] transition-colors duration-300 disabled:opacity-50"
            >
              {isSubmitting ? 'Odesílám...' : 'Odeslat potvrzení'}
            </button>
          </div>
        </form>
      </div>
    </Section>
  )
}

