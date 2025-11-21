'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import type { WebsiteContent } from '@/types/wedding-website'

interface NavigationProps {
  bride: string
  groom: string
  content: WebsiteContent
}

export default function Navigation({ bride, groom, content }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Build navigation items based on enabled sections
  const navItems = [
    { label: 'Domů', href: '#home' }, // Always visible
  ]

  if (content.story?.enabled) {
    navItems.push({ label: 'Náš příběh', href: '#story' })
  }
  if (content.info?.enabled) {
    navItems.push({ label: 'Místo konání', href: '#info' })
  }
  if (content.accommodation?.enabled) {
    navItems.push({ label: 'Ubytování', href: '#accommodation' })
  }
  if (content.menu?.enabled) {
    navItems.push({ label: 'Menu', href: '#menu' })
  }
  if (content.gallery?.enabled) {
    navItems.push({ label: 'Galerie', href: '#gallery' })
  }
  if (content.schedule?.enabled) {
    navItems.push({ label: 'Program', href: '#schedule' })
  }
  if (content.dressCode?.enabled) {
    navItems.push({ label: 'Dress Code', href: '#dressCode' })
  }
  if (content.gift?.enabled) {
    navItems.push({ label: 'Dary', href: '#gift' })
  }
  if (content.rsvp?.enabled) {
    navItems.push({ label: 'RSVP', href: '#rsvp' })
  }
  if (content.faq?.enabled) {
    navItems.push({ label: 'FAQ', href: '#faq' })
  }
  if (content.contact?.enabled) {
    navItems.push({ label: 'Kontakt', href: '#contact' })
  }

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <>
      {/* Header - Changes from absolute to fixed on scroll */}
      <div
        className={`${isScrolled ? 'fixed' : 'absolute'} top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-stone-800 shadow-lg'
            : 'bg-gradient-to-b from-black/40 to-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className={`transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
              <h2
                className="text-2xl md:text-3xl font-serif font-light text-white transition-colors duration-300"
              >
                {bride} & {groom}
              </h2>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:block">
              <ul className="flex list-none m-0 p-0 gap-0">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className={`block px-3 text-white text-sm transition-all duration-300 hover:text-stone-300 ${
                        isScrolled ? 'py-5' : 'py-7'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white transition-colors p-2 hover:text-stone-300"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pb-4">
              <ul className="list-none m-0 p-0">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className="block w-full text-left px-4 py-3 text-white hover:text-stone-300 transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

