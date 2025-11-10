import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Roboto_Regular_base64, Roboto_Bold_base64 } from '@/lib/fonts'

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
 * Uses Roboto font which supports Czech characters with diacritics
 */
async function generateInvoicePDFServer(invoice: any): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  // Add Roboto fonts to jsPDF
  doc.addFileToVFS('Roboto-Regular.ttf', Roboto_Regular_base64)
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')

  doc.addFileToVFS('Roboto-Bold.ttf', Roboto_Bold_base64)
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')

  // Set Roboto as default font
  doc.setFont('Roboto', 'normal')

  // Colors
  const primaryColor: [number, number, number] = [99, 102, 241] // Indigo-500
  const darkColor: [number, number, number] = [17, 24, 39] // Gray-900
  const grayColor: [number, number, number] = [107, 114, 128] // Gray-500

  // Helper function to add text (no need to clean text anymore - Roboto supports Czech!)
  const addText = (text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
    doc.text(text, x, y, options)
  }

  // Header with logo/brand
  let yPos = 20
  doc.setFontSize(24)
  doc.setFont('Roboto', 'bold')
  doc.setTextColor(...primaryColor)
  addText('SvatBot.cz', 20, yPos)

  doc.setFontSize(10)
  doc.setFont('Roboto', 'normal')
  doc.setTextColor(...grayColor)
  yPos += 6
  addText('Váš svatební plánovač', 20, yPos)

  // Invoice title and details box
  yPos += 15
  doc.setFontSize(20)
  doc.setFont('Roboto', 'bold')
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
  doc.setFont('Roboto', 'bold')
  doc.setTextColor(...grayColor)
  addText('Číslo faktury:', rightX + 3, boxY)
  doc.setFont('Roboto', 'normal')
  doc.setTextColor(...darkColor)
  addText(invoice.invoiceNumber || 'N/A', rightX + boxWidth - 3, boxY, { align: 'right' })

  boxY += 6
  doc.setFont('Roboto', 'bold')
  doc.setTextColor(...grayColor)
  addText('Datum vystavení:', rightX + 3, boxY)
  doc.setFont('Roboto', 'normal')
  doc.setTextColor(...darkColor)
  const issueDate = invoice.issueDate?.toDate?.() || invoice.issuedAt?.toDate?.() || new Date()
  addText(formatDate(issueDate), rightX + boxWidth - 3, boxY, { align: 'right' })

  boxY += 6
  doc.setFont('Roboto', 'bold')
  doc.setTextColor(...grayColor)
  addText('Variabilní symbol:', rightX + 3, boxY)
  doc.setFont('Roboto', 'normal')
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
  doc.setFont('Roboto', 'bold')
  doc.setTextColor(...darkColor)
  addText('Dodavatel:', leftColX, supplierY)

  supplierY += 6
  doc.setFontSize(10)
  doc.setFont('Roboto', 'normal')
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
    addText(`IČ: ${invoice.supplierICO}`, leftColX, supplierY)
    supplierY += 5
  }

  if (invoice.supplierDIC) {
    addText(`DIČ: ${invoice.supplierDIC}`, leftColX, supplierY)
    supplierY += 5
  } else {
    addText('Neplátce DPH', leftColX, supplierY)
    supplierY += 5
  }

  // Customer info (right column)
  let customerY = yPos
  doc.setFontSize(11)
  doc.setFont('Roboto', 'bold')
  doc.setTextColor(...darkColor)
  addText('Odběratel:', rightColX, customerY)

  customerY += 6
  doc.setFontSize(10)
  doc.setFont('Roboto', 'normal')
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
    item.description || item.name || 'N/A',
    item.quantity?.toString() || '1',
    `${formatCurrency(item.unitPrice || 0)} ${invoice.currency || 'CZK'}`,
    `${item.vatRate || 0}%`,
    `${formatCurrency(item.total || 0)} ${invoice.currency || 'CZK'}`
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Položka', 'Množství', 'Jedn. cena', 'DPH', 'Celkem']],
    body: tableData,
    theme: 'striped',
    styles: {
      font: 'Roboto',
      fontStyle: 'normal'
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      font: 'Roboto'
    },
    bodyStyles: {
      fontSize: 10,
      textColor: darkColor,
      font: 'Roboto'
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
  doc.setFont('Roboto', 'normal')
  doc.setTextColor(...grayColor)
  addText('Základ:', summaryX + 5, yPos)
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
  doc.setFont('Roboto', 'bold')
  doc.setTextColor(...primaryColor)
  addText('Celkem k úhradě:', summaryX + 5, yPos)
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
  doc.setFont('Roboto', 'bold')
  doc.setTextColor(...darkColor)
  addText('Platební údaje:', 25, yPos)

  yPos += 6
  doc.setFont('Roboto', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  addText(`Způsob platby: ${invoice.paymentMethod || 'Platební karta'}`, 25, yPos)

  if (invoice.status === 'paid' && invoice.paidAt) {
    yPos += 5
    doc.setFillColor(220, 252, 231) // Green-100
    doc.rect(25, yPos - 3, paymentBoxWidth - 10, 8, 'F')
    doc.setTextColor(22, 163, 74) // Green-600
    doc.setFont('Roboto', 'bold')
    doc.setFontSize(10)
    const paidDate = invoice.paidAt?.toDate?.() || new Date()
    addText(`ZAPLACENO dne ${formatDate(paidDate)}`, 28, yPos + 2)
  }

  yPos += paymentBoxHeight - 10

  // Footer
  const footerY = 280
  doc.setFontSize(8)
  doc.setFont('Roboto', 'normal')
  doc.setTextColor(...grayColor)
  addText('Děkujeme za Vaši důvěru!', 105, footerY, { align: 'center' })
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

