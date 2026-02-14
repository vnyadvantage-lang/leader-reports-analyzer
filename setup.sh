#!/bin/bash

# Leader Reports Analyzer - Automated Setup Script
# This script creates all necessary files and directories for the application

echo "🚀 Starting Leader Reports Analyzer setup..."

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p src/app/api/auth/\[...nextauth\]
mkdir -p src/app/api/leaders
mkdir -p src/app/api/upload
mkdir -p src/app/api/artifacts
mkdir -p src/app/api/cycles
mkdir -p src/app/dashboard
mkdir -p src/app/leaders/\[id\]
mkdir -p src/app/auth/signin
mkdir -p src/app/auth/error
mkdir -p src/lib
mkdir -p src/components
mkdir -p public

echo "✅ Directory structure created"

# Create configuration files
echo "⚙️  Creating configuration files..."

# next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
};

module.exports = nextConfig;
EOF

# tailwind.config.ts
cat > tailwind.config.ts << 'EOF'
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
EOF

# postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

echo "✅ Configuration files created"

echo ""
echo "📝 Next steps:"
echo "1. Copy .env.example to .env and fill in your credentials"
echo "2. Run: npm install"
echo "3. Run: npx prisma generate"
echo "4. Run: npx prisma db push"
echo "5. Check IMPLEMENTATION_FILES.md for all source code files"
echo "6. Create the remaining source files from IMPLEMENTATION_FILES.md"
echo "7. Run: npm run dev"
echo ""
echo "✨ Setup script completed!"
echo "📚 See QUICKSTART_RU.md for detailed instructions in Russian"
echo "📚 See README.md for detailed instructions in English"
