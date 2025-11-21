import React, { useState } from 'react';
import { SectionProps } from '../types';
import { Plus, Minus } from 'lucide-react';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-primary/10 last:border-0">
      <button 
        className="w-full py-8 flex items-center justify-between text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`font-serif text-2xl md:text-3xl pr-8 transition-colors ${isOpen ? 'text-primary' : 'text-primary/80 group-hover:text-primary'}`}>
          {question}
        </span>
        <span className={`flex-shrink-0 p-2 rounded-full border transition-all duration-300 ${isOpen ? 'border-primary bg-primary text-cream rotate-180' : 'border-primary/30 text-primary group-hover:border-primary'}`}>
           {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <div 
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-8' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="text-dark/60 leading-relaxed font-light max-w-2xl">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const FAQSection: React.FC<SectionProps> = ({ id }) => {
  const faqs = [
    { question: "Mohu s sebou vzít děti?", answer: "Máme rádi děti, ale z kapacitních důvodů a pro bezpečnost v areálu zámku jsme se rozhodli pro svatbu pouze pro dospělé (s výjimkou kojenců). Věříme, že si večer užijete i tak." },
    { question: "Mohu vzít doprovod?", answer: "Vaše pozvánka specifikuje počet míst rezervovaných přímo pro vás. Bohužel nemůžeme navýšit kapacitu nad rámec pozvánky, prostory zámku jsou limitované." },
    { question: "Jaký je dress code?", answer: "Svatba se ponese v duchu Cocktail Attire. Pánové oblek (kravata volitelná), dámy koktejlové šaty. Prosíme vyhněte se bílé barvě a džínům. Budeme rádi za ladění do barev svatby (šalvějová, zlatá, béžová)." },
    { question: "Kde můžeme parkovat?", answer: "Pro hosty je zajištěno parkování přímo v areálu hotelu Štekl (cca 200m od obřadní síně). Parkovací karta vám bude zaslána emailem týden před svatbou." },
    { question: "Kdy končí zábava?", answer: "Hudba hraje do 2:00 ráno. Poté se můžeme přesunout do hotelového lobby baru, který je otevřen nonstop." },
  ];

  return (
    <section id={id} className="py-32 bg-paper">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-20">
           <span className="text-accent uppercase tracking-[0.3em] text-xs mb-4 block">Důležité informace</span>
           <h2 className="font-display-italic text-6xl text-primary">Časté dotazy</h2>
        </div>
        
        <div className="bg-white px-6 md:px-12 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;