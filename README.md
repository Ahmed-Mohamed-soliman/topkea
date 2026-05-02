# WholesalePro — B2B Wholesale Marketplace MVP

A production-ready B2B wholesale marketplace with Arabic (RTL) + English (LTR) support, built with Next.js 14, Supabase, and PayPal.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd wholesale-marketplace
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Supabase (get from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PayPal (get from https://developer.paypal.com)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=972592701146
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Open **SQL Editor** → New Query
3. Paste the entire contents of `supabase/schema.sql`
4. Click **Run** — this creates all tables, RLS policies, and seeds 14 products
5. In **Authentication → Providers**, enable **Google OAuth** (optional)

**To create an admin user:**
```sql
-- After signing up, run this in SQL Editor:
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- Arabic (default): `http://localhost:3000/ar`
- English: `http://localhost:3000/en`
- Admin Dashboard: `http://localhost:3000/ar/admin`

---

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) and add the environment variables in **Project Settings → Environment Variables**.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── [locale]/                # i18n routes (/ar, /en)
│       ├── layout.tsx           # Locale layout (RTL/LTR)
│       ├── page.tsx             # Homepage
│       ├── trending/page.tsx    # Trending products
│       ├── cart/page.tsx        # Shopping cart
│       ├── checkout/page.tsx    # PayPal checkout
│       ├── help/page.tsx        # FAQ + chatbot
│       ├── build-your-own/page.tsx  # Product configurator
│       ├── auth/login/page.tsx  # Auth page
│       ├── product/[id]/page.tsx    # Product detail
│       ├── category/[slug]/page.tsx # Category listing
│       └── admin/               # Admin dashboard
│           ├── page.tsx         # Main dashboard
│           ├── AdminProducts.tsx
│           ├── AdminOrders.tsx
│           ├── AdminUsers.tsx   # Also exports AdminAnalytics, AdminSettings
│           ├── AdminAnalytics.tsx
│           └── AdminSettings.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── HeroSection.tsx
│   └── product/
│       ├── ProductCard.tsx
│       └── CategoryGrid.tsx
├── lib/
│   ├── supabase.ts              # Supabase client (browser + server)
│   ├── cart-store.ts            # Zustand cart with persistence
│   ├── utils.ts                 # Helpers (cn, formatCurrency, etc.)
│   └── seed-data.ts             # Demo product data (fallback)
├── types/
│   └── index.ts                 # TypeScript types + constants
├── i18n/
│   ├── request.ts               # next-intl server config
│   ├── routing.ts               # Locale routing
│   └── locales/
│       ├── ar.json              # Arabic translations
│       └── en.json              # English translations
└── middleware.ts                # i18n routing + admin auth guard
supabase/
└── schema.sql                   # Full DB schema + seed data
```

---

## ✨ Features

### Storefront
- **Homepage** — Hero, category grid, trending products, trust badges
- **Category pages** — Filter, search, sort by price
- **Product pages** — Images, price tiers, quantity selector, add to cart
- **Trending** — Curated trending product listings
- **Build Your Own** — 3-step product configurator (category → options → quantity)
- **Cart** — Persistent cart with quantity controls, VIP discount display
- **Checkout** — PayPal integration → WhatsApp redirect on success
- **Help** — FAQ accordion + rule-based chatbot

### Auth
- Email/password signup & login
- Google OAuth (via Supabase)
- Auto profile creation on signup

### VIP System
- Tracks `orders_count` per user
- After **5 completed orders** → auto-grants VIP status
- VIP users get **10% discount** on all orders

### Admin Dashboard (`/admin`)
- **Products** — Add/edit/delete with image URL, bulk CSV import
- **Orders** — View all orders, update status, export CSV
- **Users** — View users, manually grant/revoke VIP
- **Analytics** — Top products chart + AI insights powered by Claude
- **Accounting** — Revenue summary, export CSV
- **Settings** — Edit WhatsApp number, PayPal email, hero text (no code needed)

### Internationalization
- Arabic (RTL) by default at `/ar`
- English (LTR) at `/en`
- Language switcher in header persists preference
- Full RTL support via `dir="rtl"` on `<html>`

### Wholesale Logic
- Default min order: **500 units**
- Machinery exception: **min 1 unit**
- Quantity-based **price tiers** (defined per product)

---

## ⚙️ Database Schema

| Table | Key Fields |
|-------|-----------|
| `users` | id, email, is_vip, orders_count, role |
| `products` | id, name_ar, name_en, category, price, min_order, price_tiers (JSONB), is_trending |
| `orders` | id, user_id, items (JSONB), total, status, payment_id |
| `custom_orders` | id, user_id, category, color, size, features, quantity |
| `site_settings` | whatsapp_number, paypal_email, hero texts |

---

## 🔧 Production TODOs

### Critical (before going live)

- [ ] **PayPal Webhook Verification**
  - Set up webhook at https://developer.paypal.com/dashboard/webhooks
  - Create `/api/paypal/webhook` endpoint
  - Verify `PAYMENT.CAPTURE.COMPLETED` events server-side
  - Use `PAYPAL_CLIENT_SECRET` to verify webhook signature
  - Only fulfill orders after server-side confirmation

- [ ] **Input Validation**
  - Add Zod schemas for all form inputs
  - Validate on both client and API routes
  - Sanitize product names, order data

- [ ] **Rate Limiting**
  - Add rate limiting to auth endpoints
  - Protect checkout from abuse (use Upstash Redis or Vercel KV)

- [ ] **Admin Access Control**
  - Verify `role = 'admin'` server-side on all admin routes
  - Current middleware only checks authentication, not role

### Recommended Improvements

- [ ] **Image Upload** — Replace image URLs with Supabase Storage upload
- [ ] **Email Notifications** — Send order confirmation emails (Resend / SendGrid)
- [ ] **Search** — Add full-text search with Supabase `tsquery` or Algolia
- [ ] **Pagination** — Add pagination/infinite scroll for large product catalogs
- [ ] **Real-time** — Use Supabase Realtime for live order status updates
- [ ] **Analytics** — Integrate PostHog or Plausible for real conversion tracking
- [ ] **Error Monitoring** — Add Sentry for production error tracking
- [ ] **SEO** — Add `generateMetadata` to product and category pages

---

## 🌍 Supported Languages

| Language | Code | Direction | Default |
|----------|------|-----------|---------|
| Arabic   | `ar` | RTL       | ✅ Yes  |
| English  | `en` | LTR       | No      |

To add more languages:
1. Add locale to `src/i18n/routing.ts`
2. Create `src/i18n/locales/{locale}.json`
3. Update `<html lang>` mapping in locale layout

---

## 💡 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Google OAuth |
| State | Zustand (persisted) |
| i18n | next-intl |
| Payments | PayPal React SDK |
| Notifications | react-hot-toast |
| CSV | PapaParse |
| AI Insights | Anthropic Claude API |
| Deploy | Vercel |

---

## 📞 WhatsApp Integration

After payment, users are redirected to:
```
https://wa.me/972592701146?text=Hello, I've completed my order #ORDER_ID, Total: $AMOUNT
```

Change the WhatsApp number in:
1. **Admin Settings** panel (no code required)
2. Or update `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local`
