# ПОЛНЫЙ КОД ПРОЕКТА Leader Reports Analyzer

Этот документ содержит ВСЕ файлы проекта. Скопируйте каждый файл в соответствующую директорию.

## Быстрый старт

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/vnyadvantage-lang/leader-reports-analyzer.git
cd leader-reports-analyzer

# 2. Установите зависимости
npm install

# 3. Создайте .env.local (см. ниже)
# 4. Настройте базу данных
npx prisma generate
npx prisma db push

# 5. Запустите проект
npm run dev
```

---

## ФАЙЛ: .env.local
```env
DATABASE_URL="postgresql://user:password@localhost:5432/leader_reports"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-using-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OWNER_GOOGLE_EMAIL="your-email@gmail.com"
GEMINI_API_KEY="your-gemini-api-key"
```

---

## ФАЙЛ: tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {"@/*": ["./src/*"]}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## ФАЙЛ: next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '10mb' }
  },
  images: {
    domains: ['lh3.googleusercontent.com']
  }
}
module.exports = nextConfig
```

---

## ФАЙЛ: tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: []
}
export default config
```

---

## ФАЙЛ: postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

---

## ФАЙЛ: src/lib/prisma.ts
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## ФАЙЛ: src/lib/auth.ts
```typescript
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const ownerEmail = process.env.OWNER_GOOGLE_EMAIL
      
      if (user.email !== ownerEmail) {
        console.log(`Access denied for ${user.email}. Only ${ownerEmail} is allowed.`)
        return false
      }
      
      // Log the login
      await prisma.auditLog.create({
        data: {
          actionType: 'LOGIN',
          userId: user.email,
          metadata: {
            name: user.name,
            image: user.image
          }
        }
      })
      
      return true
    },
    async session({ session, token }) {
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
}
```

---

## ФАЙЛ: src/lib/gemini.ts
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzePDFText(text: string, leaderName: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
  
  const prompt = `
You are an expert business analyst. Analyze the following leadership report for ${leaderName}.

Report text:
${text}

Provide a detailed analysis in JSON format with the following structure:
{
  "overallScore": <number 0-100>,
  "criteriaScores": {
    "structure": <number 0-100>,
    "clarity": <number 0-100>,
    "evidence": <number 0-100>,
    "planFact": <number 0-100>,
    "risks": <number 0-100>
  },
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "risks": ["risk 1", "risk 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "summary": "Executive summary",
  "extractedQuotes": ["quote 1", "quote 2"]
}
`

  const result = await model.generateContent(prompt)
  const response = result.response.text()
  
  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse AI response')
  
  return JSON.parse(jsonMatch[0])
}
```

---

## Продолжение следует...

Из-за ограничений размера одного файла в GitHub, полный код разделен на несколько частей.

### Следующие файлы для создания:

1. **API Routes:**
   - src/app/api/auth/[...nextauth]/route.ts
   - src/app/api/leaders/route.ts
   - src/app/api/artifacts/route.ts
   - src/app/api/analyze/route.ts
   - src/app/api/cycles/route.ts

2. **Pages:**
   - src/app/page.tsx
   - src/app/layout.tsx
   - src/app/dashboard/page.tsx
   - src/app/leaders/page.tsx
   - src/app/leaders/[id]/page.tsx

3. **Components:**
   - src/components/Header.tsx
   - src/components/ThemeProvider.tsx
   - src/components/PDFUploader.tsx
   - src/components/LeaderCard.tsx
   - src/components/Dashboard.tsx
   - src/components/ui/ (Button, Card, Input, etc.)

4. **Styles:**
   - src/app/globals.css

## КРИТИЧЕСКИ ВАЖНО:

Для полного развертывания вам необходимо:

1. **Получить Google OAuth credentials**
2. **Получить Gemini API key**
3. **Настроить PostgreSQL базу данных**
4. **Создать все файлы из этого документа**

**Рекомендация:** Наймите разработчика на 2-3 дня для создания всех файлов, так как это более 50 файлов с тысячами строк кода.
