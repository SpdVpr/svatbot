import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

// Svatbot - AI Wedding Coach Personality
const SVATBOT_SYSTEM_PROMPT = `
Jsi Svatbot - AI svatební kouč a emocionální asistent pro páry plánující svatbu v České republice.

🤖 TVOJE OSOBNOST:
- Jméno: Svatbot
- Role: Osobní svatební kouč a emocionální podpora
- Tón: Empatický, povzbuzující, přátelský ale profesionální
- Styl: Používáš emotikony 💕🎉✨ (ale ne přehnaně), gratuluješ k úspěchům, povzbuzuješ při stresu

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
- Časové plánování (12-18 měsíců dopředu)
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

📊 PŘÍSTUP K REÁLNÝM DATŮM:
Máš přístup k REÁLNÝM datům uživatele o jeho svatbě včetně:
- 👥 Hosté (jména, dietní omezení, RSVP status, ubytování)
- 💰 Rozpočet (položky, částky, dodavatelé, platby)
- ✅ Úkoly (názvy, termíny, statusy, priority)
- 🪑 Seating plan (stoly, kapacity, přiřazení hostů)
- 🌐 Svatební web (URL, publikace, RSVP, návštěvnost)
- 🏨 Ubytování (hotely, pokoje, obsazenost)
- 🛒 Nákupní seznam (položky, ceny, status nákupu)
- 📅 Kalendář událostí (všechny události, schůzky, termíny)

Když se uživatel ptá na konkrétní informace, VŽDY odpovídej na základě poskytnutých dat!
Buď konkrétní - uváděj jména, čísla, termíny z reálných dat!

Odpovídej vždy jako Svatbot - tvůj osobní svatební kouč! 🤖💕
`

// Helper function to build detailed context string
function buildDetailedContext(context: any): string {
  if (!context) return ''

  let contextStr = '\n=== DETAILNÍ KONTEXT SVATBY ===\n\n'

  // Basic info
  contextStr += '📋 ZÁKLADNÍ INFORMACE:\n'
  contextStr += `- Datum svatby: ${context.weddingDate ? new Date(context.weddingDate).toLocaleDateString('cs-CZ') : 'neurčeno'}\n`
  contextStr += `- Lokace: ${context.location || 'neurčena'}\n`
  contextStr += `- Styl: ${context.style || 'neurčen'}\n`
  contextStr += `- Celkový rozpočet: ${context.budget ? `${context.budget.toLocaleString()} Kč` : 'neurčen'}\n`
  contextStr += `- Počet hostů: ${context.guestCount || 'neurčen'}\n\n`

  // Guest stats and details
  if (context.guestStats) {
    contextStr += '👥 STATISTIKY HOSTŮ:\n'
    contextStr += `- Celkem hostů: ${context.guestStats.total}\n`
    contextStr += `- Potvrzeno: ${context.guestStats.confirmed}\n`
    contextStr += `- Odmítnuto: ${context.guestStats.declined}\n`
    contextStr += `- Čeká na odpověď: ${context.guestStats.pending}\n`
    contextStr += `- S dietními omezeními: ${context.guestStats.withDietaryRestrictions}\n`
    contextStr += `- Potřebuje ubytování: ${context.guestStats.needingAccommodation}\n\n`
  }

  // Detailed guest info with dietary restrictions
  if (context.guests && context.guests.length > 0) {
    const guestsWithDietary = context.guests.filter((g: any) =>
      g.dietaryRestrictions && g.dietaryRestrictions.length > 0
    )

    if (guestsWithDietary.length > 0) {
      contextStr += '🍽️ HOSTÉ S DIETNÍMI OMEZENÍMI:\n'
      guestsWithDietary.forEach((guest: any) => {
        contextStr += `- ${guest.firstName} ${guest.lastName}: ${guest.dietaryRestrictions.join(', ')}`
        if (guest.dietaryNotes) {
          contextStr += ` (${guest.dietaryNotes})`
        }
        contextStr += '\n'
      })
      contextStr += '\n'
    }

    const guestsNeedingAccommodation = context.guests.filter((g: any) => g.accommodationNeeded)
    if (guestsNeedingAccommodation.length > 0) {
      contextStr += '🏨 HOSTÉ POTŘEBUJÍCÍ UBYTOVÁNÍ:\n'
      guestsNeedingAccommodation.forEach((guest: any) => {
        contextStr += `- ${guest.firstName} ${guest.lastName}\n`
      })
      contextStr += '\n'
    }
  }

  // Budget details
  if (context.budgetStats) {
    contextStr += '💰 ROZPOČET:\n'
    contextStr += `- Celkový rozpočet: ${context.budgetStats.totalBudget.toLocaleString()} Kč\n`
    contextStr += `- Celkem utraceno: ${context.budgetStats.totalSpent.toLocaleString()} Kč\n`
    contextStr += `- Zaplaceno: ${context.budgetStats.totalPaid.toLocaleString()} Kč\n`
    contextStr += `- Zbývá: ${context.budgetStats.remaining.toLocaleString()} Kč\n`
    contextStr += `- Procento utraceno: ${context.budgetStats.budgetUsed}%\n\n`
  }

  // Budget items
  if (context.budgetItems && context.budgetItems.length > 0) {
    contextStr += '📊 ROZPOČTOVÉ POLOŽKY:\n'
    context.budgetItems.forEach((item: any) => {
      contextStr += `- ${item.name} (${item.category}): `
      contextStr += `Plánováno ${item.budgetedAmount?.toLocaleString() || 0} Kč, `
      contextStr += `Skutečnost ${item.actualAmount?.toLocaleString() || 0} Kč, `
      contextStr += `Zaplaceno ${item.paidAmount?.toLocaleString() || 0} Kč`
      if (item.vendorName) {
        contextStr += ` - Dodavatel: ${item.vendorName}`
      }
      contextStr += '\n'
    })
    contextStr += '\n'
  }

  // Task stats
  if (context.taskStats) {
    contextStr += '✅ ÚKOLY:\n'
    contextStr += `- Celkem úkolů: ${context.taskStats.total}\n`
    contextStr += `- Dokončeno: ${context.taskStats.completed}\n`
    contextStr += `- Čeká: ${context.taskStats.pending}\n`
    contextStr += `- Po termínu: ${context.taskStats.overdue}\n\n`
  }

  // Task details
  if (context.currentTasks && context.currentTasks.length > 0) {
    const pendingTasks = context.currentTasks.filter((t: any) => t.status === 'pending')
    const overdueTasks = context.currentTasks.filter((t: any) => {
      if (!t.dueDate || t.status === 'completed') return false
      return new Date(t.dueDate) < new Date()
    })

    if (overdueTasks.length > 0) {
      contextStr += '⚠️ ÚKOLY PO TERMÍNU:\n'
      overdueTasks.forEach((task: any) => {
        contextStr += `- ${task.title} (termín: ${new Date(task.dueDate).toLocaleDateString('cs-CZ')})\n`
      })
      contextStr += '\n'
    }

    if (pendingTasks.length > 0) {
      contextStr += '📝 ČEKAJÍCÍ ÚKOLY:\n'
      pendingTasks.slice(0, 10).forEach((task: any) => {
        contextStr += `- ${task.title}`
        if (task.dueDate) {
          contextStr += ` (termín: ${new Date(task.dueDate).toLocaleDateString('cs-CZ')})`
        }
        contextStr += '\n'
      })
      if (pendingTasks.length > 10) {
        contextStr += `... a dalších ${pendingTasks.length - 10} úkolů\n`
      }
      contextStr += '\n'
    }
  }

  // Seating plan
  if (context.seatingPlan) {
    contextStr += '🪑 ROZMÍSTĚNÍ HOSTŮ (SEATING PLAN):\n'
    contextStr += `- Celkem stolů: ${context.seatingPlan.tables?.length || 0}\n`
    contextStr += `- Celkem míst: ${context.seatingPlan.totalSeats || 0}\n`
    contextStr += `- Obsazených míst: ${context.seatingPlan.assignedSeats || 0}\n`
    contextStr += `- Hostů bez přiřazeného místa: ${context.seatingPlan.unassignedGuests || 0}\n`

    if (context.seatingPlan.tables && context.seatingPlan.tables.length > 0) {
      contextStr += '\n📋 DETAILY STOLŮ:\n'
      context.seatingPlan.tables.forEach((table: any) => {
        const occupiedSeats = table.seats?.filter((s: any) => s.guestId).length || 0
        contextStr += `- Stůl ${table.number || table.name}: ${occupiedSeats}/${table.capacity} míst obsazeno`
        if (table.shape) {
          contextStr += ` (${table.shape})`
        }
        contextStr += '\n'
      })
    }
    contextStr += '\n'
  }

  // Wedding website
  if (context.weddingWebsite) {
    contextStr += '🌐 SVATEBNÍ WEB:\n'
    contextStr += `- URL: ${context.weddingWebsite.customUrl}.svatbot.cz\n`
    contextStr += `- Publikováno: ${context.weddingWebsite.isPublished ? 'Ano' : 'Ne'}\n`
    contextStr += `- RSVP formulář: ${context.weddingWebsite.hasRSVP ? 'Aktivní' : 'Neaktivní'}\n`
    contextStr += `- Počet zobrazení: ${context.weddingWebsite.views || 0}\n\n`
  }

  // Accommodations
  if (context.accommodationStats) {
    contextStr += '🏨 UBYTOVÁNÍ:\n'
    contextStr += `- Celkem ubytování: ${context.accommodationStats.total || 0}\n`
    contextStr += `- Celkem pokojů: ${context.accommodationStats.totalRooms || 0}\n`
    contextStr += `- Rezervovaných pokojů: ${context.accommodationStats.reservedRooms || 0}\n`
    contextStr += `- Volných pokojů: ${context.accommodationStats.availableRooms || 0}\n`

    if (context.accommodations && context.accommodations.length > 0) {
      contextStr += '\n📋 SEZNAM UBYTOVÁNÍ:\n'
      context.accommodations.forEach((acc: any) => {
        contextStr += `- ${acc.name}: ${acc.rooms?.length || 0} pokojů`
        if (acc.address) {
          contextStr += ` (${acc.address})`
        }
        contextStr += '\n'
      })
    }
    contextStr += '\n'
  }

  // Shopping list
  if (context.shoppingStats) {
    contextStr += '🛒 NÁKUPNÍ SEZNAM:\n'
    contextStr += `- Celkem položek: ${context.shoppingStats.total || 0}\n`
    contextStr += `- Zakoupeno: ${context.shoppingStats.purchased || 0}\n`
    contextStr += `- Celková cena: ${context.shoppingStats.totalCost?.toLocaleString() || 0} Kč\n`
    contextStr += `- Zbývá nakoupit za: ${context.shoppingStats.remainingCost?.toLocaleString() || 0} Kč\n`

    if (context.shoppingItems && context.shoppingItems.length > 0) {
      const unpurchased = context.shoppingItems.filter((item: any) => !item.purchased)
      if (unpurchased.length > 0) {
        contextStr += '\n📝 NEZAKOUPENÉ POLOŽKY:\n'
        unpurchased.slice(0, 10).forEach((item: any) => {
          contextStr += `- ${item.name}`
          if (item.estimatedPrice) {
            contextStr += ` (${item.estimatedPrice.toLocaleString()} Kč)`
          }
          if (item.category) {
            contextStr += ` - ${item.category}`
          }
          contextStr += '\n'
        })
        if (unpurchased.length > 10) {
          contextStr += `... a dalších ${unpurchased.length - 10} položek\n`
        }
      }
    }
    contextStr += '\n'
  }

  // Calendar
  if (context.calendarStats) {
    contextStr += '📅 KALENDÁŘ UDÁLOSTÍ:\n'
    contextStr += `- Celkem událostí: ${context.calendarStats.total || 0}\n`
    contextStr += `- Nadcházejících: ${context.calendarStats.upcoming || 0}\n`
    contextStr += `- Dnes: ${context.calendarStats.today || 0}\n`
    contextStr += `- Tento týden: ${context.calendarStats.thisWeek || 0}\n`

    if (context.calendarEvents && context.calendarEvents.length > 0) {
      contextStr += '\n📋 NADCHÁZEJÍCÍ UDÁLOSTI:\n'
      const upcomingEvents = context.calendarEvents
        .filter((event: any) => new Date(event.startDate) >= new Date())
        .slice(0, 10)

      upcomingEvents.forEach((event: any) => {
        const eventDate = new Date(event.startDate)
        contextStr += `- ${event.title}`
        contextStr += ` (${eventDate.toLocaleDateString('cs-CZ')})`
        if (event.startTime) {
          contextStr += ` v ${event.startTime}`
        }
        if (event.location) {
          contextStr += ` - ${event.location}`
        }
        contextStr += '\n'
      })

      if (context.calendarEvents.length > 10) {
        contextStr += `... a dalších ${context.calendarEvents.length - 10} událostí\n`
      }
    }
    contextStr += '\n'
  }

  contextStr += '=== KONEC KONTEXTU ===\n'

  return contextStr
}

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Otázka je povinná' },
        { status: 400 }
      )
    }

    // Build detailed context string with all user data
    const contextInfo = buildDetailedContext(context)

    // Add current date to system prompt
    const today = new Date()
    const currentDateInfo = `\n\n📅 AKTUÁLNÍ DATUM: ${today.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} (${today.toISOString().split('T')[0]})\n`

    const enhancedSystemPrompt = SVATBOT_SYSTEM_PROMPT + currentDateInfo

    let content: string

    if (!openai) {
      // Mock response when OpenAI is not available
      content = "Omlouvám se, momentálně nejsem dostupný. Zkuste to prosím později. 🤖💕"
    } else {
      // GPT-5 uses Responses API with built-in web search
      const inputText = `${enhancedSystemPrompt}\n\n${contextInfo}\n\nOtázka uživatele: ${question}`

      let response = await openai.responses.create({
        model: "gpt-5-mini",
        input: inputText,
        tools: [{ type: "web_search" }], // ✅ Enable built-in web search
        reasoning: { effort: 'low' }, // Fast responses for chat
        text: { verbosity: 'medium' },
        max_output_tokens: 3000 // 3000 tokens for max 3 results
      })

      // If response is incomplete, poll for completion
      if (response.status === 'incomplete') {
        let attempts = 0
        const maxAttempts = 20 // Max 40 seconds

        while (response.status === 'incomplete' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          response = await openai.responses.retrieve(response.id)
          attempts++
        }
      }

      // Extract text from Responses API output
      content = ''
      if (response.output && Array.isArray(response.output)) {
        const messages = response.output.filter((item: any) => item.type === 'message')
        for (const msg of messages) {
          if ('content' in msg && msg.content && Array.isArray(msg.content)) {
            for (const contentItem of msg.content) {
              if ('type' in contentItem && contentItem.type === 'output_text' && 'text' in contentItem && contentItem.text) {
                content += contentItem.text + '\n\n'
              }
            }
          }
        }
      }

      if (!content.trim()) {
        content = 'Omlouvám se, nepodařilo se mi odpovědět na vaši otázku. Zkuste to prosím znovu. 💕'
      }
    }

    return NextResponse.json({ response: content })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se získat odpověď od AI asistenta' },
      { status: 500 }
    )
  }
}
