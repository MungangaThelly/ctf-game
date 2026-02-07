# Production Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- Stripe account with live mode enabled

---

## Step 1: Prepare for Production

### 1.1 Update Database for Production
You'll need to switch from SQLite to PostgreSQL for Vercel deployment.

**Install PostgreSQL adapter:**
```bash
npm install @prisma/adapter-neon @neondatabase/serverless ws
```

**Update `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Create schema on PostgreSQL:**
```bash
# For Neon and other serverless Postgres providers
npx prisma db push
```

---

## Step 2: Get Stripe Live Keys

1. Go to https://dashboard.stripe.com
2. Toggle from "Test mode" to "Live mode" (top right)
3. Go to **Developers → API keys**
4. Copy:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)
5. Create a product:
   - Go to **Products** → Create product
   - Name: "CTF Premium Access"
   - Price: $9.99 (one-time or recurring)
   - Copy the **Price ID** (starts with `price_...`)

---

## Step 3: Deploy to Vercel

### 3.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - CTF game ready for production"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ctf-game.git
git push -u origin main
```

### 3.2 Deploy on Vercel
1. Go to https://vercel.com
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next

### 3.3 Set Environment Variables
In Vercel project settings → Environment Variables, add:

```
# Database (Neon/Vercel Postgres)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate-random-secret>

# Stripe (LIVE KEYS - NOT TEST!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=<will-set-after-webhook-setup>
```

**Generate NEXTAUTH_SECRET:**
```bash
# macOS/Linux
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3.4 Deploy
Click **"Deploy"** and wait for build to complete.

---

## Step 4: Set Up Production Database

### Option A: Vercel Postgres (Recommended)
1. In Vercel project → **Storage** → Create Database
2. Choose **Postgres**
3. Copy connection string to `DATABASE_URL`

### Option B: Neon.tech (Free tier)
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add to Vercel environment variables

**Run Prisma migration on production:**
```bash
# If you have migrations checked in
npx prisma migrate deploy

# If you only used db push during setup
npx prisma db push
```

**Seed admin user:**
```bash
npx prisma studio
# Manually create admin@example.com with hashed password
```

---

## Step 5: Configure Stripe Webhook (Production)

1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Events to listen to:
   - `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`
7. Redeploy in Vercel

---

## Step 6: Update Stripe Checkout URLs

In `src/app/pricing/page.tsx`, update:
```typescript
success_url: `${process.env.NEXTAUTH_URL}/challenges?success=true`,
cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
```

---

## Step 7: Testing Production

### Test Stripe Payment Flow:
1. Visit https://your-domain.vercel.app/pricing
2. Sign up with real email
3. Use Stripe test card: `4242 4242 4242 4242`
4. Verify webhook received (Stripe Dashboard → Webhooks → Logs)
5. Check user upgraded in database

### Security Checklist:
- ✅ All environment variables set
- ✅ NEXTAUTH_SECRET is strong & unique
- ✅ Using Stripe LIVE keys (not test)
- ✅ Database in production mode
- ✅ Webhook endpoint secured
- ✅ HTTPS enabled (automatic on Vercel)

---

## Step 8: Post-Deployment

### Monitor:
- Vercel Analytics (enabled by default)
- Stripe Dashboard for payments
- Database connections
- Error logs in Vercel dashboard

### Custom Domain (Optional):
1. Go to Vercel project → **Settings → Domains**
2. Add your custom domain
3. Update DNS records
4. Update `NEXTAUTH_URL` environment variable
5. Update Stripe webhook URL

---

## Troubleshooting

### Build fails:
- Check `npm run build` works locally
- Verify all dependencies in `package.json`
- Check Vercel build logs

### Database connection fails:
- Verify `DATABASE_URL` format
- Check IP allowlist (Vercel IPs)
- Run `npx prisma generate`

### Stripe webhook not working:
- Check webhook URL is correct
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check Stripe webhook logs
- Test with Stripe CLI: `stripe trigger checkout.session.completed`

### NextAuth session issues:
- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Clear cookies and try again

---

## Production Checklist

Before going live:

- [ ] Database migrated to PostgreSQL
- [ ] Environment variables configured in Vercel
- [ ] Stripe live keys added (not test keys!)
- [ ] Stripe webhook configured and tested
- [ ] Admin user created in production database
- [ ] Test sign-up flow
- [ ] Test payment flow with real card
- [ ] Test premium challenge access
- [ ] Verify webhook marks user as paid
- [ ] Check admin dashboard works
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain (if applicable)
- [ ] Update Stripe webhook for custom domain

---

## Quick Commands

```bash
# Build locally to test
npm run build

# Test production build
npm start

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Check for errors
vercel logs

# Redeploy
git push origin main
```

---

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Stripe Docs: https://stripe.com/docs
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to Git
- Rotate secrets regularly
- Use Stripe live keys only in production
- Enable Vercel's security headers
- Monitor for unusual activity
- Set up rate limiting for API routes
- Enable 2FA on all accounts (Vercel, Stripe, GitHub)

Good luck with your launch! 🚀
