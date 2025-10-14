'use client'

import { useCallback } from 'react'
import { useWeddingNotifications, WeddingNotificationType } from './useWeddingNotifications'
import { useWedding } from './useWedding'
import { useTask } from './useTask'
import { useBudget } from './useBudget'
import { useGuest } from './useGuest'

/**
 * Svatbot Smart Notifications
 * AI-powered motivational and contextual notifications
 */
export function useSvatbotNotifications() {
  const { createNotification } = useWeddingNotifications()
  const { wedding } = useWedding()
  const { tasks } = useTask()
  const { stats: budgetStats } = useBudget()
  const { guests } = useGuest()

  // Celebration notification for task completion
  const celebrateTaskCompletion = useCallback(async (taskTitle: string) => {
    const motivationalMessages = [
      `Skvělá práce! 🎉 "${taskTitle}" je hotový. Jste o krok blíž k dokonalé svatbě!`,
      `Výborně! ✨ "${taskTitle}" dokončen. Svatbot je na vás pyšný! 💕`,
      `Hurá! 🎊 "${taskTitle}" máte za sebou. Pokračujte v této skvělé práci!`,
      `Gratulujeme! 🌟 "${taskTitle}" je hotový. Každý krok vás přibližuje k velkému dni!`,
      `Úžasné! 💪 "${taskTitle}" dokončen. Jste na skvělé cestě!`
    ]

    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

    await createNotification(
      WeddingNotificationType.TASK_COMPLETED,
      'Úkol dokončen! 🎉',
      message,
      {
        priority: 'low',
        category: 'task',
        data: { type: 'celebration', taskTitle }
      }
    )
  }, [createNotification])

  // Milestone celebration
  const celebrateMilestone = useCallback(async (
    milestoneType: 'progress' | 'countdown' | 'budget' | 'guests',
    value: number,
    context?: string
  ) => {
    let title = ''
    let message = ''

    switch (milestoneType) {
      case 'progress':
        title = `${value}% dokončeno! 🎊`
        if (value === 25) {
          message = 'Čtvrtina cesty je za vámi! Skvělý začátek! 🌟'
        } else if (value === 50) {
          message = 'Polovina hotovo! Jste přesně v půlce cesty k dokonalé svatbě! 💕'
        } else if (value === 75) {
          message = 'Tři čtvrtiny hotovo! Už je to skoro za vámi! 🎉'
        } else if (value === 100) {
          message = 'Všechno je připraveno! Teď si jen užijte váš velký den! 💑✨'
        } else {
          message = `${value}% příprav dokončeno. Pokračujte v této skvělé práci! 💪`
        }
        break

      case 'countdown':
        title = `${value} dní do svatby! 🎊`
        if (value === 365) {
          message = 'Rok do svatby! Máte spoustu času na přípravu. Užijte si to! 💕'
        } else if (value === 180) {
          message = 'Půl roku do svatby! Čas začít s hlavními přípravami! 🌟'
        } else if (value === 100) {
          message = '100 dní! Už je to za rohem. Nezapomeňte si užívat cestu! ✨'
        } else if (value === 60) {
          message = 'Dva měsíce! Čas na finální detaily a relaxaci! 💆'
        } else if (value === 30) {
          message = 'Měsíc do svatby! Už je to tady! Nezapomeňte dýchat a užívat si to! 💕'
        } else if (value === 14) {
          message = 'Dva týdny! Finální přípravy a hlavně klid! Bude to úžasné! 🎉'
        } else if (value === 7) {
          message = 'Týden do svatby! Už je to tady! Užijte si každou chvíli! 💑'
        } else if (value === 3) {
          message = 'Tři dny! Dýchejte, relaxujte, bude to nádherné! ✨'
        } else if (value === 1) {
          message = 'Zítra je ten velký den! Užijte si každou vteřinu! 💕🎊'
        } else {
          message = `Ještě ${value} dní! Svatbot je tu pro vás! 🤖💕`
        }
        break

      case 'budget':
        title = `Rozpočet: ${value}% využito 💰`
        if (value <= 50) {
          message = 'Skvěle hospodaříte! Máte ještě rezervu na nečekané výdaje. 👍'
        } else if (value <= 75) {
          message = 'Dobrá práce! Sledujte zbývající výdaje, ale jste na dobré cestě. 💪'
        } else if (value <= 90) {
          message = 'Blížíte se k limitu. Zvažte, kde můžete ušetřit. Svatbot vám poradí! 💡'
        } else if (value <= 100) {
          message = 'Jste na limitu rozpočtu. Doporučuji přehodnotit zbývající výdaje. 🤔'
        } else {
          message = 'Překročili jste rozpočet. Pojďme společně najít řešení! 💪'
        }
        break

      case 'guests':
        title = `${value}% hostů potvrdilo! 👥`
        if (value >= 80) {
          message = 'Skvělá odezva! Většina hostů už potvrdila účast! 🎉'
        } else if (value >= 50) {
          message = 'Polovina hostů potvrdila. Čas připomenout ostatním! 📧'
        } else {
          message = 'Čas poslat připomínky hostům, kteří ještě neodpověděli! 💌'
        }
        break
    }

    await createNotification(
      WeddingNotificationType.WEDDING_COUNTDOWN,
      title,
      message,
      {
        priority: value <= 7 && milestoneType === 'countdown' ? 'high' : 'medium',
        category: 'system',
        data: { type: 'milestone', milestoneType, value, context }
      }
    )
  }, [createNotification])

  // Stress relief suggestion
  const sendStressReliefTip = useCallback(async () => {
    const tips = [
      {
        title: 'Čas na pauzu 🧘',
        message: 'Svatební přípravy mohou být náročné. Zkuste si dát pauzu - procházka, meditace nebo čaj s partnerem. 💕'
      },
      {
        title: 'Date night! 💑',
        message: 'Kdy jste naposledy měli večer jen pro sebe? Naplánujte si date night - bez svatebního plánování! ✨'
      },
      {
        title: 'Delegujte! 🤝',
        message: 'Nemusíte všechno dělat sami. Požádejte rodinu nebo přátele o pomoc s některými úkoly. 💪'
      },
      {
        title: 'Dokonalost neexistuje 🌟',
        message: 'Pamatujte: Dokonalá svatba neexistuje, ale vaše láska ano! Užijte si přípravu, ne jen výsledek. 💕'
      },
      {
        title: 'Dýchejte! 🌬️',
        message: 'Když se cítíte přetížení, zkuste hluboké dýchání. 5 vteřin nádech, 5 vteřin výdech. Opakujte 5x. 🧘'
      },
      {
        title: 'Prioritizujte! 📋',
        message: 'Nemůžete stihnout všechno. Zaměřte se na to, co je pro vás opravdu důležité. Zbytek může počkat. ✨'
      }
    ]

    const tip = tips[Math.floor(Math.random() * tips.length)]

    await createNotification(
      WeddingNotificationType.SYSTEM_UPDATE,
      tip.title,
      tip.message,
      {
        priority: 'medium',
        category: 'system',
        data: { type: 'stress_relief' }
      }
    )
  }, [createNotification])

  // Relationship reminder
  const sendRelationshipReminder = useCallback(async () => {
    const reminders = [
      {
        title: 'Čas pro vás dva 💑',
        message: 'Nezapomeňte, že svatba je o vaší lásce! Naplánujte si večer jen pro sebe - bez svatebního plánování. ✨'
      },
      {
        title: 'Komunikujte! 💬',
        message: 'Svatební přípravy mohou být stresující. Mluvte spolu o svých pocitech a podporujte se navzájem. 💕'
      },
      {
        title: 'Užijte si cestu! 🌟',
        message: 'Svatba je jen jeden den, ale vzpomínky na přípravu zůstanou navždy. Užijte si tento speciální čas! 💑'
      },
      {
        title: 'Společné rozhodování 🤝',
        message: 'Ujistěte se, že oba máte prostor vyjádřit své přání. Svatba je o vás obou! 💕'
      }
    ]

    const reminder = reminders[Math.floor(Math.random() * reminders.length)]

    await createNotification(
      WeddingNotificationType.SYSTEM_UPDATE,
      reminder.title,
      reminder.message,
      {
        priority: 'low',
        category: 'system',
        data: { type: 'relationship_reminder' }
      }
    )
  }, [createNotification])

  // Proactive suggestion based on wedding data
  const sendProactiveSuggestion = useCallback(async () => {
    if (!wedding || !tasks) return

    const now = new Date()
    const overdueTasks = tasks.filter(t => 
      t.status !== 'completed' &&
      t.dueDate &&
      new Date(t.dueDate) < now
    )

    const upcomingTasks = tasks.filter(t =>
      t.status !== 'completed' &&
      t.dueDate &&
      new Date(t.dueDate) > now &&
      new Date(t.dueDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    )

    // Suggest tackling overdue tasks
    if (overdueTasks.length > 0 && overdueTasks.length <= 3) {
      await createNotification(
        WeddingNotificationType.TASK_OVERDUE,
        'Pojďme to zvládnout! 💪',
        `Máte ${overdueTasks.length} ${overdueTasks.length === 1 ? 'úkol' : 'úkoly'} po termínu. Začněte s tím nejdůležitějším a postupně to zvládnete! 🌟`,
        {
          priority: 'high',
          category: 'task',
          actionUrl: '/tasks',
          data: { type: 'proactive_suggestion', count: overdueTasks.length }
        }
      )
    }

    // Remind about upcoming tasks
    if (upcomingTasks.length > 0) {
      await createNotification(
        WeddingNotificationType.TASK_DUE_SOON,
        'Nadcházející úkoly 📅',
        `Tento týden máte ${upcomingTasks.length} ${upcomingTasks.length === 1 ? 'úkol' : 'úkoly'} k dokončení. Naplánujte si čas! ✨`,
        {
          priority: 'medium',
          category: 'task',
          actionUrl: '/tasks',
          data: { type: 'upcoming_tasks', count: upcomingTasks.length }
        }
      )
    }
  }, [wedding, tasks, createNotification])

  // Daily check-in
  const sendDailyCheckIn = useCallback(async () => {
    const checkIns = [
      {
        title: 'Dobré ráno! ☀️',
        message: 'Nový den, nové možnosti! Jak se dnes cítíte? Nezapomeňte si užít tento speciální čas! 💕'
      },
      {
        title: 'Ahoj! 👋',
        message: 'Svatbot je tu pro vás! Máte nějaké otázky nebo potřebujete radu? Jsem tu, abych pomohl! 🤖💕'
      },
      {
        title: 'Dobrý den! 🌟',
        message: 'Jak pokračují přípravy? Pamatujte - každý krok vás přibližuje k vašemu velkému dni! ✨'
      }
    ]

    const checkIn = checkIns[Math.floor(Math.random() * checkIns.length)]

    await createNotification(
      WeddingNotificationType.SYSTEM_UPDATE,
      checkIn.title,
      checkIn.message,
      {
        priority: 'low',
        category: 'system',
        data: { type: 'daily_checkin' }
      }
    )
  }, [createNotification])

  return {
    celebrateTaskCompletion,
    celebrateMilestone,
    sendStressReliefTip,
    sendRelationshipReminder,
    sendProactiveSuggestion,
    sendDailyCheckIn
  }
}

