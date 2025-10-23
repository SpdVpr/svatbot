'use client'

import { useState } from 'react'
import { Calendar, Users, Utensils, Music, Send, CheckCircle, Phone, Mail } from 'lucide-react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { RSVPContent } from '@/types/wedding-website'

interface RSVPSectionProps {
  content: RSVPContent
  websiteId: string
  weddingId: string
}

interface RSVPFormData {
  name: string
  email: string
  phone?: string
  attendance: 'yes' | 'no' | ''
  guestCount: number
  mealChoice?: string
  songRequest?: string
  dietaryRestrictions?: string
  message?: string
}

export default function RSVPSection({ content, websiteId, weddingId }: RSVPSectionProps) {
  const [formData, setFormData] = useState<RSVPFormData>({
    name: '',
    email: '',
    phone: '',
    attendance: '',
    guestCount: 1,
    mealChoice: '',
    songRequest: '',
    dietaryRestrictions: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: keyof RSVPFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.attendance) {
      alert('Prosím vyplňte všechna povinná pole')
      return
    }

    setIsSubmitting(true)

    try {
      // Save RSVP to Firestore
      const rsvpData = {
        websiteId,
        weddingId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        status: formData.attendance === 'yes' ? 'attending' : formData.attendance === 'no' ? 'declined' : 'maybe',
        guestCount: formData.guestCount,
        mealChoice: formData.mealChoice || null,
        dietaryRestrictions: formData.dietaryRestrictions || null,
        songRequest: formData.songRequest || null,
        message: formData.message || null,
        submittedAt: Timestamp.now(),
        confirmed: false
      }

      await addDoc(collection(db, 'weddingWebsiteRSVPs'), rsvpData)

      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      alert('Chyba při odesílání. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg scale-in">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6 bounce-in" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif slide-in-bottom" style={{ animationDelay: '0.2s' }}>
              Děkujeme za potvrzení!
            </h2>
            <p className="text-gray-600 text-lg mb-6 fade-in" style={{ animationDelay: '0.4s' }}>
              Vaše odpověď byla úspěšně odeslána. Těšíme se na vás!
            </p>
            
            {formData.attendance === 'yes' && (
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-2">
                  Shrnutí vaší účasti:
                </h3>
                <div className="text-left space-y-2 text-green-800">
                  <p><strong>Jméno:</strong> {formData.name}</p>
                  <p><strong>Počet osob:</strong> {formData.guestCount}</p>
                  {formData.mealChoice && (
                    <p><strong>Výběr jídla:</strong> {formData.mealChoice}</p>
                  )}
                  {formData.songRequest && (
                    <p><strong>Přání písničky:</strong> {formData.songRequest}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif scale-in">
            Potvrzení účasti
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto mb-6 slide-in-left" style={{ animationDelay: '0.2s' }}></div>
          
          {content.message && (
            <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-6">
              {content.message}
            </p>
          )}

          {content.deadline && (
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                Potvrďte prosím do {content.deadline.toLocaleDateString('cs-CZ')}
              </span>
            </div>
          )}
        </div>

        {/* RSVP Form */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Jméno a příjmení *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Zadejte vaše jméno"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="vas@email.cz"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+420 123 456 789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Attendance */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Účast *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-300 transition-colors">
                  <input
                    type="radio"
                    name="attendance"
                    value="yes"
                    checked={formData.attendance === 'yes'}
                    onChange={(e) => handleInputChange('attendance', e.target.value)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Ano, zúčastním se</div>
                    <div className="text-sm text-gray-600">Těšíme se na vás!</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-300 transition-colors">
                  <input
                    type="radio"
                    name="attendance"
                    value="no"
                    checked={formData.attendance === 'no'}
                    onChange={(e) => handleInputChange('attendance', e.target.value)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Ne, nezúčastním se</div>
                    <div className="text-sm text-gray-600">Budeme vás postrádat</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional fields only if attending */}
            {formData.attendance === 'yes' && (
              <>
                {/* Guest Count */}
                {content.plusOneAllowed && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Počet osob
                    </label>
                    <select
                      value={formData.guestCount}
                      onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value={1}>1 osoba</option>
                      <option value={2}>2 osoby</option>
                    </select>
                  </div>
                )}

                {/* Meal Selection */}
                {content.mealSelection && content.mealOptions && content.mealOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      <Utensils className="w-4 h-4 inline mr-1" />
                      Výběr jídla
                    </label>
                    <div className="space-y-3">
                      {content.mealOptions.map((option) => (
                        <label key={option.id} className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-rose-300 transition-colors">
                          <input
                            type="radio"
                            name="mealChoice"
                            value={option.name}
                            checked={formData.mealChoice === option.name}
                            onChange={(e) => handleInputChange('mealChoice', e.target.value)}
                            className="text-rose-600 focus:ring-rose-500 mt-1"
                          />
                          <div className="ml-3">
                            <div className="font-semibold text-gray-900">{option.name}</div>
                            {option.description && (
                              <div className="text-sm text-gray-600">{option.description}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dietary Restrictions */}
                {content.dietaryRestrictions && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Dietní omezení / Alergie
                    </label>
                    <textarea
                      value={formData.dietaryRestrictions}
                      onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                      placeholder="Popište vaše dietní požadavky nebo alergie..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Song Requests */}
                {content.songRequests && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <Music className="w-4 h-4 inline mr-1" />
                      Přání písniček
                    </label>
                    <input
                      type="text"
                      value={formData.songRequest}
                      onChange={(e) => handleInputChange('songRequest', e.target.value)}
                      placeholder="Jaké písničky byste rádi slyšeli?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                )}
              </>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Vzkaz pro nás (volitelné)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Napište nám něco hezkého..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-rose-600 hover:to-amber-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Odesílání...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Odeslat potvrzení
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Contact Info */}
        {(content.contactName || content.contactPhone || content.contactEmail) && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl p-6 shadow-lg inline-block">
              <h3 className="font-semibold text-gray-900 mb-4">
                Máte dotazy? Kontaktujte nás:
              </h3>
              <div className="space-y-2 text-gray-700">
                {content.contactName && (
                  <p className="font-medium">{content.contactName}</p>
                )}
                {content.contactPhone && (
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{content.contactPhone}</span>
                  </div>
                )}
                {content.contactEmail && (
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{content.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
