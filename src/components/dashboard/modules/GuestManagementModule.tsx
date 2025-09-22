'use client'

import Link from 'next/link'
import { Users, UserCheck, UserX, Mail, ArrowRight } from 'lucide-react'
import { useGuest } from '@/hooks/useGuest'

export default function GuestManagementModule() {
  const { stats } = useGuest()

  return (
    <div className="wedding-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary-600" />
          <span>Správa hostů</span>
        </h3>
        <Link href="/guests" className="text-sm text-primary-600 hover:underline">
          Otevřít
        </Link>
      </div>

      <div className="space-y-4">
        {/* Guest Count */}
        <div className="bg-primary-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary-600 mb-1">{stats.total}</div>
          <div className="text-sm text-primary-700">Celkem hostů</div>
        </div>

        {/* RSVP Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
              <UserCheck className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">{stats.attending}</div>
            <div className="text-xs text-gray-500">Přijde</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mx-auto mb-1">
              <UserX className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">{stats.declined}</div>
            <div className="text-xs text-gray-500">Nepřijde</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mx-auto mb-1">
              <Mail className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-sm font-bold text-gray-900">{stats.pending}</div>
            <div className="text-xs text-gray-500">Čeká</div>
          </div>
        </div>

        {/* Response Rate */}
        {stats.total > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Míra odpovědí</span>
              <span className="text-sm font-semibold">{stats.responseRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.responseRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Status */}
        <div className="text-center">
          <div className={`text-sm px-3 py-1 rounded-full inline-block ${
            stats.total === 0
              ? 'bg-gray-100 text-gray-600'
              : stats.responseRate < 50
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
          }`}>
            {stats.total === 0
              ? 'Žádní hosté'
              : stats.responseRate < 50
                ? 'Čekáme na odpovědi'
                : 'Dobré odpovědi'
            }
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          href="/guests" 
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>Spravovat hosty</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
