import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      testerName,
      frontPage,
      aiCoach,
      quickActions,
      taskManagement,
      guestManagement,
      seatingPlan,
      vendorManagement,
      weddingChecklist,
      budgetTracking,
      timelinePlanning,
      marketplace,
      moodboard,
      weddingDayTimeline,
      foodDrinks,
      musicPlaylist,
      shoppingList,
      accommodation,
      weddingWebsite,
      overallDesign,
      generalComment
    } = body

    if (!testerName) {
      return NextResponse.json(
        { error: 'Jméno testera je povinné' },
        { status: 400 }
      )
    }

    const docRef = await adminDb.collection('testFeedback').add({
      testerName,
      frontPage,
      aiCoach,
      quickActions,
      taskManagement,
      guestManagement,
      seatingPlan,
      vendorManagement,
      weddingChecklist,
      budgetTracking,
      timelinePlanning,
      marketplace,
      moodboard,
      weddingDayTimeline,
      foodDrinks,
      musicPlaylist,
      shoppingList,
      accommodation,
      weddingWebsite,
      overallDesign,
      generalComment,
      createdAt: new Date(),
      status: 'new'
    })

    return NextResponse.json({ 
      success: true,
      message: 'Odpovědi byly úspěšně odeslány',
      id: docRef.id
    })

  } catch (error) {
    console.error('Error saving test feedback:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se uložit odpovědi' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const snapshot = await adminDb.collection('testFeedback').orderBy('createdAt', 'desc').get()

    const feedbackList = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt?._seconds ? data.createdAt._seconds * 1000 : Date.now())
      }
    })

    return NextResponse.json({ 
      success: true,
      feedback: feedbackList
    })

  } catch (error) {
    console.error('Error fetching test feedback:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se načíst odpovědi' },
      { status: 500 }
    )
  }
}
