import React from 'react';
import { SectionProps } from '../types';
import { Mail, Phone } from 'lucide-react';

const ContactSection: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="py-32 bg-secondary text-cream relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
             <h2 className="font-display-italic text-6xl md:text-7xl mb-8">Potřebujete <br/> poradit?</h2>
             <p className="text-white/70 text-lg leading-relaxed mb-12 max-w-md font-light">
               V den svatby se prosím obracejte na naše koordinátory a svědky, abychom si mohli den naplno užít bez telefonů v ruce.
             </p>
             
             <div className="h-px w-full bg-white/10 mb-12"></div>

             <div className="grid sm:grid-cols-2 gap-12">
                {/* Contact 1 */}
                <div>
                  <p className="text-accent uppercase tracking-widest text-xs mb-2">Svědek ženicha</p>
                  <h3 className="font-serif text-3xl mb-4">Petr Svoboda</h3>
                  <div className="space-y-2">
                    <a href="tel:+420777123456" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group">
                      <span className="p-2 border border-white/20 rounded-full group-hover:bg-white group-hover:text-secondary transition-colors"><Phone size={14} /></span>
                      <span>+420 777 123 456</span>
                    </a>
                    <a href="mailto:petr@svoboda.cz" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group">
                      <span className="p-2 border border-white/20 rounded-full group-hover:bg-white group-hover:text-secondary transition-colors"><Mail size={14} /></span>
                      <span>petr@svoboda.cz</span>
                    </a>
                  </div>
                </div>

                {/* Contact 2 */}
                <div>
                  <p className="text-accent uppercase tracking-widest text-xs mb-2">Svědkyně nevěsty</p>
                  <h3 className="font-serif text-3xl mb-4">Jana Novotná</h3>
                  <div className="space-y-2">
                    <a href="tel:+420777654321" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group">
                      <span className="p-2 border border-white/20 rounded-full group-hover:bg-white group-hover:text-secondary transition-colors"><Phone size={14} /></span>
                      <span>+420 777 654 321</span>
                    </a>
                    <a href="mailto:jana@novotna.cz" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group">
                      <span className="p-2 border border-white/20 rounded-full group-hover:bg-white group-hover:text-secondary transition-colors"><Mail size={14} /></span>
                      <span>jana@novotna.cz</span>
                    </a>
                  </div>
                </div>
             </div>
          </div>

          {/* Image Side */}
          <div className="relative hidden lg:block">
             <div className="aspect-[3/4] rounded-t-full overflow-hidden border-2 border-white/10 p-4">
                <div className="w-full h-full rounded-t-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1520854221250-858f27636722?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
                    alt="Wedding planner" 
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700 hover:scale-105" 
                  />
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;