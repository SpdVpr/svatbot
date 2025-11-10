import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'

/**
 * Delete invoice (admin only)
 */
export async function DELETE(
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

    // Delete the invoice
    await adminDb.collection('invoices').doc(invoiceId).delete()

    console.log(`✅ Invoice deleted: ${invoiceId}`)

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}

