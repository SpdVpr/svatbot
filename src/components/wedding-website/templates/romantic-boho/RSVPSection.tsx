'use client'

import { useState } from 'react'
import { Heart, User, Users, Mail, Phone, MessageSquare, Check, Utensils, Music } from 'lucide-react'
import type { RSVPContent } from '@/types/wedding-website'

interface RSVPSectionProps {
  content: RSVPContent
  websiteId: string
  weddingId: string
}

export default function RSVPSection({ content, websiteId, weddingId }: RSVPSectionProps) {
  if (!content.enabled) return null

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    attending: '',
    guests: '1',
    meal: '',
    dietary: '',
    song: '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual RSVP submission
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="relative py-24 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl border-4 border-rose-200">
            <div className="inline-block mb-6">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full p-6">
                <Check className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h3 className="text-4xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Děkujeme! 💕
            </h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              Vaše odpověď byla úspěšně odeslána. Těšíme se na vás!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-20"></div>

      <div className="relative max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-300 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-rose-100 to-pink-100 rounded-full p-5">
                <Heart className="w-10 h-10 text-rose-600 fill-rose-400" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Potvrzení účasti
          </h2>
          {content.deadline && (
            <p className="text-lg text-rose-600 font-semibold">
              Prosíme o odpověď do {new Date(content.deadline).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          {content.message && (
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">{content.message}</p>
          )}
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-rose-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <User className="w-5 h-5 text-rose-500" />
                Jméno a příjmení *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-rose-100 rounded-2xl focus:border-rose-400 focus:outline-none transition-colors"
                placeholder="Vaše jméno"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Mail className="w-5 h-5 text-rose-500" />
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-rose-100 rounded-2xl focus:border-rose-400 focus:outline-none transition-colors"
                placeholder="vas@email.cz"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Phone className="w-5 h-5 text-rose-500" />
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-rose-100 rounded-2xl focus:border-rose-400 focus:outline-none transition-colors"
                placeholder="+420 123 456 789"
              />
            </div>

            {/* Attending */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <Heart className="w-5 h-5 text-rose-500" />
                Zúčastníte se? *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, attending: 'yes' })}
                  className={`py-4 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                    formData.attending === 'yes'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-rose-50 text-gray-700 hover:bg-rose-100'
                  }`}
                >
                  ✅ Ano, přijdu
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, attending: 'no' })}
                  className={`py-4 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                    formData.attending === 'no'
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ❌ Bohužel nemohu
                </button>
              </div>
            </div>

            {formData.attending === 'yes' && (
              <>
                {/* Number of guests */}
                {content.plusOneAllowed && (
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                      <Users className="w-5 h-5 text-rose-500" />
                      Počet osob
                    </label>
                    <select
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-rose-100 rounded-2xl focus:border-rose-400 focus:outline-none transition-colors"
                    >
                      <option value="1">1 osoba</option>
                      <option value="2">2 osoby</option>
                      <option value="3">3 osoby</option>
                      <option value="4">4 osoby</option>
                    </select>
                  </div>
                )}

                {/* Meal selection */}
                {content.mealSelection && content.mealOptions && content.mealOptions.length > 0 && (
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                      <Utensils className="w-5 h-5 text-rose-500" />
                      Výběr menu
                    </label>
                    <div className="space-y-3">
                      {content.mealOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, meal: option.id })}
                          className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                            formData.meal === option.id
                              ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400 shadow-lg'
                              : 'bg-amber-50 border-2 border-amber-100 hover:border-amber-300'
                          }`}
                        >
                          <p className="font-bold text-gray-800">{option.name}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dietary restrictions */}
                {content.dietaryRestrictions && (
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                      <MessageSquare className="w-5 h-5 text-rose-500" />
                      Dietní omezení nebo alergie
                    </label>
                    <textarea
                      value={formData.dietary}
                      onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-rose-100 rounded-2xl focus:border-rose-400 focus:outline-none transition-colors"
                      rows={3}
                      placeholder="Vegetarián, bezlepková dieta, alergie..."
                    />
                  </div>
                )}

                {/* Song requests */}
                {content.songRequests && (
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                      <Music className="w-5 h-5 text-rose-500" />
                      Přání na písničku 🎵
                    </label>
                    <input
                      type="text"
                      value={formData.song}
                      onChange={(e) => setFormData({ ...formData, song: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-rose-100 rounded-2xl focus:border-rose-400 focus:outline-none transition-colors"
                      placeholder="Vaše oblíbená písnička"
                    />
                  </div>
                )}
              </>
            )}

            {/* Message */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <MessageSquare className="w-5 h-5 text-rose-500" />
                Vzkaz pro nás
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border-2 border-rose-100 rounded-2xl focus:border-rose-400 focus:outline-none transition-colors"
                rows={4}
                placeholder="Napište nám cokoliv..."
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-4 px-8 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Odeslat odpověď 💌
            </button>
          </form>
        </div>

        {/* Contact info */}
        {(content.contactName || content.contactPhone || content.contactEmail) && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-2">Máte dotazy? Kontaktujte nás:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {content.contactName && (
                <span className="text-gray-700 font-semibold">{content.contactName}</span>
              )}
              {content.contactPhone && (
                <a href={`tel:${content.contactPhone}`} className="text-rose-600 hover:text-rose-700">
                  {content.contactPhone}
                </a>
              )}
              {content.contactEmail && (
                <a href={`mailto:${content.contactEmail}`} className="text-rose-600 hover:text-rose-700">
                  {content.contactEmail}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

