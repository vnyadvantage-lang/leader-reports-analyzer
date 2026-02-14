# Leader Reports Analyzer

## Полное веб-приложение для анализа отчётов руководителей

### Особенности
- ✅ Next.js 15 + React 19 + TypeScript
- ✅ Google OAuth 2.0 с проверкой владельца
- ✅ PostgreSQL + Prisma ORM
- ✅ Gemini AI для анализа PDF отчётов
- ✅ Tailwind CSS + Dark/Light темы
- ✅ Дашборды с графиками и аналитикой
- ✅ Загрузка и анализ PDF файлов
- ✅ Управление циклами и рейтингами

### Быстрый старт

#### 1. Клонируйте репозиторий
```bash
git clone https://github.com/vnyadvantage-lang/leader-reports-analyzer.git
cd leader-reports-analyzer
```

#### 2. Установите зависимости
```bash
npm install
```

#### 3. Создайте файл .env.local
```env
DATABASE_URL="postgresql://user:password@localhost:5432/leader_reports"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OWNER_GOOGLE_EMAIL="your-owner-email@gmail.com"
GEMINI_API_KEY="your-gemini-api-key"
```

#### 4. Настройте базу данных
```bash
npx prisma generate
npx prisma db push
```

#### 5. Запустите проект
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

---

## Создание полной структуры проекта

### Создайте следующие директории:
```bash
mkdir -p src/{app/{api/{auth/[...nextauth],leaders,cycles,artifacts,analyze},dashboard,leaders/[id]},components/{ui},lib,types}
mkdir -p prisma public uploads
```

### Важные файлы для создания:

**prisma/schema.prisma** - Схема базы данных с моделями:
- Leader (руководители)
- Cycle (циклы отчётности)
- Artifact (PDF файлы и ссылки)
- AIReview (результаты AI анализа)
- AuditLog (логи действий)

**src/app/api/auth/[...nextauth]/route.ts** - OAuth аутентификация с проверкой OWNER_GOOGLE_EMAIL

**src/app/api/analyze/route.ts** - API для анализа PDF через Gemini AI

**src/app/dashboard/page.tsx** - Главный дашборд с графиками

**src/components/** - UI компоненты с поддержкой тем

---

## Структура базы данных

### Leader (Руководитель)
- id, fullName, roleTitle, department
- photoUrl, hireDate, status
- salary (amount, currency, comment)
- performiaSummary, performiaFileUrl
- notes, timestamps

### Cycle (Цикл отчётности)
- id, name, type (5week/month/quarter)
- startDate, endDate, notes

### Artifact (Артефакт)
- id, leaderId, cycleId
- type (PDF/LINK/NOTE)
- title, url, fileUrl, fileName
- source (Platrum/Wrike/GoogleDocs)
- tags[], aiStatus

### AIReview (AI Анализ)
- id, leaderId, cycleId
- artifactIds[], promptVersion
- overallScore (0-100)
- criteriaScores (JSON)
- strengths[], improvements[], risks[]
- recommendations[], summary
- extractedQuotes[]

---

## Следующие шаги для полного развёртывания

1. **Создайте все файлы проекта согласно структуре**
2. **Настройте Google OAuth** в Google Cloud Console
3. **Получите Gemini API Key**
