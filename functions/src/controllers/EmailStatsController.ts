import { Request, Response } from 'express'
import * as admin from 'firebase-admin'

const db = admin.firestore()

export class EmailStatsController {
  /**
   * Get email statistics
   * GET /api/v1/admin/email-stats
   */
  static async getEmailStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, type } = req.query

      // Build query
      let query: admin.firestore.Query = db.collection('emailLogs')

      // Filter by date range
      if (startDate) {
        const start = admin.firestore.Timestamp.fromDate(new Date(startDate as string))
        query = query.where('sentAt', '>=', start)
      }

      if (endDate) {
        const end = admin.firestore.Timestamp.fromDate(new Date(endDate as string))
        query = query.where('sentAt', '<=', end)
      }

      // Filter by type
      if (type) {
        query = query.where('type', '==', type)
      }

      // Get all email logs
      const logsSnapshot = await query.get()

      // Calculate statistics
      const stats = {
        total: logsSnapshot.size,
        sent: 0,
        failed: 0,
        pending: 0,
        byType: {
          registration: 0,
          payment_success: 0,
          trial_reminder: 0,
          trial_expired: 0,
          other: 0
        },
        byStatus: {
          sent: 0,
          failed: 0,
          pending: 0
        },
        recentEmails: [] as any[]
      }

      // Process logs
      logsSnapshot.forEach((doc) => {
        const log = doc.data()

        // Count by status
        if (log.status === 'sent') stats.sent++
        else if (log.status === 'failed') stats.failed++
        else if (log.status === 'pending') stats.pending++

        stats.byStatus[log.status as keyof typeof stats.byStatus]++

        // Count by type
        if (log.type in stats.byType) {
          stats.byType[log.type as keyof typeof stats.byType]++
        }

        // Add to recent emails (limit to 10)
        if (stats.recentEmails.length < 10) {
          stats.recentEmails.push({
            id: doc.id,
            email: log.email,
            type: log.type,
            subject: log.subject,
            status: log.status,
            sentAt: log.sentAt.toDate().toISOString(),
            error: log.error || null
          })
        }
      })

      // Sort recent emails by date
      stats.recentEmails.sort((a, b) => 
        new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      )

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error getting email stats:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get email statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Get email stats summary (for dashboard)
   * GET /api/v1/admin/email-stats/summary
   */
  static async getEmailStatsSummary(req: Request, res: Response): Promise<void> {
    try {
      // Get stats for last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const logsSnapshot = await db
        .collection('emailLogs')
        .where('sentAt', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .get()

      // Calculate summary
      const summary = {
        last30Days: {
          total: logsSnapshot.size,
          sent: 0,
          failed: 0,
          successRate: 0
        },
        today: {
          total: 0,
          sent: 0,
          failed: 0
        },
        byType: {
          registration: 0,
          payment_success: 0,
          trial_reminder: 0,
          trial_expired: 0,
          other: 0
        }
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      logsSnapshot.forEach((doc) => {
        const log = doc.data()
        const logDate = log.sentAt.toDate()

        // Count by status
        if (log.status === 'sent') {
          summary.last30Days.sent++
          if (logDate >= today) summary.today.sent++
        } else if (log.status === 'failed') {
          summary.last30Days.failed++
          if (logDate >= today) summary.today.failed++
        }

        // Count today's total
        if (logDate >= today) {
          summary.today.total++
        }

        // Count by type
        if (log.type in summary.byType) {
          summary.byType[log.type as keyof typeof summary.byType]++
        }
      })

      // Calculate success rate
      if (summary.last30Days.total > 0) {
        summary.last30Days.successRate = Math.round(
          (summary.last30Days.sent / summary.last30Days.total) * 100
        )
      }

      res.json({
        success: true,
        data: summary
      })
    } catch (error) {
      console.error('Error getting email stats summary:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get email statistics summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Get daily email stats for chart
   * GET /api/v1/admin/email-stats/daily
   */
  static async getDailyEmailStats(req: Request, res: Response): Promise<void> {
    try {
      const { days = 30 } = req.query
      const daysCount = parseInt(days as string)

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysCount)
      startDate.setHours(0, 0, 0, 0)

      const logsSnapshot = await db
        .collection('emailLogs')
        .where('sentAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
        .orderBy('sentAt', 'asc')
        .get()

      // Group by day
      const dailyStats: Record<string, { date: string; sent: number; failed: number; total: number }> = {}

      logsSnapshot.forEach((doc) => {
        const log = doc.data()
        const date = log.sentAt.toDate().toISOString().split('T')[0]

        if (!dailyStats[date]) {
          dailyStats[date] = { date, sent: 0, failed: 0, total: 0 }
        }

        dailyStats[date].total++
        if (log.status === 'sent') {
          dailyStats[date].sent++
        } else if (log.status === 'failed') {
          dailyStats[date].failed++
        }
      })

      // Convert to array and sort
      const dailyStatsArray = Object.values(dailyStats).sort((a, b) => 
        a.date.localeCompare(b.date)
      )

      res.json({
        success: true,
        data: dailyStatsArray
      })
    } catch (error) {
      console.error('Error getting daily email stats:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get daily email statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

