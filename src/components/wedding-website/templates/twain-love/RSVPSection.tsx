'use client'

import { RSVPContent } from '@/types/wedding-website'
import { useState } from 'react'
import SectionTitle from './SectionTitle'

interface RSVPSectionProps {
  content: RSVPContent
  websiteId: string
}

export default function RSVPSection({ content, websiteId }: RSVPSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: '1',
    attending: 'attending',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!content.enabled) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Integrate with Firebase RSVP system
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      alert('Chyba při odesílání. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div id="rsvp" className="py-20 bg-white">
        <SectionTitle title="RSVP" />
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-2xl font-light text-gray-800 mb-2">
                Děkujeme za potvrzení!
              </h3>
              <p className="text-gray-600">
                Vaše odpověď byla úspěšně odeslána.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="rsvp" className="py-20 bg-white">
      <SectionTitle title="RSVP" />

      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {content.message && (
            <p className="text-center text-gray-600 mb-8">
              {content.message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jméno a příjmení *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#85aaba] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#85aaba] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Počet hostů *
              </label>
              <select
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#85aaba] focus:border-transparent"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vzkaz pro novomanžele
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#85aaba] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#85aaba] text-white rounded-lg hover:bg-[#6a8a98] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Odesílám...' : 'Odeslat potvrzení'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

