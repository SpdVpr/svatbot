import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, ShoppingCart, CreditCard, Shield, AlertCircle, Scale, Mail, Cookie } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Obchodní podmínky',
  description: 'Všeobecné obchodní podmínky pro používání služeb SvatBot.cz',
}

export default function ObchodniPodminkyPage() {
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
              <h1 className="text-4xl font-bold text-gray-900">Obchodní podmínky</h1>
              <p className="text-gray-600 mt-2">Všeobecné obchodní podmínky SvatBot.cz</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Úvodní informace */}
            <section className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                Tyto všeobecné obchodní podmínky (dále jen „<strong>VOP</strong>") upravují vztahy mezi 
                provozovatelem služby SvatBot.cz a uživateli služby. Tyto VOP jsou vydány v souladu 
                s ustanovením § 1751 a násl. zákona č. 89/2012 Sb., občanský zákoník, ve znění pozdějších 
                předpisů (dále jen „<strong>občanský zákoník</strong>") a zákonem č. 634/1992 Sb., 
                o ochraně spotřebitele, ve znění pozdějších předpisů.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                <strong>Poslední aktualizace:</strong> 5. listopadu 2025
              </p>
            </section>

            {/* Identifikace prodávajícího */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-rose-500" />
                1. Identifikace prodávajícího (provozovatele)
              </h2>
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 p-6 rounded-lg">
                <p className="text-gray-900 font-semibold mb-3">Provozovatel služby:</p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Jméno a příjmení:</strong> Michal Vesecký</p>
                  <p><strong>IČO:</strong> 88320090</p>
                  <p><strong>Sídlo/Adresa:</strong> Zápská 1149, 250 71 Nehvizdy, Česká republika</p>
                  <p><strong>Email:</strong> <a href="mailto:info@svatbot.cz" className="text-rose-600 hover:text-rose-700">info@svatbot.cz</a></p>
                  <p><strong>Web:</strong> <a href="https://svatbot.cz" className="text-rose-600 hover:text-rose-700">https://svatbot.cz</a></p>
                  <p className="text-sm mt-3 pt-3 border-t border-rose-200">
                    <strong>Poznámka:</strong> Provozovatel není plátcem DPH.
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mt-4">
                Provozovatel je fyzickou osobou podnikající na základě živnostenského oprávnění. 
                Dozor nad dodržováním povinností podle zákona o ochraně spotřebitele vykonává 
                Česká obchodní inspekce (<a href="https://www.coi.cz" className="text-rose-600 hover:text-rose-700">www.coi.cz</a>).
              </p>
            </section>

            {/* Vymezení pojmů */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Vymezení pojmů</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="font-semibold text-gray-900">Provozovatel</dt>
                  <dd className="text-gray-700 ml-4">Michal Vesecký, IČO: 88320090, poskytovatel služby SvatBot.cz</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Uživatel/Zákazník</dt>
                  <dd className="text-gray-700 ml-4">Fyzická nebo právnická osoba, která využívá služby SvatBot.cz</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Spotřebitel</dt>
                  <dd className="text-gray-700 ml-4">Fyzická osoba, která při uzavírání a plnění smlouvy nejedná v rámci své podnikatelské činnosti nebo v rámci samostatného výkonu svého povolání</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Služba</dt>
                  <dd className="text-gray-700 ml-4">Webová aplikace SvatBot.cz pro plánování svateb včetně všech jejích funkcí a nástrojů</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Smlouva</dt>
                  <dd className="text-gray-700 ml-4">Smlouva o poskytování služeb uzavřená mezi provozovatelem a uživatelem</dd>
                </div>
              </dl>
            </section>

            {/* Předmět smlouvy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Předmět smlouvy a služby</h2>
              <p className="text-gray-700 mb-4">
                Předmětem smlouvy je poskytování online služby pro plánování svateb prostřednictvím 
                webové aplikace SvatBot.cz. Služba zahrnuje:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Správu svatebních úkolů a timeline</li>
                <li>Správu rozpočtu svatby</li>
                <li>Správu seznamu hostů a RSVP systém</li>
                <li>Plánovač usazení hostů (seating plan)</li>
                <li>Správu dodavatelů a marketplace</li>
                <li>Tvorbu svatebního webu</li>
                <li>Další nástroje pro plánování svatby</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Služba je poskytována ve dvou variantách:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Free (Zdarma)</strong> - první měsíc po registraci zdarma s přístupem ke všem funkcím</li>
                <li><strong>Premium (Placené)</strong> - pokračování v používání všech funkcí po uplynutí zkušebního měsíce</li>
              </ul>
            </section>

            {/* Registrace a uzavření smlouvy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Registrace a uzavření smlouvy</h2>
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">4.1 Registrace</h3>
              <p className="text-gray-700 mb-3">
                Pro využívání služby je nutná registrace uživatele. Registrací a vytvořením účtu 
                uživatel potvrzuje, že:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Je starší 18 let</li>
                <li>Souhlasí s těmito obchodními podmínkami</li>
                <li>Souhlasí se zpracováním osobních údajů dle Zásad ochrany soukromí</li>
                <li>Poskytl pravdivé a aktuální údaje</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4.2 Uzavření smlouvy</h3>
              <p className="text-gray-700 mb-3">
                Smlouva o poskytování služeb je uzavřena:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>U bezplatné verze:</strong> okamžikem dokončení registrace</li>
                <li><strong>U placených verzí:</strong> okamžikem přijetí platby provozovatelem</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Po uzavření smlouvy obdrží uživatel potvrzení na emailovou adresu uvedenou při registraci.
              </p>
            </section>

            {/* Ceny a platební podmínky */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-rose-500" />
                5. Ceny a platební podmínky
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">5.1 Ceny</h3>
              <p className="text-gray-700 mb-3">
                Aktuální ceny služeb jsou uvedeny na webových stránkách svatbot.cz v sekci „Ceník" 
                nebo „Předplatné". Všechny ceny jsou uvedeny včetně všech daní a poplatků.
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Poznámka:</strong> Provozovatel není plátcem DPH, ceny tedy neobsahují DPH.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">5.2 Platební podmínky</h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-4">
                <p className="text-gray-900 font-semibold mb-3">Způsob platby:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Online platba platební kartou</strong> (Visa, Mastercard, American Express, Maestro)</li>
                  <li><strong>Platební brána:</strong> GoPay (<a href="https://www.gopay.com" className="text-rose-600 hover:text-rose-700" target="_blank" rel="noopener noreferrer">www.gopay.com</a>)</li>
                  <li><strong>Měna:</strong> CZK (Kč)</li>
                  <li><strong>Zabezpečení:</strong> PCI DSS certifikace</li>
                </ul>
              </div>
              <p className="text-gray-700 mb-3">
                Platba je zpracována bezpečně prostřednictvím platební brány GoPay. Provozovatel
                nemá přístup k údajům o platební kartě zákazníka. Všechny platební údaje jsou
                šifrovány a zpracovávány v souladu s nejvyššími bezpečnostními standardy.
              </p>
              <p className="text-gray-700 mb-3">
                Více informací o zpracování plateb:
                <a href="https://www.gopay.com/cs/ochrana-osobnich-udaju" className="text-rose-600 hover:text-rose-700 ml-1" target="_blank" rel="noopener noreferrer">
                  GoPay - Ochrana osobních údajů
                </a>
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">5.3 Fakturace</h3>
              <p className="text-gray-700 mb-3">
                Po úspěšné platbě obdrží zákazník:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Potvrzení o platbě na emailovou adresu</li>
                <li>Daňový doklad (provozovatel není plátcem DPH, nevystavuje faktury s DPH)</li>
                <li>Přístup k placené verzi služby</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">5.4 Předplatné a platební plány</h3>
              <p className="text-gray-700 mb-3">
                Placené verze služby jsou poskytovány ve dvou variantách:
              </p>
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 p-6 rounded-lg mb-4">
                <ul className="space-y-3 text-gray-700">
                  <li>
                    <strong className="text-gray-900">Měsíční členství (299 Kč/měsíc):</strong>
                    <br />
                    <span className="text-sm">Platba se automaticky strhává každý měsíc. Členství lze kdykoli zrušit v nastavení účtu.</span>
                  </li>
                  <li>
                    <strong className="text-gray-900">Roční členství (2 999 Kč - jednorázová platba):</strong>
                    <br />
                    <span className="text-sm">Jednorázová platba za celý rok. Členství se automaticky neobnovuje a po uplynutí roku je nutné provést novou platbu.</span>
                  </li>
                </ul>
              </div>
              <p className="text-gray-700 mt-3">
                <strong>Měsíční členství:</strong> Zákazník může předplatné kdykoli zrušit v nastavení svého účtu.
                Zrušení je účinné k datu konce aktuálního předplaceného období. Již zaplacené částky za aktuální
                období nejsou vratné (s výjimkou odstoupení od smlouvy dle bodu 7).
              </p>
              <p className="text-gray-700 mt-3">
                <strong>Roční členství (2 999 Kč):</strong> Jedná se o jednorázovou platbu bez automatického obnovení.
                Po uplynutí ročního období je nutné provést novou platbu pro pokračování v používání prémiových funkcí.
              </p>
            </section>

            {/* Práva a povinnosti */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Práva a povinnosti stran</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">6.1 Práva a povinnosti uživatele</h3>
              <p className="text-gray-700 mb-3">Uživatel je povinen:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Používat službu v souladu s těmito VOP a platnými právními předpisy</li>
                <li>Chránit své přihlašovací údaje před zneužitím třetími osobami</li>
                <li>Poskytovat pravdivé a aktuální údaje</li>
                <li>Nepoužívat službu k nezákonným účelům</li>
                <li>Respektovat autorská práva provozovatele</li>
                <li>Hradit cenu za službu dle zvoleného tarifu</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">6.2 Práva a povinnosti provozovatele</h3>
              <p className="text-gray-700 mb-3">Provozovatel je povinen:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Poskytovat službu v dohodnutém rozsahu a kvalitě</li>
                <li>Zajistit bezpečnost a ochranu osobních údajů uživatelů</li>
                <li>Informovat uživatele o plánovaných odstávkách a změnách služby</li>
                <li>Poskytovat technickou podporu</li>
                <li>Vyřizovat reklamace v souladu s právními předpisy</li>
              </ul>
              <p className="text-gray-700 mt-3">Provozovatel má právo:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Upravovat a vylepšovat službu</li>
                <li>Dočasně omezit nebo přerušit službu z technických důvodů</li>
                <li>Zablokovat nebo smazat účet při porušení VOP</li>
                <li>Změnit ceny služeb s předchozím oznámením (min. 30 dní)</li>
              </ul>
            </section>

            {/* Odstoupení od smlouvy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-6 h-6 mr-2 text-rose-500" />
                7. Odstoupení od smlouvy (právo spotřebitele)
              </h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">14denní lhůta pro odstoupení</h3>
                <p className="text-gray-700 mb-3">
                  V souladu s § 1829 občanského zákoníku má spotřebitel právo odstoupit od smlouvy 
                  bez udání důvodu do <strong>14 dnů</strong> od uzavření smlouvy (od zaplacení).
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">7.1 Jak odstoupit od smlouvy</h3>
              <p className="text-gray-700 mb-3">
                Pro odstoupení od smlouvy zašlete provozovateli jednoznačné prohlášení o odstoupení:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Email:</strong> <a href="mailto:info@svatbot.cz" className="text-rose-600 hover:text-rose-700">info@svatbot.cz</a></li>
                <li><strong>Poštou:</strong> Michal Vesecký, Zápská 1149, 250 71 Nehvizdy</li>
              </ul>
              <p className="text-gray-700 mt-3">
                V prohlášení uveďte: jméno, emailovou adresu, datum uzavření smlouvy a číslo objednávky.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">7.2 Vrácení peněz</h3>
              <p className="text-gray-700 mb-3">
                Při odstoupení od smlouvy vám provozovatel vrátí všechny platby přijaté od vás 
                do <strong>14 dnů</strong> od doručení oznámení o odstoupení. Peníze budou vráceny 
                stejným způsobem, jakým byla provedena platba (na platební kartu).
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">7.3 Výjimky z práva na odstoupení</h3>
              <p className="text-gray-700 mb-3">
                Podle § 1837 občanského zákoníku nemůže spotřebitel odstoupit od smlouvy o:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Poskytování digitálního obsahu,</strong> pokud nebyl dodán na hmotném nosiči 
                  a byl dodán s předchozím výslovným souhlasem spotřebitele před uplynutím lhůty 
                  pro odstoupení a provozovatel před uzavřením smlouvy sdělil spotřebiteli, 
                  že v takovém případě nemá právo na odstoupení od smlouvy
                </li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Důležité:</strong> Pokud začnete službu aktivně používat (vytvoříte svatbu, 
                  zadáte hosty, použijete prémiové funkce) před uplynutím 14denní lhůty, budete 
                  požádáni o výslovný souhlas s tím, že začneme plnit smlouvu před uplynutím této 
                  lhůty. Tímto souhlasem ztrácíte právo na odstoupení od smlouvy.
                </p>
              </div>
            </section>

            {/* Reklamace */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Reklamace a odpovědnost za vady</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">8.1 Práva z vadného plnění</h3>
              <p className="text-gray-700 mb-3">
                Pokud služba vykazuje vady, má uživatel právo na reklamaci. Reklamaci lze uplatnit:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Email:</strong> <a href="mailto:info@svatbot.cz" className="text-rose-600 hover:text-rose-700">info@svatbot.cz</a></li>
                <li><strong>Formulář:</strong> V sekci „Podpora" na webu</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">8.2 Vyřízení reklamace</h3>
              <p className="text-gray-700 mb-3">
                Provozovatel vyřídí reklamaci do <strong>30 dnů</strong> od jejího uplatnění. 
                O výsledku reklamace bude uživatel informován emailem.
              </p>
              <p className="text-gray-700 mb-3">
                Způsoby vyřízení reklamace:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Odstranění vady (oprava služby)</li>
                <li>Přiměřená sleva z ceny</li>
                <li>Vrácení peněz (při závažné vadě)</li>
              </ul>
            </section>

            {/* Ukončení služby */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Ukončení služby a smazání účtu</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">9.1 Ukončení ze strany uživatele</h3>
              <p className="text-gray-700 mb-3">
                Uživatel může kdykoli:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Zrušit předplatné v nastavení účtu (účinné k datu konce předplaceného období)</li>
                <li>Smazat svůj účet v nastavení (okamžitě, nevratně)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">9.2 Ukončení ze strany provozovatele</h3>
              <p className="text-gray-700 mb-3">
                Provozovatel může ukončit poskytování služby a zablokovat nebo smazat účet uživatele v případě:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Porušení těchto VOP</li>
                <li>Nezaplacení ceny služby</li>
                <li>Zneužití služby k nezákonným účelům</li>
                <li>Dlouhodobé neaktivity účtu (více než 2 roky)</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Před smazáním účtu bude uživatel upozorněn emailem (min. 30 dní předem), 
                s výjimkou závažného porušení VOP.
              </p>
            </section>

            {/* Duševní vlastnictví */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Duševní vlastnictví</h2>
              <p className="text-gray-700 mb-3">
                Veškerý obsah služby SvatBot.cz (design, texty, grafika, loga, software, databáze) 
                je chráněn autorským právem a je majetkem provozovatele nebo třetích stran, 
                které provozovateli udělily licenci.
              </p>
              <p className="text-gray-700 mb-3">
                Uživatel získává nevýhradní, nepřenosnou licenci k používání služby pro osobní 
                účely. Je zakázáno:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Kopírovat, upravovat nebo distribuovat obsah služby</li>
                <li>Provádět reverse engineering aplikace</li>
                <li>Používat službu pro komerční účely bez souhlasu provozovatele</li>
                <li>Odstraňovat ochranné prvky nebo autorská označení</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Obsah vytvořený uživatelem (data o svatbě, hostech, rozpočtu apod.) zůstává 
                majetkem uživatele. Provozovatel má právo tento obsah zpracovávat pouze 
                pro účely poskytování služby.
              </p>
            </section>

            {/* Ochrana osobních údajů */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Ochrana osobních údajů</h2>
              <p className="text-gray-700 mb-3">
                Zpracování osobních údajů uživatelů se řídí Nařízením GDPR a zákonem č. 110/2019 Sb., 
                o zpracování osobních údajů.
              </p>
              <p className="text-gray-700 mb-3">
                Podrobné informace o zpracování osobních údajů naleznete v dokumentu{' '}
                <Link href="/ochrana-soukromi" className="text-rose-600 hover:text-rose-700 font-semibold underline">
                  Ochrana soukromí
                </Link>
                .
              </p>
              <p className="text-gray-700 mb-3">
                Správce osobních údajů: Michal Vesecký, IČO: 88320090, 
                email: <a href="mailto:info@svatbot.cz" className="text-rose-600 hover:text-rose-700">info@svatbot.cz</a>
              </p>
            </section>

            {/* Řešení sporů */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-rose-500" />
                12. Řešení sporů
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">12.1 Mimosoudní řešení sporů</h3>
              <p className="text-gray-700 mb-3">
                V případě sporu mezi provozovatelem a spotřebitelem má spotřebitel právo obrátit se na:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <p className="font-semibold text-gray-900 mb-2">Česká obchodní inspekce (ČOI)</p>
                <p className="text-gray-700">
                  <strong>Web:</strong> <a href="https://www.coi.cz" className="text-rose-600 hover:text-rose-700">www.coi.cz</a><br />
                  <strong>Email:</strong> <a href="mailto:adr@coi.cz" className="text-rose-600 hover:text-rose-700">adr@coi.cz</a><br />
                  <strong>Telefon:</strong> +420 296 366 360
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  ČOI je subjektem mimosoudního řešení spotřebitelských sporů. Spotřebitel může 
                  podat návrh na mimosoudní řešení sporu online prostřednictvím platformy ODR 
                  na adrese: <a href="https://ec.europa.eu/consumers/odr" className="text-rose-600 hover:text-rose-700">https://ec.europa.eu/consumers/odr</a>
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">12.2 Soudní řešení sporů</h3>
              <p className="text-gray-700 mb-3">
                Případné spory mezi provozovatelem a uživatelem budou řešeny obecnými soudy 
                České republiky. Místně příslušným soudem je soud podle sídla provozovatele, 
                pokud zákon nestanoví jinak.
              </p>
              <p className="text-gray-700 mb-3">
                Pro spotřebitele platí ochrana podle zákona č. 634/1992 Sb., o ochraně spotřebitele.
              </p>
            </section>

            {/* Závěrečná ustanovení */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Závěrečná ustanovení</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">13.1 Změny VOP</h3>
              <p className="text-gray-700 mb-3">
                Provozovatel si vyhrazuje právo tyto VOP změnit. O změně VOP bude uživatel 
                informován emailem minimálně <strong>30 dní</strong> před nabytím účinnosti změny.
              </p>
              <p className="text-gray-700 mb-3">
                Pokud uživatel se změnou nesouhlasí, má právo smlouvu vypovědět. Pokud uživatel 
                nevypoví smlouvu do 30 dnů od oznámení změny, má se za to, že se změnou souhlasí.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">13.2 Rozhodné právo</h3>
              <p className="text-gray-700 mb-3">
                Tyto VOP a vztahy jimi neupravené se řídí právním řádem České republiky, zejména:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Zákonem č. 89/2012 Sb., občanský zákoník</li>
                <li>Zákonem č. 634/1992 Sb., o ochraně spotřebitele</li>
                <li>Zákonem č. 110/2019 Sb., o zpracování osobních údajů</li>
                <li>Nařízením GDPR (EU) 2016/679</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">13.3 Oddělitelnost ustanovení</h3>
              <p className="text-gray-700 mb-3">
                Pokud se některé ustanovení těchto VOP stane neplatným nebo nevymahatelným, 
                nemá to vliv na platnost ostatních ustanovení. Neplatné ustanovení bude nahrazeno 
                ustanovením, které se co nejvíce blíží smyslu původního ustanovení.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">13.4 Účinnost</h3>
              <p className="text-gray-700 mb-3">
                Tyto obchodní podmínky nabývají účinnosti dnem <strong>5. listopadu 2025</strong>.
              </p>
              <p className="text-gray-700 mb-3 text-sm">
                Předchozí verze: 16. října 2025
              </p>
            </section>

            {/* Kontakt */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-rose-500" />
                14. Kontaktní údaje
              </h2>
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 p-6 rounded-lg">
                <p className="text-gray-700 mb-3">
                  Pro dotazy, reklamace nebo odstoupení od smlouvy nás kontaktujte:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> <a href="mailto:info@svatbot.cz" className="text-rose-600 hover:text-rose-700">info@svatbot.cz</a></p>
                  <p><strong>Poštovní adresa:</strong><br />
                  Michal Vesecký<br />
                  Zápská 1149<br />
                  250 71 Nehvizdy<br />
                  Česká republika</p>
                  <p><strong>IČO:</strong> 88320090</p>
                  <p><strong>Web:</strong> <a href="https://svatbot.cz" className="text-rose-600 hover:text-rose-700">https://svatbot.cz</a></p>
                </div>
              </div>
            </section>

            {/* Související dokumenty */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Související dokumenty</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link 
                  href="/ochrana-soukromi"
                  className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 p-6 rounded-lg hover:shadow-lg transition-all"
                >
                  <Shield className="w-8 h-8 text-rose-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Ochrana soukromí</h3>
                  <p className="text-sm text-gray-600">Jak zpracováváme vaše osobní údaje</p>
                </Link>
                <Link 
                  href="/gdpr"
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-lg hover:shadow-lg transition-all"
                >
                  <Shield className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">GDPR - Vaše práva</h3>
                  <p className="text-sm text-gray-600">Práva subjektů údajů podle GDPR</p>
                </Link>
                <Link 
                  href="/cookies"
                  className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 p-6 rounded-lg hover:shadow-lg transition-all"
                >
                  <Cookie className="w-8 h-8 text-purple-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Zásady cookies</h3>
                  <p className="text-sm text-gray-600">Jak používáme cookies</p>
                </Link>
                <Link 
                  href="/podminky-sluzby"
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-lg hover:shadow-lg transition-all"
                >
                  <FileText className="w-8 h-8 text-green-500 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Podmínky služby</h3>
                  <p className="text-sm text-gray-600">Všeobecné podmínky používání</p>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

