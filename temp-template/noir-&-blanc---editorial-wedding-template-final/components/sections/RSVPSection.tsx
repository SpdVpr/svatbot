import React, { useState } from 'react';
import { Section } from '../ui/Section';
import { DisplayText, Paragraph } from '../ui/Typography';

export const RSVPSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the actual submission logic
    setTimeout(() => setSubmitted(true), 1000);
  };

  if (submitted) {
    return (
        <Section id="rsvp" className="bg-black text-cream flex flex-col items-center justify-center text-center min-h-[60vh]">
            <DisplayText className="text-cream mb-8">Děkujeme</DisplayText>
            <Paragraph className="text-cream/60 max-w-xl mx-auto">Vaše odpověď byla úspěšně zaznamenána. Těšíme se na vás.</Paragraph>
        </Section>
    )
  }

  return (
    <Section id="rsvp" className="bg-black text-cream">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 border-b border-cream/20 pb-8">
           <h2 className="font-serif text-6xl md:text-9xl text-cream mb-4">R.S.V.P.</h2>
           <p className="font-sans uppercase tracking-[0.3em] text-accent">Potvrďte účast do 15.05.2025</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="group">
                <label className="block font-sans text-xs uppercase tracking-widest text-cream/50 mb-2">Jméno a Příjmení</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-transparent border-b border-cream/30 py-4 text-xl font-serif text-cream focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div className="group">
                <label className="block font-sans text-xs uppercase tracking-widest text-cream/50 mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-transparent border-b border-cream/30 py-4 text-xl font-serif text-cream focus:border-accent focus:outline-none transition-colors"
                />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-cream/50 mb-2">Počet osob</label>
                <select className="w-full bg-transparent border-b border-cream/30 py-4 text-xl font-sans text-cream focus:border-accent focus:outline-none appearance-none">
                    {[1,2,3,4,5].map(n => <option key={n} value={n} className="bg-black">{n}</option>)}
                </select>
            </div>
            <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-cream/50 mb-2">Účast</label>
                <select className="w-full bg-transparent border-b border-cream/30 py-4 text-xl font-sans text-cream focus:border-accent focus:outline-none appearance-none">
                    <option className="bg-black" value="yes">S radostí dorazím</option>
                    <option className="bg-black" value="no">Bohužel nedorazím</option>
                    <option className="bg-black" value="maybe">Zatím nevím</option>
                </select>
            </div>
          </div>

          <div>
             <label className="block font-sans text-xs uppercase tracking-widest text-cream/50 mb-2">Vzkaz pro novomanžele (Dieta, Písničky...)</label>
             <textarea 
               rows={3}
               className="w-full bg-transparent border-b border-cream/30 py-4 text-xl font-serif text-cream focus:border-accent focus:outline-none resize-none"
             />
          </div>

          <div className="text-center pt-8">
            <button 
                type="submit"
                className="px-16 py-4 bg-cream text-black font-sans uppercase tracking-widest hover:bg-accent transition-colors duration-300"
            >
                Odeslat potvrzení
            </button>
          </div>
        </form>
      </div>
    </Section>
  );
};