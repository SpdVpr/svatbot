'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface NavigationProps {
  bride: string
  groom: string
}

export default function Navigation({ bride, groom }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Couple', href: '#couple' },
    { label: 'Story', href: '#story' },
    { label: 'Events', href: '#location' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Rsvp', href: '#rsvp' },
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <>
      {/* Header - Absolute positioned over hero */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-[rgba(0,0,0,0.12)] border-b border-[rgba(255,255,255,0.1)]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="py-8">
              <h2 className="text-3xl text-white m-0" style={{ fontFamily: 'Great Vibes, cursive' }}>
                {bride} & {groom}
              </h2>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:block">
              <ul className="flex list-none m-0 p-0">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className="block px-6 py-9 text-white hover:text-[#b6e9ff] transition-colors duration-300"
                      style={{ fontFamily: 'Muli, sans-serif' }}
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
              className="lg:hidden text-white hover:text-[#b6e9ff] transition-colors p-4"
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
                      className="block w-full text-left px-4 py-3 text-white hover:text-[#b6e9ff] transition-colors"
                      style={{ fontFamily: 'Muli, sans-serif' }}
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

