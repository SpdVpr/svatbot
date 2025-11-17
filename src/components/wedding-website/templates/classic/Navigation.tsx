'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import type { WebsiteContent } from '@/types/wedding-website'
import { useColorTheme } from '../ColorThemeContext'

interface NavigationProps {
  content: WebsiteContent
}

export default function Navigation({ content }: NavigationProps) {
  const { themeName } = useColorTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Build navigation items based on enabled sections
  const navItems = []

  if (content.story?.enabled) {
    navItems.push({ id: 'story', label: 'Náš příběh' })
  }
  if (content.info?.enabled) {
    navItems.push({ id: 'info', label: 'Informace' })
  }
  if (content.dressCode?.enabled) {
    navItems.push({ id: 'dressCode', label: 'Dress Code' })
  }
  if (content.schedule?.enabled) {
    navItems.push({ id: 'schedule', label: 'Program' })
  }
  if (content.menu?.enabled) {
    navItems.push({ id: 'menu', label: 'Menu' })
  }
  if (content.accommodation?.enabled) {
    navItems.push({ id: 'accommodation', label: 'Ubytování' })
  }
  if (content.gallery?.enabled) {
    navItems.push({ id: 'gallery', label: 'Galerie' })
  }
  if (content.gift?.enabled) {
    navItems.push({ id: 'gift', label: 'Dary' })
  }
  if (content.rsvp?.enabled) {
    navItems.push({ id: 'rsvp', label: 'RSVP' })
  }
  if (content.faq?.enabled) {
    navItems.push({ id: 'faq', label: 'FAQ' })
  }
  if (content.contact?.enabled) {
    navItems.push({ id: 'contact', label: 'Kontakt' })
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Height of fixed navbar
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const isDefaultTheme = themeName === 'default'
  const shouldShowBackground = isScrolled || isDefaultTheme

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        shouldShowBackground
          ? 'bg-white/95 backdrop-blur-md shadow-md py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo / Names */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex items-center gap-2 font-serif font-bold text-lg transition-colors ${
              shouldShowBackground ? 'text-gray-900' : 'text-white drop-shadow-lg'
            }`}
          >
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            <span>{content.hero.bride} & {content.hero.groom}</span>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                  shouldShowBackground ? 'text-gray-700' : 'text-white drop-shadow-lg'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              shouldShowBackground ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}

