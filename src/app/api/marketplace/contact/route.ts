import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Vendor contact API called')
    const body = await request.json()
    console.log('📧 Request body:', body)

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
      console.error('❌ Missing required fields:', { vendorId, vendorName, vendorEmail, customerName, customerEmail, message })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('💾 Saving inquiry to Firestore...')
    // Save inquiry to Firestore
    const inquiriesRef = collection(db, 'vendorInquiries')
    const docRef = await addDoc(inquiriesRef, {
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
    console.log('✅ Inquiry saved to Firestore with ID:', docRef.id)

    // Call Firebase Function to send emails
    console.log('📨 Calling Firebase Function to send emails...')
    const functionUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ||
                       'https://europe-west1-svatbot-app.cloudfunctions.net'

    console.log('🔗 Function URL:', `${functionUrl}/sendVendorContactEmails`)

    try {
      const emailPayload = {
        vendorEmail,
        vendorName,
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        weddingDate: weddingDate || '',
        message
      }
      console.log('📤 Email payload:', emailPayload)

      const response = await fetch(`${functionUrl}/sendVendorContactEmails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      })

      console.log('📬 Email function response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Failed to send emails via Firebase Function:', errorText)
      } else {
        const result = await response.json()
        console.log('✅ Emails sent successfully:', result)
      }
    } catch (emailError) {
      console.error('❌ Error calling Firebase Function for emails:', emailError)
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

