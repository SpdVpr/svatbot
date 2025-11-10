import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Server-side PDF generation endpoint
 * Generates invoice PDF with proper font support for Czech characters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params

    // Get invoice from Firestore
    const adminDb = getAdminDb()
    const invoiceDoc = await adminDb.collection('invoices').doc(invoiceId).get()

    if (!invoiceDoc.exists) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const invoice = invoiceDoc.data()
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invalid invoice data' },
        { status: 400 }
      )
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDFServer(invoice)

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="faktura-${invoice.invoiceNumber}.pdf"`,
      },
    })

  } catch (error: any) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

/**
 * Generate PDF invoice on server-side
 * Uses Helvetica font which supports Latin Extended characters
 */
async function generateInvoicePDFServer(invoice: any): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  // Use Helvetica font (built-in, supports Czech characters)
  doc.setFont('helvetica', 'normal')

  // Colors
  const primaryColor: [number, number, number] = [99, 102, 241] // Indigo-500
  const darkColor: [number, number, number] = [17, 24, 39] // Gray-900
  const grayColor: [number, number, number] = [107, 114, 128] // Gray-500

  // Helper function to remove Czech diacritics for PDF compatibility
  const cleanText = (text: string) => text
    .replace(/č/g, 'c').replace(/Č/g, 'C')
    .replace(/ď/g, 'd').replace(/Ď/g, 'D')
    .replace(/ě/g, 'e').replace(/Ě/g, 'E')
    .replace(/ň/g, 'n').replace(/Ň/g, 'N')
    .replace(/ř/g, 'r').replace(/Ř/g, 'R')
    .replace(/š/g, 's').replace(/Š/g, 'S')
    .replace(/ť/g, 't').replace(/Ť/g, 'T')
    .replace(/ů/g, 'u').replace(/Ů/g, 'U')
    .replace(/ý/g, 'y').replace(/Ý/g, 'Y')
    .replace(/ž/g, 'z').replace(/Ž/g, 'Z')
    .replace(/á/g, 'a').replace(/Á/g, 'A')
    .replace(/é/g, 'e').replace(/É/g, 'E')
    .replace(/í/g, 'i').replace(/Í/g, 'I')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ú/g, 'u').replace(/Ú/g, 'U')

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
    doc.text(cleanText(text), x, y, options)
  }

  // Header with logo/brand
  let yPos = 20
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  addText('SvatBot.cz', 20, yPos)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  yPos += 6
  addText('Vas svatebni planovac', 20, yPos)

  // Invoice title and details box
  yPos += 15
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  addText('FAKTURA', 20, yPos)

  // Invoice details box (right side)
  const rightX = 115
  const boxWidth = 75
  const boxHeight = 25

  // Draw box
  doc.setFillColor(249, 250, 251) // Gray-50
  doc.rect(rightX, yPos - 5, boxWidth, boxHeight, 'F')
  doc.setDrawColor(...grayColor)
  doc.setLineWidth(0.3)
  doc.rect(rightX, yPos - 5, boxWidth, boxHeight)

  // Invoice details inside box
  let boxY = yPos
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...grayColor)
  addText('Cislo faktury:', rightX + 3, boxY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkColor)
  addText(invoice.invoiceNumber || 'N/A', rightX + boxWidth - 3, boxY, { align: 'right' })

  boxY += 6
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...grayColor)
  addText('Datum vystaveni:', rightX + 3, boxY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkColor)
  const issueDate = invoice.issueDate?.toDate?.() || invoice.issuedAt?.toDate?.() || new Date()
  addText(formatDate(issueDate), rightX + boxWidth - 3, boxY, { align: 'right' })

  boxY += 6
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...grayColor)
  addText('Variabilni symbol:', rightX + 3, boxY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkColor)
  addText(invoice.variableSymbol || 'N/A', rightX + boxWidth - 3, boxY, { align: 'right' })

  yPos += boxHeight + 5

  // Supplier and Customer info side by side
  yPos += 10
  const leftColX = 20
  const rightColX = 110

  // Supplier info (left column)
  let supplierY = yPos
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  addText('Dodavatel:', leftColX, supplierY)

  supplierY += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkColor)
  addText(invoice.supplierName || 'SvatBot.cz', leftColX, supplierY)

  supplierY += 5
  doc.setTextColor(...grayColor)
  // Build address string - only include non-empty parts
  if (invoice.supplierAddress) {
    addText(invoice.supplierAddress, leftColX, supplierY)
    supplierY += 5
  }

  // Add city and zip on same line if both exist
  const cityZipParts = []
  if (invoice.supplierZip) cityZipParts.push(invoice.supplierZip)
  if (invoice.supplierCity) cityZipParts.push(invoice.supplierCity)
  if (cityZipParts.length > 0) {
    addText(cityZipParts.join(' '), leftColX, supplierY)
    supplierY += 5
  }

  if (invoice.supplierCountry) {
    addText(invoice.supplierCountry, leftColX, supplierY)
    supplierY += 5
  }

  if (invoice.supplierICO) {
    addText(`IC: ${invoice.supplierICO}`, leftColX, supplierY)
    supplierY += 5
  }

  if (invoice.supplierDIC) {
    addText(`DIC: ${invoice.supplierDIC}`, leftColX, supplierY)
    supplierY += 5
  } else {
    addText('Neplatce DPH', leftColX, supplierY)
    supplierY += 5
  }

  // Customer info (right column)
  let customerY = yPos
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  addText('Odberatel:', rightColX, customerY)

  customerY += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkColor)
  addText(invoice.customerName || invoice.userEmail || 'N/A', rightColX, customerY)

  customerY += 5
  doc.setTextColor(...grayColor)
  if (invoice.customerEmail && invoice.customerEmail !== invoice.customerName) {
    addText(invoice.customerEmail, rightColX, customerY)
    customerY += 5
  }

  // Use the larger Y position
  yPos = Math.max(supplierY, customerY)

  // Items table
  yPos += 10

  const tableData = (invoice.items || []).map((item: any) => [
    cleanText(item.description || item.name || 'N/A'),
    item.quantity?.toString() || '1',
    `${formatCurrency(item.unitPrice || 0)} ${invoice.currency || 'CZK'}`,
    `${item.vatRate || 0}%`,
    `${formatCurrency(item.total || 0)} ${invoice.currency || 'CZK'}`
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Polozka', 'Mnozstvi', 'Jedn. cena', 'DPH', 'Celkem']],
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
    }
  })

  // Get Y position after table
  yPos = (doc as any).lastAutoTable.finalY + 10

  // Summary box with better styling
  const summaryX = 125
  const summaryWidth = 65
  const summaryHeight = 35

  // Draw box with background
  doc.setFillColor(249, 250, 251) // Gray-50
  doc.rect(summaryX, yPos, summaryWidth, summaryHeight, 'F')
  doc.setDrawColor(...grayColor)
  doc.setLineWidth(0.3)
  doc.rect(summaryX, yPos, summaryWidth, summaryHeight)

  yPos += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  addText('Zaklad:', summaryX + 5, yPos)
  doc.setTextColor(...darkColor)
  addText(`${formatCurrency(invoice.subtotal || 0)} ${invoice.currency || 'CZK'}`, summaryX + summaryWidth - 5, yPos, { align: 'right' })

  yPos += 6
  doc.setTextColor(...grayColor)
  addText(`DPH (${invoice.vatRate || 0}%):`, summaryX + 5, yPos)
  doc.setTextColor(...darkColor)
  addText(`${formatCurrency(invoice.vatAmount || 0)} ${invoice.currency || 'CZK'}`, summaryX + summaryWidth - 5, yPos, { align: 'right' })

  // Separator line
  yPos += 4
  doc.setDrawColor(...grayColor)
  doc.setLineWidth(0.3)
  doc.line(summaryX + 5, yPos, summaryX + summaryWidth - 5, yPos)

  yPos += 6
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  addText('Celkem k uhrade:', summaryX + 5, yPos)
  doc.setFontSize(13)
  addText(`${formatCurrency(invoice.total || 0)} ${invoice.currency || 'CZK'}`, summaryX + summaryWidth - 5, yPos, { align: 'right' })

  yPos += summaryHeight - 18

  // Payment info box
  yPos += 15
  const paymentBoxWidth = 170
  const paymentBoxHeight = invoice.status === 'paid' ? 20 : 15

  doc.setFillColor(249, 250, 251) // Gray-50
  doc.rect(20, yPos, paymentBoxWidth, paymentBoxHeight, 'F')
  doc.setDrawColor(...grayColor)
  doc.setLineWidth(0.3)
  doc.rect(20, yPos, paymentBoxWidth, paymentBoxHeight)

  yPos += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  addText('Platebni udaje:', 25, yPos)

  yPos += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  addText(`Zpusob platby: ${cleanText(invoice.paymentMethod || 'Platebni karta')}`, 25, yPos)

  if (invoice.status === 'paid' && invoice.paidAt) {
    yPos += 5
    doc.setFillColor(220, 252, 231) // Green-100
    doc.rect(25, yPos - 3, paymentBoxWidth - 10, 8, 'F')
    doc.setTextColor(22, 163, 74) // Green-600
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    const paidDate = invoice.paidAt?.toDate?.() || new Date()
    addText(`ZAPLACENO dne ${formatDate(paidDate)}`, 28, yPos + 2)
  }

  yPos += paymentBoxHeight - 10

  // Footer
  const footerY = 280
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  addText('Dekujeme za Vasi duveru!', 105, footerY, { align: 'center' })
  addText(`${invoice.supplierEmail || 'info@svatbot.cz'} | svatbot.cz`, 105, footerY + 4, { align: 'center' })

  // Return PDF as Buffer
  const pdfArrayBuffer = doc.output('arraybuffer')
  return Buffer.from(pdfArrayBuffer)
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

