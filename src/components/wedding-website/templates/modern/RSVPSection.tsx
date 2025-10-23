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

export default function ModernRSVPSection({ content, websiteId, weddingId }: RSVPSectionProps) {
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
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white p-16 shadow-sm border border-gray-200">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-8" />
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Děkujeme za potvrzení!
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Vaše odpověď byla úspěšně odeslána. Těšíme se na vás!
            </p>
            
            {formData.attendance === 'yes' && (
              <div className="bg-gray-50 p-8 text-left max-w-md mx-auto">
                <h3 className="font-medium text-gray-900 mb-4">
                  Shrnutí vaší účasti:
                </h3>
                <div className="space-y-2 text-gray-700">
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
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Potvrzení účasti
          </h2>
          <div className="w-12 h-px bg-gray-900 mx-auto mb-8"></div>
          
          {content.message && (
            <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-8">
              {content.message}
            </p>
          )}

          {content.deadline && (
            <div className="inline-flex items-center gap-3 bg-white border border-gray-200 px-6 py-3">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="font-light text-gray-900">
                Potvrďte prosím do {content.deadline.toLocaleDateString('cs-CZ')}
              </span>
            </div>
          )}
        </div>

        {/* RSVP Form */}
        <div className="bg-white p-12 shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3 tracking-wide">
                  JMÉNO A PŘÍJMENÍ *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Zadejte vaše jméno"
                  className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3 tracking-wide">
                  EMAIL *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="vas@email.cz"
                  className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3 tracking-wide">
                  TELEFON
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+420 123 456 789"
                  className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent"
                />
              </div>
            </div>

            {/* Attendance */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-6 tracking-wide">
                ÚČAST *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center p-6 border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="radio"
                    name="attendance"
                    value="yes"
                    checked={formData.attendance === 'yes'}
                    onChange={(e) => handleInputChange('attendance', e.target.value)}
                    className="text-gray-900 focus:ring-gray-900 border-gray-300"
                  />
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">Ano, zúčastním se</div>
                    <div className="text-sm text-gray-600">Těšíme se na vás!</div>
                  </div>
                </label>

                <label className="flex items-center p-6 border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="radio"
                    name="attendance"
                    value="no"
                    checked={formData.attendance === 'no'}
                    onChange={(e) => handleInputChange('attendance', e.target.value)}
                    className="text-gray-900 focus:ring-gray-900 border-gray-300"
                  />
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">Ne, nezúčastním se</div>
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
                    <label className="block text-sm font-medium text-gray-900 mb-3 tracking-wide">
                      <Users className="w-4 h-4 inline mr-2" />
                      POČET OSOB
                    </label>
                    <select
                      value={formData.guestCount}
                      onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value))}
                      className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent"
                    >
                      <option value={1}>1 osoba</option>
                      <option value={2}>2 osoby</option>
                    </select>
                  </div>
                )}

                {/* Meal Selection */}
                {content.mealSelection && content.mealOptions && content.mealOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-6 tracking-wide">
                      <Utensils className="w-4 h-4 inline mr-2" />
                      VÝBĚR JÍDLA
                    </label>
                    <div className="space-y-4">
                      {content.mealOptions.map((option) => (
                        <label key={option.id} className="flex items-start p-4 border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors">
                          <input
                            type="radio"
                            name="mealChoice"
                            value={option.name}
                            checked={formData.mealChoice === option.name}
                            onChange={(e) => handleInputChange('mealChoice', e.target.value)}
                            className="text-gray-900 focus:ring-gray-900 border-gray-300 mt-1"
                          />
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{option.name}</div>
                            {option.description && (
                              <div className="text-sm text-gray-600 mt-1">{option.description}</div>
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
                    <label className="block text-sm font-medium text-gray-900 mb-3 tracking-wide">
                      DIETNÍ OMEZENÍ / ALERGIE
                    </label>
                    <textarea
                      value={formData.dietaryRestrictions}
                      onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                      placeholder="Popište vaše dietní požadavky nebo alergie..."
                      rows={3}
                      className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent resize-none"
                    />
                  </div>
                )}

                {/* Song Requests */}
                {content.songRequests && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3 tracking-wide">
                      <Music className="w-4 h-4 inline mr-2" />
                      PŘÁNÍ PÍSNIČEK
                    </label>
                    <input
                      type="text"
                      value={formData.songRequest}
                      onChange={(e) => handleInputChange('songRequest', e.target.value)}
                      placeholder="Jaké písničky byste rádi slyšeli?"
                      className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent"
                    />
                  </div>
                )}
              </>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3 tracking-wide">
                VZKAZ PRO NÁS (VOLITELNÉ)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Napište nám něco hezkého..."
                rows={3}
                className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-gray-900 focus:ring-0 bg-transparent resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center pt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-3 bg-gray-900 text-white px-12 py-4 font-light text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ODESÍLÁNÍ...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    ODESLAT POTVRZENÍ
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Contact Info */}
        {(content.contactName || content.contactPhone || content.contactEmail) && (
          <div className="mt-16 text-center">
            <div className="bg-white p-8 shadow-sm border border-gray-200 inline-block">
              <h3 className="font-medium text-gray-900 mb-6 tracking-wide">
                MÁTE DOTAZY? KONTAKTUJTE NÁS:
              </h3>
              <div className="space-y-3 text-gray-700">
                {content.contactName && (
                  <p className="font-light">{content.contactName}</p>
                )}
                {content.contactPhone && (
                  <div className="flex items-center justify-center gap-3">
                    <Phone className="w-4 h-4" />
                    <span>{content.contactPhone}</span>
                  </div>
                )}
                {content.contactEmail && (
                  <div className="flex items-center justify-center gap-3">
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
