import { NextRequest, NextResponse } from 'next/server'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { initializeApp, getApps } from 'firebase/app'

// Initialize Firebase if not already initialized
if (getApps().length === 0) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, role, secretKey } = body

    if (!userId || !role || !secretKey) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: userId, role, secretKey' },
        { status: 400 }
      )
    }

    // Call Firebase Function to set admin role
    const functions = getFunctions(undefined, 'europe-west1')
    const setAdminRoleFunction = httpsCallable(functions, 'setAdminRole')
    
    const result = await setAdminRoleFunction({
      userId,
      role,
      secretKey
    })

    const data = result.data as { success: boolean; message: string }

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message
      })
    } else {
      return NextResponse.json(
        { success: false, message: data.message },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error setting admin role:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to set admin role'
      },
      { status: 500 }
    )
  }
}

