import React from 'react';

interface MarqueeProps {
  text: string;
  reverse?: boolean;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({ text, reverse = false, className = "" }) => {
  return (
    <div className={`relative w-full overflow-hidden py-4 border-y border-black bg-black text-cream ${className}`}>
      <div className="flex whitespace-nowrap">
        <div className={`flex animate-${reverse ? 'marquee-reverse' : 'marquee'}`}>
          {[...Array(8)].map((_, i) => (
            <span key={i} className="mx-8 font-serif text-4xl md:text-6xl uppercase italic tracking-widest">
              {text} •
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};