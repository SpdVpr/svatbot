'use client'

import { useState } from 'react'
import { useAdminInvoices } from '@/hooks/useAdminInvoices'
import { Invoice } from '@/types/subscription'
import {
  FileText,
  Download,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  FileDown,
  Archive,
  TestTube,
  Trash2,
  Settings
} from 'lucide-react'
import { showSimpleToast } from '@/components/notifications/SimpleToast'

export default function InvoicesTab() {
  const {
    invoices,
    stats,
    loading,
    deleting,
    downloadInvoice,
    downloadMultipleInvoices,
    exportToCSV,
    exportToExcel,
    deleteInvoice,
    deleteMultipleInvoices,
    refresh
  } = useAdminInvoices()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [downloading, setDownloading] = useState<string | null>(null)
  const [creatingTest, setCreatingTest] = useState(false)
  const [showCounterModal, setShowCounterModal] = useState(false)
  const [counterPeriod, setCounterPeriod] = useState('')
  const [counterValue, setCounterValue] = useState('')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleDownload = async (invoice: Invoice) => {
    try {
      setDownloading(invoice.id)
      await downloadInvoice(invoice)
      showSimpleToast('success', 'Úspěch', 'Faktura byla stažena')
    } catch (err) {
      showSimpleToast('error', 'Chyba', 'Nepodařilo se stáhnout fakturu')
    } finally {
      setDownloading(null)
    }
  }

  const handleBulkDownload = async () => {
    if (selectedInvoices.length === 0) {
      showSimpleToast('warning', 'Upozornění', 'Vyberte alespoň jednu fakturu')
      return
    }

    try {
      await downloadMultipleInvoices(selectedInvoices)
      showSimpleToast('success', 'Úspěch', `Staženo ${selectedInvoices.length} faktur`)
      setSelectedInvoices([])
    } catch (err) {
      showSimpleToast('error', 'Chyba', 'Nepodařilo se stáhnout faktury')
    }
  }

  const handleExportCSV = () => {
    try {
      const invoicesToExport = selectedInvoices.length > 0 ? selectedInvoices : undefined
      exportToCSV(invoicesToExport)
      showSimpleToast('success', 'Úspěch', 'Export do CSV byl dokončen')
    } catch (err) {
      showSimpleToast('error', 'Chyba', 'Nepodařilo se exportovat do CSV')
    }
  }

  const handleExportExcel = async () => {
    try {
      const invoicesToExport = selectedInvoices.length > 0 ? selectedInvoices : undefined
      await exportToExcel(invoicesToExport)
      showSimpleToast('success', 'Úspěch', 'Export do Excelu byl dokončen')
    } catch (err) {
      showSimpleToast('error', 'Chyba', 'Nepodařilo se exportovat do Excelu')
    }
  }

  const toggleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id))
    }
  }

  const toggleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const handleCreateTestInvoice = async () => {
    try {
      setCreatingTest(true)

      // Use admin user for test invoice
      const response = await fetch('/api/invoices/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-id',
          userEmail: 'test@svatbot.cz'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create test invoice')
      }

      const data = await response.json()
      showSimpleToast('success', 'Úspěch', `Testovací faktura ${data.invoiceNumber} byla vytvořena`)

      // Refresh invoices list
      await refresh()
    } catch (err) {
      console.error('Error creating test invoice:', err)
      showSimpleToast('error', 'Chyba', 'Nepodařilo se vytvořit testovací fakturu')
    } finally {
      setCreatingTest(false)
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Opravdu chcete smazat tuto fakturu? Tato akce je nevratná.')) {
      return
    }

    try {
      await deleteInvoice(invoiceId)
      showSimpleToast('success', 'Úspěch', 'Faktura byla smazána')
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId))
    } catch (err) {
      showSimpleToast('error', 'Chyba', 'Nepodařilo se smazat fakturu')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedInvoices.length === 0) {
      showSimpleToast('warning', 'Upozornění', 'Vyberte alespoň jednu fakturu')
      return
    }

    if (!confirm(`Opravdu chcete smazat ${selectedInvoices.length} faktur? Tato akce je nevratná.`)) {
      return
    }

    try {
      const result = await deleteMultipleInvoices(selectedInvoices)
      showSimpleToast('success', 'Úspěch', `Smazáno ${result.successful} faktur`)
      setSelectedInvoices([])

      if (result.failed > 0) {
        showSimpleToast('warning', 'Upozornění', `${result.failed} faktur se nepodařilo smazat`)
      }
    } catch (err) {
      showSimpleToast('error', 'Chyba', 'Nepodařilo se smazat faktury')
    }
  }

  const handleSetCounter = async () => {
    if (!counterPeriod || !counterValue) {
      showSimpleToast('warning', 'Upozornění', 'Vyplňte období a hodnotu')
      return
    }

    try {
      const response = await fetch('/api/invoices/counter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: counterPeriod,
          lastNumber: parseInt(counterValue, 10)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to set counter')
      }

      showSimpleToast('success', 'Úspěch', `Číselná řada nastavena: ${counterPeriod} -> ${counterValue}`)
      setShowCounterModal(false)
      setCounterPeriod('')
      setCounterValue('')
    } catch (err) {
      showSimpleToast('error', 'Chyba', 'Nepodařilo se nastavit číselnou řadu')
    }
  }

  const getCurrentPeriod = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}${month}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'issued':
        return <Clock className="w-5 h-5 text-amber-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50'
      case 'issued':
        return 'text-amber-600 bg-amber-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Zaplaceno'
      case 'issued':
        return 'Vystaveno'
      case 'draft':
        return 'Koncept'
      case 'cancelled':
        return 'Stornováno'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem faktur</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalInvoices}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Zaplacené faktury</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{stats.paidInvoices}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkový příjem</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.totalRevenue)} Kč
                </p>
              </div>
              <div className="p-3 bg-rose-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faktury</h2>
          <p className="text-gray-600 mt-1">Správa všech vystavených faktur</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCounterPeriod(getCurrentPeriod())
              setShowCounterModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Číselná řada</span>
          </button>
          <button
            onClick={handleCreateTestInvoice}
            disabled={creatingTest}
            className="flex items-center gap-2 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingTest ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Vytváření...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4" />
                Testovací faktura
              </>
            )}
          </button>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Obnovit
          </button>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat podle čísla faktury, emailu, jména..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Všechny stavy</option>
            <option value="paid">Zaplaceno</option>
            <option value="issued">Vystaveno</option>
            <option value="draft">Koncept</option>
            <option value="cancelled">Stornováno</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedInvoices.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Vybráno: {selectedInvoices.length}
            </span>
            <button
              onClick={handleBulkDownload}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Archive className="w-4 h-4" />
              Stáhnout jako ZIP
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Package className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Smazat vybrané
            </button>
          </div>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Číslo faktury
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zákazník
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Částka
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => toggleSelectInvoice(invoice.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{invoice.customerName}</div>
                    <div className="text-sm text-gray-500">{invoice.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.issueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(invoice.total)} {invoice.currency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {getStatusText(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDownload(invoice)}
                        disabled={downloading === invoice.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        title="Stáhnout fakturu"
                      >
                        {downloading === invoice.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin inline" />
                        ) : (
                          <Download className="w-4 h-4 inline" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        disabled={deleting === invoice.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Smazat fakturu"
                      >
                        {deleting === invoice.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin inline" />
                        ) : (
                          <Trash2 className="w-4 h-4 inline" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Žádné faktury
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenalezeny žádné faktury odpovídající vašim filtrům' 
                : 'Zatím nebyly vystaveny žádné faktury'}
            </p>
          </div>
        )}
      </div>

      {/* Counter Modal */}
      {showCounterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Nastavit číselnou řadu faktur
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Období (RRRRMMM)
                </label>
                <input
                  type="text"
                  value={counterPeriod}
                  onChange={(e) => setCounterPeriod(e.target.value)}
                  placeholder="202511"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formát: RRRRMMM (např. 202511 pro listopad 2025)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poslední číslo faktury
                </label>
                <input
                  type="number"
                  value={counterValue}
                  onChange={(e) => setCounterValue(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Další faktura bude mít číslo {counterPeriod}-{String(parseInt(counterValue || '0') + 1).padStart(4, '0')}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Upozornění:</strong> Změna číselné řady může ovlivnit legislativní požadavky na chronologické číslování faktur.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSetCounter}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Nastavit
              </button>
              <button
                onClick={() => {
                  setShowCounterModal(false)
                  setCounterPeriod('')
                  setCounterValue('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

