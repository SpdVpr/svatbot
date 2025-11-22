'use client'

import React from 'react'
import { Heart } from 'lucide-react'

interface FooterProps {
  bride: string
  groom: string
  weddingDate: Date
}

export default function Footer({ bride, groom, weddingDate }: FooterProps) {
  const getFirstName = (fullName: string) => fullName.split(' ')[0]
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <footer className="bg-black text-[#f2f0ea] py-20 border-t border-white/10">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        
        <div className="mb-12">
          <Heart className="w-8 h-8 mx-auto mb-4 text-[#d4b0aa]" />
          <h3 className="font-serif text-4xl md:text-6xl">
            {getFirstName(groom)} & {getFirstName(bride)}
          </h3>
          <p className="font-sans text-sm uppercase tracking-[0.3em] mt-2 opacity-60">
            {formatDate(weddingDate)}
          </p>
        </div>

        <div className="w-full border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs opacity-40 font-sans uppercase tracking-widest">
          <span>© {new Date().getFullYear()} All Rights Reserved</span>
          <span className="mt-2 md:mt-0">Made with Love</span>
        </div>
      </div>
    </footer>
  )
}

