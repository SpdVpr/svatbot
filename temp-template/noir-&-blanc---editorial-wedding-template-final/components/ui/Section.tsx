import React from 'react';

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  noPadding?: boolean;
  borderBottom?: boolean;
}

import { ReactNode } from 'react';

export const Section: React.FC<SectionProps> = ({ 
  children, 
  id, 
  className = "", 
  noPadding = false,
  borderBottom = true
}) => {
  return (
    <section 
      id={id} 
      className={`relative w-full bg-cream text-black overflow-hidden ${borderBottom ? 'border-b border-black' : ''} ${className}`}
    >
      <div className={`${noPadding ? '' : 'px-4 py-20 md:py-32 md:px-12 max-w-[1800px] mx-auto'}`}>
        {children}
      </div>
    </section>
  );
};