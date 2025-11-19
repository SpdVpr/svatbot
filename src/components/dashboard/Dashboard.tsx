'use client'

import { useState, useEffect } from 'react'
import { useWeddingStore } from '@/stores/weddingStore'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useWeddingDate } from '@/hooks/useDemoSettings'
import { useDataPrefetch } from '@/hooks/useDataPrefetch'
import { dateUtils } from '@/utils'
import DragDropWrapper from './DragDropWrapper'
import { CanvasProvider, useCanvas } from '@/contexts/CanvasContext'
import {
  Heart,
  LogOut,
  User,
  Edit,
  StickyNote,
  Crown,
  Clock,
  Menu,
  UserPlus,
  Palette
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import WeddingSettings from '@/components/wedding/WeddingSettings'
import AccountModal from '@/components/account/AccountModal'
import AuthModal from '@/components/auth/AuthModal'
import AIAssistant from '@/components/ai/AIAssistant'
import NotesModal from '@/components/notes/NotesModal'
import DashboardSkeleton from './DashboardSkeleton'
import { useViewTransition } from '@/hooks/useViewTransition'
import MobileMenu from '@/components/navigation/MobileMenu'
import LiveNotifications, { LiveToastNotifications } from '@/components/notifications/LiveNotifications'
import SimpleToastContainer, { showSimpleToast } from '@/components/notifications/SimpleToast'
// import { useNotificationTriggers } from '@/hooks/useNotificationTriggers'
import { useWeddingNotifications, useLiveToastNotifications } from '@/hooks/useWeddingNotifications'
import { createDemoNotifications, createTestToast } from '@/utils/demoNotifications'
import { useAutoNotifications } from '@/hooks/useAutoNotifications'
import { useCalendarReminders } from '@/hooks/useCalendarReminders'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import ScrollProgress from '@/components/animations/ScrollProgress'
import TrialExpiredModal from '@/components/subscription/TrialExpiredModal'
import { useSearchParams } from 'next/navigation'
import { useColorTheme } from '@/hooks/useColorTheme'
import { COLOR_PALETTES, ColorTheme } from '@/types/colorTheme'
// Import test utilities (only in development)
import '@/utils/testTrialExpiry'

function DashboardContent() {
  const { currentWedding } = useWeddingStore()
  const { logout, user } = useAuth()
  const { subscription, trialDaysRemaining, hasPremiumAccess } = useSubscription()
  const { getCanvasMaxWidth } = useCanvas()
  const { startTransition } = useViewTransition()
  const { colorTheme, changeTheme, canChangeTheme } = useColorTheme()

  // Check if user is demo
  const isDemoUserCheck = user?.email === 'demo@svatbot.cz'
  const [showWeddingSettings, setShowWeddingSettings] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [accountInitialTab, setAccountInitialTab] = useState<'profile' | 'subscription' | 'payments' | 'statistics' | 'settings' | 'feedback'>('profile')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileColorMenu, setShowMobileColorMenu] = useState(false)
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false)
  const [showOnboardingWizardFromDashboard, setShowOnboardingWizardFromDashboard] = useState(false)
  const [isSafari, setIsSafari] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const searchParams = useSearchParams()

  // Use DEMO-aware wedding date
  const { weddingDate, isDemoUser } = useWeddingDate(user?.id, currentWedding?.weddingDate || null)

  // Check if trial has expired
  const isTrialExpired = subscription &&
    subscription.status === 'trialing' &&
    (
      // Either isTrialActive is false OR trial end date has passed
      !subscription.isTrialActive ||
      new Date() > subscription.trialEndDate
    ) &&
    !hasPremiumAccess

  // Show trial expired modal when trial expires
  useEffect(() => {
    if (isTrialExpired && user?.email !== 'demo@svatbot.cz') {
      setShowTrialExpiredModal(true)
    }
  }, [isTrialExpired, user])

  // Detect Safari browser for logo fallback
  useEffect(() => {
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    setIsSafari(isSafariBrowser)
  }, [])

  // Initialize auto-notifications system
  useAutoNotifications()

  // Initialize calendar reminders system
  const { testNotifications } = useCalendarReminders()

  // Check for payment success/cancel in URL
  useEffect(() => {
    const payment = searchParams.get('payment')
    const openAccount = searchParams.get('openAccount') as 'profile' | 'subscription' | 'payments' | 'statistics' | 'settings' | 'feedback' | null
    const openSettings = searchParams.get('openSettings')

    if (payment === 'success') {
      showSimpleToast('success', 'Platba úspěšná! 🎉', 'Vaše předplatné bylo aktivováno. Děkujeme!')
      // Remove payment param from URL
      window.history.replaceState({}, '', '/')
    } else if (payment === 'canceled') {
      showSimpleToast('info', 'Platba zrušena', 'Platba byla zrušena. Můžete to zkusit znovu kdykoliv.')
      // Remove payment param from URL
      window.history.replaceState({}, '', '/')
    }

    // Check if we should open account modal with specific tab
    if (openAccount && ['profile', 'subscription', 'payments', 'statistics', 'settings', 'feedback'].includes(openAccount)) {
      console.log('🔍 Opening account modal with tab:', openAccount)
      setAccountInitialTab(openAccount)
      setShowAccountModal(true)
      // Remove openAccount param from URL
      window.history.replaceState({}, '', '/')
    }

    // Check if we should open wedding settings modal
    if (openSettings === 'true') {
      console.log('🔍 Opening wedding settings modal from URL')
      setShowWeddingSettings(true)
      // Remove openSettings param from URL
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams])

  // Helper functions for opening/closing modals with View Transitions
  const openWeddingSettings = () => {
    // Set state immediately to hide content instantly (no transition delay)
    setShowWeddingSettings(true)
  }

  const closeWeddingSettings = () => {
    startTransition(() => setShowWeddingSettings(false))
  }

  const openNotesModal = () => {
    // Set state immediately to hide content instantly (no transition delay)
    setShowNotesModal(true)
  }

  const closeNotesModal = () => {
    startTransition(() => setShowNotesModal(false))
  }

  const openAccountModal = (tab?: typeof accountInitialTab) => {
    // Set state immediately to hide content instantly (no transition delay)
    if (tab) setAccountInitialTab(tab)
    setShowAccountModal(true)
  }

  const closeAccountModal = () => {
    startTransition(() => setShowAccountModal(false))
  }

  const openRegistration = () => {
    setAuthMode('register')
    setShowAuthModal(true)
  }

  const openMobileMenu = () => {
    startTransition(() => setShowMobileMenu(true))
  }

  const closeMobileMenu = () => {
    startTransition(() => setShowMobileMenu(false))
  }

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

  // Use wedding from store (loaded from Firestore for all users including demo)
  const wedding = currentWedding

  // Prefetch data in parallel for faster dashboard loading
  useDataPrefetch(user?.id, wedding?.id)

  // Preload logo video
  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/Animation-logo.webm'
    video.preload = 'auto'
    video.onloadeddata = () => {
      setLogoLoaded(true)
    }
    video.load()
  }, [])

  // Wait for everything to be ready before showing content
  useEffect(() => {
    if (wedding && user && logoLoaded) {
      // Small delay to ensure all resources are loaded
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [wedding, user, logoLoaded])

  // Show skeleton while loading
  if (!wedding || !isReady || !logoLoaded) {
    return <DashboardSkeleton />
  }



  return (
    <div className="min-h-screen flex flex-col">
      {/* Trial Expired Modal - Blocks access */}
      {showTrialExpiredModal && (
        <TrialExpiredModal
          onUpgrade={() => {
            // Modal will close automatically after successful payment
            setShowTrialExpiredModal(false)
          }}
        />
      )}

      {/* Main content with blur when trial expired */}
      <div className={showTrialExpiredModal ? 'filter blur-sm pointer-events-none' : ''}>
        {/* Scroll Progress Indicator */}
        <ScrollProgress />

      {/* Glassmorphism Header - hidden when modal is open */}
      <header className={`bg-gray-50/95 backdrop-blur-xl border-b border-gray-100/50 shadow-sm sticky top-0 z-[200] ${
        showNotesModal || showAccountModal || showWeddingSettings || showOnboardingWizardFromDashboard ? 'hidden' : ''
      }`}>
        {/* Mobile Header */}
        <div className="sm:hidden">
          <div className="h-14 px-1 flex items-center justify-between">
            <div className="flex items-center -space-x-1">
              <button
                onClick={openMobileMenu}
                className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Animated logo with Safari fallback */}
              {isSafari ? (
                <img
                  src="/logo-svatbot.svg"
                  alt="SvatBot.cz"
                  className="h-7 w-auto"
                  style={{ width: '60px', height: '28px' }}
                />
              ) : (
                <video
                  src="/Animation-logo.webm"
                  autoPlay
                  muted
                  playsInline
                  className="h-7 w-auto"
                  style={{ width: '60px', height: '28px' }}
                />
              )}
              <LiveNotifications />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowMobileColorMenu(!showMobileColorMenu)}
                className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Barevná paleta"
              >
                <Palette className="w-6 h-6" />
              </button>
              <button
                onClick={openNotesModal}
                className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Poznámky"
              >
                <StickyNote className="w-6 h-6" />
              </button>
              {isDemoUserCheck ? (
                <button
                  onClick={openRegistration}
                  className="mobile-nav-button text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                  title="Registrace"
                >
                  <UserPlus className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={() => openAccountModal()}
                  className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  title="Účet"
                >
                  <User className="w-6 h-6" />
                </button>
              )}
              <div className="w-2"></div>
              <button
                onClick={logout}
                className="mobile-nav-button text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Odhlásit"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className={`hidden sm:block mx-auto px-3 sm:px-4 lg:px-8 py-3 lg:py-4 min-h-[88px] lg:min-h-[112px] ${getCanvasMaxWidth()}`}>
          <div className="flex items-center justify-between h-full gap-2 lg:gap-4">
            <div className="flex items-center space-x-3 lg:space-x-6 min-w-0 flex-1">
              {isSafari ? (
                <img
                  src="/logo-svatbot.svg"
                  alt="SvatBot.cz"
                  className="h-14 lg:h-20 w-auto flex-shrink-0"
                  style={{ width: '56px', height: '56px' }}
                />
              ) : (
                <video
                  src="/Animation-logo.webm"
                  autoPlay
                  muted
                  playsInline
                  className="h-14 lg:h-20 w-auto flex-shrink-0"
                  style={{ width: '56px', height: '56px' }}
                />
              )}
              <div className="border-l border-gray-300 pl-3 lg:pl-6 min-w-0 flex-1">
                <button
                  onClick={openWeddingSettings}
                  className="text-left hover:text-primary-600 transition-colors group w-full"
                  title="Klikněte pro úpravu"
                >
                  <h1 className="text-base md:text-lg lg:text-2xl font-bold text-text-primary leading-tight group-hover:text-primary-600 transition-colors truncate" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Upright', serif" }}>
                    Svatba {wedding.brideName} & {wedding.groomName}
                    <Edit className="w-3 h-3 lg:w-4 lg:h-4 inline ml-1 lg:ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h1>
                  <p className="text-xs lg:text-sm text-text-muted truncate">
                    {weddingDate
                      ? `${dateUtils.format(weddingDate, 'dd. MMMM yyyy')} • Dnes: ${dateUtils.format(new Date(), 'dd. MMMM yyyy')}`
                      : 'Datum zatím nestanoveno - klikněte pro nastavení'
                    }
                  </p>
                </button>

                {/* Subscription info - outside button to avoid nesting */}
                {subscription?.status === 'trialing' && subscription?.isTrialActive && trialDaysRemaining !== null && (
                  <button
                    onClick={() => openAccountModal('subscription')}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity mt-1"
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className={`text-sm font-medium ${trialDaysRemaining <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                      {trialDaysRemaining === 0
                        ? 'Trial vyprší dnes!'
                        : `Trial vyprší za ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'den' : trialDaysRemaining <= 4 ? 'dny' : 'dní'}`
                      }
                    </span>
                  </button>
                )}

                {/* Premium status */}
                {subscription?.status === 'active' && hasPremiumAccess && (
                  <button
                    onClick={() => openAccountModal('subscription')}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity mt-1"
                  >
                    <Crown className="w-4 h-4 text-primary-600" fill="currentColor" />
                    <span className="text-sm font-medium text-primary-600">
                      {subscription.plan === 'premium_monthly' && 'Premium měsíční'}
                      {subscription.plan === 'premium_yearly' && 'Premium roční'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1.5 lg:space-x-4 flex-shrink-0">
              <div className="hidden xl:block text-right mr-2 lg:mr-4">
                <p className="text-xs text-text-muted">Přihlášen jako</p>
                <p className="text-xs font-medium truncate max-w-[120px]">{user?.displayName || user?.email}</p>
              </div>
              <LiveNotifications />
              <button
                onClick={openNotesModal}
                className="btn-outline flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 text-sm"
                title="Poznámky"
              >
                <StickyNote className="w-4 h-4" />
                <span className="hidden lg:inline">Poznámky</span>
              </button>
              {isDemoUserCheck ? (
                <button
                  onClick={openRegistration}
                  className="btn-primary flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 text-sm"
                  title="Registrace"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden lg:inline">Registrace</span>
                </button>
              ) : (
                <button
                  onClick={() => openAccountModal()}
                  className="btn-outline flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 text-sm"
                  title="Účet"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">Účet</span>
                </button>
              )}
              <button
                onClick={logout}
                className="btn-outline flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Odhlásit</span>
              </button>
              {/* Development Test Buttons - HIDDEN */}
              {false && (
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
                    onClick={() => testNotifications()}
                    className="btn-outline text-xs px-2 py-1"
                    title="Test Calendar Reminders"
                  >
                    📅
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Reduced padding on mobile, hidden when modal is open */}
      <main className={`flex-1 py-2 sm:py-6 px-2 sm:px-6 lg:px-8 ${
        showNotesModal || showAccountModal || showWeddingSettings || showOnboardingWizardFromDashboard ? 'hidden' : ''
      }`}>
        <DragDropWrapper
          onWeddingSettingsClick={openWeddingSettings}
          onOnboardingWizardChange={setShowOnboardingWizardFromDashboard}
        />
      </main>

      {/* Wedding Settings Modal */}
      {showWeddingSettings && (
        <WeddingSettings
          onClose={closeWeddingSettings}
          onSave={() => {
            // Refresh the page or update state as needed
            window.location.reload()
          }}
        />
      )}

      {/* Floating AI Assistant - Hidden (using Svatbot module in dashboard instead) */}
      {/* <AIAssistant compact={true} /> */}

      {/* Onboarding Wizard - Manual only, not auto-shown */}
      {showOnboardingWizardFromDashboard && (
        <OnboardingWizard
          autoShow={false}
          onClose={() => setShowOnboardingWizardFromDashboard(false)}
        />
      )}

      {/* Live Toast Notifications */}
      <LiveToastNotifications />

      {/* Simple Toast Container */}
      <SimpleToastContainer />

      {/* Notes Modal */}
      <NotesModal
        isOpen={showNotesModal}
        onClose={closeNotesModal}
      />

      {/* Account Modal */}
      {showAccountModal && (
        <AccountModal
          onClose={closeAccountModal}
          initialTab={accountInitialTab}
        />
      )}

      {/* Auth Modal for Demo Users */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}

      {/* Mobile Color Menu Modal */}
      {showMobileColorMenu && (
        <div className="fixed inset-0 z-[300] flex items-end sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileColorMenu(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full bg-white rounded-t-3xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Barevná paleta</h3>
                <button
                  onClick={() => setShowMobileColorMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-400">×</span>
                </button>
              </div>

              {/* Color Themes */}
              <div className="space-y-2">
                {(Object.keys(COLOR_PALETTES) as ColorTheme[]).map((theme) => {
                  const palette = COLOR_PALETTES[theme]
                  return (
                    <button
                      key={theme}
                      onClick={() => {
                        changeTheme(theme)
                        setShowMobileColorMenu(false)
                      }}
                      disabled={!canChangeTheme}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border-2 ${
                        colorTheme === theme
                          ? 'shadow-md scale-105'
                          : 'border-transparent hover:border-gray-200'
                      } ${!canChangeTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{
                        backgroundColor: palette.colors.primaryLight,
                        color: palette.colors.primary700,
                        borderColor: colorTheme === theme ? palette.colors.primary400 : 'transparent'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{palette.name}</span>
                        {colorTheme === theme && (
                          <span className="text-lg">✓</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={closeMobileMenu}
      />
      </div>
      {/* End of blurred content wrapper */}
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
