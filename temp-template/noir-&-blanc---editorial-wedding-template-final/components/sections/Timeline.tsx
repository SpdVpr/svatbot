import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading } from '../ui/Typography';
import { TIMELINE } from '../../constants';

export const Timeline: React.FC = () => {
  return (
    <Section id="harmonogram" className="bg-black text-cream" borderBottom={false}>
      <div className="mb-16">
        <SubHeading className="text-cream/50">02 — Agenda</SubHeading>
        <Heading className="text-cream">Harmonogram Dne</Heading>
      </div>

      <div className="space-y-0">
        {TIMELINE.map((event, index) => (
          <div 
            key={index} 
            className="group flex flex-col md:flex-row md:items-center py-8 border-b border-cream/20 hover:bg-cream/5 transition-colors duration-300"
          >
            <div className="w-full md:w-1/4 font-sans text-3xl font-light tracking-tighter text-accent">
              {event.time}
            </div>
            <div className="w-full md:w-2/4">
              <h3 className="font-serif text-4xl md:text-5xl uppercase group-hover:pl-4 transition-all duration-300">
                {event.title}
              </h3>
            </div>
            <div className="w-full md:w-1/4 mt-2 md:mt-0 font-sans text-sm uppercase tracking-widest text-cream/60 text-right">
              {event.description}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};