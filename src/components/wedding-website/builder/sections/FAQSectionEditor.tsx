'use client'

import { useState } from 'react'
import { HelpCircle, Plus, X } from 'lucide-react'
import type { FAQContent, FAQItem } from '@/types/wedding-website'

interface FAQSectionEditorProps {
  content?: FAQContent
  onChange: (content: FAQContent) => void
}

export default function FAQSectionEditor({ content, onChange }: FAQSectionEditorProps) {
  const [localContent, setLocalContent] = useState<FAQContent>({
    enabled: content?.enabled || false,
    items: content?.items || []
  })

  const updateContent = (updates: Partial<FAQContent>) => {
    const newContent = { ...localContent, ...updates }
    setLocalContent(newContent)
    onChange(newContent)
  }

  const addFAQ = () => {
    const newItem: FAQItem = {
      question: '',
      answer: ''
    }
    updateContent({
      items: [...localContent.items, newItem]
    })
  }

  const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
    const updated = [...localContent.items]
    updated[index] = { ...updated[index], [field]: value }
    updateContent({ items: updated })
  }

  const removeFAQ = (index: number) => {
    updateContent({
      items: localContent.items.filter((_, i) => i !== index)
    })
  }

  const addCommonFAQs = () => {
    const commonFAQs: FAQItem[] = [
      {
        question: 'Jaký je dress code?',
        answer: 'Prosíme o formální oblečení. Pánové v obleku, dámy v koktejlových šatech.'
      },
      {
        question: 'Mohu přivést doprovod?',
        answer: 'Ano, pokud jste obdrželi pozvánku s možností +1.'
      },
      {
        question: 'Jsou děti vítány?',
        answer: 'Ano, děti jsou vítány. Prosíme o potvrzení jejich účasti v RSVP formuláři.'
      },
      {
        question: 'Kde mohu parkovat?',
        answer: 'Parkování je k dispozici přímo u místa konání.'
      },
      {
        question: 'Do kdy mám potvrdit účast?',
        answer: 'Prosíme o potvrzení účasti do [datum].'
      }
    ]
    
    updateContent({
      items: [...localContent.items, ...commonFAQs]
    })
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-primary-600" />
          <div>
            <h3 className="font-medium text-gray-900">Sekce FAQ</h3>
            <p className="text-sm text-gray-600">
              Zobrazit často kladené otázky
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localContent.enabled}
            onChange={(e) => updateContent({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      {localContent.enabled && (
        <>
          {/* Quick Add Common FAQs */}
          {localContent.items.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Přidat běžné otázky
                  </h4>
                  <p className="text-sm text-blue-700">
                    Rychle přidejte nejčastější otázky, které můžete později upravit
                  </p>
                </div>
                <button
                  onClick={addCommonFAQs}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                >
                  Přidat běžné FAQ
                </button>
              </div>
            </div>
          )}

          {/* FAQ List */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Otázky a odpovědi</h4>
              <button
                onClick={addFAQ}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Přidat otázku
              </button>
            </div>

            {localContent.items.length > 0 ? (
              <div className="space-y-4">
                {localContent.items.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        Otázka {index + 1}
                      </span>
                      <button
                        onClick={() => removeFAQ(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Otázka
                        </label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                          placeholder="Jaký je dress code?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Odpověď
                        </label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                          placeholder="Prosíme o formální oblečení..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  Zatím nejsou přidány žádné otázky
                </p>
                <button
                  onClick={addFAQ}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Přidat první otázku
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

