import React from 'react';
import { Section } from '../ui/Section';
import { Heading } from '../ui/Typography';
import { FAQS } from '../../constants';

export const FAQSection: React.FC = () => {
  return (
    <Section className="bg-white">
      <Heading className="text-center mb-12">Časté Dotazy</Heading>
      <div className="max-w-3xl mx-auto border-t border-black">
        {FAQS.map((faq, i) => (
          <details key={i} className="group border-b border-black cursor-pointer">
            <summary className="flex justify-between items-center py-6 px-4 list-none hover:bg-cream transition-colors">
              <span className="font-serif text-xl md:text-2xl">{faq.question}</span>
              <span className="text-2xl transform group-open:rotate-45 transition-transform duration-300">+</span>
            </summary>
            <div className="px-4 pb-8 pt-2">
              <p className="font-light opacity-80 leading-relaxed">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
};