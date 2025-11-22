import React from 'react';
import { Section } from '../ui/Section';
import { Heading, SubHeading, Paragraph } from '../ui/Typography';
import { COUPLE } from '../../constants';

export const Story: React.FC = () => {
  return (
    <Section id="pribeh">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <SubHeading>01 — The Beginning</SubHeading>
          <Heading className="text-5xl md:text-7xl">Love<br/>Story</Heading>
          <img 
            src={COUPLE.story.met.photo} 
            alt="Couple Portrait" 
            className="w-full aspect-[3/4] object-cover grayscale mt-8 hidden lg:block" 
          />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-12">
           <div className="border-l border-black pl-8 md:pl-12 py-2">
             <Paragraph className="text-xl md:text-2xl leading-relaxed font-serif italic text-black">
               "Potkali jsme se v dešti, kdy nám oběma ujel poslední autobus. Byla to náhoda, která změnila vše."
             </Paragraph>
           </div>
           
           <div className="columns-1 md:columns-2 gap-12 space-y-12 md:space-y-0">
              <Paragraph>
                <span className="float-left text-6xl font-serif mr-4 mt-[-10px] text-black">B</span>
                ylo to jako scéna z černobílého filmu. Od té chvíle jsme věděli, že naše cesty už nepůjdou rozdělit. 
                Cestovali jsme, smáli se, hádali se o to, jakou pizzu objednat, a budovali domov.
              </Paragraph>
              <Paragraph>
                Teď stojíme před dalším dobrodružstvím. Svatba pro nás není jen formalita, ale oslava toho, že jsme našli 
                jeden druhého v tomto bláznivém světě. Chceme tento moment sdílet s vámi, našimi nejbližšími, v atmosféře 
                dobrého jídla, skvělé hudby a nekonečné pohody.
              </Paragraph>
           </div>

           <img 
            src={COUPLE.story.proposal.photo} 
            alt="Couple Detail" 
            className="w-full h-[400px] object-cover grayscale object-center" 
           />
        </div>

      </div>
    </Section>
  );
};