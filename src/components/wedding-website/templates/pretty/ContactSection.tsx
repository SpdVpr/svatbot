'use client'

import { ContactContent } from '@/types/wedding-website'
import SectionTitle from './SectionTitle'

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
      contacts.push({ ...person, role: 'Družička' })
    })
  }

  if (content.groomsmen) {
    content.groomsmen.forEach(person => {
      contacts.push({ ...person, role: 'Svědek' })
    })
  }

  if (contacts.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <SectionTitle title="Kontakty" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="p-6 rounded-lg shadow-lg text-center"
              style={{ background: 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%)' }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {contact.name}
              </h3>
              {contact.role && (
                <p className="text-sm mb-4 italic" style={{ color: '#b19a56' }}>
                  {contact.role}
                </p>
              )}
              <div className="space-y-2">
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="block text-gray-600 transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#b19a56'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
                  >
                    📞 {contact.phone}
                  </a>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="block text-gray-600 transition-colors break-all"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#b19a56'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
                  >
                    ✉️ {contact.email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

