'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Image, Calendar, MapPin, Users, MessageSquare, Gift, Camera, Phone, HelpCircle, Building2 } from 'lucide-react'
import HeroSectionEditor from './sections/HeroSectionEditor'
import InfoSectionEditor from './sections/InfoSectionEditor'
import RSVPSectionEditor from './sections/RSVPSectionEditor'
import StorySectionEditor from './sections/StorySectionEditor'
import ScheduleSectionEditor from './sections/ScheduleSectionEditor'
import GallerySectionEditor from './sections/GallerySectionEditor'
import AccommodationSectionEditor from './sections/AccommodationSectionEditor'
import ContactSectionEditor from './sections/ContactSectionEditor'
import FAQSectionEditor from './sections/FAQSectionEditor'
import GiftSectionEditor from './sections/GiftSectionEditor'
import type { WebsiteContent } from '@/types/wedding-website'

interface ContentEditorProps {
  content: WebsiteContent
  onContentChange: (content: WebsiteContent) => void
}

type SectionType = 'hero' | 'info' | 'rsvp' | 'story' | 'schedule' | 'accommodation' | 'gift' | 'gallery' | 'contact' | 'faq'

interface Section {
  id: SectionType
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  required: boolean
  enabled: boolean
}

export default function ContentEditor({ content, onContentChange }: ContentEditorProps) {
  const [expandedSection, setExpandedSection] = useState<SectionType>('hero')

  const sections: Section[] = [
    {
      id: 'hero',
      title: 'Hlavní sekce',
      description: 'Jména snoubenců, datum svatby a hlavní fotka',
      icon: Image,
      required: true,
      enabled: true
    },
    {
      id: 'info',
      title: 'Informace o svatbě',
      description: 'Místo konání, dress code, parkování',
      icon: MapPin,
      required: true,
      enabled: content.info.enabled
    },
    {
      id: 'rsvp',
      title: 'RSVP formulář',
      description: 'Potvrzení účasti hostů',
      icon: MessageSquare,
      required: false,
      enabled: content.rsvp.enabled
    },
    {
      id: 'story',
      title: 'Náš příběh',
      description: 'Jak jste se poznali a vaše společná cesta',
      icon: Users,
      required: false,
      enabled: content.story.enabled
    },
    {
      id: 'schedule',
      title: 'Program svatby',
      description: 'Časový harmonogram dne',
      icon: Calendar,
      required: false,
      enabled: content.schedule.enabled
    },
    {
      id: 'accommodation',
      title: 'Ubytování',
      description: 'Doporučené hotely a ubytování',
      icon: Building2,
      required: false,
      enabled: content.accommodation?.enabled || false
    },
    {
      id: 'gift',
      title: 'Svatební dary',
      description: 'Seznam přání nebo číslo účtu',
      icon: Gift,
      required: false,
      enabled: content.gift?.enabled || false
    },
    {
      id: 'gallery',
      title: 'Fotogalerie',
      description: 'Fotky ze zásnub nebo společné fotky',
      icon: Camera,
      required: false,
      enabled: content.gallery?.enabled || false
    },
    {
      id: 'contact',
      title: 'Kontakty',
      description: 'Kontaktní informace na organizátory',
      icon: Phone,
      required: false,
      enabled: content.contact?.enabled || true
    },
    {
      id: 'faq',
      title: 'Často kladené otázky',
      description: 'Odpovědi na časté dotazy hostů',
      icon: HelpCircle,
      required: false,
      enabled: content.faq?.enabled || false
    }
  ]

  const toggleSection = (sectionId: SectionType, event?: React.MouseEvent) => {
    // Prevent default scroll behavior
    if (event) {
      event.preventDefault()
    }

    if (expandedSection === sectionId) {
      setExpandedSection('hero') // Always keep hero expanded as fallback
    } else {
      setExpandedSection(sectionId)
    }
  }

  const toggleSectionEnabled = (sectionId: SectionType, enabled: boolean) => {
    const updatedContent = { ...content }
    
    switch (sectionId) {
      case 'info':
        updatedContent.info = { ...updatedContent.info, enabled }
        break
      case 'rsvp':
        updatedContent.rsvp = { ...updatedContent.rsvp, enabled }
        break
      case 'story':
        updatedContent.story = { ...updatedContent.story, enabled }
        break
      case 'schedule':
        updatedContent.schedule = { ...updatedContent.schedule, enabled }
        break
      case 'accommodation':
        updatedContent.accommodation = { ...updatedContent.accommodation, enabled }
        break
      case 'gift':
        updatedContent.gift = { ...updatedContent.gift, enabled }
        break
      case 'gallery':
        updatedContent.gallery = { ...updatedContent.gallery, enabled }
        break
      case 'contact':
        updatedContent.contact = { ...updatedContent.contact, enabled }
        break
      case 'faq':
        updatedContent.faq = { ...updatedContent.faq, enabled }
        break
    }
    
    onContentChange(updatedContent)
  }

  const updateSectionContent = (sectionId: SectionType, sectionContent: any) => {
    const updatedContent = { ...content }
    updatedContent[sectionId] = sectionContent
    onContentChange(updatedContent)
  }

  const renderSectionEditor = (sectionId: SectionType) => {
    switch (sectionId) {
      case 'hero':
        return (
          <HeroSectionEditor
            content={content.hero}
            onChange={(heroContent) => updateSectionContent('hero', heroContent)}
          />
        )
      case 'info':
        return (
          <InfoSectionEditor
            content={content.info}
            onChange={(infoContent) => updateSectionContent('info', infoContent)}
          />
        )
      case 'rsvp':
        return (
          <RSVPSectionEditor
            content={content.rsvp}
            onChange={(rsvpContent) => updateSectionContent('rsvp', rsvpContent)}
          />
        )
      case 'story':
        return (
          <StorySectionEditor
            content={content.story}
            onChange={(storyContent) => updateSectionContent('story', storyContent)}
          />
        )
      case 'schedule':
        return (
          <ScheduleSectionEditor
            content={content.schedule}
            onChange={(scheduleContent) => updateSectionContent('schedule', scheduleContent)}
          />
        )
      case 'gallery':
        return (
          <GallerySectionEditor
            content={content.gallery}
            onChange={(galleryContent) => updateSectionContent('gallery', galleryContent)}
          />
        )
      case 'accommodation':
        return (
          <AccommodationSectionEditor
            content={content.accommodation}
            onChange={(accommodationContent) => updateSectionContent('accommodation', accommodationContent)}
          />
        )
      case 'contact':
        return (
          <ContactSectionEditor
            content={content.contact}
            onChange={(contactContent) => updateSectionContent('contact', contactContent)}
          />
        )
      case 'faq':
        return (
          <FAQSectionEditor
            content={content.faq}
            onChange={(faqContent) => updateSectionContent('faq', faqContent)}
          />
        )
      case 'gift':
        return (
          <GiftSectionEditor
            content={content.gift}
            onChange={(giftContent) => updateSectionContent('gift', giftContent)}
          />
        )
      default:
        return (
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Editor pro tuto sekci
            </h3>
            <p className="text-gray-600">
              Editor pro sekci "{sections.find(s => s.id === sectionId)?.title}" je ve vývoji.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upravit obsah webu
        </h2>
        <p className="text-gray-600">
          Vyplňte informace pro jednotlivé sekce vašeho svatebního webu
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Section Header */}
          <div
            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
              expandedSection === section.id ? 'bg-pink-50' : 'hover:bg-gray-50'
            }`}
            onClick={(e) => toggleSection(section.id, e)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {expandedSection === section.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <section.icon className="w-5 h-5 text-pink-600" />
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  {section.title}
                  {section.required && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      Povinné
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{section.description}</p>
              </div>
            </div>

            {!section.required && (
              <label className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={(e) => toggleSectionEnabled(section.id, e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-600">Zobrazit</span>
              </label>
            )}
          </div>

          {/* Section Content */}
          {expandedSection === section.id && section.enabled && (
            <div className="border-t border-gray-200">
              {renderSectionEditor(section.id)}
            </div>
          )}

          {/* Disabled State */}
          {expandedSection === section.id && !section.enabled && !section.required && (
            <div className="border-t border-gray-200 p-6 text-center bg-gray-50">
              <div className="text-gray-400 mb-2">
                <section.icon className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-gray-600">
                Tato sekce je vypnutá. Zapněte ji pomocí přepínače výše.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
