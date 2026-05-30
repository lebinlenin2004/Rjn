# RJN Wholesale React + Supabase

RJN Wholesale is a React rebuild of the original Django wholesale e-commerce project. It uses Vite for the frontend and Supabase for authentication, Postgres data, row-level security, and future storage or email workflows.

## Current Features

- React pages for homepage, product catalog, product detail, auth, seller dashboard, and bulk inquiry form
- Supabase email/password authentication
- Product search, category filter, price filter, sorting, and WhatsApp inquiry links
- Seller product creation flow
- Product feedback with ratings
- Supabase SQL schema with tables and row-level security policies

## Tech Stack

- React
- Vite
- React Router
- Supabase JavaScript client
- Supabase Auth + Postgres
- Plain CSS
- Lucide React icons

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor in Supabase.
3. Run `supabase/schema.sql`.
4. Copy your project URL and anon key into `.env`.
5. Restart the dev server.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Deploy Frontend to Vercel

1. Push this project to GitHub.
2. Open Vercel and import the GitHub repository.
3. Use these settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add these Environment Variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

The included `vercel.json` rewrites every route to `index.html`, so React Router pages work when opened directly or refreshed.

## Main Tables

- `profiles`: user profile, phone, address, and role
- `categories`: product categories
- `products`: seller product listings
- `feedback`: ratings and comments for products
- `bulk_inquiries`: contact and bulk order inquiries
- `site_settings`: WhatsApp/admin configuration

## Next Build Steps

- Add edit/delete product actions in the dashboard
- Add admin-only screens for inquiries, settings, and category management
- Add Edge Functions for email notifications and rate limiting
- Deploy to Vercel, Netlify, or Supabase hosting-compatible static output
