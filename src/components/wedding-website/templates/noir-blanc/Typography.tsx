'use client'

import React from 'react'

export const DisplayText: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <h1 className={`font-serif text-6xl md:text-8xl lg:text-[10rem] uppercase leading-[0.85] tracking-tight text-black ${className}`}>
    {children}
  </h1>
)

export const Heading: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <h2 className={`font-serif text-4xl md:text-6xl uppercase text-black mb-8 ${className}`}>
    {children}
  </h2>
)

export const SubHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <h3 className={`font-sans text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-black/60 mb-4 ${className}`}>
    {children}
  </h3>
)

export const Paragraph: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <p className={`font-sans text-base md:text-lg font-light leading-relaxed text-black/80 ${className}`}>
    {children}
  </p>
)

