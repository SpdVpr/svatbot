'use client'

import React from 'react'
import { Section } from './Section'
import { Heading, SubHeading } from './Typography'
import { ContactContent } from '@/types/wedding-website'
import { Phone, Mail } from 'lucide-react'

interface ContactSectionProps {
  content: ContactContent
}

export default function ContactSection({ content }: ContactSectionProps) {
  if (!content.enabled) return null

  const contacts = []
  
  if (content.bride) {
    contacts.push({ ...content.bride, role: 'Nevěsta' })
  }
  if (content.groom) {
    contacts.push({ ...content.groom, role: 'Ženich' })
  }
  if (content.bridesmaids) {
    content.bridesmaids.forEach(person => {
      contacts.push({ ...person, role: 'Svědkyně' })
    })
  }
  if (content.groomsmen) {
    content.groomsmen.forEach(person => {
      contacts.push({ ...person, role: 'Svědek' })
    })
  }

  if (contacts.length === 0) return null

  return (
    <Section id="contact" className="bg-[#f2f0ea] border-t border-black">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <SubHeading>Otázky?</SubHeading>
        <Heading>Kontakty</Heading>
        <p className="opacity-70">Pokud máte jakékoliv dotazy, neváhejte se obrátit na naše koordinátory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {contacts.map((person, i) => (
          <div key={i} className="bg-white border border-black p-8 text-center hover:bg-black hover:text-[#f2f0ea] transition-colors duration-500 group">
            <h4 className="font-serif text-2xl mb-1">{person.name}</h4>
            <span className="font-sans text-xs uppercase tracking-widest opacity-60 mb-6 block">{person.role}</span>
            
            <div className="flex flex-col gap-2 items-center text-sm">
              {person.phone && (
                <a 
                  href={`tel:${person.phone}`} 
                  className="flex items-center gap-2 hover:text-[#d4b0aa]"
                >
                  <Phone size={14}/> {person.phone}
                </a>
              )}
              {person.email && (
                <a 
                  href={`mailto:${person.email}`} 
                  className="flex items-center gap-2 hover:text-[#d4b0aa]"
                >
                  <Mail size={14}/> {person.email}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

