import React from 'react';
import { COUPLE } from '../../constants';
import { DisplayText } from '../ui/Typography';

export const Hero: React.FC = () => {
  return (
    <section id="uvod" className="relative h-screen w-full flex flex-col justify-between p-4 md:p-8 bg-cream overflow-hidden border-b border-black">
      
      {/* Top Info */}
      <div className="flex justify-between items-start z-10 font-sans text-sm md:text-base uppercase font-bold tracking-widest">
        <div className="flex flex-col">
          <span>Save the date</span>
          <span>{COUPLE.date}</span>
        </div>
        <div className="flex flex-col text-right">
          <span>Zámek Červená Lhota</span>
          <span>Czech Republic</span>
        </div>
      </div>

      {/* Main Visual */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div className="relative w-[80%] h-[70%] md:w-[400px] md:h-[550px] overflow-hidden">
           <img 
             src={COUPLE.mainImage} 
             className="w-full h-full object-cover grayscale contrast-125"
             alt="Couple" 
           />
           {/* "Stamp" overlay */}
           <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-black rounded-full flex items-center justify-center text-cream animate-spin-slow hidden md:flex">
             <svg viewBox="0 0 100 100" className="w-full h-full p-2 animate-[spin_10s_linear_infinite]">
               <path id="curve" d="M 25, 50 a 25,25 0 1,1 50,0 a 25,25 0 1,1 -50,0" fill="none" />
               <text className="text-[10px] font-sans uppercase fill-current tracking-widest">
                 <textPath xlinkHref="#curve">
                   Svatba roku • 2025 •
                 </textPath>
               </text>
             </svg>
           </div>
        </div>
      </div>

      {/* Typography Layer - Overlapping Image */}
      <div className="relative z-10 w-full flex flex-col justify-center h-full pointer-events-none mix-blend-difference text-cream md:text-black md:mix-blend-normal">
         <div className="text-center">
            <DisplayText className="leading-none block md:absolute md:top-1/2 md:left-12 md:-translate-y-1/2 md:text-left">
              {COUPLE.groom.name.split(' ')[0]}
            </DisplayText>
            <span className="font-serif text-4xl italic md:hidden">&</span>
            <DisplayText className="leading-none block md:absolute md:top-1/2 md:right-12 md:-translate-y-1/2 md:text-right">
              {COUPLE.bride.name.split(' ')[0]}
            </DisplayText>
         </div>
      </div>

      {/* Bottom Arrow */}
      <div className="flex justify-center z-10">
        <div className="animate-bounce">
            <div className="w-[1px] h-16 bg-black"></div>
        </div>
      </div>
    </section>
  );
};