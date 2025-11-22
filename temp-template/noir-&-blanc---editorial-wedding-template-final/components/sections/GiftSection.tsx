import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading, Paragraph } from '../ui/Typography';
import { GIFTS } from '../../constants';
import { Gift } from 'lucide-react';

export const GiftSection: React.FC = () => {
  return (
    <Section className="bg-cream text-center">
      <div className="max-w-3xl mx-auto">
        <Gift className="w-12 h-12 mx-auto mb-8 opacity-50" />
        <SubHeading>Registry</SubHeading>
        <Heading>Svatební Dary</Heading>
        <Paragraph className="mb-12">{GIFTS.message}</Paragraph>

        {/* Bank Account - Hero */}
        <div className="bg-white border border-black p-12 mb-16 relative overflow-hidden group">
            <div className="relative z-10">
                <p className="font-sans text-sm uppercase tracking-widest mb-4 text-black/50">Číslo účtu pro příspěvky</p>
                <p className="font-mono text-3xl md:text-5xl tracking-tighter select-all">{GIFTS.account}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
            {/* Registry List */}
            <div>
                <h4 className="font-serif text-2xl mb-6 border-b border-black pb-2">Seznam přání</h4>
                <ul className="space-y-4">
                    {GIFTS.registry.map((item, i) => (
                        <li key={i} className="flex justify-between items-center group">
                            <span>{item.name}</span>
                            <a href={item.url} className="text-xs uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
                                Zobrazit
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Charity */}
            <div className="bg-black text-cream p-8">
                 <h4 className="font-serif text-2xl mb-4 text-white">Charitativní dar</h4>
                 <p className="opacity-80 mb-2 font-bold">{GIFTS.charity.name}</p>
                 <p className="opacity-60 text-sm mb-6">{GIFTS.charity.description}</p>
                 <a href={GIFTS.charity.url} className="inline-block text-xs uppercase border-b border-cream pb-1 hover:text-accent hover:border-accent">
                    Přispět zde
                 </a>
            </div>
        </div>
      </div>
    </Section>
  );
};