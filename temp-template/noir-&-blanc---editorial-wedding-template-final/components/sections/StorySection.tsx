import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading, Paragraph } from '../ui/Typography';
import { COUPLE } from '../../constants';

export const StorySection: React.FC = () => {
  return (
    <Section id="pribeh">
      {/* Profiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32">
        {/* Bride Profile */}
        <div className="flex flex-col items-center text-center">
          <div className="w-full aspect-[3/4] overflow-hidden mb-8 border border-black">
            <img src={COUPLE.bride.photo} alt={COUPLE.bride.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
          </div>
          <h3 className="font-serif text-4xl mb-2">{COUPLE.bride.name}</h3>
          <span className="font-sans text-xs uppercase tracking-widest text-black/50 mb-4">The Bride</span>
          <Paragraph className="mb-6 max-w-md">{COUPLE.bride.description}</Paragraph>
          <div className="flex gap-2 flex-wrap justify-center">
            {COUPLE.bride.hobbies.map(h => (
              <span key={h} className="px-3 py-1 border border-black/20 rounded-full text-xs uppercase tracking-wide">{h}</span>
            ))}
          </div>
        </div>

        {/* Groom Profile */}
        <div className="flex flex-col items-center text-center lg:mt-24">
          <div className="w-full aspect-[3/4] overflow-hidden mb-8 border border-black">
            <img src={COUPLE.groom.photo} alt={COUPLE.groom.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
          </div>
          <h3 className="font-serif text-4xl mb-2">{COUPLE.groom.name}</h3>
          <span className="font-sans text-xs uppercase tracking-widest text-black/50 mb-4">The Groom</span>
          <Paragraph className="mb-6 max-w-md">{COUPLE.groom.description}</Paragraph>
          <div className="flex gap-2 flex-wrap justify-center">
            {COUPLE.groom.hobbies.map(h => (
              <span key={h} className="px-3 py-1 border border-black/20 rounded-full text-xs uppercase tracking-wide">{h}</span>
            ))}
          </div>
        </div>
      </div>

      {/* How We Met & Proposal */}
      <div className="space-y-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5">
            <img src={COUPLE.story.met.photo} className="w-full h-auto grayscale" alt="Met" />
          </div>
          <div className="md:col-span-7 md:pl-12">
             <SubHeading>{COUPLE.story.met.date}</SubHeading>
             <Heading>{COUPLE.story.met.title}</Heading>
             <Paragraph>{COUPLE.story.met.text}</Paragraph>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center dir-rtl">
          <div className="md:col-span-7 md:pr-12 md:text-right order-2 md:order-1">
             <SubHeading>{COUPLE.story.proposal.date}</SubHeading>
             <Heading>{COUPLE.story.proposal.title}</Heading>
             <Paragraph>{COUPLE.story.proposal.text}</Paragraph>
          </div>
          <div className="md:col-span-5 order-1 md:order-2">
            <img src={COUPLE.story.proposal.photo} className="w-full h-auto grayscale" alt="Proposal" />
          </div>
        </div>
      </div>
    </Section>
  );
};