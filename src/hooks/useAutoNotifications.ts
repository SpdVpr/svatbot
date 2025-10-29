'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { useTask } from './useTask'
import { useWeddingDate } from './useDemoSettings'
import { useWeddingNotifications, WeddingNotificationType } from './useWeddingNotifications'
import { useSvatbotNotifications } from './useSvatbotNotifications'
import { useLiveToastNotifications } from './useWeddingNotifications'

/**
 * Auto Notifications System
 * Automatically generates notifications based on:
 * - Daily check-ins
 * - Milestone countdowns
 * - Task reminders
 * - Stress relief tips
 * - Celebration notifications
 */
export function useAutoNotifications() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { tasks } = useTask()
  const { createNotification } = useWeddingNotifications()
  const { showToast } = useLiveToastNotifications()
  const {
    celebrateTaskCompletion,
    celebrateMilestone,
    sendStressReliefTip,
    sendRelationshipReminder,
    sendProactiveSuggestion,
    sendDailyCheckIn
  } = useSvatbotNotifications()

  // Use DEMO-aware wedding date
  const { weddingDate, isDemoUser } = useWeddingDate(user?.id, wedding?.weddingDate || null)

  const lastCheckRef = useRef<Date | null>(null)
  const hasShownWelcomeRef = useRef(false)

  // Load last check date from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('svatbot_last_notification_check')
    if (stored) {
      lastCheckRef.current = new Date(stored)
    }
  }, [])

  // Check if it's a new day
  const isNewDay = useCallback(() => {
    if (!lastCheckRef.current) {
      // First time - load from localStorage
      const stored = localStorage.getItem('svatbot_last_notification_check')
      if (stored) {
        lastCheckRef.current = new Date(stored)
      } else {
        return true // First ever check
      }
    }

    const now = new Date()
    const lastCheck = lastCheckRef.current

    return (
      now.getDate() !== lastCheck.getDate() ||
      now.getMonth() !== lastCheck.getMonth() ||
      now.getFullYear() !== lastCheck.getFullYear()
    )
  }, [])

  // Welcome notification for new users
  const sendWelcomeNotification = useCallback(async () => {
    if (!user?.id || hasShownWelcomeRef.current) return

    try {
      await createNotification(
        WeddingNotificationType.SYSTEM_UPDATE,
        '🎉 Vítejte v SvatBot!',
        'Jsem Svatbot, váš osobní AI svatební kouč! Pomohu vám naplánovat dokonalou svatbu. Začněme společně! 💕',
        {
          priority: 'high',
          category: 'system',
          data: { type: 'welcome' }
        }
      )

      showToast(
        'success',
        '👋 Vítejte!',
        'Svatbot je tu pro vás! Klikněte na ikonu 🤖 pro chat.',
        { priority: 'high', duration: 8000 }
      )

      hasShownWelcomeRef.current = true
    } catch (error) {
      console.error('Error sending welcome notification:', error)
    }
  }, [user?.id, createNotification, showToast])

  // Daily check-in notification
  const sendDailyNotification = useCallback(async () => {
    if (!user?.id || !wedding?.id) return

    try {
      await sendDailyCheckIn()
      
      // Also send proactive suggestion
      await sendProactiveSuggestion()
    } catch (error) {
      console.error('Error sending daily notification:', error)
    }
  }, [user?.id, wedding?.id, sendDailyCheckIn, sendProactiveSuggestion])

  // Milestone countdown notifications
  const checkMilestones = useCallback(async () => {
    if (!weddingDate) return

    const now = new Date()
    const wedding = new Date(weddingDate)
    const daysUntil = Math.ceil((wedding.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Important milestones
    const milestones = [365, 180, 100, 60, 30, 14, 7, 3, 1]
    
    if (milestones.includes(daysUntil)) {
      await celebrateMilestone('countdown', daysUntil, `${daysUntil} dní do svatby`)

      // Show toast for important milestones
      if (daysUntil <= 30) {
        showToast(
          'info',
          `🎊 ${daysUntil} dní do svatby!`,
          daysUntil === 1
            ? 'Zítra je ten velký den! 💕'
            : `Už je to za rohem! Těšíme se s vámi! ✨`,
          { priority: 'high', duration: 10000 }
        )
      }
    }
  }, [weddingDate, celebrateMilestone, showToast])

  // Task completion celebrations
  const checkTaskCompletions = useCallback(async () => {
    if (!tasks || tasks.length === 0) return

    const now = new Date()
    const recentlyCompleted = tasks.filter(t =>
      t.status === 'completed' &&
      t.completedAt &&
      (now.getTime() - new Date(t.completedAt).getTime()) < 60 * 60 * 1000 // Last hour
    )

    for (const task of recentlyCompleted) {
      await celebrateTaskCompletion(task.title)
      
      // Show toast
      showToast(
        'success',
        '🎉 Skvělá práce!',
        `Dokončili jste: ${task.title}`,
        { priority: 'medium', duration: 5000 }
      )
    }
  }, [tasks, celebrateTaskCompletion, showToast])

  // Overdue task reminders
  const checkOverdueTasks = useCallback(async () => {
    if (!tasks || tasks.length === 0) return

    const now = new Date()
    const overdueTasks = tasks.filter(t =>
      t.status !== 'completed' &&
      t.dueDate &&
      new Date(t.dueDate) < now
    )

    if (overdueTasks.length > 0 && overdueTasks.length <= 5) {
      await createNotification(
        WeddingNotificationType.TASK_OVERDUE,
        '⏰ Úkoly po termínu',
        `Máte ${overdueTasks.length} ${overdueTasks.length === 1 ? 'úkol' : 'úkoly'} po termínu. Pojďme to společně zvládnout! 💪`,
        {
          priority: 'high',
          category: 'task',
          actionUrl: '/tasks',
          data: { type: 'overdue_reminder', count: overdueTasks.length }
        }
      )
    }
  }, [tasks, createNotification])

  // Upcoming task reminders
  const checkUpcomingTasks = useCallback(async () => {
    if (!tasks || tasks.length === 0) return

    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    const upcomingTasks = tasks.filter(t =>
      t.status !== 'completed' &&
      t.dueDate &&
      new Date(t.dueDate) >= now &&
      new Date(t.dueDate) <= tomorrow
    )

    if (upcomingTasks.length > 0) {
      await createNotification(
        WeddingNotificationType.TASK_DUE_SOON,
        '📅 Úkoly na zítra',
        `Zítra máte ${upcomingTasks.length} ${upcomingTasks.length === 1 ? 'úkol' : 'úkoly'} k dokončení. Nezapomeňte! ✨`,
        {
          priority: 'medium',
          category: 'task',
          actionUrl: '/tasks',
          data: { type: 'upcoming_reminder', count: upcomingTasks.length }
        }
      )
    }
  }, [tasks, createNotification])

  // Random stress relief tip (once per day)
  const sendRandomTip = useCallback(async () => {
    // 30% chance to send a tip
    if (Math.random() > 0.7) {
      await sendStressReliefTip()
    }
  }, [sendStressReliefTip])

  // Random relationship reminder (once per week)
  const sendRandomRelationshipReminder = useCallback(async () => {
    // 20% chance to send a reminder
    if (Math.random() > 0.8) {
      await sendRelationshipReminder()
    }
  }, [sendRelationshipReminder])

  // Main auto-check function
  const runAutoChecks = useCallback(async () => {
    if (!user?.id) return

    console.log('🤖 Running auto-checks...')

    try {
      // Check for new day
      if (isNewDay()) {
        console.log('📅 New day detected - running daily checks')

        await sendDailyNotification()
        await checkMilestones()
        await checkOverdueTasks()
        await checkUpcomingTasks()
        await sendRandomTip()
        await sendRandomRelationshipReminder()

        const now = new Date()
        lastCheckRef.current = now
        localStorage.setItem('svatbot_last_notification_check', now.toISOString())
      }

      // Always check for recent task completions
      await checkTaskCompletions()

    } catch (error) {
      console.error('Error running auto-checks:', error)
    }
  }, [
    user?.id,
    isNewDay,
    sendDailyNotification,
    checkMilestones,
    checkOverdueTasks,
    checkUpcomingTasks,
    checkTaskCompletions,
    sendRandomTip,
    sendRandomRelationshipReminder
  ])

  // Run checks on mount and periodically
  useEffect(() => {
    if (!user?.id) return

    // Prevent multiple initial runs using localStorage
    const sessionKey = `svatbot_auto_check_session_${user.id}`
    const lastSession = localStorage.getItem(sessionKey)
    const now = Date.now()

    // If last session was less than 1 minute ago, skip
    if (lastSession && (now - parseInt(lastSession)) < 60000) {
      console.log('⏭️ Skipping auto-checks - already ran recently')
      return
    }

    // Mark this session
    localStorage.setItem(sessionKey, now.toString())

    // Send welcome notification for new users
    sendWelcomeNotification()

    // Run initial check
    runAutoChecks()

    // Run checks every 5 minutes
    const interval = setInterval(() => {
      runAutoChecks()
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [user?.id, runAutoChecks, sendWelcomeNotification])

  // Manual trigger for testing
  const triggerManualCheck = useCallback(async () => {
    lastCheckRef.current = null // Reset to force new day
    await runAutoChecks()
  }, [runAutoChecks])

  return {
    triggerManualCheck
  }
}

