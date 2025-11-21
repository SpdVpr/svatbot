import React from 'react';
import { SectionProps, AccommodationItem } from '../types';
import { ExternalLink } from 'lucide-react';

const hotels: AccommodationItem[] = [
  {
    name: 'Hotel Štekl',
    description: 'Luxusní hotel přímo vedle zámku.',
    address: 'Bezručova 141, Hluboká',
    price: 'od 3500 Kč',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    url: '#'
  },
  {
    name: 'Parkhotel Hluboká',
    description: 'Komfort s wellness, 10 min od zámku.',
    address: 'Masarykova 602, Hluboká',
    price: 'od 2200 Kč',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1025&q=80',
    url: '#'
  },
  {
    name: 'Penzion Podhradi',
    description: 'Rodinný penzion s útulnou atmosférou.',
    address: 'Hluboká nad Vltavou 20',
    price: 'od 1500 Kč',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    url: '#'
  }
];

const AccommodationSection: React.FC<SectionProps> = ({ id }) => {
  return (
    <section id={id} className="py-32 bg-cream">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-primary/10 pb-8">
          <div className="max-w-xl">
             <h2 className="font-serif text-5xl text-primary mb-4">Ubytování</h2>
             <p className="text-dark/60">Rezervovali jsme kapacity v těchto hotelech. Heslo pro rezervaci: "Svatba Anna a Jakub".</p>
          </div>
          <div className="mt-8 md:mt-0">
             <span className="text-accent text-sm uppercase tracking-widest">Koordinátor: Lucie Veselá (+420 777 888 999)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {hotels.map((hotel, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="h-[350px] overflow-hidden mb-6 relative rounded-sm">
                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                   {hotel.price}
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                   <h3 className="font-serif text-2xl text-primary mb-1">{hotel.name}</h3>
                   <p className="text-sm text-dark/50 mb-2">{hotel.address}</p>
                   <p className="text-dark/70 text-sm">{hotel.description}</p>
                </div>
                <a href={hotel.url} className="p-2 border border-primary/20 rounded-full hover:bg-primary hover:text-white transition-colors">
                   <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccommodationSection;