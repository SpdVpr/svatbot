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
    format: 'a4'
  })

  // Use Helvetica font (built-in, supports Czech characters)
  doc.setFont('helvetica', 'normal')

  // Colors
  const primaryColor: [number, number, number] = [99, 102, 241] // Indigo-500
  const darkColor: [number, number, number] = [17, 24, 39] // Gray-900
  const grayColor: [number, number, number] = [107, 114, 128] // Gray-500

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => {
    doc.text(text, x, y, options)
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
  addText('Váš svatební plánovač', 20, yPos)

  // Invoice title
  yPos += 15
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  addText('FAKTURA', 20, yPos)

  // Invoice details (right side)
  const rightX = 120
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  addText('Číslo:', rightX, yPos)
  doc.setFont('helvetica', 'normal')
  addText(invoice.invoiceNumber || 'N/A', rightX + 20, yPos)

  yPos += 6
  doc.setFont('helvetica', 'bold')
  addText('Datum vystavení:', rightX, yPos)
  doc.setFont('helvetica', 'normal')
  addText(formatDate(invoice.issuedAt?.toDate() || new Date()), rightX + 35, yPos)

  yPos += 6
  doc.setFont('helvetica', 'bold')
  addText('Variabilní symbol:', rightX, yPos)
  doc.setFont('helvetica', 'normal')
  addText(invoice.variableSymbol || 'N/A', rightX + 35, yPos)

  // Supplier info
  yPos += 15
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  addText('Dodavatel:', 20, yPos)

  yPos += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  addText(invoice.supplierName || 'SvatBot.cz', 20, yPos)

  yPos += 5
  const addressParts = []
  if (invoice.supplierAddress) addressParts.push(invoice.supplierAddress)
  if (invoice.supplierCity) addressParts.push(invoice.supplierCity)
  if (invoice.supplierZip) addressParts.push(invoice.supplierZip)
  if (invoice.supplierCountry) addressParts.push(invoice.supplierCountry)
  
  if (addressParts.length > 0) {
    addText(addressParts.join(', '), 20, yPos)
    yPos += 5
  }

  if (invoice.supplierICO) {
    addText(`IČ: ${invoice.supplierICO}`, 20, yPos)
    yPos += 5
  }

  if (invoice.supplierDIC) {
    addText(`DIČ: ${invoice.supplierDIC}`, 20, yPos)
    yPos += 5
  } else {
    addText('Neplátce DPH', 20, yPos)
    yPos += 5
  }

  // Customer info
  yPos += 5
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  addText('Odběratel:', 20, yPos)

  yPos += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  addText(invoice.customerName || 'N/A', 20, yPos)

  yPos += 5
  if (invoice.customerEmail) {
    addText(invoice.customerEmail, 20, yPos)
    yPos += 5
  }

  // Items table
  yPos += 10
  const tableData = (invoice.items || []).map((item: any) => [
    item.name || 'N/A',
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

  // Summary box
  const summaryX = 130
  const summaryWidth = 60
  doc.setDrawColor(...grayColor)
  doc.setLineWidth(0.5)
  doc.rect(summaryX, yPos, summaryWidth, 30)

  yPos += 7
  doc.setFontSize(10)
  doc.setTextColor(...grayColor)
  addText('Základ:', summaryX + 5, yPos)
  doc.setTextColor(...darkColor)
  addText(`${formatCurrency(invoice.subtotal || 0)} ${invoice.currency || 'CZK'}`, summaryX + summaryWidth - 5, yPos, { align: 'right' })

  yPos += 6
  doc.setTextColor(...grayColor)
  addText(`DPH (${invoice.vatRate || 0}%):`, summaryX + 5, yPos)
  doc.setTextColor(...darkColor)
  addText(`${formatCurrency(invoice.vatAmount || 0)} ${invoice.currency || 'CZK'}`, summaryX + summaryWidth - 5, yPos, { align: 'right' })

  yPos += 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  addText('Celkem zaplaceno:', summaryX + 5, yPos)
  doc.setFontSize(14)
  addText(`${formatCurrency(invoice.total || 0)} ${invoice.currency || 'CZK'}`, summaryX + summaryWidth - 5, yPos, { align: 'right' })

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
  addText(`Způsob platby: ${invoice.paymentMethod || 'Platební karta'}`, 20, yPos)

  if (invoice.status === 'paid' && invoice.paidAt) {
    yPos += 5
    doc.setTextColor(34, 197, 94) // Green-500
    doc.setFont('helvetica', 'bold')
    addText(`✓ ZAPLACENO dne ${formatDate(invoice.paidAt.toDate())}`, 20, yPos)
  }

  // Footer
  const footerY = 280
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
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

