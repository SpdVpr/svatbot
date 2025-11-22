import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading } from '../ui/Typography';
import { ACCOMMODATION } from '../../constants';
import { Info, Phone } from 'lucide-react';

export const AccommodationSection: React.FC = () => {
  return (
    <Section id="ubytovani">
      <div className="mb-16">
        <SubHeading>Pobyt</SubHeading>
        <Heading>Ubytování</Heading>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {ACCOMMODATION.map((hotel, index) => (
          <div key={index} className="border border-black flex flex-col">
            <div className="h-64 overflow-hidden">
                <img src={hotel.photo} alt={hotel.name} className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" />
            </div>
            <div className="p-8 flex-grow">
                <div className="flex justify-between items-baseline mb-4">
                    <h3 className="font-serif text-3xl">{hotel.name}</h3>
                </div>
                <p className="mb-6 font-light opacity-80">{hotel.description}</p>
                <p className="text-sm mb-6 flex items-center gap-2"><Phone size={14}/> {hotel.contact}</p>
                
                <div className="space-y-4 border-t border-black/10 pt-4">
                    {hotel.rooms.map((room, rIndex) => (
                        <div key={rIndex} className="flex justify-between items-center bg-cream/50 p-4">
                            <div>
                                <div className="font-bold uppercase text-sm">{room.name}</div>
                                <div className="text-xs opacity-60">{room.description} • {room.capacity}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-serif text-lg">{room.price}</div>
                                <div className="text-[10px] uppercase tracking-widest text-green-800">
                                    {room.available} volných
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};