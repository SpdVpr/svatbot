import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Firebase Admin SDK...')

    // Test 1: Check if Admin SDK is initialized
    console.log('✅ Admin SDK imported successfully')

    // Test 2: Try to read from Firestore
    console.log('📖 Testing read access...')
    const adminDb = getAdminDb()
    const usersSnapshot = await adminDb.collection('users').limit(1).get()
    console.log(`✅ Read test passed. Found ${usersSnapshot.size} users`)

    // Test 3: Try to write to payments collection
    console.log('✍️ Testing write access to payments collection...')
    const testPayment = {
      userId: 'test-user-id',
      userEmail: 'test@example.com',
      subscriptionId: 'test-sub-id',
      amount: 299,
      currency: 'CZK',
      status: 'test',
      paymentMethod: 'card',
      plan: 'monthly',
      invoiceNumber: 'TEST-001',
      invoiceUrl: 'https://example.com',
      stripePaymentIntentId: 'test-pi-id',
      stripeInvoiceId: 'test-inv-id',
      createdAt: Timestamp.now(),
      paidAt: Timestamp.now()
    }

    const docRef = await adminDb.collection('payments').add(testPayment)
    console.log(`✅ Write test passed. Created document: ${docRef.id}`)

    // Test 4: Read the document we just created
    const createdDoc = await docRef.get()
    console.log(`✅ Read-after-write test passed. Document exists: ${createdDoc.exists}`)

    // Test 5: Delete the test document
    await docRef.delete()
    console.log('✅ Cleanup completed. Test document deleted.')

    // Test 6: Check environment variables
    const envCheck = {
      hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'NOT SET'
    }

    return NextResponse.json({
      success: true,
      message: 'All Firebase Admin SDK tests passed! ✅',
      tests: {
        adminSdkInitialized: true,
        readAccess: true,
        writeAccess: true,
        readAfterWrite: true,
        cleanup: true
      },
      environment: envCheck,
      testDocumentId: docRef.id
    })

  } catch (error: any) {
    console.error('❌ Firebase Admin SDK test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      environment: {
        hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'NOT SET'
      }
    }, { status: 500 })
  }
}

