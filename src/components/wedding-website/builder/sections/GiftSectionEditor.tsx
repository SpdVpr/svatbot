'use client'

import { useState } from 'react'
import { Gift, CreditCard, Plus, X, ExternalLink } from 'lucide-react'
import type { GiftContent, RegistryItem } from '@/types/wedding-website'

interface GiftSectionEditorProps {
  content?: GiftContent
  onChange: (content: GiftContent) => void
}

export default function GiftSectionEditor({ content, onChange }: GiftSectionEditorProps) {
  const [localContent, setLocalContent] = useState<GiftContent>({
    enabled: content?.enabled || false,
    message: content?.message || '',
    bankAccount: content?.bankAccount || '',
    registry: content?.registry || []
  })

  const updateContent = (updates: Partial<GiftContent>) => {
    const newContent = { ...localContent, ...updates }
    setLocalContent(newContent)
    onChange(newContent)
  }

  const addRegistry = () => {
    const newItem: RegistryItem = {
      name: '',
      url: '',
      description: ''
    }
    updateContent({
      registry: [...(localContent.registry || []), newItem]
    })
  }

  const updateRegistry = (index: number, field: keyof RegistryItem, value: string) => {
    const updated = [...(localContent.registry || [])]
    updated[index] = { ...updated[index], [field]: value }
    updateContent({ registry: updated })
  }

  const removeRegistry = (index: number) => {
    updateContent({
      registry: localContent.registry?.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Gift className="w-5 h-5 text-primary-600" />
          <div>
            <h3 className="font-medium text-gray-900">Sekce Svatební dary</h3>
            <p className="text-sm text-gray-600">
              Zobrazit informace o darech a seznamu přání
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
          {/* Message */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Zpráva pro hosty</h4>
            <p className="text-sm text-gray-600 mb-4">
              Osobní zpráva o darech (např. "Vaše přítomnost je pro nás největším darem...")
            </p>
            
            <textarea
              value={localContent.message || ''}
              onChange={(e) => updateContent({ message: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Vaše přítomnost na naší svatbě je pro nás největším darem. Pokud nás však chcete obdarovat, budeme vděční za finanční příspěvek na naši společnou budoucnost."
            />
          </div>

          {/* Bank Account */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary-600" />
              <h4 className="text-lg font-semibold text-gray-900">Číslo účtu</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Bankovní účet pro finanční dary
            </p>
            
            <input
              type="text"
              value={localContent.bankAccount || ''}
              onChange={(e) => updateContent({ bankAccount: e.target.value })}
              placeholder="123456789/0100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Registry Links */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Seznam přání</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Odkazy na online seznamy přání (např. svatební seznam v obchodě)
                </p>
              </div>
              <button
                onClick={addRegistry}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Přidat odkaz
              </button>
            </div>

            {localContent.registry && localContent.registry.length > 0 ? (
              <div className="space-y-4">
                {localContent.registry.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        Seznam {index + 1}
                      </span>
                      <button
                        onClick={() => removeRegistry(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Název
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateRegistry(index, 'name', e.target.value)}
                          placeholder="IKEA Svatební seznam"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL odkaz
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => updateRegistry(index, 'url', e.target.value)}
                            placeholder="https://www.ikea.cz/svatebni-seznam/..."
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Popis (volitelné)
                        </label>
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => updateRegistry(index, 'description', e.target.value)}
                          placeholder="Náš svatební seznam v IKEA..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  Zatím nejsou přidány žádné seznamy přání
                </p>
                <button
                  onClick={addRegistry}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Přidat první seznam
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

