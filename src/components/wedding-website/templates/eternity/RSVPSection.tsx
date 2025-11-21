'use client'

import { RSVPContent } from '@/types/wedding-website'
import { useState } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface RSVPSectionProps {
  content: RSVPContent
  websiteId: string
}

export default function RSVPSection({ content, websiteId }: RSVPSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: 1,
    attendance: 'attending',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!content.enabled) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Implement actual RSVP submission to Firebase
    setTimeout(() => {
      setIsSubmitted(true)
      setIsSubmitting(false)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <section id="rsvp" className="py-32 bg-[#2C362B] relative">
      <div className="max-w-2xl mx-auto px-6 relative z-10">
        
        {/* Invitation Card Effect */}
        <div className="bg-[#F4F2ED] text-[#2C362B] p-8 md:p-16 rounded-[2rem] shadow-2xl border border-white/10">
          <div className="text-center mb-12">
            <span className="text-[#C5A880] uppercase tracking-[0.3em] text-xs mb-4 block">R.S.V.P.</span>
            <h2 className="font-serif text-5xl mb-4">Potvrďte účast</h2>
            {content.deadline && (
              <p 
                className="text-[#1A1C1A]/60 italic text-xl"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Prosíme o odpověď do {format(new Date(content.deadline), 'd. MMMM yyyy', { locale: cs })}
              </p>
            )}
          </div>

          {isSubmitted ? (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="text-6xl mb-6">✨</div>
              <h3 className="font-serif text-3xl mb-4">Děkujeme!</h3>
              <p className="text-[#1A1C1A]/70 mb-8">Moc se těšíme, že tento den oslavíte s námi.</p>
              <button 
                onClick={() => setIsSubmitted(false)} 
                className="text-xs uppercase tracking-widest text-[#C5A880] border-b border-[#C5A880] pb-1"
              >
                Odeslat znovu
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-[#5F6F52] ml-1">Jméno a Příjmení</label>
                <input 
                  required
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-[#2C362B]/20 py-3 focus:outline-none focus:border-[#C5A880] transition-colors placeholder-[#2C362B]/30 text-lg font-serif"
                  placeholder="Jan Novák"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-[#5F6F52] ml-1">Email</label>
                  <input 
                    required
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-[#2C362B]/20 py-3 focus:outline-none focus:border-[#C5A880] transition-colors placeholder-[#2C362B]/30 font-sans"
                    placeholder="jan@email.cz"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-[#5F6F52] ml-1">Počet osob</label>
                  <input 
                    type="number" 
                    min="1"
                    max="5"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-[#2C362B]/20 py-3 focus:outline-none focus:border-[#C5A880] transition-colors font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-[#5F6F52] ml-1">Účast</label>
                <select 
                  name="attendance"
                  value={formData.attendance}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-[#2C362B]/20 py-3 focus:outline-none focus:border-[#C5A880] transition-colors font-serif text-lg"
                >
                  <option value="attending">S radostí dorazím</option>
                  <option value="declined">Bohužel nemohu</option>
                  <option value="maybe">Možná</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-[#5F6F52] ml-1">Vzkaz</label>
                <textarea 
                  rows={2}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-[#2C362B]/20 py-3 focus:outline-none focus:border-[#C5A880] transition-colors placeholder-[#2C362B]/30 font-sans resize-none"
                  placeholder="Diety, písničky na přání..."
                />
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#2C362B] text-[#F4F2ED] py-4 rounded-full uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#2C362B]/90 transition-all transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Odesílám...' : 'Odeslat potvrzení'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </section>
  )
}

