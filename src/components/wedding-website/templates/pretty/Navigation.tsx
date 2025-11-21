'use client'

import { useState, useEffect } from 'react'
import type { WebsiteContent } from '@/types/wedding-website'

interface NavigationProps {
  bride: string
  groom: string
  content: WebsiteContent
}

export default function Navigation({ bride, groom, content }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  // Build navigation items based on enabled sections
  const navItems = []

  if (content.story?.enabled && (content.story.bride || content.story.groom)) {
    navItems.push({ id: 'couple', label: 'Couple' })
  }
  if (content.story?.enabled) {
    navItems.push({ id: 'story', label: 'Story' })
  }
  if (content.info?.enabled || content.schedule?.enabled) {
    navItems.push({ id: 'events', label: 'Events' })
  }
  if (content.gallery?.enabled) {
    navItems.push({ id: 'gallery', label: 'Gallery' })
  }
  if (content.rsvp?.enabled) {
    navItems.push({ id: 'rsvp', label: 'RSVP' })
  }
  if (content.gift?.enabled) {
    navItems.push({ id: 'gift', label: 'Gifts' })
  }
  if (content.menu?.enabled) {
    navItems.push({ id: 'menu', label: 'Menu' })
  }
  if (content.contact?.enabled) {
    navItems.push({ id: 'contact', label: 'Contact' })
  }
  if (content.faq?.enabled) {
    navItems.push({ id: 'faq', label: 'FAQ' })
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <a
            href="#home"
            className="text-2xl font-bold flex items-center gap-2"
            style={{ fontFamily: 'Great Vibes, cursive', color: '#b19a56' }}
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            {bride} <i className="flaticon-spring text-xl"></i> {groom}
          </a>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-700 transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#b19a56'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-current"></span>
              <span className="block w-6 h-0.5 bg-current"></span>
              <span className="block w-6 h-0.5 bg-current"></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left text-gray-700 transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#b19a56'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}

