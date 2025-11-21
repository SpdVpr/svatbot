'use client'

import { MenuContent } from '@/types/wedding-website'

interface MenuSectionProps {
  content: MenuContent
  websiteId: string
}

export default function MenuSection({ content, websiteId }: MenuSectionProps) {
  if (!content.enabled || !content.items || content.items.length === 0) return null

  // Group items by category
  const appetizers = content.items.filter(item => item.category === 'appetizer')
  const soups = content.items.filter(item => item.category === 'soup')
  const mains = content.items.filter(item => item.category === 'main')
  const desserts = content.items.filter(item => item.category === 'dessert')
  const drinks = content.items.filter(item => item.category === 'drink')

  return (
    <section id="menu" className="py-32 bg-[#2C362B] text-[#F4F2ED]">
       <div className="max-w-4xl mx-auto px-6">
         <div className="text-center mb-20">
            <h2 
              className="text-6xl md:text-7xl mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
            >
              Menu
            </h2>
            <p className="uppercase tracking-[0.2em] text-[#C5A880] text-xs">Oslava chutí</p>
         </div>

         <div className="grid md:grid-cols-2 gap-16 md:gap-24">
            {/* Food */}
            <div className="space-y-12">
               <h3 className="font-serif text-3xl border-b border-white/10 pb-4 text-[#C5A880]">Jídlo</h3>
               
               {appetizers.length > 0 && (
                 <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">Předkrm</h4>
                    {appetizers.map(item => (
                      <div key={item.id} className="mb-4">
                        <p 
                          className="text-2xl"
                          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
                        >
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-white/40 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                    ))}
                 </div>
               )}

               {soups.length > 0 && (
                 <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">Polévka</h4>
                    {soups.map(item => (
                      <div key={item.id} className="mb-4">
                        <p 
                          className="text-2xl"
                          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
                        >
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-white/40 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                    ))}
                 </div>
               )}

               {mains.length > 0 && (
                 <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">Hlavní chod</h4>
                    {mains.map(item => (
                      <div key={item.id} className="mb-4">
                        <p 
                          className="text-2xl"
                          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
                        >
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-white/40 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                    ))}
                 </div>
               )}

               {desserts.length > 0 && (
                 <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">Dezert</h4>
                    {desserts.map(item => (
                      <div key={item.id} className="mb-4">
                        <p 
                          className="text-2xl"
                          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
                        >
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-white/40 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                    ))}
                 </div>
               )}
            </div>

            {/* Drinks */}
            {drinks.length > 0 && (
              <div className="space-y-12">
                 <h3 className="font-serif text-3xl border-b border-white/10 pb-4 text-[#C5A880]">Nápoje</h3>
                 
                 {drinks.map(item => (
                   <div key={item.id}>
                      <h4 className="font-bold uppercase tracking-widest text-xs mb-2 text-white/60">{item.name}</h4>
                      {item.description && (
                        <p 
                          className="text-2xl"
                          style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}
                        >
                          {item.description}
                        </p>
                      )}
                   </div>
                 ))}
              </div>
            )}
         </div>
       </div>
    </section>
  )
}

