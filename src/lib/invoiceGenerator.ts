import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Invoice, InvoiceItem } from '@/types/subscription'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

/**
 * Generate PDF invoice
 * Creates a professional Czech invoice with all required fields
 * NOTE: This function is deprecated - use server-side endpoint /api/invoices/[invoiceId]/download instead
 */
export async function generateInvoicePDF(invoice: Invoice): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Use Helvetica font (built-in, supports Czech characters)
  doc.setFont('helvetica', 'normal')

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, options)
  }

  // Colors
  const primaryColor: [number, number, number] = [219, 39, 119] // Rose-600
  const grayColor: [number, number, number] = [107, 114, 128] // Gray-500
  const darkColor: [number, number, number] = [17, 24, 39] // Gray-900

  let yPos = 20

  // Header - Company Logo/Name
  doc.setFontSize(24)
  doc.setTextColor(...primaryColor)
  doc.setFont('helvetica', 'bold')
  addText('SvatBot.cz', 20, yPos)

  yPos += 5
  doc.setFontSize(10)
  doc.setTextColor(...grayColor)
  doc.setFont('helvetica', 'normal')
  addText('Váš svatební plánovač', 20, yPos)

  // Invoice title and number
  yPos = 20
  doc.setFontSize(28)
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  addText('FAKTURA', 150, yPos, { align: 'right' })

  yPos += 10
  doc.setFontSize(12)
  doc.setTextColor(...grayColor)
  doc.setFont('helvetica', 'normal')
  addText(`Číslo: ${invoice.invoiceNumber}`, 150, yPos, { align: 'right' })

  yPos = 50

  // Supplier info (left column)
  doc.setFontSize(11)
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  addText('Dodavatel:', 20, yPos)

  yPos += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  addText(invoice.supplierName, 20, yPos)
  yPos += 5
  addText(invoice.supplierAddress, 20, yPos)
  yPos += 5
  if (invoice.supplierZip) {
    addText(invoice.supplierZip, 20, yPos)
    yPos += 5
  }
  if (invoice.supplierCity) {
    addText(invoice.supplierCity, 20, yPos)
    yPos += 5
  }
  if (invoice.supplierCountry) {
    addText(invoice.supplierCountry, 20, yPos)
    yPos += 5
  }
  yPos += 2
  addText(`IČ: ${invoice.supplierICO}`, 20, yPos)
  if (invoice.supplierDIC) {
    yPos += 5
    addText(`DIČ: ${invoice.supplierDIC}`, 20, yPos)
  } else {
    yPos += 5
    doc.setTextColor(...grayColor)
    addText('Neplátce DPH', 20, yPos)
    doc.setTextColor(...darkColor)
  }

  // Customer info (right column)
  yPos = 50
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  addText('Odběratel:', 120, yPos)

  yPos += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  addText(invoice.customerName || invoice.userEmail, 120, yPos)
  if (invoice.customerAddress) {
    yPos += 5
    addText(invoice.customerAddress, 120, yPos)
  }
  if (invoice.customerZip && invoice.customerCity) {
    yPos += 5
    addText(`${invoice.customerZip} ${invoice.customerCity}`, 120, yPos)
  }
  if (invoice.customerCountry) {
    yPos += 5
    addText(invoice.customerCountry, 120, yPos)
  }
  if (invoice.customerICO) {
    yPos += 7
    addText(`IČ: ${invoice.customerICO}`, 120, yPos)
  }
  if (invoice.customerDIC) {
    yPos += 5
    addText(`DIČ: ${invoice.customerDIC}`, 120, yPos)
  }

  // Invoice dates
  yPos = 110
  doc.setFillColor(249, 250, 251) // Gray-50
  doc.rect(20, yPos, 170, 25, 'F')

  yPos += 7
  doc.setFontSize(10)
  doc.setTextColor(...grayColor)
  addText('Datum vystavení:', 25, yPos)
  addText('Datum splatnosti:', 85, yPos)
  addText('Datum zdanit. plnění:', 145, yPos)

  yPos += 6
  doc.setTextColor(...darkColor)
  doc.setFont('helvetica', 'bold')
  addText(formatDate(invoice.issueDate), 25, yPos)
  addText(formatDate(invoice.dueDate), 85, yPos)
  addText(formatDate(invoice.taxableDate), 145, yPos)

  yPos += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  addText(`Variabilní symbol: ${invoice.variableSymbol}`, 25, yPos)

  // Items table
  yPos += 10

  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${formatCurrency(item.unitPrice)} ${invoice.currency}`,
    `${item.vatRate}%`,
    `${formatCurrency(item.total)} ${invoice.currency}`
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Položka', 'Množství', 'Jedn. cena', 'DPH', 'Celkem']],
    body: tableData,
    theme: 'striped',
    styles: {
      font: 'helvetica',
      fontStyle: 'normal'
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      font: 'helvetica'
    },
    bodyStyles: {
      fontSize: 10,
      textColor: darkColor,
      font: 'helvetica'
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  })

  // Get Y position after table
  yPos = (doc as any).lastAutoTable.finalY + 10

  // Summary box
  const summaryX = 120
  const summaryWidth = 70
  doc.setFillColor(249, 250, 251)
  doc.rect(summaryX, yPos, summaryWidth, 40, 'F')

  yPos += 7
  doc.setFontSize(10)
  doc.setTextColor(...grayColor)
  addText('Základ:', summaryX + 5, yPos)
  doc.setTextColor(...darkColor)
  addText(`${formatCurrency(invoice.subtotal)} ${invoice.currency}`, summaryX + summaryWidth - 5, yPos, { align: 'right' })

  yPos += 6
  doc.setTextColor(...grayColor)
  addText(`DPH (${invoice.vatRate}%):`, summaryX + 5, yPos)
  doc.setTextColor(...darkColor)
  addText(`${formatCurrency(invoice.vatAmount)} ${invoice.currency}`, summaryX + summaryWidth - 5, yPos, { align: 'right' })

  yPos += 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  addText('Celkem zaplaceno:', summaryX + 5, yPos)
  doc.setFontSize(14)
  addText(`${formatCurrency(invoice.total)} ${invoice.currency}`, summaryX + summaryWidth - 5, yPos, { align: 'right' })

  // Payment info
  yPos += 15
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  addText('Platební údaje:', 20, yPos)

  yPos += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  addText(`Způsob platby: ${invoice.paymentMethod}`, 20, yPos)

  if (invoice.status === 'paid' && invoice.paidAt) {
    yPos += 5
    doc.setTextColor(34, 197, 94) // Green-500
    doc.setFont('helvetica', 'bold')
    addText(`✓ ZAPLACENO dne ${formatDate(invoice.paidAt)}`, 20, yPos)
  }

  if (invoice.supplierBankAccount) {
    yPos += 5
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'normal')
    addText(`Číslo účtu: ${invoice.supplierBankAccount}`, 20, yPos)
  }

  if (invoice.supplierIBAN) {
    yPos += 5
    addText(`IBAN: ${invoice.supplierIBAN}`, 20, yPos)
  }

  // Notes
  if (invoice.notes) {
    yPos += 10
    doc.setFontSize(9)
    doc.setTextColor(...grayColor)
    addText('Poznámka:', 20, yPos)
    yPos += 5
    const splitNotes = doc.splitTextToSize(invoice.notes, 170)
    addText(splitNotes, 20, yPos)
  }

  // Footer
  const footerY = 280
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  addText('Děkujeme za Vaši důvěru!', 105, footerY, { align: 'center' })
  addText(`${invoice.supplierEmail} | ${invoice.supplierPhone || 'svatbot.cz'}`, 105, footerY + 4, { align: 'center' })

  // Return PDF as Blob
  return doc.output('blob')
}

/**
 * Format date to Czech format (DD.MM.YYYY)
 */
function formatDate(date: Date): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

/**
 * Format currency with thousands separator
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Generate invoice number
 * Format: YYYYMM-NNNN (e.g., 202511-0001)
 * This is a placeholder - actual number should be generated server-side with proper sequencing
 *
 * IMPORTANT: This function should NOT be used directly for creating invoices.
 * Use the server-side API endpoint which ensures proper sequential numbering.
 */
export function generateInvoiceNumber(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  // This is just a placeholder - real implementation is server-side
  const placeholder = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${year}${month}-${placeholder}`
}

/**
 * Generate variable symbol from invoice number
 */
export function generateVariableSymbol(invoiceNumber: string): string {
  // Remove dashes and take last 10 digits
  return invoiceNumber.replace(/-/g, '').slice(-10)
}

