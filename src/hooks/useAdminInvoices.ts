'use client'

import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  orderBy, 
  limit,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Invoice } from '@/types/subscription'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { generateInvoicePDF } from '@/lib/invoiceGenerator'

export interface AdminInvoiceStats {
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
  totalRevenue: number
  monthlyRevenue: number
  averageInvoiceAmount: number
}

export function useAdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<AdminInvoiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const invoicesRef = collection(db, 'invoices')
      const q = query(
        invoicesRef,
        orderBy('createdAt', 'desc'),
        limit(1000)
      )

      const snapshot = await getDocs(q)
      const invoicesData: Invoice[] = []

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        
        // Get user info
        let userEmail = data.userEmail || 'Unknown'
        let customerName = data.customerName
        
        if (data.userId && !customerName) {
          try {
            const userDoc = await getDoc(doc(db, 'users', data.userId))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              userEmail = userData.email || userEmail
              customerName = userData.displayName || userData.email?.split('@')[0]
            }
          } catch (err) {
            console.log('Could not fetch user data for invoice:', data.userId)
          }
        }

        invoicesData.push({
          id: docSnap.id,
          ...data,
          userEmail,
          customerName: customerName || userEmail,
          issueDate: data.issueDate?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || new Date(),
          taxableDate: data.taxableDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          paidAt: data.paidAt?.toDate(),
          pdfGeneratedAt: data.pdfGeneratedAt?.toDate()
        } as Invoice)
      }

      setInvoices(invoicesData)
      calculateStats(invoicesData)
      setError(null)
    } catch (err: any) {
      if (err?.code !== 'permission-denied' && !err?.message?.includes('permission')) {
        console.error('Error loading invoices:', err)
        setError('Nepodařilo se načíst faktury')
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (invoicesData: Invoice[]) => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    let totalRevenue = 0
    let monthlyRevenue = 0
    let paidInvoices = 0
    let unpaidInvoices = 0

    invoicesData.forEach(invoice => {
      if (invoice.status === 'paid') {
        totalRevenue += invoice.total
        paidInvoices++

        if (invoice.paidAt && invoice.paidAt >= thisMonth) {
          monthlyRevenue += invoice.total
        }
      } else if (invoice.status === 'issued') {
        unpaidInvoices++
      }
    })

    const averageInvoiceAmount = paidInvoices > 0 ? totalRevenue / paidInvoices : 0

    setStats({
      totalInvoices: invoicesData.length,
      paidInvoices,
      unpaidInvoices,
      totalRevenue,
      monthlyRevenue,
      averageInvoiceAmount
    })
  }

  /**
   * Download single invoice
   */
  const downloadInvoice = async (invoice: Invoice) => {
    try {
      // Generate PDF on-demand (same as user download)
      const pdfBlob = await generateInvoicePDF(invoice)

      // Download PDF directly
      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Faktura-${invoice.invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading invoice:', err)
      throw new Error('Nepodařilo se stáhnout fakturu')
    }
  }

  /**
   * Download multiple invoices as ZIP
   */
  const downloadMultipleInvoices = async (invoiceIds: string[]) => {
    try {
      const zip = new JSZip()
      const selectedInvoices = invoices.filter(inv => invoiceIds.includes(inv.id))

      for (const invoice of selectedInvoices) {
        try {
          // Generate PDF on-demand for each invoice
          const pdfBlob = await generateInvoicePDF(invoice)
          zip.file(`Faktura-${invoice.invoiceNumber}.pdf`, pdfBlob)
        } catch (err) {
          console.error(`Error generating invoice ${invoice.invoiceNumber}:`, err)
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `Faktury-${new Date().toISOString().split('T')[0]}.zip`)
    } catch (err) {
      console.error('Error creating ZIP:', err)
      throw new Error('Nepodařilo se vytvořit ZIP archiv')
    }
  }

  /**
   * Export invoices to CSV
   */
  const exportToCSV = (invoiceIds?: string[]) => {
    try {
      const dataToExport = invoiceIds 
        ? invoices.filter(inv => invoiceIds.includes(inv.id))
        : invoices

      const headers = [
        'Číslo faktury',
        'Datum vystavení',
        'Datum splatnosti',
        'Zákazník',
        'Email',
        'IČO',
        'Částka',
        'Měna',
        'Stav',
        'Datum zaplacení',
        'Variabilní symbol'
      ]

      const rows = dataToExport.map(inv => [
        inv.invoiceNumber,
        formatDate(inv.issueDate),
        formatDate(inv.dueDate),
        inv.customerName || '',
        inv.userEmail,
        inv.customerICO || '',
        inv.total.toString(),
        inv.currency,
        getStatusText(inv.status),
        inv.paidAt ? formatDate(inv.paidAt) : '',
        inv.variableSymbol
      ])

      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
      ].join('\n')

      // Add BOM for Excel UTF-8 support
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, `Faktury-${new Date().toISOString().split('T')[0]}.csv`)
    } catch (err) {
      console.error('Error exporting to CSV:', err)
      throw new Error('Nepodařilo se exportovat do CSV')
    }
  }

  /**
   * Export invoices to Excel-compatible format
   */
  const exportToExcel = async (invoiceIds?: string[]) => {
    try {
      const XLSX = await import('xlsx')
      const dataToExport = invoiceIds 
        ? invoices.filter(inv => invoiceIds.includes(inv.id))
        : invoices

      const worksheetData = dataToExport.map(inv => ({
        'Číslo faktury': inv.invoiceNumber,
        'Datum vystavení': formatDate(inv.issueDate),
        'Datum splatnosti': formatDate(inv.dueDate),
        'DUZP': formatDate(inv.taxableDate),
        'Zákazník': inv.customerName || '',
        'Email': inv.userEmail,
        'IČO': inv.customerICO || '',
        'DIČ': inv.customerDIC || '',
        'Základ': inv.subtotal,
        'DPH': inv.vatAmount,
        'Celkem': inv.total,
        'Měna': inv.currency,
        'Stav': getStatusText(inv.status),
        'Datum zaplacení': inv.paidAt ? formatDate(inv.paidAt) : '',
        'Variabilní symbol': inv.variableSymbol,
        'Způsob platby': inv.paymentMethod
      }))

      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Faktury')

      XLSX.writeFile(workbook, `Faktury-${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (err) {
      console.error('Error exporting to Excel:', err)
      throw new Error('Nepodařilo se exportovat do Excelu')
    }
  }

  return {
    invoices,
    stats,
    loading,
    error,
    downloadInvoice,
    downloadMultipleInvoices,
    exportToCSV,
    exportToExcel,
    refresh: loadInvoices
  }
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

function getStatusText(status: string): string {
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

