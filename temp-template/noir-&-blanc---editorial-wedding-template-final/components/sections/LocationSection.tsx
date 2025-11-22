import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading, Paragraph } from '../ui/Typography';
import { LOCATIONS } from '../../constants';
import { MapPin, Clock } from 'lucide-react';

export const LocationSection: React.FC = () => {
  return (
    <Section id="misto" noPadding className="border-b border-black">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        {/* Ceremony */}
        <div className="relative h-[600px] lg:h-[800px] group overflow-hidden bg-black text-cream flex flex-col justify-between p-8 md:p-16 border-b lg:border-b-0 lg:border-r border-white/20">
          <img src={LOCATIONS.ceremony.photo} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity duration-500" alt="Ceremony" />
          <div className="relative z-10">
            <SubHeading className="text-cream/60">Part 01</SubHeading>
            <Heading className="text-cream">{LOCATIONS.ceremony.title}</Heading>
          </div>
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span className="font-serif text-2xl">{LOCATIONS.ceremony.time}</span>
             </div>
             <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1" />
                <div>
                    <p className="font-bold uppercase tracking-widest">{LOCATIONS.ceremony.placeName}</p>
                    <p className="font-light opacity-80 mb-4">{LOCATIONS.ceremony.address}</p>
                    <a href={LOCATIONS.ceremony.mapUrl} target="_blank" rel="noreferrer" className="inline-block border-b border-cream pb-1 text-sm uppercase hover:text-accent hover:border-accent transition-colors">
                        Otevřít mapu
                    </a>
                </div>
             </div>
          </div>
        </div>

        {/* Reception */}
        <div className="relative h-[600px] lg:h-[800px] group overflow-hidden bg-cream text-black flex flex-col justify-between p-8 md:p-16">
          <img src={LOCATIONS.reception.photo} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-5 transition-opacity duration-500" alt="Reception" />
          <div className="relative z-10">
            <SubHeading>Part 02</SubHeading>
            <Heading>{LOCATIONS.reception.title}</Heading>
          </div>
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span className="font-serif text-2xl">{LOCATIONS.reception.time}</span>
             </div>
             <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1" />
                <div>
                    <p className="font-bold uppercase tracking-widest">{LOCATIONS.reception.placeName}</p>
                    <p className="font-light opacity-80 mb-4">{LOCATIONS.reception.address}</p>
                    <a href={LOCATIONS.reception.mapUrl} target="_blank" rel="noreferrer" className="inline-block border-b border-black pb-1 text-sm uppercase hover:text-accent hover:border-accent transition-colors">
                        Otevřít mapu
                    </a>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* Extra Info Bar */}
      <div className="bg-black text-cream p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
         <div>
            <h4 className="uppercase tracking-widest font-bold mb-2 text-sm">Parkování</h4>
            <p className="opacity-70 font-light">{LOCATIONS.parking}</p>
         </div>
         <div>
            <h4 className="uppercase tracking-widest font-bold mb-2 text-sm">Bezbariérovost</h4>
            <p className="opacity-70 font-light">{LOCATIONS.accessibility}</p>
         </div>
      </div>
    </Section>
  );
};