# SvatBot.cz 💕

Moderní svatební plánovač pro český trh - kompletní aplikace pro plánování svatby krok za krokem.

## 🎯 Vize

"Svatbot.cz - váš průvodce krásným svatebním plánováním krok za krokem"

Aplikace navede uživatele logickým procesem od základních rozhodnutí po nejmenší detaily. Každý krok je příjemný, vizuálně atraktivní a poskytuje pocit pokroku.

## 🏗 Architektura

### Platformy
- **Primární**: Android (React Native)
- **Sekundární**: Web aplikace (Next.js)
- **Budoucí**: iOS

### Tech Stack
- **Mobile**: React Native 0.73+
- **Web**: Next.js 14+ (App Router)
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **UI**: React Native Paper + Custom Theme
- **State**: Zustand + React Query
- **Maps**: Google Maps API
- **Payments**: Stripe (future)

## 📱 Hlavní moduly

### Core Features
1. **Autentifikace & Onboarding** - postupný setup svatby
2. **Dashboard** - přehled pokroku a rychlé akce
3. **Wedding Builder** - 7 fází plánování
4. **Checklist úkolů** - strukturované úkoly podle fází
5. **Správa hostů** - CRM s RSVP systémem
6. **Rozpočet & finance** - detailní tracking nákladů
7. **Časový plán** - timeline svatebního dne
8. **Seating plan** - interaktivní rozmístění hostů

### Advanced Features
9. **Místa konání** - databáze českých venues
10. **Dodavatelé služeb** - marketplace s hodnocením
11. **Darová registrace** - wishlist pro hosty
12. **Dokumenty & foto** - cloud storage

## 🎨 Design System

### Barvy
- **Primary**: Soft Rose (#F8BBD9)
- **Secondary**: Lavender (#E1D5E7)
- **Accent**: Gold (#F7DC6F)
- **Neutral**: Cream White (#FDFEFE)
- **Text**: Charcoal (#2C3E50)

### Typography
- **Headers**: Playfair Display (elegant serif)
- **Body**: Inter (modern sans-serif)
- **Buttons**: Montserrat (bold sans-serif)

## 💰 Monetizace

### Free verze
- Max 50 hostů
- Základní checklist
- Simple rozpočet
- Export s watermarkem

### Premium (99 Kč/měsíc)
- Neomezené funkce
- Pokročilé nástroje
- Prioritní podpora
- Bez reklam

### Pro verze (299 Kč/měsíc)
- Pro koordinátory
- Více svateb současně
- Brandované exporty
- API přístup

## 🚀 Development Roadmap

### Fáze 1: MVP (8-10 týdnů)
- [ ] Project setup
- [ ] Authentication
- [ ] Onboarding flow
- [ ] Dashboard
- [ ] Wedding Builder
- [ ] Basic checklist
- [ ] Guest management
- [ ] Budget tracking

### Fáze 2: Android (4-6 týdnů)
- [ ] React Native build
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Google Play Store

### Fáze 3: Advanced Features (6-8 týdnů)
- [ ] Seating plan
- [ ] RSVP system
- [ ] Venues database
- [ ] Vendor marketplace

### Fáze 4: Web App (4-5 týdnů)
- [ ] Next.js implementation
- [ ] Desktop optimization
- [ ] SEO optimization

### Fáze 5: Premium & Launch (3-4 týdnů)
- [ ] Subscription system
- [ ] Payment processing
- [ ] Analytics
- [ ] Launch campaign

## 📊 Success Metrics

### Rok 1 cíle
- 50,000+ registrovaných uživatelů
- 15% conversion rate (free → premium)
- 4.5+ App Store rating
- 70% user retention (30 dní)
- 200+ verified vendors

## 🔧 Development Setup

```bash
# Clone repository
git clone https://github.com/svatbot/svatbot-app.git
cd svatbot-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Start development
npm run dev
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contact

- **Email**: info@svatbot.cz
- **Website**: https://svatbot.cz
- **Instagram**: @svatbot.cz

---

Made with 💕 for Czech couples planning their perfect wedding day.
