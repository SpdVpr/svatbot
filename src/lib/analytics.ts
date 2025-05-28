'use client'

import { Wedding } from '@/types'
import { Task } from '@/types/task'
import { Guest } from '@/types/guest'
import { BudgetItem } from '@/types/budget'
import { Vendor } from '@/types/vendor'

// Analytics interfaces
export interface WeddingAnalytics {
  overview: {
    totalProgress: number
    daysUntilWedding: number
    completionRate: number
    onTrack: boolean
  }
  tasks: TaskAnalytics
  budget: BudgetAnalytics
  guests: GuestAnalytics
  vendors: VendorAnalytics
  timeline: TimelineAnalytics
  trends: TrendAnalytics
}

export interface TaskAnalytics {
  total: number
  completed: number
  overdue: number
  upcoming: number
  byCategory: Record<string, number>
  byPriority: Record<string, number>
  completionRate: number
  averageCompletionTime: number
  productivityScore: number
}

export interface BudgetAnalytics {
  totalBudget: number
  totalSpent: number
  totalPlanned: number
  remaining: number
  percentageUsed: number
  byCategory: Record<string, { budget: number; spent: number; planned: number }>
  overBudgetCategories: string[]
  savingsOpportunities: string[]
  monthlySpending: { month: string; amount: number }[]
  projectedTotal: number
}

export interface GuestAnalytics {
  total: number
  responded: number
  attending: number
  notAttending: number
  pending: number
  responseRate: number
  byInvitationType: Record<string, number>
  byDietaryRestrictions: Record<string, number>
  ageDistribution: Record<string, number>
  geographicDistribution: Record<string, number>
  rsvpTrend: { date: string; responses: number }[]
}

export interface VendorAnalytics {
  total: number
  booked: number
  contacted: number
  pending: number
  totalValue: number
  averageRating: number
  byCategory: Record<string, number>
  byStatus: Record<string, number>
  responseTime: number
  satisfactionScore: number
}

export interface TimelineAnalytics {
  totalMilestones: number
  completedMilestones: number
  upcomingDeadlines: number
  criticalPath: string[]
  timelineHealth: 'on-track' | 'at-risk' | 'behind'
  estimatedCompletion: Date
}

export interface TrendAnalytics {
  weeklyProgress: { week: string; progress: number }[]
  taskCompletionTrend: { date: string; completed: number }[]
  budgetTrend: { month: string; spent: number }[]
  guestResponseTrend: { date: string; responses: number }[]
  productivityScore: number
  engagementScore: number
}

class AnalyticsService {
  // Calculate comprehensive wedding analytics
  calculateWeddingAnalytics(
    wedding: Wedding,
    tasks: Task[],
    guests: Guest[],
    budgetItems: BudgetItem[],
    vendors: Vendor[]
  ): WeddingAnalytics {
    const taskAnalytics = this.calculateTaskAnalytics(tasks)
    const budgetAnalytics = this.calculateBudgetAnalytics(budgetItems, wedding.budget)
    const guestAnalytics = this.calculateGuestAnalytics(guests)
    const vendorAnalytics = this.calculateVendorAnalytics(vendors)
    const timelineAnalytics = this.calculateTimelineAnalytics(wedding, tasks)
    const trendAnalytics = this.calculateTrendAnalytics(tasks, budgetItems, guests)

    const daysUntilWedding = wedding.weddingDate
      ? Math.ceil((new Date(wedding.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0

    const totalProgress = this.calculateOverallProgress(
      taskAnalytics.completionRate,
      budgetAnalytics.percentageUsed,
      guestAnalytics.responseRate,
      vendorAnalytics.total > 0 ? (vendorAnalytics.booked / vendorAnalytics.total) * 100 : 0
    )

    return {
      overview: {
        totalProgress,
        daysUntilWedding,
        completionRate: taskAnalytics.completionRate,
        onTrack: this.isWeddingOnTrack(totalProgress, daysUntilWedding)
      },
      tasks: taskAnalytics,
      budget: budgetAnalytics,
      guests: guestAnalytics,
      vendors: vendorAnalytics,
      timeline: timelineAnalytics,
      trends: trendAnalytics
    }
  }

  // Calculate task analytics
  private calculateTaskAnalytics(tasks: Task[]): TaskAnalytics {
    const now = new Date()
    const completed = tasks.filter(t => t.status === 'completed').length
    const overdue = tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now).length
    const upcoming = tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) > now && new Date(t.dueDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)).length

    const byCategory = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0

    // Calculate average completion time (mock data for now)
    const averageCompletionTime = 3.5 // days

    // Calculate productivity score based on completion rate and overdue tasks
    const productivityScore = Math.max(0, completionRate - (overdue * 10))

    return {
      total: tasks.length,
      completed,
      overdue,
      upcoming,
      byCategory,
      byPriority,
      completionRate,
      averageCompletionTime,
      productivityScore
    }
  }

  // Calculate budget analytics
  private calculateBudgetAnalytics(budgetItems: BudgetItem[], totalBudget: number): BudgetAnalytics {
    const totalSpent = budgetItems.reduce((sum, item) => sum + item.actualAmount, 0)
    const totalPlanned = budgetItems.reduce((sum, item) => sum + item.budgetedAmount, 0)
    const remaining = totalBudget - totalSpent
    const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    const byCategory = budgetItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { budget: 0, spent: 0, planned: 0 }
      }
      acc[item.category].spent += item.actualAmount
      acc[item.category].planned += item.budgetedAmount
      return acc
    }, {} as Record<string, { budget: number; spent: number; planned: number }>)

    const overBudgetCategories = Object.entries(byCategory)
      .filter(([_, data]) => data.spent > data.planned)
      .map(([category]) => category)

    // Mock monthly spending data
    const monthlySpending = [
      { month: 'Leden', amount: totalSpent * 0.1 },
      { month: 'Únor', amount: totalSpent * 0.15 },
      { month: 'Březen', amount: totalSpent * 0.2 },
      { month: 'Duben', amount: totalSpent * 0.25 },
      { month: 'Květen', amount: totalSpent * 0.3 }
    ]

    const projectedTotal = totalPlanned + (totalSpent - totalPlanned) * 1.1 // 10% buffer

    return {
      totalBudget,
      totalSpent,
      totalPlanned,
      remaining,
      percentageUsed,
      byCategory,
      overBudgetCategories,
      savingsOpportunities: [], // To be implemented
      monthlySpending,
      projectedTotal
    }
  }

  // Calculate guest analytics
  private calculateGuestAnalytics(guests: Guest[]): GuestAnalytics {
    const responded = guests.filter(g => g.rsvpStatus !== 'pending').length
    const attending = guests.filter(g => g.rsvpStatus === 'attending').length
    const notAttending = guests.filter(g => g.rsvpStatus === 'declined').length
    const pending = guests.filter(g => g.rsvpStatus === 'pending').length
    const responseRate = guests.length > 0 ? (responded / guests.length) * 100 : 0

    const byInvitationType = guests.reduce((acc, guest) => {
      acc[guest.invitationType] = (acc[guest.invitationType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byDietaryRestrictions = guests.reduce((acc, guest) => {
      if (guest.dietaryRestrictions) {
        guest.dietaryRestrictions.forEach(restriction => {
          acc[restriction] = (acc[restriction] || 0) + 1
        })
      }
      return acc
    }, {} as Record<string, number>)

    // Mock data for age and geographic distribution
    const ageDistribution = {
      '18-25': Math.floor(guests.length * 0.2),
      '26-35': Math.floor(guests.length * 0.4),
      '36-50': Math.floor(guests.length * 0.25),
      '51+': Math.floor(guests.length * 0.15)
    }

    const geographicDistribution = {
      'Praha': Math.floor(guests.length * 0.4),
      'Brno': Math.floor(guests.length * 0.2),
      'Ostrava': Math.floor(guests.length * 0.15),
      'Ostatní': Math.floor(guests.length * 0.25)
    }

    // Mock RSVP trend data
    const rsvpTrend = [
      { date: '2024-01-01', responses: Math.floor(responded * 0.1) },
      { date: '2024-02-01', responses: Math.floor(responded * 0.3) },
      { date: '2024-03-01', responses: Math.floor(responded * 0.6) },
      { date: '2024-04-01', responses: responded }
    ]

    return {
      total: guests.length,
      responded,
      attending,
      notAttending,
      pending,
      responseRate,
      byInvitationType,
      byDietaryRestrictions,
      ageDistribution,
      geographicDistribution,
      rsvpTrend
    }
  }

  // Calculate vendor analytics
  private calculateVendorAnalytics(vendors: Vendor[]): VendorAnalytics {
    const booked = vendors.filter(v => v.status === 'booked' || v.status === 'contracted').length
    const contacted = vendors.filter(v => v.status === 'contacted').length
    const pending = vendors.filter(v => v.status === 'potential').length

    const totalValue = vendors.reduce((sum, vendor) => {
      return sum + (vendor.priceRange?.min || 0)
    }, 0)

    const averageRating = vendors.length > 0
      ? vendors.reduce((sum, vendor) => sum + (vendor.rating?.overall || 0), 0) / vendors.length
      : 0

    const byCategory = vendors.reduce((acc, vendor) => {
      acc[vendor.category] = (acc[vendor.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byStatus = vendors.reduce((acc, vendor) => {
      acc[vendor.status] = (acc[vendor.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: vendors.length,
      booked,
      contacted,
      pending,
      totalValue,
      averageRating,
      byCategory,
      byStatus,
      responseTime: 24, // hours (mock)
      satisfactionScore: averageRating * 20 // convert to 0-100 scale
    }
  }

  // Calculate timeline analytics
  private calculateTimelineAnalytics(wedding: Wedding, tasks: Task[]): TimelineAnalytics {
    const totalMilestones = 7 // Based on wedding phases
    const completedMilestones = Math.floor(wedding.progress.overall / 100 * totalMilestones)

    const now = new Date()
    const upcomingDeadlines = tasks.filter(t =>
      t.status !== 'completed' &&
      t.dueDate &&
      new Date(t.dueDate) > now &&
      new Date(t.dueDate) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    ).length

    const criticalPath = ['Místo konání', 'Catering', 'Fotograf', 'Hudba', 'Květiny']

    const timelineHealth: 'on-track' | 'at-risk' | 'behind' =
      wedding.progress.overall >= 70 ? 'on-track' :
      wedding.progress.overall >= 40 ? 'at-risk' : 'behind'

    const estimatedCompletion = wedding.weddingDate
      ? new Date(new Date(wedding.weddingDate).getTime() - 30 * 24 * 60 * 60 * 1000)
      : new Date()

    return {
      totalMilestones,
      completedMilestones,
      upcomingDeadlines,
      criticalPath,
      timelineHealth,
      estimatedCompletion
    }
  }

  // Calculate trend analytics
  private calculateTrendAnalytics(tasks: Task[], budgetItems: BudgetItem[], guests: Guest[]): TrendAnalytics {
    // Mock trend data - in real app, this would come from historical data
    const weeklyProgress = [
      { week: 'Týden 1', progress: 10 },
      { week: 'Týden 2', progress: 25 },
      { week: 'Týden 3', progress: 40 },
      { week: 'Týden 4', progress: 60 },
      { week: 'Týden 5', progress: 75 }
    ]

    const taskCompletionTrend = [
      { date: '2024-01-01', completed: 2 },
      { date: '2024-02-01', completed: 8 },
      { date: '2024-03-01', completed: 15 },
      { date: '2024-04-01', completed: 25 }
    ]

    const budgetTrend = [
      { month: 'Leden', spent: 50000 },
      { month: 'Únor', spent: 120000 },
      { month: 'Březen', spent: 200000 },
      { month: 'Duben', spent: 280000 }
    ]

    const guestResponseTrend = [
      { date: '2024-01-01', responses: 5 },
      { date: '2024-02-01', responses: 15 },
      { date: '2024-03-01', responses: 30 },
      { date: '2024-04-01', responses: 45 }
    ]

    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const productivityScore = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

    const respondedGuests = guests.filter(g => g.rsvpStatus !== 'pending').length
    const engagementScore = guests.length > 0 ? (respondedGuests / guests.length) * 100 : 0

    return {
      weeklyProgress,
      taskCompletionTrend,
      budgetTrend,
      guestResponseTrend,
      productivityScore,
      engagementScore
    }
  }

  // Calculate overall progress
  private calculateOverallProgress(
    taskCompletion: number,
    budgetUsage: number,
    guestResponse: number,
    vendorBooking: number
  ): number {
    // Weighted average of different progress metrics
    const weights = {
      tasks: 0.4,
      budget: 0.2,
      guests: 0.2,
      vendors: 0.2
    }

    return Math.round(
      taskCompletion * weights.tasks +
      Math.min(budgetUsage, 100) * weights.budget +
      guestResponse * weights.guests +
      vendorBooking * weights.vendors
    )
  }

  // Check if wedding is on track
  private isWeddingOnTrack(progress: number, daysUntilWedding: number): boolean {
    if (daysUntilWedding <= 0) return true

    // Expected progress based on time remaining
    const totalPlanningDays = 365 // Assume 1 year planning period
    const daysPassed = totalPlanningDays - daysUntilWedding
    const expectedProgress = (daysPassed / totalPlanningDays) * 100

    return progress >= expectedProgress * 0.8 // 80% of expected progress
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()

// Analytics event tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // In production, this would send to analytics service (Google Analytics, Mixpanel, etc.)
  console.log('Analytics Event:', eventName, properties)
}

// Common analytics events
export const ANALYTICS_EVENTS = {
  TASK_COMPLETED: 'task_completed',
  GUEST_RSVP: 'guest_rsvp',
  VENDOR_CONTACTED: 'vendor_contacted',
  BUDGET_UPDATED: 'budget_updated',
  CALENDAR_SYNC: 'calendar_sync',
  EMAIL_SENT: 'email_sent',
  MILESTONE_REACHED: 'milestone_reached',
  WEDDING_CREATED: 'wedding_created'
} as const
