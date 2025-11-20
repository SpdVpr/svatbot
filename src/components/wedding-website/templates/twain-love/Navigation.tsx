'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

interface NavigationProps {
  bride: string
  groom: string
}

export default function Navigation({ bride, groom }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Domů', href: '#home' },
    { label: 'Náš příběh', href: '#story' },
    { label: 'Místo konání', href: '#event' },
    { label: 'Program', href: '#schedule' },
    { label: 'Dress Code', href: '#dresscode' },
    { label: 'Ubytování', href: '#accommodation' },
    { label: 'Galerie', href: '#gallery' },
    { label: 'Potvrzení účasti', href: '#rsvp' },
    { label: 'Dary', href: '#gift' },
    { label: 'Menu', href: '#menu' },
    { label: 'Kontakt', href: '#contact' },
    { label: 'FAQ', href: '#faq' },
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
      {/* Header - Changes from absolute to fixed on scroll */}
      <div
        className={`${isScrolled ? 'fixed' : 'absolute'} top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#b2c9d3] shadow-md border-b border-[rgba(255,255,255,0.3)]'
            : 'bg-[rgba(0,0,0,0.12)] border-b border-[rgba(255,255,255,0.1)]'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className={`transition-all duration-300 ${isScrolled ? 'py-4' : 'py-8'}`}>
              <h2
                className="text-3xl m-0 text-white transition-colors duration-300"
                style={{ fontFamily: 'Great Vibes, cursive' }}
              >
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
                      className={`block px-6 text-white transition-all duration-300 ${
                        isScrolled
                          ? 'py-6 hover:text-[#6a8a98]'
                          : 'py-9 hover:text-[#b6e9ff]'
                      }`}
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
              className="lg:hidden text-white transition-colors p-4 hover:text-[#b6e9ff]"
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

