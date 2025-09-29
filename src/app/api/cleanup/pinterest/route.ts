import { NextRequest, NextResponse } from 'next/server'
import { cleanupPinterestData, cleanupPinterestDataForUser } from '@/utils/cleanupPinterestData'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, weddingId, cleanupAll } = body
    
    let result
    
    if (cleanupAll) {
      // Admin cleanup - remove all Pinterest data
      result = await cleanupPinterestData()
    } else if (userId) {
      // User-specific cleanup
      result = await cleanupPinterestDataForUser(userId, weddingId)
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing userId or cleanupAll parameter' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Pinterest cleanup API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to cleanup Pinterest data'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Pinterest cleanup API',
    endpoints: {
      'POST /api/cleanup/pinterest': {
        description: 'Clean up Pinterest data',
        parameters: {
          userId: 'string (optional) - Clean data for specific user',
          weddingId: 'string (optional) - Clean data for specific wedding',
          cleanupAll: 'boolean (optional) - Clean all Pinterest data (admin only)'
        }
      }
    }
  })
}
