import { NextRequest, NextResponse } from 'next/server'
import { cleanupDuplicateNotifications, cleanupOldNotifications, cleanupAllUserNotifications } from '@/utils/cleanupNotifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, daysOld } = body
    
    let result
    
    switch (action) {
      case 'duplicates':
        // Clean up duplicate notifications
        result = await cleanupDuplicateNotifications(userId)
        break
        
      case 'old':
        // Clean up old notifications
        const days = daysOld || 30
        result = await cleanupOldNotifications(days, userId)
        break
        
      case 'all':
        // Clean up all notifications for user
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'userId is required for cleaning all notifications' },
            { status: 400 }
          )
        }
        result = await cleanupAllUserNotifications(userId)
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: duplicates, old, or all' },
          { status: 400 }
        )
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Notifications cleanup API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to cleanup notifications'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Notifications cleanup API',
    endpoints: {
      'POST /api/cleanup/notifications': {
        description: 'Clean up notifications',
        parameters: {
          userId: 'string (optional) - Clean notifications for specific user',
          action: 'string (required) - Action to perform: duplicates, old, all',
          daysOld: 'number (optional) - For "old" action, days threshold (default: 30)'
        },
        examples: {
          'Clean duplicates for user': {
            userId: 'user123',
            action: 'duplicates'
          },
          'Clean old notifications (30+ days)': {
            userId: 'user123',
            action: 'old',
            daysOld: 30
          },
          'Clean all notifications for user': {
            userId: 'user123',
            action: 'all'
          }
        }
      }
    }
  })
}
