'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { WebsiteContent } from '@/types/wedding-website'

interface NavigationProps {
  bride: string
  groom: string
  content: WebsiteContent
}

export default function Navigation({ bride, groom, content }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Náš příběh', href: '#story', enabled: content.story?.enabled },
    { label: 'Místo', href: '#info', enabled: content.info?.enabled },
    { label: 'Harmonogram', href: '#schedule', enabled: content.schedule?.enabled },
    { label: 'Ubytování', href: '#accommodation', enabled: content.accommodation?.enabled },
    { label: 'Dary', href: '#gift', enabled: content.gift?.enabled },
  ].filter(item => item.enabled)

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  // Get initials
  const brideInitial = bride.charAt(0).toUpperCase()
  const groomInitial = groom.charAt(0).toUpperCase()

  return (
    <nav 
      className={`fixed w-full z-[60] transition-all duration-500 ${
        scrolled ? 'bg-[#F4F2ED]/90 backdrop-blur-md border-b border-[#2C362B]/5 py-4' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('#hero')}
            className={`font-serif italic text-3xl font-bold tracking-wider transition-colors z-50 ${
              scrolled || isOpen ? 'text-[#2C362B]' : 'text-white'
            }`}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {brideInitial} & {groomInitial}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className={`text-xs uppercase tracking-[0.2em] font-medium hover:text-[#C5A880] transition-colors relative group ${
                  scrolled ? 'text-[#2C362B]' : 'text-white/90 hover:text-white'
                }`}
              >
                {item.label}
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-[#C5A880] transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
            {content.rsvp?.enabled && (
              <button 
                onClick={() => scrollToSection('#rsvp')}
                className={`px-6 py-2 border text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 ${
                  scrolled 
                    ? 'border-[#2C362B] text-[#2C362B] hover:bg-[#2C362B] hover:text-[#F4F2ED]' 
                    : 'border-white text-white hover:bg-white hover:text-[#2C362B]'
                }`}
              >
                RSVP
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden z-50 text-current focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-8 h-8 text-[#2C362B]" />
            ) : (
              <Menu className={`w-8 h-8 ${scrolled ? 'text-[#2C362B]' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#F4F2ED] z-40 flex flex-col items-center justify-center transition-all duration-500 transform ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}>
        <div className="flex flex-col items-center space-y-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.href)}
              className="text-[#2C362B] font-serif text-3xl italic"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {item.label}
            </button>
          ))}
          {content.rsvp?.enabled && (
            <button 
              onClick={() => scrollToSection('#rsvp')}
              className="px-8 py-3 border border-[#2C362B] text-[#2C362B] uppercase tracking-widest hover:bg-[#2C362B] hover:text-[#F4F2ED] transition-colors mt-4"
            >
              Potvrdit účast
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

