import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading, Paragraph } from '../ui/Typography';
import { DRESS_CODE } from '../../constants';

export const DressCodeSection: React.FC = () => {
  return (
    <Section className="bg-white">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <SubHeading>Style Guide</SubHeading>
        <Heading>{DRESS_CODE.title}</Heading>
        <Paragraph>{DRESS_CODE.description}</Paragraph>
      </div>

      <div className="flex flex-wrap justify-center gap-8 mb-16">
        {DRESS_CODE.palette.map((color, index) => (
          <div key={index} className="flex flex-col items-center gap-4">
            <div 
              className="w-24 h-24 rounded-full border border-black/10 shadow-xl" 
              style={{ backgroundColor: color.hex }} 
            />
            <span className="font-mono uppercase text-sm tracking-widest">{color.name}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DRESS_CODE.inspirationPhotos.map((photo, index) => (
           <div key={index} className="h-[400px] overflow-hidden border border-black">
              <img src={photo} alt="Inspiration" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
           </div>
        ))}
      </div>
    </Section>
  );
};