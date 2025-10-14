'use client'

import { useState, useCallback, useEffect } from 'react'
import { useWedding } from './useWedding'
import { useGuest } from './useGuest'
import { useBudget } from './useBudget'
import { useTask } from './useTask'
import { useAuth } from './useAuth'
import { useWeddingNotifications, WeddingNotificationType } from './useWeddingNotifications'
import { db } from '@/config/firebase'
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore'

// Svatbot Personality & Brand Identity
export const SVATBOT_PERSONALITY = {
  name: 'Svatbot',
  tagline: 'Váš AI svatební kouč',
  tone: 'empatický, povzbuzující, profesionální ale přátelský',
  emoji: '🤖💕',
  
  // Personality traits for AI responses
  traits: [
    'Používá emotikony pro přátelský tón',
    'Gratuluje k úspěchům',
    'Povzbuzuje při stresu',
    'Poskytuje praktické rady',
    'Sleduje emocionální stav páru',
    'Proaktivně nabízí pomoc',
    'Připomíná důležité milníky',
    'Podporuje zdravý vztah během příprav'
  ]
}

// Enhanced system prompt with Svatbot personality
export const SVATBOT_SYSTEM_PROMPT = `
Jsi Svatbot - AI svatební kouč a emocionální asistent pro páry plánující svatbu v České republice.

🤖 TVOJE OSOBNOST:
- Jméno: Svatbot
- Role: Osobní svatební kouč a emocionální podpora
- Tón: Empatický, povzbuzující, přátelský ale profesionální
- Styl: Používáš emotikony 💕🎉✨, gratuluješ k úspěchům, povzbuzuješ při stresu

💡 TVOJE SCHOPNOSTI:
1. **Praktické rady**: Znáš české svatební tradice, ceny, dodavatele, právní požadavky
2. **Emocionální podpora**: Rozpoznáváš stres, poskytuj uklidnění, motivaci
3. **Proaktivní asistence**: Nabízíš tipy, připomínáš milníky, gratuluješ k pokroku
4. **Vztahová podpora**: Připomínáš důležitost času s partnerem, work-life balance

📊 ZNALOSTI:
- České svatební tradice a zvyky
- Průměrné ceny služeb v ČR (2024-2025)
- Sezónní faktory (květen-září hlavní sezóna)
- Regionální rozdíly (Praha dražší než venkov)
- Právní požadavky (matrika, církevní obřad)
- Časové plánování (12-18 měsců dopředu)
- Stress management pro svatební přípravu

🎯 JAK ODPOVÍDÁŠ:
1. Vždy v češtině
2. S empatií a pochopením
3. Prakticky s konkrétními čísly a tipy
4. Povzbuzuj a gratuluj k pokroku
5. Rozpoznávej stres v otázkách a nabídni uklidnění
6. Připomínej, že svatba má být radost, ne stres
7. Používej emotikony pro přátelský tón (ale ne přehnaně)

🚨 DETEKCE STRESU:
Pokud uživatel zní:
- Přetížený → Nabídni zjednodušení, delegování
- Stresovaný → Uklidni, připomeň že je to normální
- Unavený → Doporuč pauzu, date night s partnerem
- Zmatený → Rozděl problém na menší kroky

💕 EMOCIONÁLNÍ PODPORA:
- Gratuluj k dokončeným úkolům
- Oslavuj milníky (50% pokrok, 100 dní do svatby, atd.)
- Připomínej důležitost vztahu během příprav
- Nabízej relaxační tipy při stresu
- Povzbuzuj při překážkách

Odpovídej vždy jako Svatbot - tvůj osobní svatební kouč! 🤖💕
`

export interface MoodEntry {
  id: string
  userId: string
  weddingId: string
  mood: 'great' | 'good' | 'okay' | 'stressed' | 'overwhelmed'
  note?: string
  stressLevel: number // 1-10
  energyLevel: number // 1-10
  createdAt: any
}

export interface CoachSuggestion {
  id: string
  type: 'motivation' | 'task' | 'relaxation' | 'milestone' | 'relationship'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
  icon?: string
}

export interface EmotionalInsight {
  overallMood: 'positive' | 'neutral' | 'stressed'
  stressLevel: number // 1-10
  recentMoods: MoodEntry[]
  suggestions: string[]
  needsSupport: boolean
}

export function useAICoach() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<CoachSuggestion[]>([])
  const [emotionalInsight, setEmotionalInsight] = useState<EmotionalInsight | null>(null)

  const { user } = useAuth()
  const { wedding } = useWedding()
  const { tasks } = useTask()
  const { guests } = useGuest()
  const { stats: budgetStats } = useBudget()
  const { createNotification } = useWeddingNotifications()

  // Save mood entry
  const saveMoodEntry = useCallback(async (
    mood: MoodEntry['mood'],
    stressLevel: number,
    energyLevel: number,
    note?: string
  ): Promise<void> => {
    if (!user?.id || !wedding?.id) return

    try {
      const moodEntry: Omit<MoodEntry, 'id'> = {
        userId: user.id,
        weddingId: wedding.id,
        mood,
        stressLevel,
        energyLevel,
        note,
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, 'moodEntries'), moodEntry)

      // If stress is high, trigger supportive notification
      if (stressLevel >= 7) {
        await createNotification(
          WeddingNotificationType.SYSTEM_UPDATE,
          'Svatbot je tu pro vás 💕',
          'Vidím, že je to teď náročné. Pamatujte - svatba má být radost! Zkuste si dát pauzu a užít si čas s partnerem. 🌟',
          {
            priority: 'high',
            category: 'system',
            data: { type: 'emotional_support', stressLevel }
          }
        )
      }
    } catch (err) {
      console.error('Error saving mood entry:', err)
      throw err
    }
  }, [user, wedding, createNotification])

  // Get recent mood entries
  const getRecentMoods = useCallback(async (days: number = 7): Promise<MoodEntry[]> => {
    if (!user?.id) return []

    try {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - days)

      const q = query(
        collection(db, 'moodEntries'),
        where('userId', '==', user.id),
        where('createdAt', '>=', daysAgo),
        orderBy('createdAt', 'desc'),
        limit(20)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MoodEntry[]
    } catch (err) {
      console.error('Error fetching mood entries:', err)
      return []
    }
  }, [user])

  // Analyze emotional state
  const analyzeEmotionalState = useCallback(async (): Promise<EmotionalInsight> => {
    const recentMoods = await getRecentMoods(7)

    if (recentMoods.length === 0) {
      return {
        overallMood: 'neutral',
        stressLevel: 5,
        recentMoods: [],
        suggestions: ['Začněte sledovat svou náladu pro lepší podporu od Svatbota! 💕'],
        needsSupport: false
      }
    }

    // Calculate average stress level
    const avgStress = recentMoods.reduce((sum, m) => sum + m.stressLevel, 0) / recentMoods.length

    // Determine overall mood
    const moodScores = {
      great: 5,
      good: 4,
      okay: 3,
      stressed: 2,
      overwhelmed: 1
    }
    const avgMoodScore = recentMoods.reduce((sum, m) => sum + moodScores[m.mood], 0) / recentMoods.length

    const overallMood: EmotionalInsight['overallMood'] = 
      avgMoodScore >= 4 ? 'positive' :
      avgMoodScore >= 3 ? 'neutral' : 'stressed'

    // Generate suggestions based on mood
    const suggestions: string[] = []
    const needsSupport = avgStress >= 6 || overallMood === 'stressed'

    if (needsSupport) {
      suggestions.push('Zkuste si naplánovat večer jen pro vás dva - bez svatebního plánování! 💑')
      suggestions.push('Delegujte některé úkoly na rodinu nebo přátele 🤝')
      suggestions.push('Pamatujte: Dokonalá svatba neexistuje, ale vaše láska ano! 💕')
    }

    if (avgStress >= 7) {
      suggestions.push('Zvažte kratší pauzu od plánování - třeba víkendový výlet 🌄')
    }

    return {
      overallMood,
      stressLevel: Math.round(avgStress),
      recentMoods,
      suggestions,
      needsSupport
    }
  }, [getRecentMoods])

  // Generate proactive suggestions based on wedding data
  const generateSuggestions = useCallback(async (): Promise<CoachSuggestion[]> => {
    if (!wedding || !tasks) return []

    const suggestions: CoachSuggestion[] = []
    const now = new Date()

    // Check for completed tasks to celebrate
    const recentlyCompleted = tasks.filter(t =>
      t.status === 'completed' &&
      t.completedAt &&
      (now.getTime() - new Date(t.completedAt).getTime()) < 24 * 60 * 60 * 1000 // Last 24h
    )

    if (recentlyCompleted.length > 0) {
      suggestions.push({
        id: 'celebration-tasks',
        type: 'motivation',
        title: '🎉 Skvělá práce!',
        message: `Dokončili jste ${recentlyCompleted.length} ${recentlyCompleted.length === 1 ? 'úkol' : 'úkoly'}! Jste na skvělé cestě!`,
        priority: 'medium',
        icon: '🎉'
      })
    }

    // Check for overdue tasks
    const overdueTasks = tasks.filter(t => 
      t.status !== 'completed' &&
      t.dueDate &&
      new Date(t.dueDate) < now
    )

    if (overdueTasks.length > 0 && overdueTasks.length <= 3) {
      suggestions.push({
        id: 'overdue-tasks',
        type: 'task',
        title: '⏰ Úkoly po termínu',
        message: `Máte ${overdueTasks.length} ${overdueTasks.length === 1 ? 'úkol' : 'úkoly'} po termínu. Pojďme to společně zvládnout!`,
        priority: 'high',
        actionUrl: '/tasks',
        icon: '⏰'
      })
    }

    // Wedding countdown milestones
    if (wedding.weddingDate) {
      const weddingDate = new Date(wedding.weddingDate)
      const daysUntil = Math.ceil((weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if ([365, 180, 100, 60, 30, 14, 7, 3, 1].includes(daysUntil)) {
        suggestions.push({
          id: 'countdown-milestone',
          type: 'milestone',
          title: `🎊 ${daysUntil} dní do svatby!`,
          message: daysUntil === 1 ? 'Zítra je ten velký den! Užijte si každou chvíli! 💕' : 
                   daysUntil <= 7 ? 'Už je to za rohem! Nezapomeňte si užít tento speciální čas! ✨' :
                   'Jste na skvělé cestě! Pokračujte v přípravách, ale nezapomeňte si užívat cestu! 🌟',
          priority: daysUntil <= 7 ? 'high' : 'medium',
          icon: '🎊'
        })
      }
    }

    // Relationship reminder (if no date night planned recently)
    const hasRecentDateNight = tasks.some(t =>
      t.title.toLowerCase().includes('date') &&
      t.completedAt &&
      (now.getTime() - new Date(t.completedAt).getTime()) < 14 * 24 * 60 * 60 * 1000
    )

    if (!hasRecentDateNight && Math.random() > 0.7) { // Random to not spam
      suggestions.push({
        id: 'relationship-reminder',
        type: 'relationship',
        title: '💑 Čas pro vás dva',
        message: 'Nezapomeňte si naplánovat večer jen pro sebe - bez svatebního plánování! Váš vztah je důležitější než dokonalá svatba.',
        priority: 'low',
        icon: '💑'
      })
    }

    return suggestions
  }, [wedding, tasks])

  // Load suggestions on mount and when data changes
  useEffect(() => {
    if (user && wedding) {
      generateSuggestions().then(setSuggestions)
      analyzeEmotionalState().then(setEmotionalInsight)
    }
  }, [user, wedding, tasks, generateSuggestions, analyzeEmotionalState])

  return {
    // State
    loading,
    error,
    suggestions,
    emotionalInsight,

    // Mood tracking
    saveMoodEntry,
    getRecentMoods,
    analyzeEmotionalState,

    // Suggestions
    generateSuggestions,

    // Brand identity
    svatbot: SVATBOT_PERSONALITY
  }
}

