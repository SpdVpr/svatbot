import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, AlertCircle, CheckCircle, XCircle, CreditCard } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Podmínky služby',
  description: 'Všeobecné obchodní podmínky pro používání služby SvatBot.cz',
}

export default function TermsOfServicePage() {
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
            <FileText className="w-12 h-12 text-rose-500 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Podmínky služby</h1>
              <p className="text-gray-600 mt-2">Všeobecné obchodní podmínky</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Úvodní informace */}
            <section className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                Tyto všeobecné obchodní podmínky (dále jen „VOP") upravují vztahy mezi provozovatelem 
                služby SvatBot.cz a uživateli této služby. Používáním služby SvatBot.cz vyjadřujete 
                souhlas s těmito podmínkami.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                <strong>Účinnost od:</strong> 16. října 2025
              </p>
            </section>

            {/* 1. Základní ustanovení */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Základní ustanovení a vymezení pojmů</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.1 Provozovatel služby</h3>
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
                <p className="text-gray-700 mt-2 text-sm">
                  Provozovatel není plátcem DPH.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1.2 Vymezení pojmů</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Služba:</strong> Webová aplikace SvatBot.cz dostupná na adrese https://svatbot.cz</li>
                <li><strong>Uživatel:</strong> Fyzická osoba, která se zaregistrovala a používá službu</li>
                <li><strong>Účet:</strong> Uživatelský účet vytvořený při registraci</li>
                <li><strong>Obsah:</strong> Veškeré informace, data a materiály vložené uživatelem do služby</li>
              </ul>
            </section>

            {/* 2. Předmět služby */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Předmět služby</h2>
              <p className="text-gray-700 mb-4">
                SvatBot.cz je online aplikace pro plánování svateb, která poskytuje následující funkce:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Správa seznamu hostů a RSVP systém</li>
                <li>Plánování rozpočtu svatby</li>
                <li>Správa úkolů a časové osy</li>
                <li>Seating plan editor (rozmístění hostů)</li>
                <li>Marketplace dodavatelů</li>
                <li>Tvorba svatebního webu</li>
                <li>AI asistent pro plánování</li>
                <li>Integrace s kalendáři a dalšími službami</li>
              </ul>
            </section>

            {/* 3. Registrace a účet */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registrace a uživatelský účet</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 Podmínky registrace</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Službu mohou používat osoby starší 18 let</li>
                <li>Při registraci je nutné uvést pravdivé a aktuální údaje</li>
                <li>Každý uživatel může mít pouze jeden aktivní účet</li>
                <li>Uživatel je povinen chránit své přihlašovací údaje před zneužitím</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 Odpovědnost za účet</h3>
              <p className="text-gray-700">
                Uživatel je plně odpovědný za veškeré aktivity provedené pod jeho účtem. 
                V případě podezření na neoprávněný přístup je uživatel povinen neprodleně 
                kontaktovat provozovatele.
              </p>
            </section>

            {/* 4. Práva a povinnosti */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Práva a povinnosti stran</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                4.1 Práva uživatele
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Používat službu v souladu s těmito VOP</li>
                <li>Ukládat a spravovat své svatební údaje</li>
                <li>Exportovat svá data ve strukturovaném formátu</li>
                <li>Kdykoli zrušit svůj účet</li>
                <li>Požadovat technickou podporu</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3 flex items-center">
                <AlertCircle className="w-6 h-6 mr-2 text-orange-500" />
                4.2 Povinnosti uživatele
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Používat službu v souladu s právními předpisy České republiky</li>
                <li>Nepoužívat službu k nezákonným účelům</li>
                <li>Nenahrávat obsah porušující práva třetích stran</li>
                <li>Nepokoušet se narušit bezpečnost nebo funkčnost služby</li>
                <li>Nepoužívat automatizované nástroje pro sběr dat ze služby</li>
                <li>Respektovat autorská práva a duševní vlastnictví provozovatele</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.3 Práva provozovatele</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Upravovat a vylepšovat službu</li>
                <li>Dočasně omezit dostupnost služby z důvodu údržby</li>
                <li>Zablokovat nebo smazat účet porušující tyto VOP</li>
                <li>Změnit tyto VOP s předchozím oznámením uživatelům</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.4 Povinnosti provozovatele</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Zajistit dostupnost služby (s výjimkou plánované údržby)</li>
                <li>Chránit osobní údaje uživatelů v souladu s GDPR</li>
                <li>Poskytovat technickou podporu</li>
                <li>Informovat uživatele o významných změnách služby</li>
              </ul>
            </section>

            {/* 5. Ceny a platby */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-rose-500" />
                5. Ceny a platební podmínky
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Cenové plány</h3>
              <p className="text-gray-700 mb-4">
                Služba je dostupná v následujících variantách:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Bezplatná verze:</strong> Základní funkce s omezeními</li>
                <li><strong>Prémiové plány:</strong> Rozšířené funkce dle aktuálního ceníku</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Platební podmínky</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Ceny jsou uvedeny v českých korunách (CZK) včetně všech daní</li>
                <li>Platby jsou zpracovávány prostřednictvím zabezpečených platebních bran</li>
                <li>Předplatné se automaticky obnovuje, pokud není zrušeno</li>
                <li>Provozovatel si vyhrazuje právo změnit ceny s 30denním předstihem</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.3 Vrácení platby</h3>
              <p className="text-gray-700">
                V souladu se zákonem č. 634/1992 Sb., o ochraně spotřebitele, má spotřebitel právo 
                odstoupit od smlouvy do 14 dnů od jejího uzavření bez udání důvodu. Po uplynutí této 
                lhůty není vrácení platby možné, s výjimkou případů stanovených zákonem.
              </p>
            </section>

            {/* 6. Duševní vlastnictví */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Duševní vlastnictví</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.1 Vlastnictví služby</h3>
              <p className="text-gray-700">
                Veškerá práva k službě SvatBot.cz, včetně designu, kódu, loga a obchodní značky, 
                jsou majetkem provozovatele a jsou chráněna autorským právem a dalšími právními předpisy.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.2 Uživatelský obsah</h3>
              <p className="text-gray-700">
                Uživatel zůstává vlastníkem veškerého obsahu, který do služby nahraje. Uděluje však 
                provozovateli nevýhradní licenci k použití tohoto obsahu pro účely poskytování služby.
              </p>
            </section>

            {/* 7. Ochrana dat */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Ochrana osobních údajů</h2>
              <p className="text-gray-700">
                Zpracování osobních údajů se řídí <Link href="/ochrana-soukromi" className="text-rose-600 hover:text-rose-700 font-semibold">Zásadami ochrany soukromí</Link> 
                {' '}a Nařízením GDPR. Provozovatel se zavazuje chránit osobní údaje uživatelů 
                a používat je pouze pro účely poskytování služby.
              </p>
            </section>

            {/* 8. Omezení odpovědnosti */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <XCircle className="w-6 h-6 mr-2 text-red-500" />
                8. Omezení odpovědnosti
              </h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-4">
                <p className="text-gray-700 font-semibold mb-2">Důležité upozornění:</p>
                <p className="text-gray-700">
                  Služba je poskytována „tak jak je" (as is). Provozovatel nenese odpovědnost za:
                </p>
              </div>

              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Ztrátu dat způsobenou technickou poruchou nebo vyšší mocí</li>
                <li>Škody vzniklé nesprávným použitím služby uživatelem</li>
                <li>Dočasnou nedostupnost služby z důvodu údržby nebo technických problémů</li>
                <li>Obsah vložený uživateli nebo třetími stranami</li>
                <li>Škody způsobené neoprávněným přístupem třetích stran k účtu uživatele</li>
              </ul>

              <p className="text-gray-700 mt-4">
                Provozovatel doporučuje uživatelům pravidelně zálohovat svá data a používat 
                bezpečná hesla.
              </p>
            </section>

            {/* 9. Ukončení služby */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Ukončení používání služby</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.1 Ukončení uživatelem</h3>
              <p className="text-gray-700">
                Uživatel může kdykoli zrušit svůj účet prostřednictvím nastavení účtu nebo 
                kontaktováním provozovatele. Po zrušení účtu budou osobní údaje smazány 
                v souladu se Zásadami ochrany soukromí.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.2 Ukončení provozovatelem</h3>
              <p className="text-gray-700">
                Provozovatel má právo zrušit účet uživatele v případě:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Porušení těchto VOP</li>
                <li>Nezaplacení sjednaného předplatného</li>
                <li>Zneužití služby nebo pokus o narušení její bezpečnosti</li>
                <li>Neaktivity účtu po dobu delší než 2 roky</li>
              </ul>
            </section>

            {/* 10. Závěrečná ustanovení */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Závěrečná ustanovení</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.1 Změny VOP</h3>
              <p className="text-gray-700">
                Provozovatel si vyhrazuje právo tyto VOP změnit. O změnách budou uživatelé 
                informováni e-mailem nebo oznámením v aplikaci minimálně 30 dní před nabytím 
                účinnosti změn.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.2 Řešení sporů</h3>
              <p className="text-gray-700 mb-4">
                Případné spory mezi provozovatelem a uživatelem budou řešeny přednostně dohodou. 
                Pokud nedojde k dohodě, jsou spory příslušné řešit soudy České republiky.
              </p>
              <p className="text-gray-700">
                Spotřebitel má právo obrátit se s případným sporem na subjekt mimosoudního řešení 
                spotřebitelských sporů, kterým je Česká obchodní inspekce 
                (<a href="https://coi.gov.cz" className="text-rose-600 hover:text-rose-700">www.coi.gov.cz</a>).
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.3 Rozhodné právo</h3>
              <p className="text-gray-700">
                Tyto VOP se řídí právním řádem České republiky, zejména:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Zákonem č. 89/2012 Sb., občanský zákoník</li>
                <li>Zákonem č. 634/1992 Sb., o ochraně spotřebitele</li>
                <li>Nařízením GDPR (EU) 2016/679</li>
                <li>Zákonem č. 110/2019 Sb., o zpracování osobních údajů</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.4 Oddělitelnost ustanovení</h3>
              <p className="text-gray-700">
                Pokud se některé ustanovení těchto VOP stane neplatným nebo nevymahatelným, 
                ostatní ustanovení zůstávají v platnosti.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.5 Účinnost</h3>
              <p className="text-gray-700">
                Tyto VOP nabývají účinnosti dnem 16. října 2025.
              </p>
            </section>

            {/* Kontakt */}
            <section className="mb-8">
              <div className="bg-rose-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Kontakt na provozovatele</h3>
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href="mailto:info@svatbot.cz" className="text-rose-600 hover:text-rose-700">info@svatbot.cz</a><br />
                  <strong>Adresa:</strong> Michal Vesecký, Zápská 1149, 250 71 Nehvizdy<br />
                  <strong>IČO:</strong> 88320090
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/ochrana-soukromi"
            className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Ochrana soukromí
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

