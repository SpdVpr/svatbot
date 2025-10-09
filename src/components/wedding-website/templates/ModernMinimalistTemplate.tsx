'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Users, Mail, Phone, Menu, X } from 'lucide-react'
import type { WeddingWebsite } from '@/types/wedding-website'
import ModernHeroSection from './modern/HeroSection'
import ModernInfoSection from './modern/InfoSection'
import ModernRSVPSection from './modern/RSVPSection'
import AccommodationSection from './modern/AccommodationSection'
import FAQSection from './modern/FAQSection'
import MenuSection from './modern/MenuSection'
import { Timestamp } from 'firebase/firestore'

// Helper funkce pro formátování data
const formatDate = (date: any): string => {
  if (!date) return ''

  let dateObj: Date

  if (date instanceof Date) {
    dateObj = date
  } else if (date instanceof Timestamp) {
    dateObj = date.toDate()
  } else if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date.seconds) {
    // Firestore Timestamp object
    dateObj = new Date(date.seconds * 1000)
  } else {
    return ''
  }

  return dateObj.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

interface ModernMinimalistTemplateProps {
  website: WeddingWebsite
}

export default function ModernMinimalistTemplate({ website }: ModernMinimalistTemplateProps) {
  const { content } = website
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  // Scroll spy pro aktivní sekci
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['uvod', 'snoubenci', 'galerie', 'misto', 'program', 'dary', 'dress-code', 'ucast']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Výška sticky navigace
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
    setMobileMenuOpen(false)
  }

  // Získání iniciál
  const getInitials = () => {
    const brideInitial = content.hero.bride?.charAt(0) || 'N'
    const groomInitial = content.hero.groom?.charAt(0) || 'N'
    return `${brideInitial}${groomInitial}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Initials */}
            <button
              onClick={() => scrollToSection('uvod')}
              className="text-xl font-bold text-gray-900 hover:text-gray-600 transition-colors"
            >
              {getInitials()}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: 'uvod', label: 'Úvod' },
                { id: 'snoubenci', label: 'Snoubenci' },
                content.gallery?.enabled && { id: 'galerie', label: 'Galerie' },
                content.info?.enabled && { id: 'misto', label: content.info.ceremony?.venue || 'Místo' },
                content.schedule?.enabled && { id: 'program', label: 'Program' },
                content.gift?.enabled && { id: 'dary', label: 'Dary' },
                { id: 'dress-code', label: 'Dress Code' },
                content.rsvp?.enabled && { id: 'ucast', label: 'Účast' },
              ].filter(Boolean).map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                {[
                  { id: 'uvod', label: 'Úvod' },
                  { id: 'snoubenci', label: 'Snoubenci' },
                  content.gallery?.enabled && { id: 'galerie', label: 'Galerie' },
                  content.info?.enabled && { id: 'misto', label: content.info.ceremony?.venue || 'Místo' },
                  content.schedule?.enabled && { id: 'program', label: 'Program' },
                  content.gift?.enabled && { id: 'dary', label: 'Dary' },
                  { id: 'dress-code', label: 'Dress Code' },
                  content.rsvp?.enabled && { id: 'ucast', label: 'Účast' },
                ].filter(Boolean).map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-left text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Always visible */}
      <div id="uvod">
        <ModernHeroSection content={content.hero} />
      </div>

      {/* Snoubenci Section */}
      <section id="snoubenci" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Snoubenci
            </h2>
            <div className="w-16 h-px bg-gray-900 mx-auto mb-8"></div>
            {content.story?.description && (
              <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
                {content.story.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16">
            {/* Nevěsta */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-48 h-48 mx-auto rounded-full bg-gray-100 overflow-hidden mb-6">
                  {content.story?.bride?.image ? (
                    <img
                      src={content.story.bride.image}
                      alt={content.hero.bride}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      👰
                    </div>
                  )}
                </div>
                <h3 className="text-3xl font-light text-gray-900 mb-4">
                  {content.hero.bride}
                </h3>
              </div>
              {content.story?.bride?.description && (
                <p className="text-gray-600 leading-relaxed text-left">
                  {content.story.bride.description}
                </p>
              )}
            </div>

            {/* Ženich */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-48 h-48 mx-auto rounded-full bg-gray-100 overflow-hidden mb-6">
                  {content.story?.groom?.image ? (
                    <img
                      src={content.story.groom.image}
                      alt={content.hero.groom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🤵
                    </div>
                  )}
                </div>
                <h3 className="text-3xl font-light text-gray-900 mb-4">
                  {content.hero.groom}
                </h3>
              </div>
              {content.story?.groom?.description && (
                <p className="text-gray-600 leading-relaxed text-left">
                  {content.story.groom.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      {content.info.enabled && (
        <div id="misto">
          <ModernInfoSection content={content.info} />
        </div>
      )}

      {/* Schedule Section */}
      {content.schedule.enabled && (
        <section id="program" className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-gray-900 mb-4">
                Program
              </h2>
              <div className="w-16 h-px bg-gray-900 mx-auto mb-8"></div>
              <p className="text-gray-600 text-lg">
                Na co se můžete během našeho svatebního dne těšit?
              </p>
            </div>

            {content.schedule.items && content.schedule.items.length > 0 ? (
              <div className="space-y-8">
                {content.schedule.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-light text-gray-900">{item.title}</h3>
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                          {item.time}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-gray-600">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-4">⏰</div>
                <p className="text-gray-600">
                  Program bude brzy k dispozici.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* RSVP Section */}
      {content.rsvp.enabled && (
        <div id="ucast">
          <ModernRSVPSection
            content={content.rsvp}
            websiteId={website.id}
            weddingId={website.weddingId}
          />
        </div>
      )}

      {/* Accommodation Section */}
      {content.accommodation?.enabled && (
        <AccommodationSection content={content.accommodation} />
      )}

      {/* Gift Section */}
      {content.gift?.enabled && (
        <section id="dary" className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-gray-900 mb-4">
                Dary
              </h2>
              <div className="w-16 h-px bg-gray-900 mx-auto mb-8"></div>
            </div>

            <div className="text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🎁</div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {content.gift.message || 'Největším darem pro nás bude, když tento den oslavíte s námi. Pokud byste nás ale chtěli potěšit ještě trochu více, rádi uvítáme finanční příspěvek, který nám pomůže splnit naše společné sny.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Dress Code Section */}
      <section id="dress-code" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Dress Code
            </h2>
            <div className="w-16 h-px bg-gray-900 mx-auto mb-8"></div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Prosíme, slaďte se s námi a přijďte formálně oblečeni v jedné z těchto barev
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: 'Tmavě modrá', color: '#1e3a5f', description: 'jako zimní obloha' },
              { name: 'Tmavě zelená', color: '#2d5016', description: 'jako voňavé jehličí' },
              { name: 'Světle hnědá', color: '#c4a57b', description: 'jako teplé kakao' },
              { name: 'Světle šedá', color: '#d3d3d3', description: 'jako sněhové vločky' },
              { name: 'Tmavě hnědá', color: '#5c4033', description: 'jako popadané šišky' },
              { name: 'Tmavě šedá', color: '#4a5568', description: 'jako zamrzlé jezero' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-full aspect-square rounded-lg mb-4 shadow-md"
                  style={{ backgroundColor: item.color }}
                ></div>
                <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 italic">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 text-sm">
              + černá barva pro pány
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {content.gallery?.enabled && (
        <section id="galerie" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-gray-900 mb-4">
                {content.gallery.title || 'Galerie'}
              </h2>
              <div className="w-16 h-px bg-gray-900 mx-auto mb-8"></div>
              {content.gallery.subtitle && (
                <p className="text-gray-600 text-lg mb-4">{content.gallery.subtitle}</p>
              )}
              {content.gallery.description && (
                <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">{content.gallery.description}</p>
              )}
            </div>

            {content.gallery.images && content.gallery.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {content.gallery.images.map((image) => (
                  <div key={image.id} className="group relative">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {image.caption && (
                      <p className="text-center text-gray-600 text-sm mt-3 font-light">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  Fotky budou brzy k dispozici
                </h3>
                <p className="text-gray-600">
                  Těšte se na krásné fotky z našeho velkého dne!
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Menu Section */}
      {content.menu?.enabled && (
        <MenuSection content={content.menu} />
      )}

      {/* Contact Section */}
      {content.contact?.enabled && (
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                Kontakt
              </h2>
              <div className="w-12 h-px bg-gray-900 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-2xl">👰</div>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  {content.hero.bride}
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+420 123 456 789</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>nevesta@example.com</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-2xl">🤵</div>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-4">
                  {content.hero.groom}
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+420 987 654 321</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>zenich@example.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {content.faq?.enabled && <FAQSection content={content.faq} />}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-12">
            <div className="text-5xl font-light mb-4">
              {getInitials()}
            </div>
            <h3 className="text-3xl font-light mb-4">
              {content.hero.bride} & {content.hero.groom}
            </h3>
            {content.hero.weddingDate && (
              <p className="text-gray-400 text-lg">
                {formatDate(content.hero.weddingDate)} • {content.info?.ceremony?.venue || 'Místo konání'}
              </p>
            )}
          </div>

          <div className="border-t border-gray-700 pt-8">
            <p className="text-gray-500 text-sm">
              Vytvořeno s ❤️ pomocí SvatBot.cz
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
