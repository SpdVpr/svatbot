import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading } from '../ui/Typography';
import { CONTACTS } from '../../constants';
import { Phone, Mail } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <Section id="kontakt" className="bg-cream border-t border-black">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <SubHeading>Otázky?</SubHeading>
        <Heading>Kontakty</Heading>
        <p className="opacity-70">Pokud máte jakékoliv dotazy, neváhejte se obrátit na naše koordinátory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {CONTACTS.map((person, i) => (
            <div key={i} className="bg-white border border-black p-8 text-center hover:bg-black hover:text-cream transition-colors duration-500 group">
                <h4 className="font-serif text-2xl mb-1">{person.name}</h4>
                <span className="font-sans text-xs uppercase tracking-widest opacity-60 mb-6 block">{person.role}</span>
                
                <div className="flex flex-col gap-2 items-center text-sm">
                    <a href={`tel:${person.phone}`} className="flex items-center gap-2 hover:text-accent"><Phone size={14}/> {person.phone}</a>
                    <a href={`mailto:${person.email}`} className="flex items-center gap-2 hover:text-accent"><Mail size={14}/> {person.email}</a>
                </div>
            </div>
        ))}
      </div>
    </Section>
  );
};