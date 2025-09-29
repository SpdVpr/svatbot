'use client'

import { useState } from 'react'
import { useWeddingStore } from '@/stores/weddingStore'
import { useAuth } from '@/hooks/useAuth'
import { dateUtils } from '@/utils'
import DragDropWrapper from './DragDropWrapper'
import { CanvasProvider, useCanvas } from '@/contexts/CanvasContext'
import {
  Heart,
  LogOut,
  Settings,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import WeddingSettings from '@/components/wedding/WeddingSettings'
import AIAssistant from '@/components/ai/AIAssistant'
import LiveNotifications, { LiveToastNotifications } from '@/components/notifications/LiveNotifications'
import SimpleToastContainer, { showSimpleToast } from '@/components/notifications/SimpleToast'
// import { useNotificationTriggers } from '@/hooks/useNotificationTriggers'
import { useWeddingNotifications, useLiveToastNotifications } from '@/hooks/useWeddingNotifications'
import { createDemoNotifications, createTestToast } from '@/utils/demoNotifications'

function DashboardContent() {
  const { currentWedding } = useWeddingStore()
  const { logout, user } = useAuth()
  const { getCanvasMaxWidth } = useCanvas()
  const [showWeddingSettings, setShowWeddingSettings] = useState(false)

  // Initialize notification triggers - DISABLED to prevent spam
  // useNotificationTriggers()

  // Demo notification hooks (for testing)
  const { createNotification, deleteAllNotifications } = useWeddingNotifications()
  const { showToast } = useLiveToastNotifications()

  // Demo function for testing notifications
  const handleTestNotifications = () => {
    console.log('Testing notifications...', { user: user?.id, createNotification })

    // Test simple toasts first
    showSimpleToast('info', 'Notifikace Test', 'Testování notifikačního systému...')

    setTimeout(() => {
      showSimpleToast('warning', 'Úkol brzy termín', 'Objednat svatební dort má termín zítra.')
    }, 1000)

    setTimeout(() => {
      showSimpleToast('error', 'Rozpočet překročen', 'Překročili jste rozpočet o 15%.')
    }, 2000)

    setTimeout(() => {
      showSimpleToast('success', 'RSVP potvrzeno', 'Jana Nováková potvrdila účast na svatbě.')
    }, 3000)

    // Try Firebase notifications if user is authenticated
    if (user?.id && createNotification) {
      setTimeout(() => {
        createDemoNotifications(createNotification, showToast)
      }, 4000)
    }
  }

  const handleDeleteAllNotifications = async () => {
    const result = await deleteAllNotifications()
    if (result?.success) {
      showSimpleToast('success', 'Notifikace smazány', `Smazáno ${result.deletedCount} notifikací!`)
    } else {
      showSimpleToast('error', 'Chyba', 'Chyba při mazání notifikací')
    }
  }

  const handleTestToast = () => {
    console.log('Testing toast...')
    // Test simple toast
    showSimpleToast('success', 'Test Toast', 'Toto je testovací toast notifikace!')

    // Also test the complex toast if available
    if (showToast) {
      createTestToast(showToast)
    }
  }

  // Create mock wedding if none exists (for demo purposes or demo user)
  const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || currentWedding?.id === 'demo-wedding'

  // For demo users, always provide demo wedding immediately
  const wedding = isDemoUser ? {
    id: 'demo-wedding',
    userId: user?.id || 'demo-user-id',
    brideName: 'Jana',
    groomName: 'Petr',
    weddingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    estimatedGuestCount: 85,
    budget: 450000,
    style: 'classic' as const,
    region: 'Praha',
    status: 'planning' as const,
    progress: {
      overall: 73,
      foundation: 100,
      venue: 85,
      guests: 80,
      budget: 65,
      design: 45,
      organization: 30,
      final: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  } : currentWedding



  if (!wedding) {
    return (
      <div className="min-h-screen wedding-gradient flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="heading-3 mb-2">Načítáme vaši svatbu...</h2>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        {/* Mobile Header */}
        <div className="sm:hidden">
          <div className="mobile-header">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-primary-500" fill="currentColor" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">SvatBot.cz</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <LiveNotifications />
              <button
                onClick={() => setShowWeddingSettings(true)}
                className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Nastavení"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Odhlásit"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile wedding info */}
          <div className="px-4 pb-3 border-t border-gray-100">
            <button
              onClick={() => setShowWeddingSettings(true)}
              className="text-left w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <h2 className="text-sm font-semibold text-gray-900">
                {wedding.brideName} & {wedding.groomName}
              </h2>
              <p className="text-xs text-text-muted">
                {wedding.weddingDate
                  ? `${dateUtils.format(wedding.weddingDate, 'dd.MM.yyyy')}`
                  : 'Klikněte pro nastavení data'
                }
              </p>
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className={`hidden sm:block mx-auto px-4 sm:px-6 lg:px-8 py-6 ${getCanvasMaxWidth()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-primary-500" fill="currentColor" />
              <div>
                <button
                  onClick={() => setShowWeddingSettings(true)}
                  className="text-left hover:text-primary-600 transition-colors group"
                  title="Klikněte pro úpravu"
                >
                  <h1 className="heading-4 group-hover:text-primary-600 transition-colors">
                    Svatba {wedding.brideName} & {wedding.groomName}
                    <Edit className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h1>
                  <p className="body-small text-text-muted">
                    {wedding.weddingDate
                      ? `${dateUtils.format(wedding.weddingDate, 'dd. MMMM yyyy')} • Dnes: ${dateUtils.format(new Date(), 'dd. MMMM yyyy')}`
                      : 'Datum zatím nestanoveno - klikněte pro nastavení'
                    }
                  </p>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right mr-4">
                <p className="body-small text-text-muted">Přihlášen jako</p>
                <p className="body-small font-medium">{user?.displayName || user?.email}</p>
              </div>
              <LiveNotifications />
              <button
                onClick={() => setShowWeddingSettings(true)}
                className="btn-outline flex items-center space-x-2"
                title="Nastavení svatby"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Nastavení</span>
              </button>
              <button
                onClick={logout}
                className="btn-outline flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Odhlásit</span>
              </button>
              {/* Development Test Buttons */}
              {true && (
                <>
                  <button
                    onClick={handleTestToast}
                    className="btn-outline text-xs px-2 py-1"
                    title="Test Toast"
                  >
                    🍞
                  </button>
                  <button
                    onClick={handleTestNotifications}
                    className="btn-outline text-xs px-2 py-1"
                    title="Test Notifications"
                  >
                    🔔
                  </button>
                  <button
                    onClick={handleDeleteAllNotifications}
                    className="btn-outline text-xs px-2 py-1 text-red-600"
                    title="Delete All Notifications"
                  >
                    🗑️
                  </button>
                </>
              )}
              <button className="btn-primary">
                <span className="hidden sm:inline">Pokračovat v plánování</span>
                <span className="sm:hidden">Plánovat</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-4 sm:py-6">
        <DragDropWrapper onWeddingSettingsClick={() => setShowWeddingSettings(true)} />
      </main>

      {/* Wedding Settings Modal */}
      {showWeddingSettings && (
        <WeddingSettings
          onClose={() => setShowWeddingSettings(false)}
          onSave={() => {
            // Refresh the page or update state as needed
            window.location.reload()
          }}
        />
      )}

      {/* Floating AI Assistant - Hidden */}
      {/* <AIAssistant compact={true} /> */}

      {/* Live Toast Notifications */}
      <LiveToastNotifications />

      {/* Simple Toast Container */}
      <SimpleToastContainer />
    </div>
  )
}

export default function Dashboard() {
  return (
    <CanvasProvider>
      <DashboardContent />
    </CanvasProvider>
  )
}
