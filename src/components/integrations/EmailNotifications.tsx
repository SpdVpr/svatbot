'use client'

import { useState } from 'react'
import { useEmail } from '@/hooks/useEmail'
import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import {
  Mail,
  Bell,
  CheckCircle,
  AlertCircle,
  Send,
  Settings,
  Clock,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react'

interface NotificationSettings {
  taskReminders: boolean
  rsvpConfirmations: boolean
  budgetAlerts: boolean
  vendorMeetings: boolean
  weeklyReports: boolean
  weddingCountdown: boolean
}

export default function EmailNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    taskReminders: true,
    rsvpConfirmations: true,
    budgetAlerts: true,
    vendorMeetings: true,
    weeklyReports: false,
    weddingCountdown: true
  })
  
  const [testEmailSent, setTestEmailSent] = useState(false)
  
  const { 
    isLoading, 
    error, 
    sendTaskReminder,
    sendWeeklyProgressReport,
    sendWeddingCountdown,
    sendCustomEmail
  } = useEmail()
  
  const { user } = useAuth()
  const { wedding } = useWedding()

  // Handle settings change
  const handleSettingChange = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Send test email
  const handleSendTestEmail = async () => {
    if (!user?.email) return

    const success = await sendCustomEmail(
      user.email,
      'Test email ze SvatBot.cz',
      `
        <h2>Testovací email</h2>
        <p>Ahoj ${user.displayName || 'uživateli'},</p>
        <p>Toto je testovací email ze SvatBot.cz. Pokud tento email vidíte, email notifikace fungují správně!</p>
        <p>Vaše svatba: ${wedding?.brideName} & ${wedding?.groomName}</p>
        <p>Datum svatby: ${wedding?.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString('cs-CZ') : 'Nenastaveno'}</p>
        <p>S pozdravem,<br>Tým SvatBot.cz</p>
      `
    )

    if (success) {
      setTestEmailSent(true)
      setTimeout(() => setTestEmailSent(false), 3000)
    }
  }

  // Send weekly report
  const handleSendWeeklyReport = async () => {
    if (!user?.email) return

    const progressData = {
      completedTasks: 15,
      totalTasks: 25,
      upcomingDeadlines: ['Vybrat květiny', 'Potvrdit catering'],
      budgetStatus: 'V pořádku',
      guestResponses: 45,
      totalGuests: 60
    }

    await sendWeeklyProgressReport(progressData)
  }

  // Calculate days until wedding
  const daysUntilWedding = wedding?.weddingDate 
    ? Math.ceil((new Date(wedding.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="heading-4">Email notifikace</h3>
            <p className="body-small text-text-muted">
              Automatické připomínky a aktualizace emailem
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Aktivní</span>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900">Nastavení notifikací</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">Připomínky úkolů</div>
                <div className="text-sm text-gray-600">Email 1 den před termínem úkolu</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.taskReminders}
                onChange={() => handleSettingChange('taskReminders')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium">RSVP potvrzení</div>
                <div className="text-sm text-gray-600">Automatické potvrzení odpovědí hostů</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.rsvpConfirmations}
                onChange={() => handleSettingChange('rsvpConfirmations')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-medium">Rozpočtová upozornění</div>
                <div className="text-sm text-gray-600">Varování při překročení rozpočtu</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.budgetAlerts}
                onChange={() => handleSettingChange('budgetAlerts')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Schůzky s dodavateli</div>
                <div className="text-sm text-gray-600">Připomínky schůzek 1 den předem</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vendorMeetings}
                onChange={() => handleSettingChange('vendorMeetings')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium">Týdenní reporty</div>
                <div className="text-sm text-gray-600">Souhrn pokroku každý týden</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.weeklyReports}
                onChange={() => handleSettingChange('weeklyReports')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-pink-600" />
              <div>
                <div className="font-medium">Odpočet do svatby</div>
                <div className="text-sm text-gray-600">Milníky: 30, 14, 7, 3, 1 den před svatbou</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.weddingCountdown}
                onChange={() => handleSettingChange('weddingCountdown')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Test Actions */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Testovací akce</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={handleSendTestEmail}
            disabled={isLoading || !user?.email}
            className="btn-outline flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span>Odesílám...</span>
              </>
            ) : testEmailSent ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Odesláno!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Test email</span>
              </>
            )}
          </button>

          <button
            onClick={handleSendWeeklyReport}
            disabled={isLoading || !user?.email}
            className="btn-outline flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span>Odesílám...</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>Týdenní report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Wedding Countdown Info */}
      {daysUntilWedding && daysUntilWedding > 0 && (
        <div className="mt-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-pink-600" />
            <div>
              <div className="font-medium text-pink-900">
                {daysUntilWedding} dní do svatby!
              </div>
              <div className="text-sm text-pink-700">
                Další countdown email: {daysUntilWedding <= 30 ? 'Brzy' : 'Za ' + (daysUntilWedding - 30) + ' dní'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">Chyba emailu</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Jak fungují notifikace:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Emaily se odesílají automaticky na váš registrovaný email</li>
          <li>• Můžete kdykoli změnit nastavení nebo notifikace vypnout</li>
          <li>• Všechny emaily obsahují odkaz pro odhlášení</li>
          <li>• Testovací emaily vám pomohou ověřit funkčnost</li>
        </ul>
      </div>
    </div>
  )
}
