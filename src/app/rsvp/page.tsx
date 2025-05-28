'use client'

import { useAuth } from '@/hooks/useAuth'
import { useWedding } from '@/hooks/useWedding'
import RSVPManager from '@/components/rsvp/RSVPManager'
import {
  ArrowLeft,
  Mail,
  Users,
  Calendar,
  Settings,
  BarChart3,
  Home
} from 'lucide-react'
import Link from 'next/link'

export default function RSVPPage() {
  const { user } = useAuth()
  const { wedding } = useWedding()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Přihlášení vyžadováno
          </h1>
          <p className="text-text-muted">
            Pro přístup k RSVP systému se musíte přihlásit.
          </p>
        </div>
      </div>
    )
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Žádná svatba
          </h1>
          <p className="text-text-muted mb-4">
            Nejdříve si vytvořte svatbu v onboarding procesu.
          </p>
          <Link href="/" className="btn-primary">
            Zpět na dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">RSVP Systém</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back button and Title */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Zpět na dashboard</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">RSVP Systém</h1>
                <p className="text-sm text-text-muted">
                  Správa pozvánek pro svatbu {wedding.brideName} & {wedding.groomName}
                </p>
              </div>
            </div>

            {/* Quick navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/guests"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Hosté</span>
              </Link>
              <Link
                href="/seating"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Rozmístění</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                RSVP Systém pro vaši svatbu
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Spravujte pozvánky, sledujte odpovědi hostů a automatizujte komunikaci. 
                Systém vám pomůže s organizací a přehledem o účasti na svatbě.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Automatické připomínky</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Detailní statistiky</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Přizpůsobitelné šablony</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RSVP Manager */}
        <RSVPManager />

        {/* Quick navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Zpět na hlavní obrazovku</span>
          </Link>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Email pozvánky</h3>
            <p className="text-sm text-text-muted">
              Krásné HTML pozvánky s personalizovanými zprávami
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Real-time statistiky</h3>
            <p className="text-sm text-text-muted">
              Sledujte míru odpovědí a plánujte podle aktuálních dat
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Automatické připomínky</h3>
            <p className="text-sm text-text-muted">
              Nastavte automatické připomínky před deadline
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
