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
 */
export async function generateInvoicePDF(invoice: Invoice): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Helper function to add text without spacing issues
  const addText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, { ...options, charSpace: 0 })
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
  addText('Vas svatebni planovac', 20, yPos)

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
  addText(`Cislo: ${invoice.invoiceNumber}`, 150, yPos, { align: 'right' })

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
  addText(`${invoice.supplierZip} ${invoice.supplierCity}`, 20, yPos)
  yPos += 5
  addText(invoice.supplierCountry, 20, yPos)
  yPos += 7
  addText(`ICO: ${invoice.supplierICO}`, 20, yPos)
  if (invoice.supplierDIC) {
    yPos += 5
    addText(`DIC: ${invoice.supplierDIC}`, 20, yPos)
  } else {
    yPos += 5
    doc.setTextColor(...grayColor)
    addText('Nejsme platci DPH', 20, yPos)
    doc.setTextColor(...darkColor)
  }

  // Customer info (right column)
  yPos = 50
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  addText('Odberatel:', 120, yPos)

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
    addText(`ICO: ${invoice.customerICO}`, 120, yPos)
  }
  if (invoice.customerDIC) {
    yPos += 5
    addText(`DIC: ${invoice.customerDIC}`, 120, yPos)
  }

  // Invoice dates
  yPos = 110
  doc.setFillColor(249, 250, 251) // Gray-50
  doc.rect(20, yPos, 170, 25, 'F')

  yPos += 7
  doc.setFontSize(10)
  doc.setTextColor(...grayColor)
  addText('Datum vystaveni:', 25, yPos)
  addText('Datum splatnosti:', 85, yPos)
  addText('Datum zdanit. plneni:', 145, yPos)

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
  addText(`Variabilni symbol: ${invoice.variableSymbol}`, 25, yPos)

  // Items table
  yPos += 10

  // Helper to remove diacritics for PDF rendering
  const removeDiacritics = (str: string) => {
    return str
      .replace(/[áàâä]/g, 'a')
      .replace(/[ÁÀÂÄ]/g, 'A')
      .replace(/[éèêë]/g, 'e')
      .replace(/[ÉÈÊË]/g, 'E')
      .replace(/[íìîï]/g, 'i')
      .replace(/[ÍÌÎÏ]/g, 'I')
      .replace(/[óòôö]/g, 'o')
      .replace(/[ÓÒÔÖ]/g, 'O')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ÚÙÛÜ]/g, 'U')
      .replace(/[ýÿ]/g, 'y')
      .replace(/[ÝŸ]/g, 'Y')
      .replace(/č/g, 'c')
      .replace(/Č/g, 'C')
      .replace(/ď/g, 'd')
      .replace(/Ď/g, 'D')
      .replace(/ě/g, 'e')
      .replace(/Ě/g, 'E')
      .replace(/ň/g, 'n')
      .replace(/Ň/g, 'N')
      .replace(/ř/g, 'r')
      .replace(/Ř/g, 'R')
      .replace(/š/g, 's')
      .replace(/Š/g, 'S')
      .replace(/ť/g, 't')
      .replace(/Ť/g, 'T')
      .replace(/ů/g, 'u')
      .replace(/Ů/g, 'U')
      .replace(/ž/g, 'z')
      .replace(/Ž/g, 'Z')
  }

  const tableData = invoice.items.map(item => [
    removeDiacritics(item.description),
    item.quantity.toString(),
    `${formatCurrency(item.unitPrice)} ${invoice.currency}`,
    `${item.vatRate}%`,
    `${formatCurrency(item.total)} ${invoice.currency}`
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Polozka', 'Mnozstvi', 'Jedn. cena', 'DPH', 'Celkem']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 10,
      textColor: darkColor
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
  addText('Zaklad:', summaryX + 5, yPos)
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
  addText('Celkem k uhrade:', summaryX + 5, yPos)
  yPos += 6
  doc.setFontSize(14)
  addText(`${formatCurrency(invoice.total)} ${invoice.currency}`, summaryX + summaryWidth - 5, yPos, { align: 'right' })

  // Payment info
  yPos += 15
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  addText('Platebni udaje:', 20, yPos)

  yPos += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  addText(`Zpusob platby: ${invoice.paymentMethod}`, 20, yPos)

  if (invoice.status === 'paid' && invoice.paidAt) {
    yPos += 5
    doc.setTextColor(34, 197, 94) // Green-500
    doc.setFont('helvetica', 'bold')
    addText(`* ZAPLACENO dne ${formatDate(invoice.paidAt)}`, 20, yPos)
  }

  if (invoice.supplierBankAccount) {
    yPos += 5
    doc.setTextColor(...grayColor)
    doc.setFont('helvetica', 'normal')
    addText(`Cislo uctu: ${invoice.supplierBankAccount}`, 20, yPos)
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
    addText('Poznamka:', 20, yPos)
    yPos += 5
    const splitNotes = doc.splitTextToSize(invoice.notes, 170)
    addText(splitNotes, 20, yPos)
  }

  // Footer
  const footerY = 280
  doc.setFontSize(8)
  doc.setTextColor(...grayColor)
  addText('Dekujeme za Vasi duveru!', 105, footerY, { align: 'center' })
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
 * Format: YYYYMMDD-XXXX (e.g., 20250107-0001)
 */
export function generateInvoiceNumber(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${year}${month}${day}-${random}`
}

/**
 * Generate variable symbol from invoice number
 */
export function generateVariableSymbol(invoiceNumber: string): string {
  // Remove dashes and take last 10 digits
  return invoiceNumber.replace(/-/g, '').slice(-10)
}

