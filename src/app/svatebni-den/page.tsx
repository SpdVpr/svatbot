'use client'

import { useState } from 'react'
import { Clock, Calendar, ArrowLeft, Plus, Edit3, Trash2, Save, X } from 'lucide-react'
import Link from 'next/link'

interface TimelineItem {
  id: string
  time: string
  activity: string
  duration: string
  category: 'preparation' | 'ceremony' | 'photography' | 'reception' | 'party'
  location?: string
  participants?: string[]
  notes?: string
}

const categoryColors = {
  preparation: 'bg-blue-100 text-blue-600 border-blue-200',
  ceremony: 'bg-pink-100 text-pink-600 border-pink-200',
  photography: 'bg-purple-100 text-purple-600 border-purple-200',
  reception: 'bg-green-100 text-green-600 border-green-200',
  party: 'bg-orange-100 text-orange-600 border-orange-200'
}

const categoryLabels = {
  preparation: 'Příprava',
  ceremony: 'Obřad',
  photography: 'Fotografie',
  reception: 'Hostina',
  party: 'Zábava'
}

const defaultTimelineItems: TimelineItem[] = [
  {
    id: '1',
    time: '08:00',
    activity: 'Příjezd vizážistky a kadeřnice',
    duration: '30 min',
    category: 'preparation',
    location: 'Hotel Château Mcely - pokoj nevěsty',
    participants: ['Vizážistka', 'Kadeřnice'],
    notes: 'Příprava vybavení a materiálů'
  },
  {
    id: '2',
    time: '08:30',
    activity: 'Příprava nevěsty - líčení a účes',
    duration: '3 hod',
    category: 'preparation',
    location: 'Hotel Château Mcely - pokoj nevěsty',
    participants: ['Nevěsta', 'Kadeřnice', 'Vizážistka', 'Družičky'],
    notes: 'Začít včas, rezervovat dostatek času. Salon Krása.'
  },
  {
    id: '3',
    time: '10:00',
    activity: 'Příprava ženicha',
    duration: '1 hod',
    category: 'preparation',
    location: 'Hotel Château Mcely - pokoj ženicha',
    participants: ['Ženich', 'Svědek'],
    notes: 'Oblékání a příprava'
  },
  {
    id: '4',
    time: '11:30',
    activity: 'Fotografie příprav',
    duration: '1 hod',
    category: 'photography',
    location: 'Hotel Château Mcely',
    participants: ['Nevěsta', 'Ženich', 'Fotograf'],
    notes: 'Fotky příprav, detaily, šperky. Photo Nejedlí.'
  },
  {
    id: '5',
    time: '12:30',
    activity: 'První setkání nevěsty a ženicha (First Look)',
    duration: '30 min',
    category: 'photography',
    location: 'Château Mcely - zahrada',
    participants: ['Nevěsta', 'Ženich', 'Fotograf'],
    notes: 'First look - intimní moment před obřadem'
  },
  {
    id: '6',
    time: '13:00',
    activity: 'Příjezd hostů',
    duration: '45 min',
    category: 'ceremony',
    location: 'Château Mcely - parkoviště',
    participants: ['Hosté'],
    notes: 'Uvítání hostů, welcome drink'
  },
  {
    id: '7',
    time: '14:00',
    activity: 'Svatební obřad',
    duration: '45 min',
    category: 'ceremony',
    location: 'Château Mcely - zahrada',
    participants: ['Nevěsta', 'Ženich', 'Oddávající', 'Hosté'],
    notes: 'Hlavní část svatby - venkovní obřad'
  },
  {
    id: '8',
    time: '14:45',
    activity: 'Gratulace a házení kytice',
    duration: '30 min',
    category: 'ceremony',
    location: 'Château Mcely - zahrada',
    participants: ['Nevěsta', 'Ženich', 'Hosté'],
    notes: 'Gratulace od hostů, házení kytice'
  },
  {
    id: '9',
    time: '15:15',
    activity: 'Skupinové fotografie',
    duration: '45 min',
    category: 'photography',
    location: 'Château Mcely - zahrada',
    participants: ['Nevěsta', 'Ženich', 'Fotograf', 'Hosté'],
    notes: 'Skupinové fotky s hosty, rodinou. Photo Nejedlí.'
  },
  {
    id: '10',
    time: '16:00',
    activity: 'Kreativní focení novomanželů',
    duration: '1 hod',
    category: 'photography',
    location: 'Château Mcely - park',
    participants: ['Nevěsta', 'Ženich', 'Fotograf'],
    notes: 'Kreativní portréty v parku'
  },
  {
    id: '11',
    time: '17:00',
    activity: 'Aperitiv a občerstvení',
    duration: '1 hod',
    category: 'reception',
    location: 'Château Mcely - terasa',
    participants: ['Všichni hosté'],
    notes: 'Aperitiv, canapés, volná zábava. Catering Elegance.'
  },
  {
    id: '12',
    time: '18:00',
    activity: 'Příchod do svatebního sálu',
    duration: '15 min',
    category: 'reception',
    location: 'Château Mcely - sál',
    participants: ['Všichni hosté'],
    notes: 'Usazení hostů, představení programu'
  },
  {
    id: '13',
    time: '18:15',
    activity: 'Slavnostní přípitek',
    duration: '15 min',
    category: 'reception',
    location: 'Château Mcely - sál',
    participants: ['Všichni hosté', 'Svědek'],
    notes: 'Přípitek od svědka'
  },
  {
    id: '14',
    time: '18:30',
    activity: 'Svatební hostina - předkrm',
    duration: '30 min',
    category: 'reception',
    location: 'Château Mcely - sál',
    participants: ['Všichni hosté'],
    notes: 'Carpaccio z hovězího. Catering Elegance.'
  },
  {
    id: '15',
    time: '19:00',
    activity: 'Svatební hostina - polévka',
    duration: '20 min',
    category: 'reception',
    location: 'Château Mcely - sál',
    participants: ['Všichni hosté'],
    notes: 'Hovězí vývar s nudlemi'
  },
  {
    id: '16',
    time: '19:20',
    activity: 'Svatební hostina - hlavní chod',
    duration: '40 min',
    category: 'reception',
    location: 'Château Mcely - sál',
    participants: ['Všichni hosté'],
    notes: 'Hovězí svíčková nebo losos'
  },
  {
    id: '17',
    time: '20:00',
    activity: 'Krájení svatebního dortu',
    duration: '15 min',
    category: 'reception',
    location: 'Château Mcely - sál',
    participants: ['Nevěsta', 'Ženich', 'Hosté'],
    notes: 'Slavnostní krájení dortu'
  },
  {
    id: '18',
    time: '20:15',
    activity: 'Svatební hostina - dezert',
    duration: '30 min',
    category: 'reception',
    location: 'Château Mcely - sál',
    participants: ['Všichni hosté'],
    notes: 'Svatební dort a dezerty'
  },
  {
    id: '19',
    time: '20:45',
    activity: 'Příprava tanečního parketu',
    duration: '15 min',
    category: 'party',
    location: 'Château Mcely - taneční parket',
    participants: ['DJ', 'Personál'],
    notes: 'Příprava hudby a osvětlení. DJ Martin Beats.'
  },
  {
    id: '20',
    time: '21:00',
    activity: 'První tanec novomanželů',
    duration: '5 min',
    category: 'party',
    location: 'Château Mcely - taneční parket',
    participants: ['Nevěsta', 'Ženich', 'Hosté'],
    notes: 'První tanec - Ed Sheeran - Perfect'
  },
  {
    id: '21',
    time: '21:05',
    activity: 'Tanec s rodiči',
    duration: '10 min',
    category: 'party',
    location: 'Château Mcely - taneční parket',
    participants: ['Nevěsta', 'Ženich', 'Rodiče'],
    notes: 'Tanec nevěsty s otcem, ženicha s matkou'
  },
  {
    id: '22',
    time: '21:15',
    activity: 'Volná zábava a tanec',
    duration: '3h 45min',
    category: 'party',
    location: 'Château Mcely - taneční parket',
    participants: ['Všichni hosté', 'DJ'],
    notes: 'Tanec a oslava. DJ Martin Beats.'
  },
  {
    id: '23',
    time: '22:00',
    activity: 'Půlnoční překvapení',
    duration: '30 min',
    category: 'party',
    location: 'Château Mcely - zahrada',
    participants: ['Všichni hosté'],
    notes: 'Ohňostroj nebo lampiony'
  },
  {
    id: '24',
    time: '01:00',
    activity: 'Závěr svatby',
    duration: '30 min',
    category: 'party',
    location: 'Château Mcely',
    participants: ['Všichni hosté'],
    notes: 'Rozloučení s hosty'
  }
]

export default function SvatebniDenPage() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(defaultTimelineItems)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Zpět na dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                <span>Harmonogram svatebního dne</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const count = timelineItems.filter(item => item.category === key).length
            return (
              <div key={key} className={`p-4 rounded-lg border ${categoryColors[key as keyof typeof categoryColors]}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm">{label}</div>
              </div>
            )
          })}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-4">
              {timelineItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                >
                  {/* Time */}
                  <div className="flex-shrink-0 w-20">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">{item.time}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{item.duration}</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.activity}</h3>
                        {item.location && (
                          <p className="text-sm text-gray-600 mt-1">📍 {item.location}</p>
                        )}
                        {item.participants && item.participants.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            👥 {item.participants.join(', ')}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">{item.notes}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[item.category]}`}>
                        {categoryLabels[item.category]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

