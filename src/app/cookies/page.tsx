import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Cookie, Settings, BarChart, Shield, CheckCircle, XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Zásady používání cookies',
  description: 'Informace o tom, jak SvatBot.cz používá cookies a jak můžete spravovat své preference',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Zpět na hlavní stránku
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Title */}
          <div className="flex items-center mb-8">
            <Cookie className="w-12 h-12 text-rose-500 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Zásady používání cookies</h1>
              <p className="text-gray-600 mt-2">Jak používáme cookies na SvatBot.cz</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Úvod */}
            <section className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                Tyto zásady vysvětlují, co jsou cookies, jak je používáme na našich webových stránkách 
                a jak můžete spravovat své preference. Používání cookies je v souladu se zákonem 
                č. 127/2005 Sb., o elektronických komunikacích, a Nařízením GDPR.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                <strong>Poslední aktualizace:</strong> 16. října 2025
              </p>
            </section>

            {/* Co jsou cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Co jsou cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies jsou malé textové soubory, které se ukládají do vašeho prohlížeče při návštěvě 
                webových stránek. Umožňují webovým stránkám zapamatovat si vaše akce a preference 
                (jako je přihlášení, jazyk, velikost písma a další nastavení) po určitou dobu, 
                takže je nemusíte zadávat znovu při každé návštěvě stránky nebo při procházení 
                z jedné stránky na druhou.
              </p>
            </section>

            {/* Jaké cookies používáme */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Jaké cookies používáme</h2>
              
              {/* Nezbytné cookies */}
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Nezbytné cookies (povinné)</h3>
                    <p className="text-gray-700 mb-3">
                      Tyto cookies jsou nezbytné pro správné fungování webových stránek a nelze je vypnout. 
                      Obvykle se nastavují pouze v reakci na vaše akce, jako je přihlášení nebo nastavení 
                      preferencí soukromí.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Příklady použití:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Autentifikace a přihlášení uživatele</li>
                        <li>• Zabezpečení a ochrana před útoky</li>
                        <li>• Uchování stavu relace (session)</li>
                        <li>• Zapamatování souhlasu s cookies</li>
                      </ul>
                      <p className="text-xs text-gray-600 mt-3">
                        <strong>Právní základ:</strong> Oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR) - 
                        nezbytné pro poskytování služby
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Doba uložení:</strong> Session nebo max. 1 rok
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Funkční cookies */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <Settings className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Funkční cookies (volitelné)</h3>
                    <p className="text-gray-700 mb-3">
                      Tyto cookies umožňují webovým stránkám zapamatovat si vaše volby (jako je uživatelské 
                      jméno, jazyk nebo region) a poskytovat vylepšené, personalizovanější funkce.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Příklady použití:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Zapamatování jazykových preferencí</li>
                        <li>• Uložení nastavení dashboardu</li>
                        <li>• Personalizace uživatelského rozhraní</li>
                        <li>• Zapamatování filtru a třídění</li>
                      </ul>
                      <p className="text-xs text-gray-600 mt-3">
                        <strong>Právní základ:</strong> Souhlas (čl. 6 odst. 1 písm. a) GDPR)
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Doba uložení:</strong> Max. 1 rok
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytické cookies */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <BarChart className="w-6 h-6 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Analytické cookies (volitelné)</h3>
                    <p className="text-gray-700 mb-3">
                      Tyto cookies nám pomáhají pochopit, jak návštěvníci používají naše webové stránky, 
                      abychom je mohli vylepšovat. Všechny informace, které tyto cookies shromažďují, 
                      jsou anonymní.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Příklady použití:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Počítání návštěvníků a sledování návštěvnosti</li>
                        <li>• Zjišťování, které stránky jsou nejoblíbenější</li>
                        <li>• Měření výkonu aplikace</li>
                        <li>• Identifikace technických problémů</li>
                      </ul>
                      <p className="text-sm font-semibold text-gray-900 mt-3 mb-2">Používáme:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>Google Analytics 4</strong> - s anonymizací IP adres</li>
                        <li>• <strong>Firebase Analytics</strong> - pro měření výkonu aplikace</li>
                      </ul>
                      <p className="text-xs text-gray-600 mt-3">
                        <strong>Právní základ:</strong> Souhlas (čl. 6 odst. 1 písm. a) GDPR)
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Doba uložení:</strong> Max. 2 roky
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketingové cookies */}
              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <XCircle className="w-6 h-6 text-orange-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Marketingové cookies (volitelné)</h3>
                    <p className="text-gray-700 mb-3">
                      Tyto cookies se používají k zobrazování reklam, které jsou pro vás relevantnější. 
                      Mohou být také použity k omezení počtu zobrazení reklamy a měření účinnosti 
                      reklamních kampaní.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Příklady použití:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Zobrazování personalizovaných reklam</li>
                        <li>• Remarketing a retargeting</li>
                        <li>• Měření efektivity reklamních kampaní</li>
                      </ul>
                      <p className="text-xs text-gray-600 mt-3">
                        <strong>Právní základ:</strong> Souhlas (čl. 6 odst. 1 písm. a) GDPR)
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Doba uložení:</strong> Max. 1 rok
                      </p>
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded mt-3">
                        <p className="text-xs text-gray-700">
                          <strong>Poznámka:</strong> V současné době nepoužíváme marketingové cookies třetích stran.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Třetí strany */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies třetích stran</h2>
              <p className="text-gray-700 mb-4">
                Některé cookies mohou být nastaveny třetími stranami, jejichž služby používáme:
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Služba</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Účel</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Více informací</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700">Google Firebase</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Autentifikace, databáze, hosting</td>
                      <td className="px-4 py-3 text-sm">
                        <a href="https://firebase.google.com/support/privacy" className="text-rose-600 hover:text-rose-700">
                          Privacy Policy
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700">Google Analytics</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Analytika návštěvnosti</td>
                      <td className="px-4 py-3 text-sm">
                        <a href="https://policies.google.com/privacy" className="text-rose-600 hover:text-rose-700">
                          Privacy Policy
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700">Vercel</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Hosting a výkon aplikace</td>
                      <td className="px-4 py-3 text-sm">
                        <a href="https://vercel.com/legal/privacy-policy" className="text-rose-600 hover:text-rose-700">
                          Privacy Policy
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Jak spravovat cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-rose-500" />
                Jak spravovat cookies
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Nastavení na našich stránkách</h3>
              <p className="text-gray-700 mb-4">
                Své preference cookies můžete kdykoli změnit kliknutím na tlačítko „Nastavení cookies" 
                v patičce stránky nebo v sekci „Nastavení" → „Soukromí a cookies" ve vašem účtu.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Nastavení v prohlížeči</h3>
              <p className="text-gray-700 mb-4">
                Většina webových prohlížečů vám umožňuje spravovat cookies prostřednictvím nastavení. 
                Zde jsou odkazy na návody pro nejoblíbenější prohlížeče:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" className="text-rose-600 hover:text-rose-700">
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/cs/kb/povoleni-zakazani-cookies" className="text-rose-600 hover:text-rose-700">
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/cs-cz/microsoft-edge/odstranění-souborů-cookie-v-microsoft-edge" className="text-rose-600 hover:text-rose-700">
                    Microsoft Edge
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/cs-cz/guide/safari/sfri11471/mac" className="text-rose-600 hover:text-rose-700">
                    Safari
                  </a>
                </li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mt-6">
                <p className="text-sm text-gray-700">
                  <strong>Upozornění:</strong> Pokud zakážete všechny cookies, některé funkce našich 
                  webových stránek nemusí fungovat správně. Zejména nebudete moci zůstat přihlášeni 
                  a používat personalizované funkce.
                </p>
              </div>
            </section>

            {/* Souhlas s cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Souhlas s používáním cookies</h2>
              <p className="text-gray-700 mb-4">
                V souladu se zákonem č. 127/2005 Sb., o elektronických komunikacích, § 89 odst. 3, 
                vyžadujeme váš souhlas s používáním volitelných cookies (funkční, analytické a marketingové).
              </p>
              <p className="text-gray-700 mb-4">
                Při první návštěvě našich stránek se zobrazí cookie lišta, kde můžete:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Přijmout všechny cookies</li>
                <li>Odmítnout volitelné cookies (budou použity pouze nezbytné)</li>
                <li>Přizpůsobit si, které kategorie cookies chcete povolit</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Svůj souhlas můžete kdykoli odvolat změnou nastavení cookies.
              </p>
            </section>

            {/* Změny */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Změny těchto zásad</h2>
              <p className="text-gray-700">
                Tyto zásady používání cookies můžeme čas od času aktualizovat, abychom odráželi změny 
                v našich postupech nebo z jiných provozních, právních nebo regulačních důvodů. 
                Doporučujeme pravidelně kontrolovat tuto stránku pro případné aktualizace.
              </p>
            </section>

            {/* Kontakt */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Kontakt</h2>
              <p className="text-gray-700 mb-4">
                Máte-li jakékoli dotazy ohledně našeho používání cookies, kontaktujte nás:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href="mailto:info@svatbot.cz" className="text-rose-600 hover:text-rose-700">info@svatbot.cz</a>
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Poštovní adresa:</strong><br />
                  Michal Vesecký<br />
                  Zápská 1149<br />
                  250 71 Nehvizdy<br />
                  Česká republika
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>IČO:</strong> 88320090
                </p>
              </div>
            </section>

            {/* Související dokumenty */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Související dokumenty</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link 
                  href="/ochrana-soukromi"
                  className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 p-6 rounded-lg hover:shadow-lg transition-all text-center"
                >
                  <Shield className="w-8 h-8 text-rose-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Ochrana soukromí</h3>
                  <p className="text-sm text-gray-600">Jak chráníme vaše osobní údaje</p>
                </Link>
                <Link 
                  href="/gdpr"
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-lg hover:shadow-lg transition-all text-center"
                >
                  <Shield className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">GDPR</h3>
                  <p className="text-sm text-gray-600">Vaše práva podle GDPR</p>
                </Link>
                <Link 
                  href="/podminky-sluzby"
                  className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 p-6 rounded-lg hover:shadow-lg transition-all text-center"
                >
                  <Shield className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Podmínky služby</h3>
                  <p className="text-sm text-gray-600">Pravidla používání SvatBot.cz</p>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

