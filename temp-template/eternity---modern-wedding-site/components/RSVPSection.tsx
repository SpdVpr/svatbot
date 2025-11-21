import React, { useState } from 'react';
import { SectionProps } from '../types';

const RSVPSection: React.FC<SectionProps> = ({ id }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: 1,
    attendance: 'yes',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => setIsSubmitted(true), 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id={id} className="py-32 bg-primary relative">
      <div className="max-w-2xl mx-auto px-6 relative z-10">
        
        {/* Invitation Card Effect */}
        <div className="bg-cream text-primary p-8 md:p-16 rounded-[2rem] shadow-2xl border border-white/10">
          <div className="text-center mb-12">
            <span className="text-accent uppercase tracking-[0.3em] text-xs mb-4 block">R.S.V.P.</span>
            <h2 className="font-serif text-5xl mb-4">Potvrďte účast</h2>
            <p className="text-dark/60 italic font-display-italic text-xl">Prosíme o odpověď do 30. června 2025</p>
          </div>

          {isSubmitted ? (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="text-6xl mb-6">✨</div>
              <h3 className="font-serif text-3xl mb-4">Děkujeme!</h3>
              <p className="text-dark/70 mb-8">Moc se těšíme, že tento den oslavíte s námi.</p>
              <button onClick={() => setIsSubmitted(false)} className="text-xs uppercase tracking-widest text-accent border-b border-accent pb-1">Odeslat znovu</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-secondary ml-1">Jméno a Příjmení</label>
                <input 
                  required
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-primary/20 py-3 focus:outline-none focus:border-accent transition-colors placeholder-primary/30 text-lg font-serif"
                  placeholder="Jan Novák"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-secondary ml-1">Email</label>
                  <input 
                    required
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-primary/20 py-3 focus:outline-none focus:border-accent transition-colors placeholder-primary/30 font-sans"
                    placeholder="jan@email.cz"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-secondary ml-1">Počet osob</label>
                  <input 
                    type="number" 
                    min="1"
                    max="5"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-primary/20 py-3 focus:outline-none focus:border-accent transition-colors font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-secondary ml-1">Účast</label>
                <select 
                  name="attendance"
                  value={formData.attendance}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-primary/20 py-3 focus:outline-none focus:border-accent transition-colors font-serif text-lg"
                >
                  <option value="yes">S radostí dorazím</option>
                  <option value="no">Bohužel nemohu</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-secondary ml-1">Vzkaz</label>
                <textarea 
                  rows={2}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-primary/20 py-3 focus:outline-none focus:border-accent transition-colors placeholder-primary/30 font-sans resize-none"
                  placeholder="Diety, písničky na přání..."
                />
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  className="w-full bg-primary text-cream py-4 rounded-full uppercase tracking-[0.2em] text-xs font-bold hover:bg-primary/90 transition-all transform hover:-translate-y-1 shadow-lg"
                >
                  Odeslat potvrzení
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default RSVPSection;