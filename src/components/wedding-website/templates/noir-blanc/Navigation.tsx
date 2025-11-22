'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { WebsiteContent } from '@/types/wedding-website'

interface NavigationProps {
  bride: string
  groom: string
  content: WebsiteContent
}

export default function Navigation({ bride, groom, content }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setIsMobileOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Build navigation items based on enabled sections
  const navItems = [
    { label: 'Úvod', href: 'home' },
  ]

  if (content.story?.enabled) {
    navItems.push({ label: 'Příběh', href: 'story' })
  }
  if (content.info?.enabled) {
    navItems.push({ label: 'Místo', href: 'info' })
  }
  if (content.schedule?.enabled) {
    navItems.push({ label: 'Program', href: 'schedule' })
  }
  if (content.dressCode?.enabled) {
    navItems.push({ label: 'Dress Code', href: 'dressCode' })
  }
  if (content.menu?.enabled) {
    navItems.push({ label: 'Menu', href: 'menu' })
  }
  if (content.accommodation?.enabled) {
    navItems.push({ label: 'Ubytování', href: 'accommodation' })
  }
  if (content.gift?.enabled) {
    navItems.push({ label: 'Dary', href: 'gift' })
  }
  if (content.gallery?.enabled) {
    navItems.push({ label: 'Galerie', href: 'gallery' })
  }
  if (content.contact?.enabled) {
    navItems.push({ label: 'Kontakt', href: 'contact' })
  }
  if (content.faq?.enabled) {
    navItems.push({ label: 'FAQ', href: 'faq' })
  }
  if (content.rsvp?.enabled) {
    navItems.push({ label: 'Účast', href: 'rsvp' })
  }

  const getFirstName = (fullName: string) => fullName.split(' ')[0]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white text-black py-4 shadow-md border-b border-black'
            : 'bg-transparent text-white py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div
            className={`font-serif text-2xl font-bold tracking-tighter cursor-pointer ${
              isScrolled ? 'text-black' : 'text-white'
            }`}
            onClick={() => window.scrollTo(0, 0)}
          >
            {getFirstName(groom)} & {getFirstName(bride)}
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className={`text-sm uppercase tracking-widest hover:text-[#d4b0aa] transition-colors ${
                  isScrolled ? 'text-black' : 'text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileOpen(true)}
              className={`${isScrolled ? 'text-black' : 'text-white'}`}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center animate-reveal">
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="absolute top-6 right-6 text-[#f2f0ea]"
          >
            <X size={32} />
          </button>
          <div className="flex flex-col space-y-8 text-center">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="font-serif text-4xl text-[#f2f0ea] hover:text-[#d4b0aa] transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

