'use client'

import { useState } from 'react'
import { useRSVP } from '@/hooks/useRSVP'
import { useGuest } from '@/hooks/useGuest'
import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  Search,
  BarChart3
} from 'lucide-react'

interface RSVPManagerProps {
  className?: string
}

export default function RSVPManager({ className = '' }: RSVPManagerProps) {
  const {
    invitations,
    responses,
    templates,
    settings,
    stats,
    loading,
    sendInvitation,
    sendBulkInvitations,
    sendReminder
  } = useRSVP()
  const { guests } = useGuest()

  const [activeTab, setActiveTab] = useState<'overview' | 'invitations' | 'responses' | 'templates' | 'settings'>('overview')
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'pending' | 'responded'>('all')

  // Get guest data for invitations
  const getGuestForInvitation = (guestId: string) => {
    return guests.find(g => g.id === guestId)
  }

  // Filter invitations based on search and status
  const filteredInvitations = invitations.filter(invitation => {
    const guest = getGuestForInvitation(invitation.guestId)
    const matchesSearch = !searchTerm ||
      (guest && `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'sent' && invitation.emailSent) ||
      (filterStatus === 'pending' && !invitation.emailSent) ||
      (filterStatus === 'responded' && invitation.respondedAt)

    return matchesSearch && matchesStatus
  })

  // Handle bulk invitation sending
  const handleSendBulkInvitations = async () => {
    if (selectedGuests.length === 0) return

    try {
      await sendBulkInvitations(selectedGuests)
      setSelectedGuests([])
    } catch (error) {
      console.error('Error sending bulk invitations:', error)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Přehled', icon: BarChart3 },
    { id: 'invitations', label: 'Pozvánky', icon: Mail },
    { id: 'responses', label: 'Odpovědi', icon: CheckCircle },
    { id: 'templates', label: 'Šablony', icon: Edit },
    { id: 'settings', label: 'Nastavení', icon: Settings }
  ]

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 loading-spinner" />
          <span className="text-text-muted">Načítání RSVP systému...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">RSVP Systém</h2>
            <p className="text-text-muted">
              Správa pozvánek a odpovědí hostů na svatbu
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="btn-outline flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Odeslat pozvánky</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Celkem pozvánek</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalInvitations}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Odpovědělo</p>
                <p className="text-2xl font-bold text-green-700">{stats.respondedInvitations}</p>
                <p className="text-xs text-green-600">{stats.responseRate}% míra odpovědí</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 mb-1">Přijde</p>
                <p className="text-2xl font-bold text-primary-700">{stats.attending}</p>
                <p className="text-xs text-primary-600">{stats.attendanceRate}% účast</p>
              </div>
              <Users className="w-8 h-8 text-primary-500" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 mb-1">Čeká na odpověď</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Response Timeline */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Časová osa odpovědí
                  </h3>
                  <div className="space-y-3">
                    {responses.slice(0, 5).map(response => {
                      const guest = getGuestForInvitation(response.guestId)
                      return (
                        <div key={response.id} className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            response.attending ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {guest ? `${guest.firstName} ${guest.lastName}` : 'Neznámý host'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {response.attending ? 'Přijde' : 'Nepřijde'} • {response.responseDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Rychlé akce
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full btn-outline flex items-center justify-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Odeslat připomínky</span>
                    </button>
                    <button className="w-full btn-outline flex items-center justify-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Export odpovědí</span>
                    </button>
                    <button className="w-full btn-outline flex items-center justify-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Detailní statistiky</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RSVP Deadline */}
              {settings && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        Deadline pro RSVP: {settings.rsvpDeadline.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-yellow-700">
                        Zbývá {Math.ceil((settings.rsvpDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dní
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invitations Tab */}
          {activeTab === 'invitations' && (
            <div className="space-y-4">
              {/* Filters and Search */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Hledat hosty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">Všechny</option>
                    <option value="sent">Odeslané</option>
                    <option value="pending">Čekající</option>
                    <option value="responded">Odpověděli</option>
                  </select>
                </div>

                {selectedGuests.length > 0 && (
                  <button
                    onClick={handleSendBulkInvitations}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Odeslat vybrané ({selectedGuests.length})</span>
                  </button>
                )}
              </div>

              {/* Invitations List */}
              <div className="space-y-2">
                {filteredInvitations.map(invitation => {
                  const guest = getGuestForInvitation(invitation.guestId)
                  const response = responses.find(r => r.guestId === invitation.guestId)

                  return (
                    <div key={invitation.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedGuests.includes(invitation.guestId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGuests(prev => [...prev, invitation.guestId])
                              } else {
                                setSelectedGuests(prev => prev.filter(id => id !== invitation.guestId))
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />

                          <div>
                            <p className="font-medium">
                              {guest ? `${guest.firstName} ${guest.lastName}` : 'Neznámý host'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {guest?.email || 'Bez emailu'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* Status */}
                          <div className="text-right">
                            {response ? (
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                response.attending
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {response.attending ? 'Přijde' : 'Nepřijde'}
                              </div>
                            ) : invitation.emailSent ? (
                              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Odesláno
                              </div>
                            ) : (
                              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Čeká
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            {!invitation.emailSent && (
                              <button
                                onClick={() => sendInvitation(invitation.id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Odeslat pozvánku"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}

                            {invitation.emailSent && !response && (
                              <button
                                onClick={() => sendReminder(invitation.id)}
                                className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                                title="Odeslat připomínku"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Zobrazit detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredInvitations.length === 0 && (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Žádné pozvánky nenalezeny</p>
                </div>
              )}
            </div>
          )}

          {/* Other tabs would be implemented here */}
          {activeTab === 'responses' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Správa odpovědí bude implementována</p>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="text-center py-8">
              <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Správa šablon bude implementována</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nastavení RSVP bude implementováno</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
