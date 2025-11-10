import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { getNextInvoiceNumber, generateVariableSymbol } from '@/lib/invoiceNumbering'

/**
 * Create Test Invoice
 * 
 * This endpoint creates a test invoice for development/testing purposes
 * without requiring a real payment transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail } = body

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing userId or userEmail' },
        { status: 400 }
      )
    }

    const adminDb = getAdminDb()
    const now = new Date()
    const invoiceNumber = await getNextInvoiceNumber(now)
    const variableSymbol = generateVariableSymbol(invoiceNumber)

    // Company info for SvatBot.cz (only include defined values)
    const supplierInfo = {
      supplierName: 'SvatBot.cz',
      supplierAddress: 'Michal Vesecky, Zapska 1149, Nehvizdy',
      supplierCity: '',
      supplierZip: '25081',
      supplierCountry: '',
      supplierICO: '88320090',
      supplierEmail: 'info@svatbot.cz'
    }

    // Create test invoice
    const invoice = {
      invoiceNumber,
      variableSymbol,
      userId,
      userEmail,
      
      // Customer details
      customerName: userEmail,
      customerEmail: userEmail,
      
      // Dates
      issueDate: Timestamp.fromDate(now),
      dueDate: Timestamp.fromDate(now),
      taxableDate: Timestamp.fromDate(now),
      
      // Items
      items: [
        {
          description: 'Premium předplatné - testovací',
          quantity: 1,
          unitPrice: 299,
          vatRate: 0,
          total: 299
        }
      ],
      
      // Amounts
      subtotal: 299,
      vatRate: 0,
      vatAmount: 0,
      total: 299,
      currency: 'CZK',
      
      // Payment info
      paymentMethod: 'Platební karta',
      status: 'paid',
      paidAt: Timestamp.fromDate(now),
      
      // Supplier info
      ...supplierInfo,
      
      // Metadata
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      
      // Mark as test invoice
      isTest: true
    }

    // Save to Firestore
    const invoiceRef = adminDb.collection('invoices').doc()
    await invoiceRef.set(invoice)

    console.log('✅ Test invoice created:', invoiceRef.id)

    return NextResponse.json({
      success: true,
      invoiceId: invoiceRef.id,
      invoiceNumber,
      message: 'Test invoice created successfully'
    })

  } catch (error: any) {
    console.error('❌ Error creating test invoice:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create test invoice' },
      { status: 500 }
    )
  }
}

