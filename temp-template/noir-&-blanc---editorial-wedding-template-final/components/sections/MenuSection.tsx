import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading } from '../ui/Typography';
import { MENUS } from '../../constants';

export const MenuSection: React.FC = () => {
  return (
    <Section id="menu" className="bg-white border-t border-black">
      <div className="text-center mb-16">
        <SubHeading>Gastronomy</SubHeading>
        <Heading>Menu</Heading>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Food Column */}
        <div>
            <div className="font-serif text-3xl mb-8 italic text-center border-b border-black pb-4">Jídlo</div>
            <div className="space-y-12">
                {MENUS.food.map((cat, i) => (
                    <div key={i}>
                        <h4 className="font-sans font-bold uppercase tracking-widest mb-6">{cat.title}</h4>
                        <div className="space-y-6">
                            {cat.items.map((item, j) => (
                                <div key={j}>
                                    <div className="flex justify-between items-baseline">
                                        <h5 className="font-serif text-xl">{item.name}</h5>
                                        {item.allergens && <span className="text-[10px] uppercase tracking-widest text-black/40">Alergeny: {item.allergens}</span>}
                                    </div>
                                    <p className="font-light opacity-70">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Drinks Column */}
        <div>
            <div className="font-serif text-3xl mb-8 italic text-center border-b border-black pb-4">Nápoje</div>
            <div className="space-y-12">
                {MENUS.drinks.map((cat, i) => (
                    <div key={i}>
                        <h4 className="font-sans font-bold uppercase tracking-widest mb-6">{cat.title}</h4>
                        <div className="space-y-6">
                            {cat.items.map((item, j) => (
                                <div key={j}>
                                    <h5 className="font-serif text-xl">{item.name}</h5>
                                    <p className="font-light opacity-70">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </Section>
  );
};