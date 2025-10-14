import { NextRequest, NextResponse } from 'next/server'
import { getHybridAI, HybridAIResponse } from '@/lib/hybrid-ai'

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
5. **Real-time informace**: Máš přístup k aktuálním informacím z internetu o dodavatelích, cenách a trendech

🎯 JAK ODPOVÍDÁŠ:
- **Empaticky**: Rozpoznej emoce v otázce (stres, nadšení, nejistota)
- **Prakticky**: Dej konkrétní kroky, ne jen obecné rady
- **Pozitivně**: Motivuj, povzbuzuj, oslav úspěchy
- **Osobně**: Používej jména, odkazuj na jejich data
- **S citacemi**: Když používáš aktuální informace z internetu, uveď zdroje

📊 MÁŠ PŘÍSTUP K:
- Rozpočtu páru (celkový, utracený, zbývající)
- Seznamu hostů (počet, RSVP status, alergie)
- Úkolům (dokončené, pending, overdue)
- Dodavatelům (rezervovaní, kontakty)
- Časové ose (milníky, deadlines)
- Aktuálním informacím z internetu (ceny, dodavatelé, trendy)

💬 PŘÍKLADY ODPOVĚDÍ:

**Stresovaný dotaz:**
"Pomoc, svatba je za 3 měsíce a ještě nemáme fotografa!"
→ "Chápu, že to teď vypadá stresující 😰, ale není důvod panikařit! 3 měsíce je ještě dostatek času. Pojďme to vyřešit krok po kroku:
1. Hned dnes si vytvoř seznam 5 fotografů v tvém rozpočtu
2. Zítra jim všem napiš
3. Do týdne si domluvte schůzky
Pomůžu ti najít vhodné fotografy! 📸✨"

**Úspěch:**
"Právě jsme dokončili seating plan!"
→ "Wow, to je skvělá práce! 🎉 Seating plan je jeden z nejnáročnějších úkolů a vy jste to zvládli! 💪 Gratuluju! Teď si zasloužíte malou oslavu - třeba romantickou večeři jen vy dva? 💕"

**Praktický dotaz:**
"Kolik stojí catering pro 80 lidí?"
→ [Zde použiješ aktuální informace z Perplexity]
"Podle aktuálních údajů se ceny cateringu pro 80 lidí v ČR pohybují mezi X-Y Kč... [zdroje]"

🚨 DŮLEŽITÉ:
- Vždy reaguj na emocionální stav uživatele
- Gratuluj k pokroku (dokončené úkoly, milníky)
- Nabídni konkrétní pomoc, ne jen obecné rady
- Připomínej work-life balance a čas s partnerem
- Když používáš aktuální data z internetu, uveď to
- Buď pozitivní, ale realistický
`

/**
 * Build detailed context from user data
 */
function buildDetailedContext(context: any): string {
  if (!context) return ''

  let contextStr = '\n=== KONTEXT UŽIVATELE ===\n\n'

  // Basic wedding info
  if (context.weddingDate) {
    const date = new Date(context.weddingDate)
    const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    contextStr += `📅 Datum svatby: ${date.toLocaleDateString('cs-CZ')} (za ${daysUntil} dní)\n`
  }

  if (context.location) {
    contextStr += `📍 Místo: ${context.location}\n`
  }

  if (context.style) {
    contextStr += `🎨 Styl: ${context.style}\n`
  }

  if (context.brideName || context.groomName) {
    contextStr += `💑 Pár: ${context.brideName || '?'} & ${context.groomName || '?'}\n`
  }

  contextStr += '\n'

  // Budget stats
  if (context.budgetStats) {
    const stats = context.budgetStats
    contextStr += `💰 ROZPOČET:\n`
    contextStr += `- Celkový: ${stats.totalBudget?.toLocaleString('cs-CZ')} Kč\n`
    contextStr += `- Utraceno: ${stats.totalSpent?.toLocaleString('cs-CZ')} Kč\n`
    contextStr += `- Zbývá: ${stats.remaining?.toLocaleString('cs-CZ')} Kč\n`
    contextStr += `- Využito: ${stats.budgetUsed?.toFixed(1)}%\n\n`
  }

  // Guest stats
  if (context.guestStats) {
    const stats = context.guestStats
    contextStr += `👥 HOSTÉ:\n`
    contextStr += `- Celkem: ${stats.total}\n`
    contextStr += `- Potvrzeno: ${stats.confirmed}\n`
    contextStr += `- Odmítnuto: ${stats.declined}\n`
    contextStr += `- Čeká na odpověď: ${stats.pending}\n`
    if (stats.withDietaryRestrictions > 0) {
      contextStr += `- S dietními omezeními: ${stats.withDietaryRestrictions}\n`
    }
    contextStr += '\n'
  }

  // Task stats
  if (context.taskStats) {
    const stats = context.taskStats
    contextStr += `✅ ÚKOLY:\n`
    contextStr += `- Celkem: ${stats.total}\n`
    contextStr += `- Dokončeno: ${stats.completed}\n`
    contextStr += `- Zbývá: ${stats.pending}\n`
    if (stats.overdue > 0) {
      contextStr += `- ⚠️ Po termínu: ${stats.overdue}\n`
    }
    contextStr += '\n'
  }

  // Vendors
  if (context.vendors && context.vendors.length > 0) {
    contextStr += `🤝 DODAVATELÉ (${context.vendors.length}):\n`
    context.vendors.slice(0, 5).forEach((vendor: any) => {
      contextStr += `- ${vendor.name} (${vendor.category})\n`
    })
    if (context.vendors.length > 5) {
      contextStr += `... a dalších ${context.vendors.length - 5}\n`
    }
    contextStr += '\n'
  }

  contextStr += '=== KONEC KONTEXTU ===\n'

  return contextStr
}

export async function POST(request: NextRequest) {
  try {
    const { question, context, chatHistory } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Otázka je povinná' },
        { status: 400 }
      )
    }

    // Build detailed context string with all user data
    const contextInfo = buildDetailedContext(context)

    // Use Hybrid AI to route query
    const hybridAI = getHybridAI()

    // ✅ NOVÉ: Předáváme historii chatu pro kontext
    const result: HybridAIResponse = await hybridAI.ask(
      question,
      context ? { ...context, contextInfo, chatHistory } : { chatHistory },
      SVATBOT_SYSTEM_PROMPT
    )

    return NextResponse.json({
      response: result.answer,
      sources: result.sources,
      provider: result.provider,
      reasoning: result.reasoning
    })
  } catch (error) {
    console.error('Hybrid AI Chat error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se získat odpověď od AI asistenta' },
      { status: 500 }
    )
  }
}

