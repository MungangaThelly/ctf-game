#!/bin/bash
# Production Setup Script
# This script helps you prepare for production deployment

set -e

echo "🚀 CTF Game - Production Setup"
echo "=============================="
echo ""

# Check Node version
echo "✓ Checking Node.js..."
node --version

# Install dependencies
echo ""
echo "✓ Installing dependencies..."
npm install

# Generate Prisma client
echo ""
echo "✓ Generating Prisma client..."
npx prisma generate

# Build the app
echo ""
echo "✓ Building Next.js application..."
npm run build

echo ""
echo "✅ Build successful!"
echo ""
echo "Next steps:"
echo "1. Create a PostgreSQL database (Vercel Postgres, Neon, or Railway)"
echo "2. Set DATABASE_URL in .env.local"
echo "3. Run: npx prisma migrate deploy"
echo "4. Get Stripe LIVE keys from: https://dashboard.stripe.com"
echo "5. Set Stripe environment variables in .env.local"
echo "6. Test locally: npm start"
echo "7. Push to GitHub: git push origin main"
echo "8. Deploy on Vercel: https://vercel.com/new"
echo ""
echo "See DEPLOYMENT.md for detailed instructions."
