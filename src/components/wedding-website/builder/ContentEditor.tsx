'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Image, Calendar, MapPin, Users, MessageSquare, Gift, Camera, Phone, HelpCircle, Building2, UtensilsCrossed, Shirt, Save } from 'lucide-react'
import HeroSectionEditor from './sections/HeroSectionEditor'
import InfoSectionEditor from './sections/InfoSectionEditor'
import DressCodeSectionEditor from './sections/DressCodeSectionEditor'
import RSVPSectionEditor from './sections/RSVPSectionEditor'
import StorySectionEditor from './sections/StorySectionEditor'
import ScheduleSectionEditor from './sections/ScheduleSectionEditor'
import GallerySectionEditor from './sections/GallerySectionEditor'
import AccommodationSectionEditor from './sections/AccommodationSectionEditor'
import ContactSectionEditor from './sections/ContactSectionEditor'
import FAQSectionEditor from './sections/FAQSectionEditor'
import GiftSectionEditor from './sections/GiftSectionEditor'
import MenuSectionEditor from './sections/MenuSectionEditor'
import SectionOrderEditor from './SectionOrderEditor'
import type { WebsiteContent, SectionType } from '@/types/wedding-website'

interface ContentEditorProps {
  content: WebsiteContent
  onContentChange: (content: WebsiteContent) => void
  onSave?: () => Promise<void>
  onExpandedChange?: (expanded: boolean) => void
  disabled?: boolean
}

interface Section {
  id: SectionType
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  required: boolean
  enabled: boolean
}

export default function ContentEditor({ content, onContentChange, onSave, onExpandedChange, disabled = false }: ContentEditorProps) {
  const [expandedSection, setExpandedSection] = useState<SectionType | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Notify parent when expanded state changes
  useEffect(() => {
    if (onExpandedChange) {
      onExpandedChange(expandedSection !== null)
    }
  }, [expandedSection, onExpandedChange])

  // Default section order
  const DEFAULT_SECTION_ORDER: SectionType[] = [
    'hero', 'story', 'info', 'dressCode', 'schedule', 'rsvp',
    'accommodation', 'gift', 'gallery', 'contact', 'faq', 'menu'
  ]

  // Initialize section order if not set
  useEffect(() => {
    if (!content.sectionOrder) {
      onContentChange({
        ...content,
        sectionOrder: DEFAULT_SECTION_ORDER
      })
    }
  }, [])

  const sectionOrder = content.sectionOrder || DEFAULT_SECTION_ORDER

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
      title: 'Místo konání',
      description: 'Obřad, hostina, parkování',
      icon: MapPin,
      required: true,
      enabled: content.info.enabled
    },
    {
      id: 'dressCode',
      title: 'Dress Code & Barevná paleta',
      description: 'Požadavky na oblečení a svatební barvy',
      icon: Shirt,
      required: false,
      enabled: content.dressCode?.enabled || false
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
    },
    {
      id: 'menu',
      title: 'Jídlo a Pití',
      description: 'Svatební menu a nápoje',
      icon: UtensilsCrossed,
      required: false,
      enabled: content.menu?.enabled || false
    }
  ]

  const selectSection = (sectionId: SectionType) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null) // Close if clicking the same section
    } else {
      setExpandedSection(sectionId)
    }
  }

  const toggleSectionEnabled = (sectionId: SectionType, enabled: boolean) => {
    if (disabled) return

    const updatedContent = { ...content }

    switch (sectionId) {
      case 'info':
        updatedContent.info = { ...updatedContent.info, enabled }
        break
      case 'dressCode':
        updatedContent.dressCode = { ...updatedContent.dressCode, enabled }
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
      case 'menu':
        updatedContent.menu = { ...updatedContent.menu, enabled }
        break
    }

    onContentChange(updatedContent)
  }

  const updateSectionContent = (sectionId: SectionType, sectionContent: any) => {
    if (disabled) return
    const updatedContent = { ...content }
    updatedContent[sectionId] = sectionContent
    onContentChange(updatedContent)
  }

  const handleSectionOrderChange = (newOrder: SectionType[]) => {
    if (disabled) return
    onContentChange({
      ...content,
      sectionOrder: newOrder
    })
  }

  const handleSaveSection = async () => {
    if (disabled) return

    if (onSave) {
      setIsSaving(true)
      try {
        await onSave()
        setExpandedSection(null) // Close the expanded section after saving
        // Scroll to top to show section selection
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (error) {
        console.error('Error saving section:', error)
      } finally {
        setIsSaving(false)
      }
    } else {
      // If no onSave callback, just close the section
      setExpandedSection(null)
      // Scroll to top to show section selection
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getEnabledSections = (): Set<SectionType> => {
    const enabled = new Set<SectionType>()
    enabled.add('hero') // Always enabled
    if (content.info.enabled) enabled.add('info')
    if (content.dressCode?.enabled) enabled.add('dressCode')
    if (content.rsvp.enabled) enabled.add('rsvp')
    if (content.story.enabled) enabled.add('story')
    if (content.schedule.enabled) enabled.add('schedule')
    if (content.accommodation?.enabled) enabled.add('accommodation')
    if (content.gift?.enabled) enabled.add('gift')
    if (content.gallery?.enabled) enabled.add('gallery')
    if (content.contact?.enabled) enabled.add('contact')
    if (content.faq?.enabled) enabled.add('faq')
    if (content.menu?.enabled) enabled.add('menu')
    return enabled
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
      case 'dressCode':
        return (
          <DressCodeSectionEditor
            content={content.dressCode}
            onChange={(dressCodeContent) => updateSectionContent('dressCode', dressCodeContent)}
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
      case 'menu':
        return (
          <MenuSectionEditor
            content={content.menu}
            onChange={(menuContent) => updateSectionContent('menu', menuContent)}
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upravit obsah webu
        </h2>
        <p className="text-gray-600">
          Vyberte sekci, kterou chcete upravit
        </p>
      </div>

      {/* Section Grid - Only show when no section is expanded */}
      {!expandedSection && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => selectSection(section.id)}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                section.enabled
                  ? 'border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 hover:border-pink-300'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              {/* Required Badge */}
              {section.required && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                    Povinné
                  </span>
                </div>
              )}

              {/* Enabled Badge */}
              {!section.required && section.enabled && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                    Aktivní
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div className={`p-4 rounded-full ${
                  section.enabled
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500'
                    : 'bg-gray-300'
                }`}>
                  <section.icon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 text-center mb-1">
                {section.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-600 text-center line-clamp-2">
                {section.description}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Section Order Editor - Only show when no section is expanded */}
      {!expandedSection && (
        <SectionOrderEditor
          sectionOrder={sectionOrder}
          enabledSections={getEnabledSections()}
          onOrderChange={handleSectionOrderChange}
        />
      )}

      {/* Expanded Section Editor */}
      {expandedSection && (
        <div className="bg-white rounded-xl border-2 border-pink-200 shadow-lg overflow-hidden">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setExpandedSection(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-6 h-6 text-white transform rotate-90" />
                </button>

                <div className="flex items-center gap-3">
                  {(() => {
                    const section = sections.find(s => s.id === expandedSection)
                    if (!section) return null
                    return (
                      <>
                        <div className="p-3 bg-white/20 rounded-lg">
                          <section.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {section.title}
                            {section.required && (
                              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                Povinné
                              </span>
                            )}
                          </h3>
                          <p className="text-pink-100 text-sm">{section.description}</p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Enable/Disable Toggle */}
              {(() => {
                const section = sections.find(s => s.id === expandedSection)
                if (!section || section.required) return null
                return (
                  <label className={`flex items-center gap-3 bg-white/20 px-4 py-2 rounded-lg transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/30'}`}>
                    <span className="text-sm font-medium text-white">Zobrazit na webu</span>
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(e) => toggleSectionEnabled(section.id, e.target.checked)}
                      disabled={disabled}
                      className="w-5 h-5 rounded border-white text-pink-600 focus:ring-pink-500 focus:ring-offset-0 disabled:cursor-not-allowed"
                    />
                  </label>
                )
              })()}
            </div>
          </div>

          {/* Section Content */}
          {(() => {
            const section = sections.find(s => s.id === expandedSection)
            if (!section) return null

            if (section.enabled) {
              return (
                <>
                  <div className="p-6">
                    {renderSectionEditor(section.id)}
                  </div>

                  {/* Save Button */}
                  <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end">
                    <button
                      onClick={handleSaveSection}
                      disabled={isSaving || disabled}
                      className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" />
                      {isSaving ? 'Ukládání...' : 'Uložit'}
                    </button>
                  </div>
                </>
              )
            } else if (!section.required) {
              return (
                <>
                  <div className="p-12 text-center bg-gray-50">
                    <div className="text-gray-400 mb-4">
                      <section.icon className="w-16 h-16 mx-auto" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Tato sekce je vypnutá
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Zapněte ji pomocí přepínače výše, aby se zobrazila na vašem svatebním webu.
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end">
                    <button
                      onClick={handleSaveSection}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" />
                      {isSaving ? 'Uložit' : 'Zavřít'}
                    </button>
                  </div>
                </>
              )
            }
          })()}
        </div>
      )}
    </div>
  )
}
