import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading } from '../ui/Typography';
import { MENUS } from '../../constants';

export const Menu: React.FC = () => {
  const allCourses = [...MENUS.food, ...MENUS.drinks];

  return (
    <Section className="bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
        <div>
          <SubHeading>04 — Gastronomy</SubHeading>
          <Heading>Menu</Heading>
          <p className="font-sans text-sm uppercase tracking-widest mt-8 text-black/60">
            Prosíme informujte nás o případných alergiích ve formuláři RSVP.
          </p>
        </div>

        <div className="space-y-12">
          {allCourses.map((course, index) => (
            <div key={index} className="relative">
              <span className="absolute -left-8 top-0 font-serif italic text-black/20 text-4xl">
                {index + 1}
              </span>
              <h4 className="font-sans font-bold uppercase tracking-widest mb-4 border-b border-black pb-2">
                {course.title}
              </h4>
              <ul className="space-y-2">
                {course.items.map((item, i) => (
                  <li key={i} className="font-serif text-xl md:text-2xl leading-snug">
                    {item.name}
                    <span className="block text-sm font-sans text-black/60">{item.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};