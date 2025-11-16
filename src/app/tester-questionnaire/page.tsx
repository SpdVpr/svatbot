'use client'

import { useState, useEffect } from 'react'
import { Star, Send, Loader2, CheckCircle } from 'lucide-react'
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite'

interface ModuleRating {
  rating: number
  comment: string
}

interface FeedbackData {
  testerName: string
  frontPage: ModuleRating
  aiCoach: ModuleRating
  quickActions: ModuleRating
  taskManagement: ModuleRating
  guestManagement: ModuleRating
  seatingPlan: ModuleRating
  vendorManagement: ModuleRating
  weddingChecklist: ModuleRating
  budgetTracking: ModuleRating
  timelinePlanning: ModuleRating
  marketplace: ModuleRating
  moodboard: ModuleRating
  weddingDayTimeline: ModuleRating
  foodDrinks: ModuleRating
  musicPlaylist: ModuleRating
  shoppingList: ModuleRating
  accommodation: ModuleRating
  weddingWebsite: ModuleRating
  overallDesign: ModuleRating
  generalComment: string
}

const modules = [
  { id: 'frontPage', label: 'Úvodní stránka', description: 'Design, přehlednost, první dojem při vstupu' },
  { id: 'aiCoach', label: 'Svatbot - Váš AI Kouč', description: 'Kvalita odpovědí, užitečnost, rychlost AI asistenta' },
  { id: 'quickActions', label: 'Rychlé akce', description: 'Použitelnost rychlých akcí na dashboardu' },
  { id: 'taskManagement', label: 'Správa úkolů', description: 'Správa úkolů, priority, termíny' },
  { id: 'guestManagement', label: 'Správa hostů', description: 'Přidávání hostů, organizace, filtry' },
  { id: 'seatingPlan', label: 'Rozmístění hostů', description: 'Rozmístění stolů, drag & drop' },
  { id: 'vendorManagement', label: 'Dodavatelé', description: 'Správa dodavatelů, kontakty' },
  { id: 'weddingChecklist', label: 'Svatební checklist', description: 'Seznam úkolů, sledování pokroku' },
  { id: 'budgetTracking', label: 'Rozpočet', description: 'Přehlednost, správa položek, kalkulace' },
  { id: 'timelinePlanning', label: 'Časová osa', description: 'Funkčnost, přehlednost, plánování' },
  { id: 'marketplace', label: 'Najít dodavatele', description: 'Marketplace dodavatelů, recenze, filtry' },
  { id: 'moodboard', label: 'Moodboard', description: 'Inspirace, ukládání nápadů, AI generování' },
  { id: 'weddingDayTimeline', label: 'Harmonogram dne', description: 'Časový harmonogram svatebního dne' },
  { id: 'foodDrinks', label: 'Jídlo a Pití', description: 'Tvorba menu, správa položek' },
  { id: 'musicPlaylist', label: 'Svatební hudba', description: 'Playlist, integrace se Spotify' },
  { id: 'shoppingList', label: 'Nákupní seznam', description: 'Organizace nákupů, kategorie' },
  { id: 'accommodation', label: 'Ubytování', description: 'Správa ubytování, pokoje, hosté' },
  { id: 'weddingWebsite', label: 'Svatební web', description: 'Builder, šablony, přizpůsobení' },
  { id: 'overallDesign', label: 'Celkový vzhled aplikace', description: 'UI/UX, konzistence, modernost, barevné téma' }
]

export default function TesterQuestionnaire() {
  const { website } = useWeddingWebsite()
  const [testerName, setTesterName] = useState('')
  const [generalComment, setGeneralComment] = useState('')
  const [ratings, setRatings] = useState<Record<string, ModuleRating>>(
    modules.reduce((acc, module) => ({
      ...acc,
      [module.id]: { rating: 0, comment: '' }
    }), {})
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const primaryColor = website?.style?.primaryColor || '#9333EA'
  const secondaryColor = website?.style?.secondaryColor || '#EC4899'

  const handleRatingChange = (moduleId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], rating }
    }))
  }

  const handleCommentChange = (moduleId: string, comment: string) => {
    setRatings(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], comment }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!testerName.trim()) {
      alert('Prosím vyplňte své jméno')
      return
    }

    setIsSubmitting(true)

    try {
      const feedbackData: FeedbackData = {
        testerName: testerName.trim(),
        frontPage: ratings.frontPage,
        aiCoach: ratings.aiCoach,
        quickActions: ratings.quickActions,
        taskManagement: ratings.taskManagement,
        guestManagement: ratings.guestManagement,
        seatingPlan: ratings.seatingPlan,
        vendorManagement: ratings.vendorManagement,
        weddingChecklist: ratings.weddingChecklist,
        budgetTracking: ratings.budgetTracking,
        timelinePlanning: ratings.timelinePlanning,
        marketplace: ratings.marketplace,
        moodboard: ratings.moodboard,
        weddingDayTimeline: ratings.weddingDayTimeline,
        foodDrinks: ratings.foodDrinks,
        musicPlaylist: ratings.musicPlaylist,
        shoppingList: ratings.shoppingList,
        accommodation: ratings.accommodation,
        weddingWebsite: ratings.weddingWebsite,
        overallDesign: ratings.overallDesign,
        generalComment
      }

      const response = await fetch('/api/test-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      })

      if (!response.ok) {
        throw new Error('Chyba při odesílání odpovědí')
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Nepodařilo se odeslat odpovědi. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Děkujeme!</h2>
          <p className="text-gray-600 text-lg">
            Vaše odpovědi byly úspěšně odeslány. Velmi si vážíme vašeho času a zpětné vazby!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dotazník pro testery SvatBot.cz
          </h1>
          <p className="text-lg text-gray-600">
            Pomožte nám vylepšit aplikaci vašimi postřehy a hodnocením jednotlivých modulů
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tester Name */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Vaše jméno *
            </label>
            <input
              type="text"
              value={testerName}
              onChange={(e) => setTesterName(e.target.value)}
              placeholder="Např. Jan Novák"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Module Ratings */}
          {modules.map((module) => (
            <div key={module.id} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {module.label}
                </h3>
                <p className="text-gray-600">{module.description}</p>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hodnocení (1-10)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(module.id, star)}
                      className={`w-12 h-12 rounded-lg font-semibold transition-all ${
                        ratings[module.id]?.rating >= star
                          ? 'text-white shadow-lg scale-110'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      style={ratings[module.id]?.rating >= star ? { backgroundColor: primaryColor } : undefined}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Komentář (volitelné)
                </label>
                <textarea
                  value={ratings[module.id]?.comment || ''}
                  onChange={(e) => handleCommentChange(module.id, e.target.value)}
                  placeholder="Sdílejte své postřehy, návrhy na vylepšení nebo co se vám líbilo/nelíbilo..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          ))}

          {/* General Comment */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Celkový komentář (volitelné)
            </label>
            <textarea
              value={generalComment}
              onChange={(e) => setGeneralComment(e.target.value)}
              placeholder="Jakékoli další postřehy, návrhy nebo připomínky k celé aplikaci..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ 
                backgroundColor: primaryColor
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Odesílám...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Odeslat odpovědi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
