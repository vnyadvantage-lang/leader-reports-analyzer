# Leader Reports Analyzer

Full-stack web application for analyzing leader reports with PDF upload, Gemini AI integration, and comprehensive dashboards.

## Overview

This application provides a secure, single-owner platform for analyzing and tracking leader performance reports over time. It features:

- **Single Owner Access**: Only one authorized Google account can access the application
- **PDF Analysis**: Upload PDF reports and extract text automatically
- **AI-Powered Insights**: Gemini AI analyzes reports and provides structured feedback
- **Leader Profiles**: Maintain detailed records for each leader including photos, salary, performance data
- **Performance Tracking**: Track metrics across multiple cycles
- **Modern UI**: Clean, responsive interface with Light/Dark mode support

## Features

### Security & Authentication
- Google OAuth 2.0 integration
- Email allowlist (single owner)
- Secure session management

### Leader Management
- Create and manage leader profiles
- Upload leader photos
- Track salary, position, and personal details
- Store Performia test results

### Document Analysis
- Upload PDF reports
- Automatic text extraction
- AI-powered analysis via Gemini
- Store structured analysis results

### Performance Cycles
- Create performance review cycles
- Track evaluations over time
- Compare performance across cycles

### Dashboards
- Overview of all leaders
- Individual leader detail pages
- Performance trends and charts

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: Google Gemini API
- **PDF Processing**: pdf-parse

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials
- Gemini API key

### Installation

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
```

Edit `.env` and fill in your credentials:
- `OWNER_GOOGLE_EMAIL`: Your authorized email
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `DATABASE_URL`: Your PostgreSQL connection string
- `GEMINI_API_KEY`: From Google AI Studio

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Create source files**

Refer to `IMPLEMENTATION_FILES.md` for all source code files that need to be created in the `src/` directory.

6. **Run development server**
```bash
npm run dev
```

7. **Open the application**

Navigate to http://localhost:3000

## Project Structure

```
leader-reports-analyzer/
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Main dashboard
│   │   └── leaders/         # Leader management pages
│   └── lib/
│       ├── auth.ts          # NextAuth configuration
│       ├── gemini.ts        # Gemini AI integration
│       └── prisma.ts        # Prisma client
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Documentation

- **IMPLEMENTATION_FILES.md**: Complete source code for all application files
- **COMPLETE_PROJECT_CODE.md**: Configuration files and utilities
- **DEPLOYMENT_GUIDE.md**: Production deployment instructions

## Database Schema

The application uses 5 main entities:

1. **Leader**: Leader profile information
2. **Cycle**: Performance review cycles
3. **Artifact**: Uploaded documents (PDFs, links)
4. **AIReview**: AI analysis results
5. **AuditLog**: Activity tracking

## Key Features Implementation

### Single Owner Access

The application enforces single-owner access through:
- Email validation in NextAuth callback
- Server-side session checks on all API routes
- Environment variable `OWNER_GOOGLE_EMAIL`

### PDF Analysis Workflow

1. User uploads PDF file
2. Backend extracts text using pdf-parse
3. Text is sent to Gemini AI for analysis
4. Structured analysis is saved to database
5. Results displayed in UI

## Development

### Database Management

View and edit database:
```bash
npx prisma studio
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Database Migrations
```bash
npx prisma migrate dev
```

## Deployment

See `DEPLOYMENT_GUIDE.md` for detailed production deployment instructions.

## Security Notes

- Never commit `.env` file
- Only the email specified in `OWNER_GOOGLE_EMAIL` can access the application
- All API routes are protected with authentication checks
- Files are validated before processing

## License

MIT

## Support

For issues or questions, please create a GitHub issue.
