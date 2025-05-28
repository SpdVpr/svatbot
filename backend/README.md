# 🚀 SvatBot API - Real Backend

Kompletní backend API pro SvatBot marketplace - profesionální svatební platforma.

## 🏗️ Architektura

- **Framework:** Express.js + TypeScript
- **Databáze:** PostgreSQL + Prisma ORM
- **Cache:** Redis
- **Upload:** Cloudinary
- **Email:** Nodemailer
- **Auth:** JWT tokens
- **Real-time:** Socket.IO
- **Monitoring:** Winston logging

## 📋 Požadavky

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Cloudinary účet (pro upload obrázků)
- Gmail účet (pro email notifikace)

## 🚀 Rychlý start

### 1. Instalace závislostí

```bash
npm install
```

### 2. Nastavení prostředí

```bash
cp .env.example .env
```

Upravte `.env` soubor s vašimi údaji:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/svatbot_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### 3. Databáze setup

```bash
# Generování Prisma klienta
npm run generate

# Migrace databáze
npm run migrate

# Naplnění testovacími daty
npm run seed
```

### 4. Spuštění serveru

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Server běží na `http://localhost:3001`

## 📚 API Dokumentace

### Základní endpointy

- **Health Check:** `GET /health`
- **API Docs:** `GET /api/v1/docs`

### Autentifikace

```bash
# Registrace
POST /api/v1/auth/register
{
  "firstName": "Jan",
  "lastName": "Novák",
  "email": "jan@example.com",
  "password": "SecurePass123"
}

# Přihlášení
POST /api/v1/auth/login
{
  "email": "jan@example.com",
  "password": "SecurePass123"
}

# Profil uživatele
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

### Dodavatelé

```bash
# Seznam dodavatelů
GET /api/v1/vendors?category=photographer&city=Praha

# Detail dodavatele
GET /api/v1/vendors/:id

# Vytvoření dodavatele (autentifikace)
POST /api/v1/vendors
Authorization: Bearer <token>

# Úprava dodavatele (vlastník/admin)
PUT /api/v1/vendors/:id
Authorization: Bearer <token>
```

### Upload obrázků

```bash
# Upload obrázků
POST /api/v1/upload/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Smazání obrázku
DELETE /api/v1/upload/images/:publicId
Authorization: Bearer <token>
```

### Admin

```bash
# Admin statistiky
GET /api/v1/admin/stats
Authorization: Bearer <admin-token>

# Ověření dodavatele
PUT /api/v1/admin/vendors/:id/verify
Authorization: Bearer <admin-token>
```

## 🔐 Autentifikace

API používá JWT tokeny pro autentifikaci:

```javascript
// Hlavička požadavku
Authorization: Bearer <access-token>
```

### Role uživatelů

- **USER** - Základní uživatel
- **VENDOR** - Dodavatel služeb
- **ADMIN** - Administrátor
- **SUPER_ADMIN** - Super administrátor

## 📊 Rate Limiting

- **Obecné API:** 100 požadavků / 15 minut
- **Autentifikace:** 5 pokusů / 15 minut
- **Upload:** 50 uploadů / hodinu
- **Kontakt:** 10 zpráv / hodinu

## 🗄️ Databázové schéma

### Hlavní tabulky

- **users** - Uživatelé systému
- **vendors** - Dodavatelé služeb
- **services** - Služby dodavatelů
- **reviews** - Hodnocení
- **inquiries** - Poptávky
- **vendor_images** - Obrázky dodavatelů
- **addresses** - Adresy

### Vztahy

```
User 1:1 Vendor
Vendor 1:N Services
Vendor 1:N VendorImages
Vendor 1:N Reviews
Vendor 1:N Inquiries
User 1:N Reviews
User 1:N Inquiries
```

## 🔧 Konfigurace

### Environment proměnné

| Proměnná | Popis | Výchozí |
|----------|-------|---------|
| `PORT` | Port serveru | 3001 |
| `NODE_ENV` | Prostředí | development |
| `DATABASE_URL` | PostgreSQL URL | - |
| `REDIS_URL` | Redis URL | redis://localhost:6379 |
| `JWT_SECRET` | JWT tajný klíč | - |
| `CLOUDINARY_*` | Cloudinary konfigurace | - |
| `EMAIL_*` | Email konfigurace | - |

### Logging

Logy se ukládají do:
- `logs/combined.log` - Všechny logy
- `logs/error.log` - Pouze chyby
- Console (development)

## 🧪 Testování

```bash
# Spuštění testů
npm test

# Test coverage
npm run test:coverage

# Linting
npm run lint

# Formátování kódu
npm run format
```

## 📈 Monitoring

### Health Check

```bash
GET /health
```

Odpověď:
```json
{
  "status": "ok",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "email": "healthy",
    "cloudinary": "healthy"
  },
  "version": "1.0.0",
  "environment": "development"
}
```

### Metriky

- Response time
- Error rate
- Database queries
- Cache hit rate
- Active connections

## 🔄 Real-time funkce

Socket.IO endpointy:

```javascript
// Připojení k admin room
socket.emit('join-admin')

// Připojení k vendor room
socket.emit('join-vendor', vendorId)

// Události
socket.on('vendor_verified', data)
socket.on('vendor_featured', data)
socket.on('new_inquiry', data)
```

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t svatbot-api .

# Spuštění
docker run -p 3001:3001 --env-file .env svatbot-api
```

### PM2

```bash
# Instalace PM2
npm install -g pm2

# Spuštění
pm2 start ecosystem.config.js

# Monitoring
pm2 monit
```

## 🔒 Bezpečnost

- **Helmet.js** - Security headers
- **CORS** - Cross-origin requests
- **Rate limiting** - Ochrana proti spam
- **Input validation** - Validace vstupů
- **SQL injection** - Prisma ORM ochrana
- **XSS** - Sanitizace dat

## 📝 Changelog

### v1.0.0
- ✅ Kompletní API implementace
- ✅ Autentifikace a autorizace
- ✅ CRUD operace pro dodavatele
- ✅ Upload obrázků
- ✅ Email notifikace
- ✅ Admin panel API
- ✅ Real-time updates
- ✅ Rate limiting
- ✅ Caching
- ✅ Logging

## 🤝 Přispívání

1. Fork repository
2. Vytvořte feature branch
3. Commitněte změny
4. Pushněte do branch
5. Vytvořte Pull Request

## 📄 Licence

MIT License - viz [LICENSE](LICENSE) soubor.

## 🆘 Podpora

- **Email:** support@svatbot.cz
- **Issues:** GitHub Issues
- **Dokumentace:** [docs.svatbot.cz](https://docs.svatbot.cz)

---

**SvatBot API v1.0.0** - Profesionální backend pro svatební marketplace 💍
