'use client'

import React, { useState, memo } from 'react'
import {
  Bell,
  Mail,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Volume2,
  Settings as SettingsIcon,
  Save,
  CheckCircle
} from 'lucide-react'

function SettingsTab() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    taskReminders: true,
    budgetAlerts: true,
    guestUpdates: true,
    weeklyDigest: true,
    language: 'cs',
    timezone: 'Europe/Prague',
    theme: 'light'
  })

  const [saved, setSaved] = useState(false)

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = () => {
    // TODO: Save settings to Firebase
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Save Success Message */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Nastavení bylo úspěšně uloženo</span>
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-6">
          <Bell className="w-5 h-5 text-primary-600" />
          <span>Notifikace</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Emailové notifikace</p>
                <p className="text-sm text-gray-600">Dostávejte důležité aktualizace emailem</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Push notifikace</p>
                <p className="text-sm text-gray-600">Okamžité upozornění v prohlížeči</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('pushNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.pushNotifications ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Marketingové emaily</p>
                <p className="text-sm text-gray-600">Tipy, novinky a speciální nabídky</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('marketingEmails')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.marketingEmails ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Specific Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Konkrétní upozornění
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Připomínky úkolů</p>
              <p className="text-sm text-gray-600">Upozornění na blížící se termíny</p>
            </div>
            <button
              onClick={() => handleToggle('taskReminders')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.taskReminders ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.taskReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Upozornění na rozpočet</p>
              <p className="text-sm text-gray-600">Když se blížíte limitu rozpočtu</p>
            </div>
            <button
              onClick={() => handleToggle('budgetAlerts')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.budgetAlerts ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.budgetAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Aktualizace hostů</p>
              <p className="text-sm text-gray-600">RSVP odpovědi a změny</p>
            </div>
            <button
              onClick={() => handleToggle('guestUpdates')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.guestUpdates ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.guestUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Týdenní přehled</p>
              <p className="text-sm text-gray-600">Souhrn aktivity každý týden</p>
            </div>
            <button
              onClick={() => handleToggle('weeklyDigest')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.weeklyDigest ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-6">
          <Globe className="w-5 h-5 text-primary-600" />
          <span>Jazyk a region</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jazyk
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="cs">Čeština</option>
              <option value="en">English</option>
              <option value="sk">Slovenčina</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Časové pásmo
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="Europe/Prague">Praha (GMT+1)</option>
              <option value="Europe/Bratislava">Bratislava (GMT+1)</option>
              <option value="Europe/Vienna">Vídeň (GMT+1)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-6">
          <SettingsIcon className="w-5 h-5 text-primary-600" />
          <span>Vzhled</span>
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Téma
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSettings({ ...settings, theme: 'light' })}
              className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                settings.theme === 'light'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Sun className="w-6 h-6 text-gray-700" />
              <span className="text-sm font-medium">Světlé</span>
            </button>

            <button
              onClick={() => setSettings({ ...settings, theme: 'dark' })}
              className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                settings.theme === 'dark'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled
            >
              <Moon className="w-6 h-6 text-gray-700" />
              <span className="text-sm font-medium">Tmavé</span>
              <span className="text-xs text-gray-500">Brzy</span>
            </button>

            <button
              onClick={() => setSettings({ ...settings, theme: 'auto' })}
              className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                settings.theme === 'auto'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled
            >
              <SettingsIcon className="w-6 h-6 text-gray-700" />
              <span className="text-sm font-medium">Auto</span>
              <span className="text-xs text-gray-500">Brzy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Uložit nastavení</span>
        </button>
      </div>
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(SettingsTab)
