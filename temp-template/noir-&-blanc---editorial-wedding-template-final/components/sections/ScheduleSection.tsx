import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading } from '../ui/Typography';
import { TIMELINE } from '../../constants';

export const ScheduleSection: React.FC = () => {
  return (
    <Section id="harmonogram" className="bg-cream">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <SubHeading>Agenda</SubHeading>
          <Heading>Harmonogram<br/>Dne</Heading>
        </div>
        
        <div className="lg:col-span-8 relative pl-8 md:pl-12 border-l border-black">
          {TIMELINE.map((event, index) => {
             const Icon = event.icon;
             return (
                <div key={index} className="relative mb-12 last:mb-0 group">
                    {/* Dot */}
                    <div className="absolute -left-[41px] md:-left-[57px] top-2 w-4 h-4 bg-black rounded-full border-4 border-cream" />
                    
                    <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-2">
                        <span className="font-sans text-2xl font-bold">{event.time}</span>
                        <h3 className="font-serif text-3xl md:text-4xl">{event.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-black/60 mb-2 font-sans uppercase tracking-widest text-xs">
                        {Icon && <Icon size={14} />}
                        <span>{event.location}</span>
                    </div>
                    
                    <p className="font-light text-lg max-w-md opacity-80">
                        {event.description}
                    </p>
                </div>
             );
          })}
        </div>
      </div>
    </Section>
  );
};