'use client'

import Link from 'next/link'
import { Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { useWeddingDayTimeline } from '@/hooks/useWeddingDayTimeline'
import NumberCounter from '@/components/animations/NumberCounter'

const categoryColors = {
  preparation: 'bg-blue-100 text-blue-600',
  ceremony: 'bg-pink-100 text-pink-600',
  photography: 'bg-purple-100 text-purple-600',
  reception: 'bg-green-100 text-green-600',
  party: 'bg-orange-100 text-orange-600'
}

const categoryLabels = {
  preparation: 'Příprava',
  ceremony: 'Obřad',
  photography: 'Fotografie',
  reception: 'Hostina',
  party: 'Zábava'
}

export default function WeddingDayTimelineModule() {
  const { timeline, stats, loading } = useWeddingDayTimeline()

  return (
    <div className="wedding-card h-[353px] flex flex-col">
      <Link href="/svatebni-den" className="block mb-4 flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center justify-start sm:justify-center space-x-2 hover:text-primary-600 transition-colors">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
          <span className="truncate">Harmonogram dne</span>
        </h3>
      </Link>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        {timeline.length > 0 ? (
          <>
            <div className="space-y-3">
              {/* Timeline Overview */}
              <div className="bg-primary-50 p-3 rounded-lg glass-morphism">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    <NumberCounter end={stats.total} duration={1800} />
                  </div>
                  <div className="text-sm text-primary-700">Naplánovaných aktivit</div>
                </div>
              </div>

              {/* Next Items */}
              <div className="bg-white border border-gray-200 rounded-lg p-2">
                <div className="text-xs font-medium text-gray-700 mb-2">Nadcházející aktivity</div>
                <div className="space-y-1.5">
                  {timeline.filter(item => !item.isCompleted).slice(0, 2).map(item => (
                    <div key={item.id} className="flex items-start space-x-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {item.time} - {item.activity}
                        </div>
                        <div className="text-[10px] text-gray-500">{item.duration}</div>
                      </div>
                    </div>
                  ))}
                  {timeline.filter(item => !item.isCompleted).length === 0 && (
                    <div className="text-xs text-gray-500 text-center py-2">
                      <CheckCircle className="w-4 h-4 text-primary-600 mx-auto mb-1" />
                      Vše dokončeno!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex-shrink-0">
              <Link
                href="/svatebni-den"
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Spravovat harmonogram</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <Calendar className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Zatím nemáte naplánovaný harmonogram
              </p>
              <p className="text-xs text-gray-500">
                Vytvořte si detailní časový plán
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 flex-shrink-0">
              <Link
                href="/svatebni-den"
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Spravovat harmonogram</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

