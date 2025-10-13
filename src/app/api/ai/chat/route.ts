import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

const WEDDING_CONTEXT = `
Jsi expert na svatební plánování v České republice. Znáš:
- České svatební tradice a zvyky
- Průměrné ceny služeb v ČR (2024-2025)
- Sezónní faktory (květen-září hlavní sezóna)
- Regionální rozdíly (Praha dražší než venkov)
- Právní požadavky (matrika, církevní obřad)
- Časové plánování (12-18 měsíců dopředu)

Odpovídáš vždy v češtině, prakticky a s konkrétními čísly.

DŮLEŽITÉ: Máš přístup k REÁLNÝM datům uživatele o jeho svatbě včetně:
- 👥 Hosté (jména, dietní omezení, RSVP status, ubytování)
- 💰 Rozpočet (položky, částky, dodavatelé, platby)
- ✅ Úkoly (názvy, termíny, statusy, priority)
- 🪑 Seating plan (stoly, kapacity, přiřazení hostů)
- 🌐 Svatební web (URL, publikace, RSVP, návštěvnost)
- 🏨 Ubytování (hotely, pokoje, obsazenost)
- 🛒 Nákupní seznam (položky, ceny, status nákupu)
- ⏰ Timeline svatebního dne (události, časy, lokace)

Když se uživatel ptá na konkrétní informace (např. "Kdo má alergii na lepek?", "Kolik mám stolů?",
"Je svatební web publikovaný?", "Kolik mám volných pokojů?"), VŽDY odpovídej na základě poskytnutých dat,
ne obecně. Pokud data nejsou k dispozici, řekni to uživateli.

Buď konkrétní - uváděj jména, čísla, termíny z reálných dat!
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

  // Timeline
  if (context.timelineStats) {
    contextStr += '⏰ ČASOVÝ PLÁN SVATEBNÍHO DNE:\n'
    contextStr += `- Celkem událostí: ${context.timelineStats.total || 0}\n`
    contextStr += `- Nadcházejících: ${context.timelineStats.upcoming || 0}\n`
    contextStr += `- Dnes: ${context.timelineStats.today || 0}\n`

    if (context.milestones && context.milestones.length > 0) {
      contextStr += '\n📅 UDÁLOSTI:\n'
      context.milestones.slice(0, 10).forEach((milestone: any) => {
        contextStr += `- ${milestone.title}`
        if (milestone.time) {
          contextStr += ` v ${milestone.time}`
        }
        if (milestone.location) {
          contextStr += ` (${milestone.location})`
        }
        contextStr += '\n'
      })
      if (context.milestones.length > 10) {
        contextStr += `... a dalších ${context.milestones.length - 10} událostí\n`
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

    let content: string

    if (!openai) {
      // Mock response when OpenAI is not available
      content = "Omlouvám se, AI asistent momentálně není dostupný. Zkuste to prosím později."
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: WEDDING_CONTEXT
          },
          {
            role: "user",
            content: `${contextInfo}\n\nOtázka uživatele: ${question}`
          }
        ],
        max_tokens: 1000, // Increased for more detailed responses
        temperature: 0.7
      })

      content = response.choices[0]?.message?.content || 'Omlouvám se, nepodařilo se mi odpovědět na vaši otázku.'
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
