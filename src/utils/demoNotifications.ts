import { WeddingNotificationType } from '@/hooks/useWeddingNotifications'

export const createDemoNotifications = async (createNotification: any, showToast: any) => {
  // Demo notifications for testing
  const demoNotifications = [
    {
      type: WeddingNotificationType.TASK_DUE_SOON,
      title: 'Úkol brzy termín',
      message: 'Objednat svatební dort má termín zítra.',
      options: {
        priority: 'high' as const,
        category: 'task' as const,
        actionUrl: '/tasks'
      }
    },
    {
      type: WeddingNotificationType.BUDGET_WARNING,
      title: 'Pozor na rozpočet',
      message: 'Využili jste 85% rozpočtu. Zbývá 45 000 Kč',
      options: {
        priority: 'medium' as const,
        category: 'budget' as const,
        actionUrl: '/budget'
      }
    },
    {
      type: WeddingNotificationType.RSVP_RECEIVED,
      title: 'Nové potvrzení účasti',
      message: 'Jana Nováková potvrdila účast na svatbě',
      options: {
        priority: 'medium' as const,
        category: 'guest' as const,
        actionUrl: '/guests'
      }
    },
    {
      type: WeddingNotificationType.WEDDING_COUNTDOWN,
      title: 'Odpočítávání svatby',
      message: 'Už jen 30 dní do svatby! 💕',
      options: {
        priority: 'medium' as const,
        category: 'system' as const
      }
    },
    {
      type: WeddingNotificationType.VENDOR_MEETING_REMINDER,
      title: 'Schůzka s dodavatelem',
      message: 'Nezapomeňte na schůzku s fotografem zítra v 14:00.',
      options: {
        priority: 'high' as const,
        category: 'vendor' as const,
        actionUrl: '/vendors'
      }
    }
  ]

  // Create notifications with delay for demo effect
  for (let i = 0; i < demoNotifications.length; i++) {
    const notification = demoNotifications[i]
    
    setTimeout(() => {
      createNotification(
        notification.type,
        notification.title,
        notification.message,
        notification.options
      )

      // Show toast for high priority notifications
      if (notification.options.priority === 'high' || notification.options.priority === 'urgent') {
        showToast(
          notification.options.priority === 'urgent' ? 'error' : 'warning',
          notification.title,
          notification.message,
          notification.options
        )
      }
    }, i * 2000) // 2 second delay between notifications
  }
}

export const createTestToast = (showToast: any) => {
  console.log('createTestToast called with:', showToast)

  if (!showToast) {
    console.error('showToast function not available!')
    return
  }

  const messages = [
    { type: 'success', title: 'Úspěch!', message: 'Úkol byl úspěšně dokončen.' },
    { type: 'error', title: 'Chyba!', message: 'Nepodařilo se uložit změny.' },
    { type: 'warning', title: 'Upozornění!', message: 'Blíží se termín úkolu.' },
    { type: 'info', title: 'Info', message: 'Nová aktualizace je k dispozici.' }
  ]

  const randomMessage = messages[Math.floor(Math.random() * messages.length)]

  console.log('Showing toast:', randomMessage)

  try {
    showToast(
      randomMessage.type,
      randomMessage.title,
      randomMessage.message,
      { priority: 'medium' }
    )
    console.log('Toast shown successfully')
  } catch (error) {
    console.error('Error showing toast:', error)
  }
}
