'use client'

import { Star, Clock, Camera, Gift, MapPin, Briefcase } from 'lucide-react'

export default function ComingSoonModule() {
  const comingFeatures = [
    {
      icon: Camera,
      title: 'Photo & Video',
      subtitle: 'Foto a video',
      description: 'Galerie a dokumentace svatby',
      status: 'Fáze 7',
      color: 'text-pink-600 bg-pink-100'
    },
    {
      icon: Gift,
      title: 'Wedding Registry',
      subtitle: 'Seznam přání',
      description: 'Svatební seznam darů pro hosty',
      status: 'Fáze 8',
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      icon: MapPin,
      title: 'Venue & Logistics',
      subtitle: 'Místa a logistika',
      description: 'Správa míst a dopravy',
      status: 'Fáze 9',
      color: 'text-teal-600 bg-teal-100'
    },
    {
      icon: Briefcase,
      title: 'Contract Management',
      subtitle: 'Správa smluv',
      description: 'Pokročilá správa smluv a dokumentů',
      status: 'Fáze 10',
      color: 'text-orange-600 bg-orange-100'
    }
  ]

  return (
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Star className="w-5 h-5 text-orange-600" />
          <span>Připravované funkce</span>
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Fáze 7+</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comingFeatures.map((feature) => (
          <div key={feature.title} className="p-4 border border-gray-200 rounded-lg opacity-75">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${feature.color}`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                {feature.status}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {feature.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">{feature.subtitle}</p>
              <p className="text-xs text-gray-500">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
        <div className="text-center">
          <Star className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <h4 className="font-medium text-orange-900 mb-1">Budoucnost SvatBot.cz</h4>
          <p className="text-sm text-orange-700 mb-3">
            Pracujeme na dalších funkcích, které vám ještě více usnadní plánování svatby.
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-orange-600">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span>V přípravě</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Plánováno</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Brzy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Máte nápad na novou funkci? 
          <a href="mailto:feedback@svatbot.cz" className="text-primary-600 hover:underline ml-1">
            Napište nám!
          </a>
        </p>
      </div>
    </div>
  )
}
