import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      vendorId, 
      vendorName, 
      vendorEmail,
      customerName, 
      customerEmail, 
      customerPhone, 
      weddingDate, 
      message 
    } = body

    // Validate required fields
    if (!vendorId || !vendorName || !vendorEmail || !customerName || !customerEmail || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save inquiry to Firestore
    const inquiriesRef = collection(db, 'vendorInquiries')
    await addDoc(inquiriesRef, {
      vendorId,
      vendorName,
      vendorEmail,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      weddingDate: weddingDate || '',
      message,
      status: 'pending',
      createdAt: serverTimestamp(),
      readByVendor: false
    })

    // Call Firebase Function to send emails
    const functionUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 
                       'https://europe-west1-svatbot-app.cloudfunctions.net'
    
    try {
      const response = await fetch(`${functionUrl}/sendVendorContactEmails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorEmail,
          vendorName,
          customerName,
          customerEmail,
          customerPhone: customerPhone || '',
          weddingDate: weddingDate || '',
          message
        })
      })

      if (!response.ok) {
        console.error('Failed to send emails via Firebase Function:', await response.text())
      }
    } catch (emailError) {
      console.error('Error calling Firebase Function for emails:', emailError)
      // Don't fail the request if email sending fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Poptávka byla úspěšně odeslána' 
    })

  } catch (error) {
    console.error('Error processing vendor contact:', error)
    return NextResponse.json(
      { error: 'Failed to process contact request' },
      { status: 500 }
    )
  }
}

