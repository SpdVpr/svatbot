'use client'

import { useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { COLOR_THEMES, ColorTheme } from '../templates/ColorThemeContext'

interface ColorThemeSelectorProps {
  selectedTheme: string
  customColors?: ColorTheme
  onSelect: (theme: string) => void
  onCustomColorsChange?: (colors: ColorTheme) => void
  disabled?: boolean
}

export default function ColorThemeSelector({
  selectedTheme,
  customColors,
  onSelect,
  onCustomColorsChange,
  disabled
}: ColorThemeSelectorProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(selectedTheme === 'custom')

  const handleThemeSelect = (theme: string) => {
    if (theme === 'custom') {
      setShowCustomPicker(true)
    } else {
      setShowCustomPicker(false)
    }
    onSelect(theme)
  }

  const handleCustomColorChange = (field: keyof ColorTheme, value: string) => {
    if (!onCustomColorsChange) return

    const newColors = {
      ...customColors,
      [field]: value,
    } as ColorTheme

    onCustomColorsChange(newColors)
  }

  return (
    <div className="space-y-6">

      {/* Předpřipravené palety */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Předpřipravené palety</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(COLOR_THEMES).map(([key, theme]) => {
            const isSelected = selectedTheme === key

            return (
              <button
                key={key}
                onClick={() => !disabled && handleThemeSelect(key)}
                disabled={disabled}
                className={`
                  relative p-3 rounded-lg border-2 transition-all
                  ${isSelected
                    ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                <div className="text-center mb-2">
                  <h4 className="font-medium text-gray-900 text-xs">{theme.name}</h4>
                </div>

                <div className="flex gap-1 justify-center">
                  <div
                    className="w-6 h-6 rounded shadow-sm border border-gray-200"
                    style={{ backgroundColor: theme.primary }}
                    title="Primární"
                  />
                  <div
                    className="w-6 h-6 rounded shadow-sm border border-gray-200"
                    style={{ backgroundColor: theme.secondary }}
                    title="Sekundární"
                  />
                  <div
                    className="w-6 h-6 rounded shadow-sm border border-gray-200"
                    style={{ backgroundColor: theme.accent }}
                    title="Akcentová"
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>


      {/* Vlastní barvy sekce */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Vlastní barvy</h4>
        <button
          onClick={() => !disabled && handleThemeSelect('custom')}
          disabled={disabled}
          className={`
            w-full relative p-4 rounded-lg border-2 transition-all
            ${selectedTheme === 'custom'
              ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {selectedTheme === 'custom' && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
              <Palette className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">Vytvořit vlastní paletu</h4>
              <p className="text-xs text-gray-500 mt-0.5">Nastavte si přesně barvy podle vašich představ</p>
            </div>
          </div>
        </button>
      </div>

      {/* Custom Color Picker */}
      {showCustomPicker && (
        <div className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 p-6 space-y-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Nastavte vlastní barvy</h4>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Primární barva
                <span className="text-gray-500 text-xs ml-1">(tlačítka, hlavní prvky)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customColors?.primary || '#f59e0b'}
                  onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                  disabled={disabled}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={customColors?.primary || '#f59e0b'}
                  onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                  disabled={disabled}
                  placeholder="#f59e0b"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sekundární barva
                <span className="text-gray-500 text-xs ml-1">(doplňkové prvky)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customColors?.secondary || '#f43f5e'}
                  onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                  disabled={disabled}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={customColors?.secondary || '#f43f5e'}
                  onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                  disabled={disabled}
                  placeholder="#f43f5e"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Akcentová barva
                <span className="text-gray-500 text-xs ml-1">(zvýraznění)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customColors?.accent || '#fbbf24'}
                  onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                  disabled={disabled}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={customColors?.accent || '#fbbf24'}
                  onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                  disabled={disabled}
                  placeholder="#fbbf24"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>

            {/* Background Gradient From */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Pozadí 1
                <span className="text-gray-500 text-xs ml-1">(světlejší)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customColors?.bgGradientFrom || '#fef3c7'}
                  onChange={(e) => handleCustomColorChange('bgGradientFrom', e.target.value)}
                  disabled={disabled}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={customColors?.bgGradientFrom || '#fef3c7'}
                  onChange={(e) => handleCustomColorChange('bgGradientFrom', e.target.value)}
                  disabled={disabled}
                  placeholder="#fef3c7"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>

            {/* Background Gradient To */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Pozadí 2
                <span className="text-gray-500 text-xs ml-1">(tmavší)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customColors?.bgGradientTo || '#fecdd3'}
                  onChange={(e) => handleCustomColorChange('bgGradientTo', e.target.value)}
                  disabled={disabled}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={customColors?.bgGradientTo || '#fecdd3'}
                  onChange={(e) => handleCustomColorChange('bgGradientTo', e.target.value)}
                  disabled={disabled}
                  placeholder="#fecdd3"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg p-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">Náhled barevné palety</h5>
            <div className="flex gap-2 flex-wrap">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-16 h-16 rounded-lg shadow-sm border-2 border-gray-300"
                  style={{ backgroundColor: customColors?.primary || '#f59e0b' }}
                />
                <span className="text-xs text-gray-600">Primární</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-16 h-16 rounded-lg shadow-sm border-2 border-gray-300"
                  style={{ backgroundColor: customColors?.secondary || '#f43f5e' }}
                />
                <span className="text-xs text-gray-600">Sekundární</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-16 h-16 rounded-lg shadow-sm border-2 border-gray-300"
                  style={{ backgroundColor: customColors?.accent || '#fbbf24' }}
                />
                <span className="text-xs text-gray-600">Akcentová</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-16 h-16 rounded-lg shadow-sm border-2 border-gray-300"
                  style={{ backgroundColor: customColors?.bgGradientFrom || '#fef3c7' }}
                />
                <span className="text-xs text-gray-600">Pozadí 1</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-16 h-16 rounded-lg shadow-sm border-2 border-gray-300"
                  style={{ backgroundColor: customColors?.bgGradientTo || '#fecdd3' }}
                />
                <span className="text-xs text-gray-600">Pozadí 2</span>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

