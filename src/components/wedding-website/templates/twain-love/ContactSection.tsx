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

  const mainContacts = []

  if (content.bride) {
    mainContacts.push({ ...content.bride, role: 'Nevěsta' })
  }

  if (content.groom) {
    mainContacts.push({ ...content.groom, role: 'Ženich' })
  }

  const hasBridesmaids = content.bridesmaids && content.bridesmaids.length > 0
  const hasGroomsmen = content.groomsmen && content.groomsmen.length > 0

  if (mainContacts.length === 0 && !hasBridesmaids && !hasGroomsmen) {
    return null
  }

  return (
    <div id="contact" className="py-20" style={{ background: 'rgba(178,201,211,0.1)' }}>
      <SectionTitle title="Kontakty" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Main Contacts - Bride & Groom */}
          {mainContacts.length > 0 && (
            <div className="grid md:grid-cols-2 gap-8">
              {mainContacts.map((contact, index) => (
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
          )}

          {/* Bridesmaids */}
          {hasBridesmaids && (
            <div>
              <h3 className="text-2xl text-center mb-6 text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
                Družičky
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {content.bridesmaids?.map((bridesmaid, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 text-center">
                    <div className="w-16 h-16 bg-[#b2c9d3] rounded-full mx-auto mb-3 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2" style={{ fontFamily: 'Muli, sans-serif' }}>
                      {bridesmaid.name}
                    </h4>
                    {bridesmaid.phone && (
                      <a
                        href={`tel:${bridesmaid.phone}`}
                        className="text-[#85aaba] hover:underline text-sm"
                        style={{ fontFamily: 'Muli, sans-serif' }}
                      >
                        {bridesmaid.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Groomsmen */}
          {hasGroomsmen && (
            <div>
              <h3 className="text-2xl text-center mb-6 text-gray-800" style={{ fontFamily: 'Great Vibes, cursive' }}>
                Svědci
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {content.groomsmen?.map((groomsman, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 text-center">
                    <div className="w-16 h-16 bg-[#b2c9d3] rounded-full mx-auto mb-3 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2" style={{ fontFamily: 'Muli, sans-serif' }}>
                      {groomsman.name}
                    </h4>
                    {groomsman.phone && (
                      <a
                        href={`tel:${groomsman.phone}`}
                        className="text-[#85aaba] hover:underline text-sm"
                        style={{ fontFamily: 'Muli, sans-serif' }}
                      >
                        {groomsman.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

