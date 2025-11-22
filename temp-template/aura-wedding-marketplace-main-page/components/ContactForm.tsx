import React, { useState } from 'react';
import { Send } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  if (isSent) {
    return (
      <div className="text-center py-8 bg-green-50 rounded-xl border border-green-100">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
          <Send size={24} />
        </div>
        <h4 className="font-serif text-lg font-bold text-green-800">Odesláno!</h4>
        <p className="text-green-600 text-sm mt-1">Dodavatel se vám ozve co nejdříve.</p>
        <button 
          onClick={() => setIsSent(false)}
          className="mt-4 text-xs font-bold text-green-700 hover:underline"
        >
          Poslat další zprávu
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-3">
        <input
          type="text"
          required
          placeholder="Vaše jméno"
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-stone-400"
        />
        <input
          type="email"
          required
          placeholder="Váš email"
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-stone-400"
        />
        <div className="flex gap-2">
             <input
              type="text"
              placeholder="Datum"
              onFocus={(e) => e.target.type = 'date'}
              onBlur={(e) => e.target.type = 'text'}
              className="w-1/2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-stone-400"
            />
             <input
              type="tel"
              placeholder="Telefon"
              className="w-1/2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-stone-400"
            />
        </div>
        <textarea
          rows={3}
          required
          placeholder="Dobrý den, rádi bychom..."
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-stone-400 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full py-3.5 rounded-lg font-bold text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all
          ${isLoading ? 'bg-stone-400 cursor-wait' : 'bg-primary-600 hover:bg-primary-700'}
        `}
      >
        {isLoading ? 'Odesílám...' : 'Nezávazně poptat'}
      </button>
      
      <p className="text-[10px] text-stone-400 text-center px-4 leading-tight">
        Odesláním souhlasíte se zpracováním osobních údajů.
      </p>
    </form>
  );
};