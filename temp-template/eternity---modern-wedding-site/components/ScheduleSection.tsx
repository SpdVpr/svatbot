import React from 'react';
import { SectionProps, TimelineEvent } from '../types';

const events: TimelineEvent[] = [
  { time: '12:30', title: 'Příjezd hostů', description: 'Setkání před obřadní síní' },
  { time: '13:00', title: 'Svatební obřad', description: 'V zahradách zámku' },
  { time: '13:45', title: 'Gratulace a focení', description: 'Společné fotografie' },
  { time: '15:30', title: 'Svatební hostina', description: 'Přípitek a oběd' },
  { time: '17:00', title: 'Krájení dortu', description: 'A odpolední káva' },
  { time: '18:00', title: 'První tanec', description: 'Zahájení párty' },
  { time: '22:00', title: 'Večerní raut', description: 'Doplnění energie' },
];

const ScheduleSection: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="py-32 bg-secondary text-cream">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-20">
           <h2 className="font-display-italic text-6xl md:text-7xl mb-4">Program dne</h2>
           <div className="w-px h-16 bg-accent mx-auto mt-8"></div>
        </div>

        <div className="space-y-8">
          {events.map((event, index) => (
            <div key={index} className="group flex items-baseline border-b border-white/10 pb-8 hover:border-accent/50 transition-colors duration-500">
               <div className="w-24 md:w-32 flex-shrink-0">
                  <span className="font-serif text-2xl md:text-3xl text-accent">{event.time}</span>
               </div>
               <div className="flex-grow">
                  <h3 className="font-serif text-2xl md:text-3xl mb-1 group-hover:translate-x-2 transition-transform duration-500">{event.title}</h3>
                  <p className="text-white/60 font-light text-sm md:text-base">{event.description}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;