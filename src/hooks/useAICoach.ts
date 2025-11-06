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

  // Refresh emotional insight (updates state)
  const refreshEmotionalInsight = useCallback(async () => {
    const insight = await analyzeEmotionalState()
    setEmotionalInsight(insight)
  }, [analyzeEmotionalState])

  // Generate motivational and supportive messages (friend & companion style)
  const generateSuggestions = useCallback(async (): Promise<CoachSuggestion[]> => {
    if (!wedding || !user) return []

    const suggestions: CoachSuggestion[] = []
    const now = new Date()
    const hour = now.getHours()
    const isFemale = user.gender === 'female'
    const isMale = user.gender === 'male'

    // Check today's activity (tasks completed today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tasksCompletedToday = tasks?.filter(t =>
      t.completedAt &&
      new Date(t.completedAt).setHours(0, 0, 0, 0) === today.getTime()
    ).length || 0

    // Morning motivation (6-11)
    if (hour >= 6 && hour < 11 && Math.random() > 0.6) {
      const morningMessagesFemale = [
        { title: '☀️ Dobré ráno, krásko!', message: 'Nový den, nové možnosti! Dnes budeš zářit ještě víc než včera! ✨' },
        { title: '🌅 Krásné ráno!', message: 'Začni den s úsměvem - tvoje svatba bude úžasná, protože TY jsi úžasná! 💕' },
        { title: '☕ Dobré ráno!', message: 'Dej si kafe, nadechni se a pamatuj - jsi silná a zvládneš to! 🌟' },
        { title: '🌸 Nový den!', message: 'Každé ráno je šance začít znovu. Dnes to bude skvělý den! 💕' },
        { title: '✨ Ahoj!', message: 'Vstávej, krásko! Svět potřebuje tvůj úsměv. A tvůj budoucí manžel taky! 😊' },
        { title: '🌞 Dobré ráno!', message: 'Dnes je perfektní den na to, udělat něco pro svatbu. Nebo si jen odpočinout. Obojí je v pohodě! 💪' },
        { title: '☕ Ranní káva?', message: 'Začni den v klidu. Svatební plánování může počkat, dokud si nedáš kafe! ☕' },
        { title: '🌺 Krásný den!', message: 'Pamatuj - nemusíš být dokonalá. Stačí být ty sama. A to je víc než dost! 💕' },
        { title: '🦋 Dobré ráno!', message: 'Dnes zkus udělat jednu věc, která tě udělá šťastnou. Jen pro sebe! ✨' },
        { title: '🌈 Nový začátek!', message: 'Každý den tě přibližuje k tvému velkému dni. Ale nezapomeň si užívat i cestu! 🌟' }
      ]
      const morningMessagesMale = [
        { title: '☀️ Dobré ráno, šampione!', message: 'Nový den, nové možnosti! Dnes to zvládneš skvěle! ✨' },
        { title: '🌅 Krásné ráno!', message: 'Začni den s úsměvem - tvoje svatba bude úžasná, protože TY jsi úžasný! 💪' },
        { title: '☕ Dobré ráno!', message: 'Dej si kafe, nadechni se a pamatuj - jsi silný a zvládneš to! 🌟' },
        { title: '🔥 Nový den!', message: 'Každé ráno je šance začít znovu. Dnes to bude skvělý den! 💪' },
        { title: '✨ Ahoj!', message: 'Vstávej, šampione! Svět potřebuje tvou energii. A tvoje budoucí manželka taky! 😊' },
        { title: '🌞 Dobré ráno!', message: 'Dnes je perfektní den na to, udělat něco pro svatbu. Nebo si jen odpočinout. Obojí je v pohodě! 💪' },
        { title: '☕ Ranní káva?', message: 'Začni den v klidu. Svatební plánování může počkat, dokud si nedáš kafe! ☕' },
        { title: '💪 Krásný den!', message: 'Pamatuj - nemusíš být dokonalý. Stačí být ty sám. A to je víc než dost! 🌟' },
        { title: '🎯 Dobré ráno!', message: 'Dnes zkus udělat jednu věc, která tě udělá šťastným. Jen pro sebe! ✨' },
        { title: '🌈 Nový začátek!', message: 'Každý den tě přibližuje k tvému velkému dni. Ale nezapomeň si užívat i cestu! 💪' }
      ]
      const messages = isFemale ? morningMessagesFemale : isMale ? morningMessagesMale : morningMessagesFemale
      const msg = messages[Math.floor(Math.random() * messages.length)]
      suggestions.push({
        id: 'morning-motivation',
        type: 'motivation',
        ...msg,
        priority: 'low',
        icon: msg.title.split(' ')[0]
      })
    }

    // Afternoon encouragement (12-17) - based on actual activity
    if (hour >= 12 && hour < 17 && Math.random() > 0.7) {
      // If user completed tasks today, congratulate them
      if (tasksCompletedToday > 0) {
        // Czech grammar: 1 úkol, 2-4 úkoly, 5+ úkolů
        const taskWord = tasksCompletedToday === 1 ? 'úkol' :
                        tasksCompletedToday >= 2 && tasksCompletedToday <= 4 ? 'úkoly' : 'úkolů'

        const afternoonMessagesFemale = [
          { title: '🎉 Skvělá práce!', message: `Dnes jsi dokončila ${tasksCompletedToday} ${taskWord}! Nezapomeň si dát pauzu. 🥗` },
          { title: '✨ Paráda!', message: `Dneska toho děláš hodně! ${tasksCompletedToday} ${taskWord} hotových! Jsi úžasná! 💕` },
          { title: '💪 Makáš!', message: `${tasksCompletedToday} ${taskWord} dokončených! Tvůj budoucí manžel má štěstí! Nezapomeň si odpočinout. 🌟` }
        ]
        const afternoonMessagesMale = [
          { title: '🎉 Skvělá práce!', message: `Dnes jsi dokončil ${tasksCompletedToday} ${taskWord}! Nezapomeň si dát pauzu. 🍔` },
          { title: '✨ Paráda!', message: `Dneska toho děláš hodně! ${tasksCompletedToday} ${taskWord} hotových! Jsi úžasný! 💪` },
          { title: '💪 Makáš!', message: `${tasksCompletedToday} ${taskWord} dokončených! Tvoje budoucí manželka má štěstí! Nezapomeň si odpočinout. 🌟` }
        ]
        const messages = isFemale ? afternoonMessagesFemale : isMale ? afternoonMessagesMale : afternoonMessagesFemale
        const msg = messages[Math.floor(Math.random() * messages.length)]
        suggestions.push({
          id: 'afternoon-encouragement',
          type: 'motivation',
          ...msg,
          priority: 'medium',
          icon: msg.title.split(' ')[0]
        })
      } else {
        // General encouragement if no tasks completed today
        const afternoonMessagesFemale = [
          { title: '💪 Jsi skvělá!', message: 'Tvoje budoucí manžel má štěstí! Nezapomeň si dát pauzu a něco dobrého k jídlu. 🥗' },
          { title: '✨ Máš to!', message: 'Každý krok tě přibližuje k tvému velkému dni. A budeš v něm vypadat úžasně! 👰' },
          { title: '🌟 Pokračuj!', message: 'Jsi na skvělé cestě! Nezapomeň si užívat i cestu, ne jen cíl. 💕' },
          { title: '🌸 Pauza je OK!', message: 'Nemusíš dělat všechno najednou. Někdy je nejlepší si jen odpočinout. 💆‍♀️' },
          { title: '💕 Jsi úžasná!', message: 'I když dnes nic neuděláš, pořád jsi úžasná nevěsta. Odpočinek je taky důležitý! 🌺' },
          { title: '🦋 Bez stresu!', message: 'Svatba má být radost, ne stres. Dělej věci svým tempem! ✨' },
          { title: '🌈 Tvoje tempo!', message: 'Každý má své tempo. Tvoje je přesně takové, jaké má být. 💕' },
          { title: '☕ Čas na pauzu?', message: 'Možná je čas si dát pauzu, kávu a jen si chvíli oddechnout. Zasloužíš si to! ☕' }
        ]
        const afternoonMessagesMale = [
          { title: '💪 Jsi skvělý!', message: 'Tvoje budoucí manželka má štěstí! Nezapomeň si dát pauzu a něco dobrého k jídlu. 🍔' },
          { title: '✨ Máš to!', message: 'Každý krok tě přibližuje k tvému velkému dni. Bude to úžasná svatba! 🤵' },
          { title: '🌟 Pokračuj!', message: 'Jsi na skvělé cestě! Nezapomeň si užívat i cestu, ne jen cíl. 💪' },
          { title: '🎯 Pauza je OK!', message: 'Nemusíš dělat všechno najednou. Někdy je nejlepší si jen odpočinout. 🏋️' },
          { title: '💪 Jsi úžasný!', message: 'I když dnes nic neuděláš, pořád jsi úžasný ženich. Odpočinek je taky důležitý! 🌟' },
          { title: '🔥 Bez stresu!', message: 'Svatba má být radost, ne stres. Dělej věci svým tempem! ✨' },
          { title: '🌈 Tvoje tempo!', message: 'Každý má své tempo. Tvoje je přesně takové, jaké má být. 💪' },
          { title: '☕ Čas na pauzu?', message: 'Možná je čas si dát pauzu, kávu a jen si chvíli oddechnout. Zasloužíš si to! ☕' }
        ]
        const messages = isFemale ? afternoonMessagesFemale : isMale ? afternoonMessagesMale : afternoonMessagesFemale
        const msg = messages[Math.floor(Math.random() * messages.length)]
        suggestions.push({
          id: 'afternoon-encouragement',
          type: 'motivation',
          ...msg,
          priority: 'low',
          icon: msg.title.split(' ')[0]
        })
      }
    }

    // Evening relaxation (18-23)
    if (hour >= 18 && hour < 23 && Math.random() > 0.6) {
      const eveningMessagesFemale = [
        { title: '🌙 Čas na odpočinek', message: 'Dnes jsi toho zvládla dost. Teď si zasloužíš relax s partnerem nebo sklenku vína! 🍷' },
        { title: '💆‍♀️ Uvolni se', message: 'Večer je na to, abys se uvolnila. Možná teplá koupel? Zasloužíš si to! 🛁' },
        { title: '✨ Krásný večer!', message: 'Jsi úžasná nevěsta a ještě úžasnější člověk. Nezapomeň na to! 💕' },
        { title: '🌺 Večerní klid', message: 'Vypni telefon, zapni svíčky a užij si chvíli jen pro sebe. Zasloužíš si to! 🕯️' },
        { title: '💕 Čas pro vás', message: 'Večer je ideální na romantiku. Kdy naposledy jste měli date night? 🌹' },
        { title: '🛁 Relax time!', message: 'Teplá koupel, dobrá hudba a žádné svatební plánování. Zní to dobře? 🎵' },
        { title: '🌙 Dobrý večer!', message: 'Dnes už toho bylo dost. Teď je čas na odpočinek a regeneraci. 💤' },
        { title: '✨ Večerní pohoda', message: 'Nezapomeň - svatba je důležitá, ale tvoje pohoda je důležitější! 💕' },
        { title: '🍷 Zasloužený relax', message: 'Dnes jsi byla skvělá. Teď si dej sklenku vína a užij si večer! 🌟' },
        { title: '💆‍♀️ Uvolnění', message: 'Stres z příprav? Zkus meditaci, jógu nebo jen hluboké dýchání. Pomůže to! 🧘‍♀️' }
      ]
      const eveningMessagesMale = [
        { title: '🌙 Čas na odpočinek', message: 'Dnes jsi toho zvládl dost. Teď si zasloužíš relax s partnerkou nebo pivo! 🍺' },
        { title: '💆‍♂️ Uvolni se', message: 'Večer je na to, abys se uvolnil. Možná sport nebo film? Zasloužíš si to! 🎮' },
        { title: '✨ Krásný večer!', message: 'Jsi úžasný ženich a ještě úžasnější člověk. Nezapomeň na to! 💪' },
        { title: '🎮 Večerní klid', message: 'Vypni telefon, zapni konzoli nebo film a užij si chvíli jen pro sebe. Zasloužíš si to! 🎬' },
        { title: '💕 Čas pro vás', message: 'Večer je ideální na romantiku. Kdy naposledy jste měli date night? 🌹' },
        { title: '🏋️ Relax time!', message: 'Možná večerní běh, posilovna nebo jen procházka? Pomůže ti to vyčistit hlavu! 🏃' },
        { title: '🌙 Dobrý večer!', message: 'Dnes už toho bylo dost. Teď je čas na odpočinek a regeneraci. 💤' },
        { title: '✨ Večerní pohoda', message: 'Nezapomeň - svatba je důležitá, ale tvoje pohoda je důležitější! 💪' },
        { title: '🍺 Zasloužený relax', message: 'Dnes jsi byl skvělý. Teď si dej pivo a užij si večer! 🌟' },
        { title: '💆‍♂️ Uvolnění', message: 'Stres z příprav? Zkus sport, běh nebo jen hluboké dýchání. Pomůže to! 🏃' }
      ]
      const messages = isFemale ? eveningMessagesFemale : isMale ? eveningMessagesMale : eveningMessagesFemale
      const msg = messages[Math.floor(Math.random() * messages.length)]
      suggestions.push({
        id: 'evening-relaxation',
        type: 'relaxation',
        ...msg,
        priority: 'low',
        icon: msg.title.split(' ')[0]
      })
    }

    // Wedding countdown milestones
    if (wedding.weddingDate) {
      const weddingDate = new Date(wedding.weddingDate)
      const daysUntil = Math.ceil((weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if ([365, 180, 100, 60, 30, 14, 7, 3, 1].includes(daysUntil)) {
        const messageFemale = daysUntil === 1 ? 'Zítra je ten velký den! Budeš v něm vypadat jako princezna! 👑💕' :
                              daysUntil <= 7 ? 'Už je to za rohem! Tvůj velký den se blíží a ty budeš zářit! ✨' :
                              daysUntil <= 30 ? 'Měsíc do svatby! Jsi na skvělé cestě a budeš nádherná nevěsta! 💕' :
                              'Máš ještě čas, ale už se můžeš těšit! Bude to úžasný den! 🌟'

        const messageMale = daysUntil === 1 ? 'Zítra je ten velký den! Bude to úžasný zážitek! 🤵💪' :
                            daysUntil <= 7 ? 'Už je to za rohem! Tvůj velký den se blíží! Jsi připravený! ✨' :
                            daysUntil <= 30 ? 'Měsíc do svatby! Jsi na skvělé cestě! Bude to bomba! 💪' :
                            'Máš ještě čas, ale už se můžeš těšit! Bude to úžasný den! 🌟'

        suggestions.push({
          id: 'countdown-milestone',
          type: 'milestone',
          title: `🎊 ${daysUntil} dní do svatby!`,
          message: isFemale ? messageFemale : isMale ? messageMale : messageFemale,
          priority: daysUntil <= 7 ? 'high' : 'medium',
          icon: '🎊'
        })
      }
    }

    // Relationship reminder - expanded with more variety
    if (Math.random() > 0.7) {
      const relationshipMessages = [
        { title: '💑 Čas pro vás dva', message: 'Nezapomeň si užít čas s partnerem - bez svatebního plánování! Váš vztah je to nejdůležitější. 💕' },
        { title: '❤️ Date night!', message: 'Kdy naposledy jste šli jen tak na večeři? Bez telefonu, bez svatby, jen vy dva? 🍽️' },
        { title: '💕 Váš vztah', message: 'Svatba je jen jeden den. Váš vztah je na celý život. Věnujte si čas! 🌟' },
        { title: '🌹 Romantika', message: 'Nezapomeň na malé gesta lásky. Květiny, vzkaz, objetí. To je to, co počítá! 💐' },
        { title: '💑 Společný čas', message: 'Zkuste něco nového spolu - tanec, vaření, procházka. Posílí to váš vztah! ✨' },
        { title: '❤️ Komunikace', message: 'Jak se cítí tvůj partner? Kdy jste naposledy mluvili o něčem jiném než o svatbě? 💬' },
        { title: '💕 Láska je důležitá', message: 'Svatba je oslava vaší lásky. Ale láska potřebuje péči každý den, ne jen na svatbě! 🌺' },
        { title: '🌟 Vy dva', message: 'Pamatuj proč se berete. Ne kvůli dokonalé svatbě, ale kvůli lásce! 💕' }
      ]
      const msg = relationshipMessages[Math.floor(Math.random() * relationshipMessages.length)]
      suggestions.push({
        id: 'relationship-reminder',
        type: 'relationship',
        ...msg,
        priority: 'low',
        icon: msg.title.split(' ')[0]
      })
    }

    // Self-care reminder - greatly expanded
    if (Math.random() > 0.75) {
      const selfCareMessagesFemale = [
        { title: '💅 Péče o sebe', message: 'Kdy naposledy jsi byla u kadeřníka nebo na manikúře? Zasloužíš si to! ✨' },
        { title: '🧘‍♀️ Relaxuj', message: 'Svatební přípravy jsou náročné. Nezapomeň na jógu, meditaci nebo jen procházku! 🌸' },
        { title: '😴 Odpočinek', message: 'Spánek je důležitý! Krásná nevěsta potřebuje odpočinek. 💤' },
        { title: '🌺 Jsi krásná!', message: 'Pamatuj - jsi krásná už teď. Svatební šaty jen zvýrazní to, co už máš! 💕' },
        { title: '🛁 Koupel?', message: 'Teplá koupel s vonnými solemi může zázraky. Zkus to dnes večer! 🕯️' },
        { title: '🌸 Tvoje zdraví', message: 'Stres ovlivňuje tělo i mysl. Dej si pauzu, když ji potřebuješ. Není to slabost! 💪' },
        { title: '💆‍♀️ Masáž?', message: 'Kdy naposledy jsi byla na masáži? Tvoje tělo by ti poděkovalo! 🌟' },
        { title: '🥗 Zdravá strava', message: 'Nezapomeň jíst pravidelně a zdravě. Tvoje tělo potřebuje energii! 🍎' },
        { title: '💧 Hydratace', message: 'Piješ dost vody? Hydratace je základ pro krásnou pleť i dobrou náladu! 💦' },
        { title: '🌺 Tvoje pohoda', message: 'Nemůžeš se starat o svatbu, když se nestaráš o sebe. Ty jsi priorita! 💕' },
        { title: '✨ Krása zevnitř', message: 'Nejkrásnější nevěsta je ta šťastná a odpočatá. Ne ta vyčerpaná! 🌟' },
        { title: '🧘‍♀️ Mindfulness', message: 'Zkus 5 minut meditace denně. Pomůže ti to zvládnout stres! 🙏' },
        { title: '🌸 Tvoje energie', message: 'Cítíš se vyčerpaná? To je signál, že potřebuješ pauzu. Poslouchej své tělo! 💤' },
        { title: '💕 Self-love', message: 'Buď na sebe hodná. Mluvíš sama se sebou tak, jak bys mluvila s kamarádkou? 🌺' }
      ]
      const selfCareMessagesMale = [
        { title: '💈 Péče o sebe', message: 'Kdy naposledy jsi byl u holiče? Ženich musí vypadat skvěle! ✨' },
        { title: '🏋️‍♂️ Relaxuj', message: 'Svatební přípravy jsou náročné. Nezapomeň na sport, běh nebo jen procházku! 💪' },
        { title: '😴 Odpočinek', message: 'Spánek je důležitý! Odpočatý ženich je šťastný ženich. 💤' },
        { title: '💪 Jsi skvělý!', message: 'Pamatuj - jsi skvělý už teď. Oblek jen zvýrazní to, co už máš! 🤵' },
        { title: '🏃 Sport?', message: 'Běh, posilovna nebo fotbal s kamarády? Sport pomáhá zvládat stres! ⚽' },
        { title: '🎯 Tvoje zdraví', message: 'Stres ovlivňuje tělo i mysl. Dej si pauzu, když ji potřebuješ. Není to slabost! 💪' },
        { title: '💆‍♂️ Masáž?', message: 'Kdy naposledy jsi byl na masáži? Tvoje tělo by ti poděkovalo! 🌟' },
        { title: '🍔 Zdravá strava', message: 'Nezapomeň jíst pravidelně a zdravě. Tvoje tělo potřebuje energii! 🥙' },
        { title: '💧 Hydratace', message: 'Piješ dost vody? Hydratace je základ pro energii i dobrou náladu! 💦' },
        { title: '💪 Tvoje pohoda', message: 'Nemůžeš se starat o svatbu, když se nestaráš o sebe. Ty jsi priorita! 🌟' },
        { title: '✨ Síla zevnitř', message: 'Nejlepší ženich je ten šťastný a odpočatý. Ne ten vyčerpaný! 💪' },
        { title: '🧘‍♂️ Mindfulness', message: 'Zkus 5 minut meditace denně. Pomůže ti to zvládnout stres! 🙏' },
        { title: '🎯 Tvoje energie', message: 'Cítíš se vyčerpaný? To je signál, že potřebuješ pauzu. Poslouchej své tělo! 💤' },
        { title: '💪 Self-care', message: 'Buď na sebe hodný. Mluvíš sám se sebou tak, jak bys mluvil s kamarádem? 🌟' }
      ]
      const messages = isFemale ? selfCareMessagesFemale : isMale ? selfCareMessagesMale : selfCareMessagesFemale
      const msg = messages[Math.floor(Math.random() * messages.length)]
      suggestions.push({
        id: 'self-care',
        type: 'relaxation',
        ...msg,
        priority: 'low',
        icon: msg.title.split(' ')[0]
      })
    }

    // Positive affirmations - greatly expanded
    if (Math.random() > 0.8) {
      const affirmationsFemale = [
        { title: '✨ Jsi úžasná!', message: 'Tvoje svatba bude krásná, protože TY jsi krásná - uvnitř i navenek! 💕' },
        { title: '🌟 Věř si!', message: 'Máš skvělý vkus a všechno bude perfektní. Věř si! 💪' },
        { title: '👑 Jsi princezna!', message: 'Tvůj velký den bude jako z pohádky. A ty budeš ta nejkrásnější princezna! 💕' },
        { title: '💖 Jsi silná!', message: 'Zvládáš toho tolik! Jsi silná, krásná a úžasná žena! 🌟' },
        { title: '🌺 Tvoje hodnota', message: 'Tvoje hodnota není v dokonalé svatbě. Jsi cenná prostě proto, že jsi TY! 💕' },
        { title: '✨ Jsi dost!', message: 'Nemusíš být dokonalá. Jsi dost přesně taková, jaká jsi. A to je krásné! 🌟' },
        { title: '💕 Tvoje cesta', message: 'Každá nevěsta má svou cestu. Tvoje je jedinečná a krásná! 🦋' },
        { title: '🌸 Důvěřuj si', message: 'Tvoje intuice je tvůj nejlepší průvodce. Poslouchej ji! 💫' },
        { title: '✨ Jsi inspirace', message: 'Tvoje láska a odvaha inspiruje ostatní. Jsi úžasná! 🌟' },
        { title: '💖 Tvoje síla', message: 'Síla není v tom, že všechno zvládneš. Ale v tom, že víš, kdy požádat o pomoc! 💪' }
      ]
      const affirmationsMale = [
        { title: '✨ Jsi úžasný!', message: 'Tvoje svatba bude skvělá, protože TY jsi skvělý - uvnitř i navenek! 💪' },
        { title: '🌟 Věř si!', message: 'Máš skvělý vkus a všechno bude perfektní. Věř si! 🔥' },
        { title: '🤵 Jsi šampion!', message: 'Tvůj velký den bude úžasný. A ty budeš ten nejlepší ženich! 💪' },
        { title: '💪 Jsi silný!', message: 'Zvládáš toho tolik! Jsi silný, skvělý a úžasný chlap! 🌟' },
        { title: '🎯 Tvoje hodnota', message: 'Tvoje hodnota není v dokonalé svatbě. Jsi cenný prostě proto, že jsi TY! 💪' },
        { title: '✨ Jsi dost!', message: 'Nemusíš být dokonalý. Jsi dost přesně takový, jaký jsi. A to je skvělé! 🌟' },
        { title: '💪 Tvoje cesta', message: 'Každý ženich má svou cestu. Tvoje je jedinečná a skvělá! 🔥' },
        { title: '🎯 Důvěřuj si', message: 'Tvoje intuice je tvůj nejlepší průvodce. Poslouchej ji! 💫' },
        { title: '✨ Jsi inspirace', message: 'Tvoje láska a odvaha inspiruje ostatní. Jsi úžasný! 🌟' },
        { title: '💪 Tvoje síla', message: 'Síla není v tom, že všechno zvládneš. Ale v tom, že víš, kdy požádat o pomoc! 🤝' }
      ]
      const messages = isFemale ? affirmationsFemale : isMale ? affirmationsMale : affirmationsFemale
      const msg = messages[Math.floor(Math.random() * messages.length)]
      suggestions.push({
        id: 'affirmation',
        type: 'motivation',
        ...msg,
        priority: 'medium',
        icon: msg.title.split(' ')[0]
      })
    }

    // Practical tips and advice - NEW CATEGORY!
    if (Math.random() > 0.75) {
      const practicalTips = [
        { title: '📝 Tip na organizaci', message: 'Zkus si udělat týdenní plán úkolů. Malé kroky jsou lepší než velký stres! 📋' },
        { title: '💰 Rozpočet', message: 'Sleduj výdaje průběžně. Překvapení na konci nechceš! Mám tady skvělý nástroj na rozpočet! 💳' },
        { title: '📞 Komunikace', message: 'Potvrď si všechny rezervace měsíc před svatbou. Jistota je základ! ✅' },
        { title: '📸 Fotky', message: 'Udělej si seznam fotek, které chceš mít. Fotografovi to usnadní práci! 📷' },
        { title: '🎵 Hudba', message: 'Vytvoř si playlist pro různé části svatby. Pomůže to DJ nebo kapele! 🎶' },
        { title: '🍽️ Catering', message: 'Nezapomeň na vegetariánské a bezlepkové varianty. Hosté ti poděkují! 🥗' },
        { title: '⏰ Časový plán', message: 'Naplánuj si časovou rezervu. Vždycky něco trvá déle, než čekáš! ⌚' },
        { title: '👥 Delegování', message: 'Vyber si svědky nebo kamarády, kteří ti pomohou v den svatby. Nemusíš všechno řešit sama/sám! 🤝' },
        { title: '🎁 Dárky', message: 'Připrav malé dárky pro hosty. Nemusí být drahé, stačí milé! 🎀' },
        { title: '📋 Checklist', message: 'Měsíc před svatbou si udělej finální checklist. Nic nezapomeneš! ✓' }
      ]
      const tip = practicalTips[Math.floor(Math.random() * practicalTips.length)]
      suggestions.push({
        id: 'practical-tip',
        type: 'task',
        ...tip,
        priority: 'medium',
        icon: tip.title.split(' ')[0]
      })
    }

    // Stress management - NEW CATEGORY!
    if (Math.random() > 0.8) {
      const stressManagement = [
        { title: '🧘 Dýchej', message: 'Cítíš stres? Zkus 4-7-8 dýchání: 4 sekundy nádech, 7 zadržet, 8 výdech. Opakuj 3x! 🌬️' },
        { title: '📱 Digital detox', message: 'Zkus jeden večer bez telefonu a sociálních sítí. Tvoje mysl ti poděkuje! 🔌' },
        { title: '🌳 Příroda', message: 'Procházka v přírodě snižuje stres o 30%. Zkus to dnes! 🌲' },
        { title: '😊 Smích', message: 'Kdy naposledy jsi se pořádně zasmál/a? Pusť si komedii nebo zavolej kamarádovi! 😄' },
        { title: '✍️ Deník', message: 'Zkus si psát deník. Pomáhá to zpracovat emoce a snížit stres! 📖' },
        { title: '🎨 Kreativita', message: 'Udělej něco kreativního - malování, vaření, zahradničení. Pomáhá to vypnout! 🖌️' },
        { title: '🎵 Hudba', message: 'Poslechni si svou oblíbenou hudbu. Má prokázaný vliv na snížení stresu! 🎧' },
        { title: '💭 Perspektiva', message: 'Za rok si budeš pamatovat lásku, ne to, jestli byly květiny přesně podle plánu! 🌸' }
      ]
      const tip = stressManagement[Math.floor(Math.random() * stressManagement.length)]
      suggestions.push({
        id: 'stress-management',
        type: 'relaxation',
        ...tip,
        priority: 'medium',
        icon: tip.title.split(' ')[0]
      })
    }

    // Friendship and support - NEW CATEGORY!
    if (Math.random() > 0.85) {
      const friendshipMessages = [
        { title: '🤗 Jsem tu pro tebe', message: 'Potřebuješ si promluvit? Jsem tu! Můžeš mi napsat cokoliv. 💬' },
        { title: '💪 Nejsi sám/sama', message: 'Tisíce párů prošly stejnou cestou. Zvládli to a ty to taky zvládneš! 🌟' },
        { title: '🌈 Lepší dny', message: 'I když je dnes těžký den, zítra může být lepší. Drž se! 💕' },
        { title: '🎯 Tvůj úspěch', message: 'Už jsi toho tolik zvládl/a! Podívej se, jak daleko jsi došel/došla! 🏆' },
        { title: '💬 Potřebuješ pomoc?', message: 'Není hanba požádat o pomoc. Naopak, je to známka síly! 🤝' },
        { title: '🌟 Věřím v tebe', message: 'Možná dnes nevěříš sama/sám sobě. Ale já v tebe věřím! 💪' },
        { title: '💕 Jsi skvělý/á', message: 'I když to dnes necítíš, jsi úžasný člověk. A zasloužíš si krásnou svatbu! ✨' }
      ]
      const msg = friendshipMessages[Math.floor(Math.random() * friendshipMessages.length)]
      suggestions.push({
        id: 'friendship-support',
        type: 'motivation',
        ...msg,
        priority: 'high',
        icon: msg.title.split(' ')[0]
      })
    }

    return suggestions
  }, [wedding, user, tasks])

  // Load suggestions on mount and when data changes
  useEffect(() => {
    if (user && wedding) {
      generateSuggestions().then(setSuggestions)
      analyzeEmotionalState().then(setEmotionalInsight)
    }
  }, [user, wedding, generateSuggestions, analyzeEmotionalState])

  // Refresh suggestions every 5 minutes to show different messages
  useEffect(() => {
    if (!user || !wedding) return

    const interval = setInterval(() => {
      generateSuggestions().then(setSuggestions)
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [user, wedding, generateSuggestions])

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
    refreshEmotionalInsight,

    // Suggestions
    generateSuggestions,

    // Brand identity
    svatbot: SVATBOT_PERSONALITY
  }
}

