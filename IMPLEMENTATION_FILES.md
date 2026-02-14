# Implementation Files

This document contains all the source code files needed for the Leader Reports Analyzer application.
Due to GitHub file size limitations, create these files locally after cloning the repository.

## Configuration Files

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'], // Google OAuth profile images
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
};

module.exports = nextConfig;
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
```

### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### .env.example
```
OWNER_GOOGLE_EMAIL=your-email@gmail.com

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

DATABASE_URL=postgresql://user:password@localhost:5432/leader_reports

GEMINI_API_KEY=your-gemini-api-key

NODE_ENV=development
```

## Library Files

### src/lib/prisma.ts
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### src/lib/auth.ts
```typescript
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

if (!process.env.OWNER_GOOGLE_EMAIL) {
  throw new Error('OWNER_GOOGLE_EMAIL must be set');
}

const ALLOWED_EMAIL = process.env.OWNER_GOOGLE_EMAIL;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return user.email === ALLOWED_EMAIL;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};
```

### src/lib/gemini.ts
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeLeaderReport(text: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
Analyze this leader report and provide structured feedback:

${text}

Provide JSON output with:
{
  "summary": "brief summary",
  "strengths": ["list of strengths"],
  "areasForImprovement": ["list of areas"],
  "keyMetrics": {"metric": "value"},
  "overallScore": 0-100,
  "recommendations": ["list of recommendations"]
}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    return { raw: text, error: 'Failed to parse JSON' };
  }
}
```

## API Routes

### src/app/api/auth/[...nextauth]/route.ts
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### src/app/api/leaders/route.ts
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const leaders = await prisma.leader.findMany({
    orderBy: { fullName: 'asc' },
  });

  return NextResponse.json(leaders);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();
  const leader = await prisma.leader.create({ data });

  return NextResponse.json(leader);
}
```

### src/app/api/upload/route.ts
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeLeaderReport } from '@/lib/gemini';
import pdf from 'pdf-parse';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const leaderId = formData.get('leaderId') as string;
    const cycleId = formData.get('cycleId') as string;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);
    const extractedText = data.text;

    // Analyze with Gemini
    const analysis = await analyzeLeaderReport(extractedText);

    // Save artifact
    const artifact = await prisma.artifact.create({
      data: {
        leaderId: parseInt(leaderId),
        cycleId: cycleId ? parseInt(cycleId) : null,
        type: 'PDF',
        url: file.name,
        content: extractedText,
      },
    });

    // Save AI review
    const aiReview = await prisma.aIReview.create({
      data: {
        artifactId: artifact.id,
        rawOutput: JSON.stringify(analysis),
        structuredData: analysis,
      },
    });

    return NextResponse.json({ artifact, aiReview });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

## Main Pages

### src/app/page.tsx
```typescript
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  redirect('/dashboard');
}
```

### src/app/dashboard/page.tsx
```typescript
'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch('/api/leaders')
      .then(res => res.json())
      .then(data => setLeaders(data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Leader Reports Analyzer
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/leaders/new" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add New Leader
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((leader: any) => (
            <Link key={leader.id} href={`/leaders/${leader.id}`}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-2">{leader.fullName}</h3>
              <p className="text-gray-600 dark:text-gray-400">{leader.position}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
```

### src/app/auth/signin/page.tsx
```typescript
'use client';
import { signIn } from 'next-auth/react';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Leader Reports Analyzer</h1>
        <p className="mb-4 text-gray-600">Sign in with your authorized Google account</p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
```

## Root Layout

### src/app/layout.tsx
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leader Reports Analyzer",
  description: "Analyze leader reports with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

### src/app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}
```

## Quick Start Guide

1. **Clone the repository**
```bash
git clone https://github.com/vnyadvantage-lang/leader-reports-analyzer.git
cd leader-reports-analyzer
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. **Set up database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run development server**
```bash
npm run dev
```

6. **Access the application**
Open http://localhost:3000

## Important Notes

- Only the email specified in OWNER_GOOGLE_EMAIL can access the application
- All files above should be created in their respective directories
- Run `npx prisma studio` to manage database via GUI
- See DEPLOYMENT_GUIDE.md for production deployment
- See COMPLETE_PROJECT_CODE.md for additional configuration files

## Directory Structure Created
```
leader-reports-analyzer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── leaders/route.ts
│   │   │   └── upload/route.ts
│   │   ├── auth/signin/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── auth.ts
│       ├── gemini.ts
│       └── prisma.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```
