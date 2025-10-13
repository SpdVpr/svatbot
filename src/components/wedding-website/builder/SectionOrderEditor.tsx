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
  { id: 'schedule', title: 'Program', description: 'Časový harmonogram', required: false },
  { id: 'rsvp', title: 'RSVP', description: 'Potvrzení účasti', required: false },
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
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pořadí sekcí na webu</h3>
        <p className="text-sm text-gray-600">
          Přetáhněte sekce pro změnu jejich pořadí na svatebním webu
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
              draggable={!sectionInfo.required}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              className={`
                flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                ${isDragging ? 'opacity-50 scale-95' : ''}
                ${isDragOver ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-white'}
                ${!isEnabled ? 'opacity-50' : ''}
                ${!sectionInfo.required ? 'cursor-move hover:border-gray-300 hover:shadow-sm' : 'cursor-default'}
              `}
            >
              {/* Drag Handle */}
              {!sectionInfo.required && (
                <div className="flex-shrink-0 text-gray-400">
                  <GripVertical className="w-5 h-5" />
                </div>
              )}

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

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Povinné sekce (Hlavní sekce, Místo konání) nelze přesouvat. 
          Ostatní sekce můžete přetáhnout na požadované místo.
        </p>
      </div>
    </div>
  )
}

