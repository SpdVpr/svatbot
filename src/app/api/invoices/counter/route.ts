import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * Get invoice counter for a specific period
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') // Format: YYYYMM

    if (!period || !/^\d{6}$/.test(period)) {
      return NextResponse.json(
        { error: 'Invalid period format. Use YYYYMM (e.g., 202511)' },
        { status: 400 }
      )
    }

    const adminDb = getAdminDb()
    const counterDoc = await adminDb.collection('invoiceCounters').doc(period).get()

    if (!counterDoc.exists) {
      return NextResponse.json({
        period,
        lastNumber: 0,
        exists: false
      })
    }

    const data = counterDoc.data()
    return NextResponse.json({
      period,
      lastNumber: data?.lastNumber || 0,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
      exists: true
    })

  } catch (error: any) {
    console.error('Error getting invoice counter:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get counter' },
      { status: 500 }
    )
  }
}

/**
 * Set invoice counter for a specific period (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { period, lastNumber } = body

    // Validate period format (YYYYMM)
    if (!period || !/^\d{6}$/.test(period)) {
      return NextResponse.json(
        { error: 'Invalid period format. Use YYYYMM (e.g., 202511)' },
        { status: 400 }
      )
    }

    // Validate lastNumber
    if (typeof lastNumber !== 'number' || lastNumber < 0) {
      return NextResponse.json(
        { error: 'Invalid lastNumber. Must be a non-negative number' },
        { status: 400 }
      )
    }

    const adminDb = getAdminDb()
    const counterRef = adminDb.collection('invoiceCounters').doc(period)
    const counterDoc = await counterRef.get()

    if (counterDoc.exists) {
      // Update existing counter
      await counterRef.update({
        lastNumber,
        updatedAt: Timestamp.now()
      })
    } else {
      // Create new counter
      await counterRef.set({
        period,
        lastNumber,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    }

    console.log(`✅ Invoice counter set: ${period} -> ${lastNumber}`)

    return NextResponse.json({
      success: true,
      period,
      lastNumber,
      message: 'Counter updated successfully'
    })

  } catch (error: any) {
    console.error('Error setting invoice counter:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to set counter' },
      { status: 500 }
    )
  }
}

/**
 * Delete invoice counter for a specific period (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period')

    if (!period || !/^\d{6}$/.test(period)) {
      return NextResponse.json(
        { error: 'Invalid period format. Use YYYYMM (e.g., 202511)' },
        { status: 400 }
      )
    }

    const adminDb = getAdminDb()
    await adminDb.collection('invoiceCounters').doc(period).delete()

    console.log(`✅ Invoice counter deleted: ${period}`)

    return NextResponse.json({
      success: true,
      message: 'Counter deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting invoice counter:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete counter' },
      { status: 500 }
    )
  }
}

