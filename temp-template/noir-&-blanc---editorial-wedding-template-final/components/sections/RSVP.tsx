import React, { useState } from 'react';
import { Section } from '../ui/Section';
import { DisplayText, Paragraph } from '../ui/Typography';

export const RSVP: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => setSubmitted(true), 1000);
  };

  if (submitted) {
    return (
        <Section id="rsvp" className="bg-black text-cream flex flex-col items-center justify-center text-center min-h-[50vh]">
            <DisplayText className="text-cream mb-8">Děkujeme</DisplayText>
            <Paragraph className="text-cream/60">Vaše odpověď byla zaznamenána.</Paragraph>
        </Section>
    )
  }

  return (
    <Section id="rsvp" className="bg-black text-cream" borderBottom={false}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
           <h2 className="font-serif text-6xl md:text-9xl text-cream mb-4">R.S.V.P.</h2>
           <p className="font-sans uppercase tracking-[0.3em] text-accent">Répondez s'il vous plaît</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="group">
             <label className="block font-sans text-xs uppercase tracking-widest text-cream/50 mb-2">Jméno</label>
             <input 
               type="text" 
               required
               placeholder="Vaše jméno"
               className="w-full bg-transparent border-b border-cream/30 py-4 text-2xl md:text-4xl font-serif text-cream placeholder-cream/20 focus:border-accent focus:outline-none transition-colors"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-cream/50 mb-2">Počet osob</label>
                <select className="w-full bg-transparent border-b border-cream/30 py-4 text-xl font-sans text-cream focus:border-accent focus:outline-none appearance-none">
                    <option className="bg-black">1 Osoba</option>
                    <option className="bg-black">2 Osoby</option>
                </select>
            </div>
            <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-cream/50 mb-2">Účast</label>
                <select className="w-full bg-transparent border-b border-cream/30 py-4 text-xl font-sans text-cream focus:border-accent focus:outline-none appearance-none">
                    <option className="bg-black">Dorazím</option>
                    <option className="bg-black">Omlouvám se</option>
                </select>
            </div>
          </div>

          <div>
             <label className="block font-sans text-xs uppercase tracking-widest text-cream/50 mb-2">Zpráva</label>
             <textarea 
               rows={2}
               placeholder="Dietní omezení nebo vzkaz..."
               className="w-full bg-transparent border-b border-cream/30 py-4 text-xl font-serif text-cream placeholder-cream/20 focus:border-accent focus:outline-none resize-none"
             />
          </div>

          <button 
            type="submit"
            className="w-full py-6 mt-8 border border-cream hover:bg-cream hover:text-black transition-all duration-300 font-sans uppercase tracking-widest text-lg"
          >
            Potvrdit Účast
          </button>
        </form>
      </div>
    </Section>
  );
};