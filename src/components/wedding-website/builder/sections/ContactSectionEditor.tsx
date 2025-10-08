'use client'

import { useState } from 'react'
import { Phone, Mail, User, Plus, X } from 'lucide-react'
import type { ContactContent } from '@/types/wedding-website'

interface ContactSectionEditorProps {
  content?: ContactContent
  onChange: (content: ContactContent) => void
}

export default function ContactSectionEditor({ content, onChange }: ContactSectionEditorProps) {
  const [localContent, setLocalContent] = useState<ContactContent>({
    enabled: content?.enabled ?? true,
    bride: content?.bride || { name: '', email: '', phone: '' },
    groom: content?.groom || { name: '', email: '', phone: '' },
    bridesmaids: content?.bridesmaids || [],
    groomsmen: content?.groomsmen || []
  })

  const updateContent = (updates: Partial<ContactContent>) => {
    const newContent = { ...localContent, ...updates }
    setLocalContent(newContent)
    onChange(newContent)
  }

  const updateBride = (field: string, value: string) => {
    updateContent({
      bride: { ...localContent.bride!, [field]: value }
    })
  }

  const updateGroom = (field: string, value: string) => {
    updateContent({
      groom: { ...localContent.groom!, [field]: value }
    })
  }

  const addBridesmaid = () => {
    updateContent({
      bridesmaids: [...(localContent.bridesmaids || []), { name: '', phone: '' }]
    })
  }

  const updateBridesmaid = (index: number, field: string, value: string) => {
    const updated = [...(localContent.bridesmaids || [])]
    updated[index] = { ...updated[index], [field]: value }
    updateContent({ bridesmaids: updated })
  }

  const removeBridesmaid = (index: number) => {
    updateContent({
      bridesmaids: localContent.bridesmaids?.filter((_, i) => i !== index)
    })
  }

  const addGroomsman = () => {
    updateContent({
      groomsmen: [...(localContent.groomsmen || []), { name: '', phone: '' }]
    })
  }

  const updateGroomsman = (index: number, field: string, value: string) => {
    const updated = [...(localContent.groomsmen || [])]
    updated[index] = { ...updated[index], [field]: value }
    updateContent({ groomsmen: updated })
  }

  const removeGroomsman = (index: number) => {
    updateContent({
      groomsmen: localContent.groomsmen?.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary-600" />
          <div>
            <h3 className="font-medium text-gray-900">Sekce Kontakty</h3>
            <p className="text-sm text-gray-600">
              Zobrazit kontaktní informace na organizátory
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
          {/* Bride Contact */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Nevěsta</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jméno
                </label>
                <input
                  type="text"
                  value={localContent.bride?.name || ''}
                  onChange={(e) => updateBride('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Jana Nováková"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={localContent.bride?.email || ''}
                    onChange={(e) => updateBride('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="jana@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={localContent.bride?.phone || ''}
                    onChange={(e) => updateBride('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+420 123 456 789"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Groom Contact */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Ženich</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jméno
                </label>
                <input
                  type="text"
                  value={localContent.groom?.name || ''}
                  onChange={(e) => updateGroom('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Petr Novák"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={localContent.groom?.email || ''}
                    onChange={(e) => updateGroom('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="petr@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={localContent.groom?.phone || ''}
                    onChange={(e) => updateGroom('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+420 987 654 321"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bridesmaids */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Družičky (volitelné)</h4>
              <button
                onClick={addBridesmaid}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Přidat družičku
              </button>
            </div>

            {localContent.bridesmaids && localContent.bridesmaids.length > 0 ? (
              <div className="space-y-3">
                {localContent.bridesmaids.map((bridesmaid, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={bridesmaid.name}
                        onChange={(e) => updateBridesmaid(index, 'name', e.target.value)}
                        placeholder="Jméno"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        value={bridesmaid.phone || ''}
                        onChange={(e) => updateBridesmaid(index, 'phone', e.target.value)}
                        placeholder="Telefon"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => removeBridesmaid(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Zatím nejsou přidány žádné družičky
              </p>
            )}
          </div>

          {/* Groomsmen */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Svědci (volitelné)</h4>
              <button
                onClick={addGroomsman}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Přidat svědka
              </button>
            </div>

            {localContent.groomsmen && localContent.groomsmen.length > 0 ? (
              <div className="space-y-3">
                {localContent.groomsmen.map((groomsman, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={groomsman.name}
                        onChange={(e) => updateGroomsman(index, 'name', e.target.value)}
                        placeholder="Jméno"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        value={groomsman.phone || ''}
                        onChange={(e) => updateGroomsman(index, 'phone', e.target.value)}
                        placeholder="Telefon"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => removeGroomsman(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Zatím nejsou přidáni žádní svědci
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

