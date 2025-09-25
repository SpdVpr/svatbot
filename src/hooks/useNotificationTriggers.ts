'use client'

import { useEffect } from 'react'
import { useWeddingNotifications, WeddingNotificationType, useLiveToastNotifications } from './useWeddingNotifications'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { useTask } from './useTask'
import { useBudget } from './useBudget'
import { useGuest } from './useGuest'

export function useNotificationTriggers() {
  const { createNotification } = useWeddingNotifications()
  const { showToast } = useLiveToastNotifications()
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { tasks } = useTask()
  const { budget } = useBudget()
  const { guests } = useGuest()

  // Check for overdue tasks
  useEffect(() => {
    if (!user?.uid || !tasks || tasks.length === 0) return

    const now = new Date()
    const overdueTasks = tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      new Date(task.dueDate) < now
    )

    overdueTasks.forEach(task => {
      const daysPastDue = Math.floor((now.getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysPastDue === 1) {
        // Task just became overdue
        createNotification(
          WeddingNotificationType.TASK_OVERDUE,
          'Úkol po termínu',
          `Úkol "${task.title}" měl být dokončen včera.`,
          {
            priority: 'high',
            category: 'task',
            actionUrl: '/tasks',
            data: { taskId: task.id }
          }
        )

        showToast(
          'warning',
          'Úkol po termínu',
          `"${task.title}" měl být dokončen včera`,
          { priority: 'high', actionUrl: '/tasks' }
        )
      }
    })
  }, [user, tasks, createNotification, showToast])

  // Check for tasks due soon
  useEffect(() => {
    if (!user?.uid || !tasks || tasks.length === 0) return

    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const tasksDueSoon = tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      new Date(task.dueDate) >= now &&
      new Date(task.dueDate) <= nextWeek
    )

    tasksDueSoon.forEach(task => {
      const dueDate = new Date(task.dueDate!)
      const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDue <= 1) {
        createNotification(
          WeddingNotificationType.TASK_DUE_SOON,
          'Úkol brzy termín',
          `Úkol "${task.title}" má termín ${daysUntilDue === 0 ? 'dnes' : 'zítra'}.`,
          {
            priority: daysUntilDue === 0 ? 'urgent' : 'high',
            category: 'task',
            actionUrl: '/tasks',
            data: { taskId: task.id }
          }
        )
      }
    })
  }, [user, tasks, createNotification])

  // Check budget alerts
  useEffect(() => {
    if (!user?.uid || !budget || !budget.items || budget.items.length === 0) return

    const totalBudget = budget.totalBudget || 0
    const totalSpent = budget.items.reduce((sum, item) => sum + (item.actualCost || 0), 0)
    const budgetUsagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    // Budget exceeded
    if (budgetUsagePercentage > 100) {
      createNotification(
        WeddingNotificationType.BUDGET_EXCEEDED,
        'Rozpočet překročen',
        `Překročili jste rozpočet o ${Math.round(budgetUsagePercentage - 100)}%. Aktuální výdaje: ${totalSpent.toLocaleString()} Kč`,
        {
          priority: 'urgent',
          category: 'budget',
          actionUrl: '/budget',
          data: { overspent: totalSpent - totalBudget }
        }
      )

      showToast(
        'error',
        'Rozpočet překročen',
        `Překročili jste rozpočet o ${Math.round(budgetUsagePercentage - 100)}%`,
        { priority: 'urgent', actionUrl: '/budget' }
      )
    }
    // Budget warning (80-100%)
    else if (budgetUsagePercentage >= 80) {
      createNotification(
        WeddingNotificationType.BUDGET_WARNING,
        'Pozor na rozpočet',
        `Využili jste ${Math.round(budgetUsagePercentage)}% rozpočtu. Zbývá ${(totalBudget - totalSpent).toLocaleString()} Kč`,
        {
          priority: 'medium',
          category: 'budget',
          actionUrl: '/budget',
          data: { usagePercentage: budgetUsagePercentage }
        }
      )
    }

    // Check for overdue payments
    const now = new Date()
    const overduePayments = budget.items.filter(item => 
      item.paymentDue && 
      new Date(item.paymentDue) < now &&
      (item.actualCost || 0) < (item.estimatedCost || 0)
    )

    overduePayments.forEach(item => {
      createNotification(
        WeddingNotificationType.PAYMENT_OVERDUE,
        'Platba po termínu',
        `Platba pro "${item.name}" měla být uhrazena ${new Date(item.paymentDue!).toLocaleDateString()}.`,
        {
          priority: 'urgent',
          category: 'budget',
          actionUrl: '/budget',
          data: { budgetItemId: item.id }
        }
      )
    })
  }, [user, budget, createNotification, showToast])

  // Wedding countdown notifications
  useEffect(() => {
    if (!user?.uid || !wedding?.weddingDate) return

    const now = new Date()
    const weddingDate = new Date(wedding.weddingDate)
    const daysUntilWedding = Math.floor((weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Special countdown milestones
    const milestones = [365, 180, 90, 60, 30, 14, 7, 3, 1]
    
    if (milestones.includes(daysUntilWedding)) {
      let message = ''
      let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'

      if (daysUntilWedding === 1) {
        message = 'Zítra je váš velký den! 🎉'
        priority = 'urgent'
      } else if (daysUntilWedding <= 7) {
        message = `Už jen ${daysUntilWedding} dní do svatby! ✨`
        priority = 'high'
      } else if (daysUntilWedding <= 30) {
        message = `Měsíc do svatby! Zbývá ${daysUntilWedding} dní. 💕`
        priority = 'medium'
      } else {
        message = `${daysUntilWedding} dní do svatby. Čas plánovat! 💍`
        priority = 'low'
      }

      createNotification(
        WeddingNotificationType.WEDDING_COUNTDOWN,
        'Odpočítávání svatby',
        message,
        {
          priority,
          category: 'system',
          data: { daysUntilWedding }
        }
      )

      if (daysUntilWedding <= 7) {
        showToast(
          'info',
          'Odpočítávání svatby',
          message,
          { priority }
        )
      }
    }
  }, [user, wedding, createNotification, showToast])

  // RSVP notifications
  useEffect(() => {
    if (!user?.uid || !guests || guests.length === 0) return

    const confirmedGuests = guests.filter(guest => guest.rsvpStatus === 'confirmed').length
    const pendingGuests = guests.filter(guest => guest.rsvpStatus === 'pending').length
    const totalGuests = guests.length

    // If we have pending RSVPs and wedding is soon
    if (pendingGuests > 0 && wedding?.weddingDate) {
      const daysUntilWedding = Math.floor((new Date(wedding.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilWedding <= 14 && daysUntilWedding > 0) {
        createNotification(
          WeddingNotificationType.RSVP_REMINDER,
          'Chybějící potvrzení účasti',
          `${pendingGuests} hostů ještě nepotvrdilo účast. Zbývá ${daysUntilWedding} dní do svatby.`,
          {
            priority: daysUntilWedding <= 7 ? 'high' : 'medium',
            category: 'guest',
            actionUrl: '/guests',
            data: { pendingCount: pendingGuests }
          }
        )
      }
    }

    // New RSVP received (this would typically be triggered by a real-time listener)
    const recentlyConfirmed = guests.filter(guest => 
      guest.rsvpStatus === 'confirmed' && 
      guest.updatedAt && 
      new Date(guest.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
    )

    recentlyConfirmed.forEach(guest => {
      showToast(
        'success',
        'Nové potvrzení účasti',
        `${guest.name} potvrdil/a účast na svatbě`,
        { priority: 'medium', actionUrl: '/guests' }
      )
    })
  }, [user, guests, wedding, createNotification, showToast])

  // System backup reminder
  useEffect(() => {
    if (!user?.uid) return
    const lastBackup = localStorage.getItem('lastBackupReminder')
    const now = Date.now()
    const oneWeek = 7 * 24 * 60 * 60 * 1000

    if (!lastBackup || now - parseInt(lastBackup) > oneWeek) {
      createNotification(
        WeddingNotificationType.BACKUP_REMINDER,
        'Zálohování dat',
        'Nezapomeňte si zálohovat důležité svatební dokumenty a kontakty.',
        {
          priority: 'low',
          category: 'system',
          expiresIn: 60 * 24 * 7 // 1 week
        }
      )

      localStorage.setItem('lastBackupReminder', now.toString())
    }
  }, [user, createNotification])
}

// Hook for manual notification triggers
export function useManualNotificationTriggers() {
  const { createNotification } = useWeddingNotifications()
  const { showToast } = useLiveToastNotifications()

  const triggerTaskCompleted = (taskTitle: string) => {
    showToast(
      'success',
      'Úkol dokončen',
      `"${taskTitle}" byl označen jako dokončený`,
      { priority: 'low' }
    )
  }

  const triggerBudgetItemAdded = (itemName: string, amount: number) => {
    showToast(
      'info',
      'Nová položka rozpočtu',
      `"${itemName}" přidána za ${amount.toLocaleString()} Kč`,
      { priority: 'low', actionUrl: '/budget' }
    )
  }

  const triggerGuestAdded = (guestName: string) => {
    showToast(
      'info',
      'Nový host přidán',
      `${guestName} byl přidán do seznamu hostů`,
      { priority: 'low', actionUrl: '/guests' }
    )
  }

  const triggerVendorMeeting = (vendorName: string, meetingDate: Date) => {
    createNotification(
      WeddingNotificationType.VENDOR_MEETING_REMINDER,
      'Schůzka s dodavatelem',
      `Nezapomeňte na schůzku s ${vendorName} dne ${meetingDate.toLocaleDateString()}.`,
      {
        priority: 'high',
        category: 'vendor',
        actionUrl: '/vendors',
        data: { vendorName, meetingDate: meetingDate.toISOString() }
      }
    )
  }

  return {
    triggerTaskCompleted,
    triggerBudgetItemAdded,
    triggerGuestAdded,
    triggerVendorMeeting
  }
}
