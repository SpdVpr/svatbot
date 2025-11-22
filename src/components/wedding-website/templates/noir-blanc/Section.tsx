'use client'

import React, { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  id?: string
  className?: string
  noPadding?: boolean
  borderBottom?: boolean
  style?: React.CSSProperties
}

export const Section: React.FC<SectionProps> = ({
  children,
  id,
  className = "",
  noPadding = false,
  borderBottom = true,
  style
}) => {
  return (
    <section
      id={id}
      className={`${className} relative w-full text-black ${borderBottom ? 'border-b border-black' : ''}`}
      style={style}
    >
      <div className={`${noPadding ? '' : 'px-4 py-20 md:py-32 md:px-12 max-w-[1800px] mx-auto'}`}>
        {children}
      </div>
    </section>
  )
}

