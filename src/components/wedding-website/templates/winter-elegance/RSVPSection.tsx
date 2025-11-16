'use client'

import { useState } from 'react'
import { useColorTheme } from '../ColorThemeContext'
import { RSVPContent } from '@/types/wedding-website'
import { Heart } from 'lucide-react'

interface RSVPSectionProps {
  content: RSVPContent
  websiteId: string
}

export default function RSVPSection({ content, websiteId }: RSVPSectionProps) {
  const { theme } = useColorTheme()
  const [formData, setFormData] = useState({
    name: '',
    companion: '',
    attendance: 'all',
    children: 'no',
    accommodation: 'no',
    note: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  if (!content.enabled) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // TODO: Implement RSVP submission to Firebase
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitMessage('Děkujeme! Vaše odpověď byla úspěšně odeslána.')
      setFormData({
        name: '',
        companion: '',
        attendance: 'all',
        children: 'no',
        accommodation: 'no',
        note: '',
      })
    } catch (error) {
      setSubmitMessage('Omlouváme se, došlo k chybě. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-6">
            Potvrzení účasti
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto">
            {content.message || 'Budeme rádi, když nám zde co nejdříve potvrdíte svou účast.'}
          </p>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-3">
                    Vaše jméno
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all duration-200"
                    placeholder="Vaše jméno a příjmení"
                  />
                </div>
                <div>
                  <label htmlFor="companion" className="block text-sm font-medium text-stone-700 mb-3">
                    Jméno doprovodu
                  </label>
                  <input
                    type="text"
                    id="companion"
                    name="companion"
                    value={formData.companion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all duration-200"
                    placeholder="Jméno a příjmení doprovodu"
                  />
                </div>
              </div>

              {/* Attendance */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-4">
                  Zúčastním se
                </label>
                <div className="space-y-3">
                  {['ceremony', 'reception', 'party', 'all', 'none'].map((value) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="attendance"
                        value={value}
                        checked={formData.attendance === value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-stone-600 border-stone-300 focus:ring-stone-400"
                      />
                      <span className="ml-3 text-stone-700">
                        {value === 'ceremony' && 'Obřadu'}
                        {value === 'reception' && 'Hostiny'}
                        {value === 'party' && 'Večerní párty'}
                        {value === 'all' && 'Celé svatby'}
                        {value === 'none' && 'Vůbec se nezúčastním'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-stone-700 mb-3">
                  Poznámka
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Pokud jste vegani, máte alergie nebo jakékoli speciální požadavky, napište nám to zde..."
                />
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-3 px-8 py-4 font-medium rounded-xl transition-all duration-300 shadow-lg ${
                    isSubmitting
                      ? 'bg-stone-400 cursor-not-allowed'
                      : 'bg-stone-800 hover:bg-stone-900 hover:shadow-xl transform hover:-translate-y-1'
                  } text-white`}
                >
                  <Heart className="w-5 h-5" />
                  {isSubmitting ? 'Odesílám...' : 'Potvrdit účast'}
                </button>
              </div>

              {/* Submit Message */}
              {submitMessage && (
                <div
                  className={`text-center mt-6 p-4 rounded-xl ${
                    submitMessage.includes('úspěšně')
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

