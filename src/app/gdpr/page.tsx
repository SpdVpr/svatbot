import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, Download, Trash2, Edit, Eye, FileDown, Mail, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'GDPR - Vaše práva',
  description: 'Informace o vašich právech podle GDPR a jak je uplatnit na SvatBot.cz',
}

export default function GDPRPage() {
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
              <h1 className="text-4xl font-bold text-gray-900">GDPR - Vaše práva</h1>
              <p className="text-gray-600 mt-2">Jak uplatňujeme GDPR na SvatBot.cz</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Úvod */}
            <section className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                Obecné nařízení o ochraně osobních údajů (GDPR) je evropský zákon, který chrání vaše 
                osobní údaje a dává vám kontrolu nad tím, jak jsou vaše data používána. Na SvatBot.cz 
                bereme ochranu vašich údajů velmi vážně a plně dodržujeme všechna ustanovení GDPR.
              </p>
            </section>

            {/* Co je GDPR */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Co je GDPR?</h2>
              <p className="text-gray-700 mb-4">
                GDPR (General Data Protection Regulation) je nařízení Evropské unie č. 2016/679, 
                které vstoupilo v platnost 25. května 2018. V České republice je doplněno zákonem 
                č. 110/2019 Sb., o zpracování osobních údajů.
              </p>
              <p className="text-gray-700">
                Toto nařízení vám dává řadu práv týkajících se vašich osobních údajů a ukládá 
                organizacím povinnost tyto údaje chránit a zpracovávat transparentně.
              </p>
            </section>

            {/* Vaše práva */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vaše práva podle GDPR</h2>
              <p className="text-gray-700 mb-6">
                Podle GDPR máte následující práva, která můžete kdykoli uplatnit:
              </p>

              {/* Právo na přístup */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <Eye className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Právo na přístup k údajům</h3>
                    <p className="text-gray-700 mb-3">
                      Máte právo vědět, jaké osobní údaje o vás zpracováváme, za jakým účelem a komu je předáváme.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Jak uplatnit:</p>
                      <p className="text-sm text-gray-700">
                        Přihlaste se do svého účtu a v sekci „Nastavení" → „Můj účet" → „Stáhnout moje data" 
                        si můžete zobrazit všechny údaje, které o vás máme.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Právo na opravu */}
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <Edit className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Právo na opravu údajů</h3>
                    <p className="text-gray-700 mb-3">
                      Máte právo požadovat opravu nepřesných nebo neúplných osobních údajů.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Jak uplatnit:</p>
                      <p className="text-sm text-gray-700">
                        Většinu údajů můžete upravit přímo ve svém účtu v sekci „Nastavení". 
                        Pro změnu e-mailu nebo jiných citlivých údajů nás kontaktujte na info@svatbot.cz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Právo na výmaz */}
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <Trash2 className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Právo na výmaz („právo být zapomenut")</h3>
                    <p className="text-gray-700 mb-3">
                      Máte právo požadovat vymazání svých osobních údajů, pokud již nejsou potřebné 
                      pro účely, pro které byly shromážděny.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Jak uplatnit:</p>
                      <p className="text-sm text-gray-700 mb-2">
                        V sekci „Nastavení" → „Můj účet" → „Smazat účet" můžete trvale smazat svůj účet 
                        a všechna data. Tato akce je nevratná.
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mt-2">
                        <p className="text-xs text-gray-700">
                          <strong>Upozornění:</strong> Některé údaje musíme uchovat po zákonem stanovenou dobu 
                          (např. účetní doklady po dobu 10 let).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Právo na přenositelnost */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <Download className="w-6 h-6 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Právo na přenositelnost údajů</h3>
                    <p className="text-gray-700 mb-3">
                      Máte právo získat své osobní údaje ve strukturovaném, běžně používaném 
                      a strojově čitelném formátu.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Jak uplatnit:</p>
                      <p className="text-sm text-gray-700">
                        V sekci „Nastavení" → „Export dat" můžete stáhnout všechna svá data ve formátu JSON nebo CSV, 
                        která můžete použít v jiných aplikacích.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Právo na omezení */}
              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">5. Právo na omezení zpracování</h3>
                    <p className="text-gray-700 mb-3">
                      Máte právo požadovat omezení zpracování vašich osobních údajů v určitých situacích.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Jak uplatnit:</p>
                      <p className="text-sm text-gray-700">
                        Kontaktujte nás na info@svatbot.cz s popisem, jaké zpracování chcete omezit a z jakého důvodu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Právo vznést námitku */}
              <div className="bg-gray-50 border-l-4 border-gray-500 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <FileDown className="w-6 h-6 text-gray-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">6. Právo vznést námitku</h3>
                    <p className="text-gray-700 mb-3">
                      Máte právo vznést námitku proti zpracování vašich osobních údajů, zejména 
                      pro účely přímého marketingu.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Jak uplatnit:</p>
                      <p className="text-sm text-gray-700">
                        Pro odhlášení z marketingových e-mailů klikněte na odkaz „Odhlásit" v patičce 
                        každého e-mailu nebo upravte své preference v sekci „Nastavení" → „Notifikace".
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Právo odvolat souhlas */}
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-lg mb-6">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-indigo-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">7. Právo odvolat souhlas</h3>
                    <p className="text-gray-700 mb-3">
                      Pokud je zpracování založeno na vašem souhlasu, máte právo tento souhlas kdykoli odvolat.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Jak uplatnit:</p>
                      <p className="text-sm text-gray-700">
                        V sekci „Nastavení" → „Soukromí a cookies" můžete spravovat všechny své souhlasy 
                        a kdykoli je odvolat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Jak chráníme vaše data */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Jak chráníme vaše data</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">🔒 Šifrování</h3>
                  <p className="text-sm text-gray-700">
                    Veškerá komunikace je šifrována pomocí SSL/TLS protokolu. Hesla jsou uložena 
                    v šifrované podobě pomocí moderních hashovacích algoritmů.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">🇪🇺 EU servery</h3>
                  <p className="text-sm text-gray-700">
                    Všechna vaše data jsou uložena na serverech v Evropské unii (Firebase Europe West 1), 
                    což zajišťuje plnou ochranu podle GDPR.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">🔐 Omezený přístup</h3>
                  <p className="text-sm text-gray-700">
                    K vašim osobním údajům mají přístup pouze oprávněné osoby, které je potřebují 
                    pro poskytování služby.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">💾 Zálohy</h3>
                  <p className="text-sm text-gray-700">
                    Pravidelně zálohujeme vaše data, abychom je ochránili před ztrátou. 
                    Zálohy jsou také šifrovány a bezpečně uloženy.
                  </p>
                </div>
              </div>
            </section>

            {/* Minimalizace dat */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Minimalizace dat</h2>
              <p className="text-gray-700 mb-4">
                V souladu s principem minimalizace dat podle GDPR sbíráme pouze údaje, které jsou 
                nezbytné pro poskytování našich služeb:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Nesbíráme citlivé údaje (rasový původ, náboženství, zdravotní stav atd.)</li>
                <li>Neprodáváme vaše údaje třetím stranám</li>
                <li>Nepoužíváme vaše údaje pro jiné účely než poskytování služby</li>
                <li>Automaticky mažeme neaktivní účty po 2 letech</li>
              </ul>
            </section>

            {/* Kontakt a stížnosti */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Kontakt a podání stížnosti</h2>
              
              <div className="bg-rose-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Kontaktujte nás</h3>
                <p className="text-gray-700 mb-3">
                  Máte-li jakékoli dotazy ohledně zpracování vašich osobních údajů nebo chcete 
                  uplatnit svá práva podle GDPR:
                </p>
                <div className="bg-white p-4 rounded-lg">
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
                <p className="text-sm text-gray-600 mt-3">
                  Odpovíme vám do 30 dnů od obdržení vaší žádosti.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Podání stížnosti u dozorového úřadu</h3>
                <p className="text-gray-700 mb-3">
                  Pokud se domníváte, že zpracování vašich osobních údajů porušuje GDPR, 
                  máte právo podat stížnost u dozorového úřadu:
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Úřad pro ochranu osobních údajů</strong><br />
                    Pplk. Sochora 27<br />
                    170 00 Praha 7<br />
                    Česká republika
                  </p>
                  <p className="text-gray-700 mt-2">
                    <strong>Web:</strong> <a href="https://uoou.gov.cz" className="text-blue-600 hover:text-blue-700">www.uoou.gov.cz</a><br />
                    <strong>Email:</strong> <a href="mailto:posta@uoou.cz" className="text-blue-600 hover:text-blue-700">posta@uoou.cz</a><br />
                    <strong>Telefon:</strong> +420 234 665 111
                  </p>
                </div>
              </div>
            </section>

            {/* Další informace */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Další informace</h2>
              <p className="text-gray-700 mb-4">
                Pro podrobné informace o tom, jak zpracováváme vaše osobní údaje, si přečtěte:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/ochrana-soukromi"
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-4 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all text-center font-semibold"
                >
                  Zásady ochrany soukromí
                </Link>
                <Link 
                  href="/podminky-sluzby"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-4 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all text-center font-semibold"
                >
                  Podmínky služby
                </Link>
              </div>
            </section>

            {/* Závěr */}
            <section className="mb-8">
              <div className="bg-gradient-to-r from-rose-50 to-purple-50 border-2 border-rose-200 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">💝 Vaše soukromí je pro nás prioritou</h3>
                <p className="text-gray-700">
                  Na SvatBot.cz si vážíme vašeho důvěry a zavazujeme se chránit vaše osobní údaje 
                  v souladu s nejvyššími standardy. Pokud máte jakékoli dotazy nebo obavy, 
                  neváhejte nás kontaktovat.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

