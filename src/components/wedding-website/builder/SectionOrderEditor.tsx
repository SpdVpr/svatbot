'use client'

import { useState } from 'react'
import { GripVertical, Eye, EyeOff } from 'lucide-react'
import type { SectionType } from '@/types/wedding-website'

interface SectionOrderEditorProps {
  sectionOrder: SectionType[]
  enabledSections: Set<SectionType>
  onOrderChange: (newOrder: SectionType[]) => void
}

interface SectionInfo {
  id: SectionType
  title: string
  description: string
  required: boolean
}

const SECTION_INFO: SectionInfo[] = [
  { id: 'hero', title: 'Hlavní sekce', description: 'Jména a datum svatby', required: true },
  { id: 'story', title: 'Náš příběh', description: 'Jak jsme se poznali', required: false },
  { id: 'info', title: 'Místo konání', description: 'Obřad a hostina', required: true },
  { id: 'dressCode', title: 'Dress Code', description: 'Oblečení a barvy', required: false },
  { id: 'schedule', title: 'Harmonogram svatby', description: 'Časový harmonogram', required: false },
  { id: 'rsvp', title: 'Potvrzení účasti', description: 'Potvrzení účasti', required: false },
  { id: 'accommodation', title: 'Ubytování', description: 'Hotely a pokoje', required: false },
  { id: 'gift', title: 'Dary', description: 'Svatební dary', required: false },
  { id: 'gallery', title: 'Galerie', description: 'Fotografie', required: false },
  { id: 'contact', title: 'Kontakt', description: 'Kontaktní údaje', required: false },
  { id: 'faq', title: 'FAQ', description: 'Časté otázky', required: false },
  { id: 'menu', title: 'Menu', description: 'Jídlo a nápoje', required: false },
]

export default function SectionOrderEditor({ sectionOrder, enabledSections, onOrderChange }: SectionOrderEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedIndex === null || dragOverIndex === null) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newOrder = [...sectionOrder]
    const [removed] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(dragOverIndex, 0, removed)

    onOrderChange(newOrder)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const getSectionInfo = (sectionId: SectionType): SectionInfo => {
    return SECTION_INFO.find(s => s.id === sectionId) || {
      id: sectionId,
      title: sectionId,
      description: '',
      required: false
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Pořadí sekcí na webu
        </h3>
        <p className="text-sm text-gray-700">
          <strong>Přetáhněte sekce</strong> myší pro změnu jejich pořadí na svatebním webu.
          Sekce se zobrazí v tomto pořadí shora dolů.
        </p>
      </div>

      <div className="space-y-2">
        {sectionOrder.map((sectionId, index) => {
          const sectionInfo = getSectionInfo(sectionId)
          const isEnabled = enabledSections.has(sectionId)
          const isDragging = draggedIndex === index
          const isDragOver = dragOverIndex === index

          return (
            <div
              key={sectionId}
              draggable={true}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              className={`
                flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200
                cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md hover:scale-102
                ${isDragging ? 'opacity-50 scale-95 rotate-2' : ''}
                ${isDragOver ? 'border-pink-500 bg-pink-100 scale-105 shadow-lg' : 'border-gray-300 bg-white'}
                ${!isEnabled ? 'opacity-60' : ''}
              `}
            >
              {/* Drag Handle - Always visible */}
              <div className="flex-shrink-0 text-gray-400">
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Section Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">
                    {sectionInfo.title}
                  </h4>
                  {sectionInfo.required && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Povinná
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {sectionInfo.description}
                </p>
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0">
                {isEnabled ? (
                  <Eye className="w-5 h-5 text-green-500" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Order Number */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                {index + 1}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-white border-2 border-blue-300 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              <strong>Jak to funguje:</strong>
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Uchopte sekci</strong> za [≡] ikonu a přetáhněte ji na nové místo</li>
              <li>• <strong>Všechny sekce</strong> lze volně přesouvat podle vašich preferencí</li>
              <li>• <strong>Pořadí se automaticky uloží</strong> při každé změně</li>
              <li>• <strong>Číslo vpravo</strong> ukazuje aktuální pozici sekce na webu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

