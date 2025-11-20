'use client'

import { ContactContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'
import { Phone, Mail, User } from 'lucide-react'

interface ContactSectionProps {
  content: ContactContent
}

export default function ContactSection({ content }: ContactSectionProps) {
  if (!content.enabled) {
    return null
  }

  const contacts = []

  if (content.bride) {
    contacts.push({ ...content.bride, role: 'Nevěsta' })
  }

  if (content.groom) {
    contacts.push({ ...content.groom, role: 'Ženich' })
  }

  if (contacts.length === 0) {
    return null
  }

  return (
    <div id="contact" className="py-20" style={{ background: 'rgba(178,201,211,0.1)' }}>
      <SectionTitle title="Kontakty" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {contacts.map((contact, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-[#b2c9d3] rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl mb-2 text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
                    {contact.name}
                  </h3>
                  {contact.role && (
                    <p className="text-[#85aaba] font-medium" style={{ fontFamily: 'Muli, sans-serif' }}>
                      {contact.role}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {contact.phone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-5 h-5 flex-shrink-0 text-[#85aaba]" />
                      <a
                        href={`tel:${contact.phone}`}
                        className="hover:text-[#85aaba] transition-colors"
                        style={{ fontFamily: 'Muli, sans-serif' }}
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}

                  {contact.email && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-5 h-5 flex-shrink-0 text-[#85aaba]" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:text-[#85aaba] transition-colors break-all"
                        style={{ fontFamily: 'Muli, sans-serif' }}
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

