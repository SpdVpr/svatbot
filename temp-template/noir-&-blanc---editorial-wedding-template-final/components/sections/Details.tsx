import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading, Paragraph } from '../ui/Typography';
import { ACCOMMODATION, FAQS, DRESS_CODE } from '../../constants';
import { ArrowUpRight } from 'lucide-react';

export const Details: React.FC = () => {
  return (
    <Section id="info" noPadding>
      {/* Title Area */}
      <div className="p-8 md:p-20 border-b border-black bg-white">
        <SubHeading>03 — Details</SubHeading>
        <Heading className="mb-0">Informace & <br />Důležité Pokyny</Heading>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        
        {/* Dress Code & Colors */}
        <div className="p-8 md:p-20 border-b md:border-b-0 md:border-r border-black">
          <h3 className="font-serif text-3xl mb-6">Dress Code: Black Tie Optional</h3>
          <Paragraph className="mb-8">
            Elegantní, nadčasové, stylové. Prosíme vyhněte se bílé barvě.
            Pánové oblek, dámy dlouhé šaty.
          </Paragraph>
          <div className="flex gap-4">
            {DRESS_CODE.palette.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div 
                  className="w-16 h-16 border border-black rounded-full" 
                  style={{ backgroundColor: c.hex }} 
                />
                <span className="text-xs font-mono uppercase">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Venue Map Link */}
        <div className="relative group overflow-hidden h-[400px] md:h-auto bg-black text-cream flex items-center justify-center cursor-pointer">
           <img 
             src="https://picsum.photos/id/122/800/600" 
             className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity duration-500 grayscale" 
             alt="Venue"
           />
           <div className="relative z-10 text-center">
             <h3 className="font-serif text-5xl mb-4">Zámek Červená Lhota</h3>
             <div className="flex items-center justify-center gap-2 text-accent uppercase tracking-widest text-sm">
               <span>Navigovat na místo</span>
               <ArrowUpRight className="w-4 h-4" />
             </div>
           </div>
        </div>
      </div>

      {/* Accommodation & Gifts split */}
      <div className="grid grid-cols-1 md:grid-cols-3">
         
         {/* Accommodation */}
         <div className="md:col-span-2 p-8 md:p-20 border-b md:border-b-0 md:border-r border-black bg-cream">
            <h3 className="font-serif text-3xl mb-8">Ubytování</h3>
            <div className="space-y-8">
              {ACCOMMODATION.map((acc, i) => (
                <div key={i} className="border-l-2 border-black pl-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 className="font-bold uppercase font-sans">{acc.name}</h4>
                  </div>
                  <p className="text-black/70">{acc.description}</p>
                </div>
              ))}
            </div>
         </div>

         {/* Gifts */}
         <div className="p-8 md:p-20 flex flex-col justify-center bg-white">
            <h3 className="font-serif text-3xl mb-4">Svatební Dary</h3>
            <Paragraph className="text-sm mb-6">
              Místo věcných darů oceníme příspěvek na naši cestu do Japonska.
            </Paragraph>
            <div className="border border-black p-4 text-center font-mono text-lg">
              1234-5678/0100
            </div>
         </div>

      </div>

      {/* FAQ Accordion Style */}
      <div className="border-t border-black">
        {FAQS.map((faq, i) => (
          <details key={i} className="group border-b border-black last:border-b-0 cursor-pointer bg-white">
            <summary className="flex justify-between items-center p-8 md:px-20 md:py-10 list-none hover:bg-black hover:text-cream transition-colors duration-300">
              <span className="font-serif text-2xl md:text-3xl">{faq.question}</span>
              <span className="text-2xl transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="px-8 md:px-20 pb-10 pt-2">
              <Paragraph>{faq.answer}</Paragraph>
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
};