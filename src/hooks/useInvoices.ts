'use client'

import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  setDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/config/firebase'
import { Invoice, Payment } from '@/types/subscription'
import { generateInvoiceNumber, generateVariableSymbol } from '@/lib/invoiceGenerator'

// Company info for SvatBot.cz (only include defined values to avoid Firestore errors)
const SVATBOT_INFO = {
  supplierName: 'SvatBot.cz',
  supplierAddress: 'Michal Vesecky, Zapska 1149, Nehvizdy',
  supplierCity: '',
  supplierZip: '25081',
  supplierCountry: '',
  supplierICO: '88320090',
  supplierEmail: 'info@svatbot.cz'
  // Note: We don't include undefined values (supplierDIC, supplierPhone, etc.)
  // as Firestore doesn't accept undefined values
}

export function useInvoices(userId?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      loadInvoices()
    }
  }, [userId])

  const loadInvoices = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const invoicesRef = collection(db, 'invoices')
      const q = query(
        invoicesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const invoicesData: Invoice[] = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || new Date(),
          taxableDate: data.taxableDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          paidAt: data.paidAt?.toDate(),
          pdfGeneratedAt: data.pdfGeneratedAt?.toDate()
        } as Invoice
      })

      setInvoices(invoicesData)
      setError(null)
    } catch (err) {
      console.error('Error loading invoices:', err)
      setError('Nepodařilo se načíst faktury')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create invoice from payment
   */
  const createInvoiceFromPayment = async (payment: Payment, userEmail: string): Promise<Invoice> => {
    try {
      const now = new Date()
      const invoiceNumber = generateInvoiceNumber(now)
      const variableSymbol = generateVariableSymbol(invoiceNumber)

      // Determine plan name
      let planName = 'Premium předplatné'
      if (payment.plan === 'premium_monthly') {
        planName = 'Premium předplatné - měsíční'
      } else if (payment.plan === 'premium_yearly') {
        planName = 'Premium předplatné - roční'
      }

      // Create invoice data
      const invoice: Omit<Invoice, 'id'> = {
        invoiceNumber,
        paymentId: payment.id,
        userId: payment.userId,
        userEmail,
        
        // Customer details (can be updated later)
        customerName: userEmail,
        
        // Dates
        issueDate: now,
        dueDate: now, // Already paid
        taxableDate: payment.paidAt || now,
        
        // Items
        items: [
          {
            description: planName,
            quantity: 1,
            unitPrice: payment.amount,
            vatRate: 0, // Not VAT payer
            total: payment.amount
          }
        ],
        
        // Amounts
        subtotal: payment.amount,
        vatRate: 0,
        vatAmount: 0,
        total: payment.amount,
        currency: payment.currency,
        
        // Payment info
        paymentMethod: getPaymentMethodName(payment.paymentMethod),
        variableSymbol,
        status: payment.status === 'succeeded' ? 'paid' : 'issued',
        paidAt: payment.paidAt,
        
        // Supplier info
        ...SVATBOT_INFO,
        
        // Metadata
        createdAt: now,
        updatedAt: now
      }

      // Save to Firestore
      const invoiceRef = doc(collection(db, 'invoices'))
      await setDoc(invoiceRef, {
        ...invoice,
        issueDate: Timestamp.fromDate(invoice.issueDate),
        dueDate: Timestamp.fromDate(invoice.dueDate),
        taxableDate: Timestamp.fromDate(invoice.taxableDate),
        createdAt: Timestamp.fromDate(invoice.createdAt),
        updatedAt: Timestamp.fromDate(invoice.updatedAt),
        paidAt: invoice.paidAt ? Timestamp.fromDate(invoice.paidAt) : null
      })

      const createdInvoice = { ...invoice, id: invoiceRef.id } as Invoice

      // Note: PDF will be generated on-demand when user downloads it
      // This keeps invoice creation fast and reliable

      return createdInvoice
    } catch (err) {
      console.error('Error creating invoice:', err)
      throw new Error('Nepodařilo se vytvořit fakturu')
    }
  }

  /**
   * Generate PDF and upload to Firebase Storage
   * NOTE: This function is no longer used - PDFs are generated on-demand
   * Keeping it for potential future use (e.g., email attachments)
   */
  /*
  const generateAndUploadPDF = async (invoice: Invoice): Promise<string> => {
    try {
      // Generate PDF
      const pdfBlob = await generateInvoicePDF(invoice)

      // Upload to Firebase Storage
      const fileName = `invoices/${invoice.userId}/${invoice.invoiceNumber}.pdf`
      const storageRef = ref(storage, fileName)
      await uploadBytes(storageRef, pdfBlob)

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef)

      // Update invoice with PDF URL
      const invoiceRef = doc(db, 'invoices', invoice.id)
      await updateDoc(invoiceRef, {
        invoicePdfUrl: downloadURL,
        pdfGeneratedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      // Also update payment record
      if (invoice.paymentId) {
        const paymentRef = doc(db, 'payments', invoice.paymentId)
        await updateDoc(paymentRef, {
          invoiceNumber: invoice.invoiceNumber,
          invoicePdfUrl: downloadURL,
          updatedAt: Timestamp.now()
        })
      }

      return downloadURL
    } catch (err) {
      console.error('Error generating PDF:', err)
      throw new Error('Nepodařilo se vygenerovat PDF faktury')
    }
  }
  */

  /**
   * Download invoice PDF
   */
  const downloadInvoice = async (invoice: Invoice) => {
    try {
      // Call server-side PDF generation endpoint
      const response = await fetch(`/api/invoices/${invoice.id}/download`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const pdfBlob = await response.blob()

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
   * Update customer details on invoice
   */
  const updateCustomerDetails = async (
    invoiceId: string,
    customerDetails: Partial<Invoice>
  ) => {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId)
      await updateDoc(invoiceRef, {
        ...customerDetails,
        updatedAt: Timestamp.now()
      })

      // Reload invoices
      await loadInvoices()
    } catch (err) {
      console.error('Error updating customer details:', err)
      throw new Error('Nepodařilo se aktualizovat údaje zákazníka')
    }
  }

  return {
    invoices,
    loading,
    error,
    createInvoiceFromPayment,
    downloadInvoice,
    updateCustomerDetails,
    refresh: loadInvoices
  }
}

/**
 * Get payment method display name
 */
function getPaymentMethodName(method: string): string {
  switch (method) {
    case 'card':
      return 'Platební karta'
    case 'bank_transfer':
      return 'Bankovní převod'
    default:
      return 'Online platba'
  }
}

