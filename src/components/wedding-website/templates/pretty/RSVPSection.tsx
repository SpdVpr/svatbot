'use client'

import { RSVPContent } from '@/types/wedding-website'
import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'

interface RSVPSectionProps {
  content: RSVPContent
  websiteId: string
}

export default function RSVPSection({ content, websiteId }: RSVPSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: '1',
    attending: 'all',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)

  if (!content.enabled) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await addDoc(collection(db, 'rsvpResponses'), {
        websiteId,
        name: formData.name,
        email: formData.email,
        guestCount: parseInt(formData.guests),
        attending: formData.attending,
        message: formData.message,
        createdAt: new Date()
      })

      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        guests: '1',
        attending: 'all',
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
                <option value="all">Všechny události</option>
                <option value="ceremony">Pouze obřad</option>
                <option value="reception">Pouze hostina</option>
              </select>
            </div>

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

