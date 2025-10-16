import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Database, Eye, FileText, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ochrana soukromí',
  description: 'Zásady ochrany osobních údajů SvatBot.cz v souladu s GDPR',
}

export default function PrivacyPolicyPage() {
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
            <Shield className="w-12 h-12 text-rose-500 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Ochrana soukromí</h1>
              <p className="text-gray-600 mt-2">Zásady ochrany osobních údajů</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Úvodní informace */}
            <section className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                Tyto zásady ochrany osobních údajů popisují, jak SvatBot.cz zpracovává vaše osobní údaje 
                v souladu s Nařízením Evropského parlamentu a Rady (EU) 2016/679 o ochraně fyzických osob 
                v souvislosti se zpracováním osobních údajů a o volném pohybu těchto údajů (GDPR) a zákonem 
                č. 110/2019 Sb., o zpracování osobních údajů.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                <strong>Poslední aktualizace:</strong> 16. října 2025
              </p>
            </section>

            {/* 1. Správce osobních údajů */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-rose-500" />
                1. Správce osobních údajů
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-900">Michal Vesecký</p>
                <p className="text-gray-700">IČO: 88320090</p>
                <p className="text-gray-700">Zápská 1149, 250 71 Nehvizdy, Česká republika</p>
                <p className="text-gray-700 mt-2">
                  <strong>Email:</strong> <a href="mailto:info@svatbot.cz" className="text-rose-600 hover:text-rose-700">info@svatbot.cz</a>
                </p>
                <p className="text-gray-700">
                  <strong>Web:</strong> <a href="https://svatbot.cz" className="text-rose-600 hover:text-rose-700">https://svatbot.cz</a>
                </p>
              </div>
              <p className="text-gray-700 mt-4">
                Správce je fyzická osoba, která určuje účely a prostředky zpracování osobních údajů.
              </p>
            </section>

            {/* 2. Jaké údaje zpracováváme */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Database className="w-6 h-6 mr-2 text-rose-500" />
                2. Jaké osobní údaje zpracováváme
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Registrační údaje</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Jméno a příjmení</li>
                <li>E-mailová adresa</li>
                <li>Heslo (uloženo v šifrované podobě)</li>
                <li>Datum registrace</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Údaje o svatbě</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Datum svatby</li>
                <li>Jména snoubenců</li>
                <li>Místo konání svatby</li>
                <li>Rozpočet a finanční plánování</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.3 Údaje o hostech</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Jména hostů</li>
                <li>Kontaktní údaje (e-mail, telefon)</li>
                <li>Informace o účasti (RSVP)</li>
                <li>Dietní preference a alergie</li>
                <li>Ubytování a doprava</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.4 Technické údaje</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>IP adresa</li>
                <li>Typ prohlížeče a zařízení</li>
                <li>Cookies a podobné technologie</li>
                <li>Údaje o používání aplikace (analytika)</li>
              </ul>
            </section>

            {/* 3. Účel zpracování */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-rose-500" />
                3. Účel a právní základ zpracování
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-rose-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Poskytování služeb (čl. 6 odst. 1 písm. b) GDPR)</h3>
                  <p className="text-gray-700">
                    Zpracováváme vaše údaje pro plnění smlouvy o poskytování služeb svatebního plánovače, 
                    včetně správy účtu, ukládání dat a poskytování funkcí aplikace.
                  </p>
                </div>

                <div className="border-l-4 border-rose-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Souhlas (čl. 6 odst. 1 písm. a) GDPR)</h3>
                  <p className="text-gray-700">
                    Pro marketingovou komunikaci, newsletter a analytické cookies zpracováváme údaje 
                    na základě vašeho souhlasu, který můžete kdykoli odvolat.
                  </p>
                </div>

                <div className="border-l-4 border-rose-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR)</h3>
                  <p className="text-gray-700">
                    Pro zajištění bezpečnosti služeb, prevenci podvodů a zlepšování našich služeb 
                    zpracováváme údaje na základě oprávněného zájmu správce.
                  </p>
                </div>

                <div className="border-l-4 border-rose-500 pl-4">
                  <h3 className="font-semibold text-gray-900">Právní povinnost (čl. 6 odst. 1 písm. c) GDPR)</h3>
                  <p className="text-gray-700">
                    Pro účetní a daňové účely zpracováváme údaje v souladu s právními předpisy České republiky.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Doba uložení */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Doba uložení osobních údajů</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Údaje účtu:</strong> Po dobu trvání účtu + 30 dní po jeho smazání</li>
                <li><strong>Údaje o svatbě:</strong> Po dobu trvání účtu nebo do jejich smazání uživatelem</li>
                <li><strong>Účetní doklady:</strong> 10 let od konce zdaňovacího období (dle zákona o účetnictví)</li>
                <li><strong>Marketingové souhlasy:</strong> Do odvolání souhlasu nebo max. 5 let</li>
                <li><strong>Technické logy:</strong> Max. 90 dní</li>
              </ul>
            </section>

            {/* 5. Předávání údajů */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Předávání osobních údajů třetím stranám</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Zpracovatelé</h3>
              <p className="text-gray-700 mb-4">
                Vaše osobní údaje mohou být zpřístupněny následujícím zpracovatelům:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Google Firebase:</strong> Hosting databáze a autentifikace (EU region - Europe West 1)</li>
                <li><strong>Vercel Inc.:</strong> Hosting webové aplikace (EU servery)</li>
                <li><strong>Google Analytics:</strong> Analytika návštěvnosti (s anonymizací IP)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Přenos do třetích zemí</h3>
              <p className="text-gray-700">
                Všechny vaše osobní údaje jsou primárně ukládány na serverech v Evropské unii (region Europe West 1). 
                V případě přenosu dat mimo EU zajišťujeme odpovídající záruky v souladu s čl. 46 GDPR 
                (standardní smluvní doložky schválené Evropskou komisí).
              </p>
            </section>

            {/* 6. Vaše práva */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Vaše práva jako subjektu údajů</h2>
              <p className="text-gray-700 mb-4">
                V souladu s GDPR máte následující práva:
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900">✓ Právo na přístup (čl. 15 GDPR)</h3>
                  <p className="text-gray-700">Máte právo získat informace o tom, jaké osobní údaje o vás zpracováváme.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900">✓ Právo na opravu (čl. 16 GDPR)</h3>
                  <p className="text-gray-700">Máte právo požadovat opravu nepřesných nebo neúplných osobních údajů.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900">✓ Právo na výmaz - "právo být zapomenut" (čl. 17 GDPR)</h3>
                  <p className="text-gray-700">Máte právo požadovat vymazání vašich osobních údajů, pokud již nejsou potřebné pro účely zpracování.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900">✓ Právo na omezení zpracování (čl. 18 GDPR)</h3>
                  <p className="text-gray-700">Máte právo požadovat omezení zpracování vašich osobních údajů.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900">✓ Právo na přenositelnost údajů (čl. 20 GDPR)</h3>
                  <p className="text-gray-700">Máte právo získat své osobní údaje ve strukturovaném, běžně používaném a strojově čitelném formátu.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900">✓ Právo vznést námitku (čl. 21 GDPR)</h3>
                  <p className="text-gray-700">Máte právo vznést námitku proti zpracování vašich osobních údajů.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900">✓ Právo odvolat souhlas</h3>
                  <p className="text-gray-700">Pokud je zpracování založeno na souhlasu, máte právo tento souhlas kdykoli odvolat.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900">✓ Právo podat stížnost</h3>
                  <p className="text-gray-700">
                    Máte právo podat stížnost u dozorového úřadu - Úřadu pro ochranu osobních údajů 
                    (<a href="https://uoou.gov.cz" className="text-rose-600 hover:text-rose-700">www.uoou.gov.cz</a>).
                  </p>
                </div>
              </div>

              <div className="bg-rose-50 p-6 rounded-lg mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Jak uplatnit svá práva?</h3>
                <p className="text-gray-700">
                  Pro uplatnění vašich práv nás kontaktujte na e-mailu: 
                  <a href="mailto:info@svatbot.cz" className="text-rose-600 hover:text-rose-700 font-semibold ml-1">
                    info@svatbot.cz
                  </a>
                </p>
                <p className="text-gray-700 mt-2">
                  Na vaši žádost odpovíme bez zbytečného odkladu, nejpozději do 1 měsíce od obdržení žádosti.
                </p>
              </div>
            </section>

            {/* 7. Zabezpečení */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-rose-500" />
                7. Zabezpečení osobních údajů
              </h2>
              <p className="text-gray-700 mb-4">
                Přijali jsme vhodná technická a organizační opatření k ochraně vašich osobních údajů:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>SSL/TLS šifrování pro veškerou komunikaci</li>
                <li>Šifrování hesel pomocí moderních hashovacích algoritmů</li>
                <li>Pravidelné bezpečnostní audity a aktualizace</li>
                <li>Omezený přístup k osobním údajům pouze pro oprávněné osoby</li>
                <li>Zálohovací systémy pro ochranu před ztrátou dat</li>
                <li>Firewall a ochrana proti neoprávněnému přístupu</li>
              </ul>
            </section>

            {/* 8. Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies a podobné technologie</h2>
              <p className="text-gray-700 mb-4">
                Naše webová stránka používá cookies v souladu se zákonem č. 127/2005 Sb., o elektronických komunikacích. 
                Podrobné informace o používání cookies naleznete v našich <Link href="/cookies" className="text-rose-600 hover:text-rose-700 font-semibold">Zásadách používání cookies</Link>.
              </p>
            </section>

            {/* 9. Kontakt */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-rose-500" />
                9. Kontaktní údaje
              </h2>
              <p className="text-gray-700 mb-4">
                Máte-li jakékoli dotazy ohledně zpracování vašich osobních údajů, kontaktujte nás:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:info@svatbot.cz" className="text-rose-600 hover:text-rose-700">info@svatbot.cz</a></p>
                <p className="text-gray-700 mt-2"><strong>Poštovní adresa:</strong> Michal Vesecký, Zápská 1149, 250 71 Nehvizdy</p>
              </div>
            </section>

            {/* 10. Změny */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Změny zásad ochrany soukromí</h2>
              <p className="text-gray-700">
                Tyto zásady ochrany soukromí můžeme čas od času aktualizovat. O významných změnách vás budeme 
                informovat prostřednictvím e-mailu nebo oznámení v aplikaci. Doporučujeme pravidelně kontrolovat 
                tuto stránku pro případné aktualizace.
              </p>
            </section>

            {/* Dozorový úřad */}
            <section className="mb-8">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Dozorový úřad</h3>
                <p className="text-gray-700 mb-2">
                  Úřad pro ochranu osobních údajů<br />
                  Pplk. Sochora 27<br />
                  170 00 Praha 7<br />
                  Česká republika
                </p>
                <p className="text-gray-700">
                  Web: <a href="https://uoou.gov.cz" className="text-blue-600 hover:text-blue-700">www.uoou.gov.cz</a><br />
                  Email: <a href="mailto:posta@uoou.cz" className="text-blue-600 hover:text-blue-700">posta@uoou.cz</a>
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/podminky-sluzby"
            className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Podmínky služby
          </Link>
          <Link 
            href="/gdpr"
            className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            GDPR
          </Link>
        </div>
      </main>
    </div>
  )
}

