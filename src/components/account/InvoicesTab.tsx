'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useInvoices } from '@/hooks/useInvoices'
import { Invoice } from '@/types/subscription'
import { 
  FileText, 
  Download, 
  Calendar, 
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  RefreshCw
} from 'lucide-react'
import { showSimpleToast } from '@/components/notifications/SimpleToast'

export default function InvoicesTab() {
  const { user } = useAuth()
  const { invoices, loading, downloadInvoice, refresh } = useInvoices(user?.id)
  const [searchTerm, setSearchTerm] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faktury</h2>
          <p className="text-gray-600 mt-1">
            Přehled všech vašich faktur a daňových dokladů
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Obnovit
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Hledat podle čísla faktury..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Žádné faktury
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Nenalezeny žádné faktury odpovídající vašemu hledání' : 'Zatím nemáte žádné faktury'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Invoice Number and Status */}
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-6 h-6 text-rose-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Faktura {invoice.invoiceNumber}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(invoice.status)}
                        <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Vystaveno: {formatDate(invoice.issueDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span>VS: {invoice.variableSymbol}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Částka: </span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(invoice.total)} {invoice.currency}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {invoice.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        {item.description} - {item.quantity}× {formatCurrency(item.unitPrice)} {invoice.currency}
                      </div>
                    ))}
                  </div>

                  {/* Payment Date */}
                  {invoice.paidAt && (
                    <div className="mt-3 text-sm text-green-600 font-medium">
                      ✓ Zaplaceno dne {formatDate(invoice.paidAt)}
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(invoice)}
                  disabled={downloading === invoice.id}
                  className="ml-4 flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading === invoice.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Stahuji...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Stáhnout PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Informace o fakturách</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Faktury jsou automaticky vystaveny po každé úspěšné platbě</li>
              <li>PDF faktury si můžete stáhnout kdykoliv</li>
              <li>Faktury obsahují všechny potřebné údaje pro účetnictví</li>
              <li>Nejsme plátci DPH - faktury jsou bez DPH</li>
            </ul>
          </div>
        </div>
      </div>
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

