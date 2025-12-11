# Web44AI Platform

A stable public website platform for Police Station Agent services, built with Next.js 14.

## Features

- Homepage with hero section and services overview
- Police station pages (dynamic routing)
- Services pages
- Blog with CMS
- SEO optimized (canonicals, sitemap, robots.txt)
- Clean URL structure
- Admin dashboard with authentication
- Safe content enhancer
- WordPress import tools

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local and set JWT_SECRET and NEXT_PUBLIC_SITE_URL
```

3. Seed initial data (police stations and services):
```bash
node scripts/seed-data.js
```

4. Create admin user:
```bash
node scripts/init-admin.js
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

Default admin credentials (change after first login):
- Username: admin
- Password: (set in .env.local)

## Deployment

This project is optimized for deployment on **Vercel**:

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- NextAuth.js (authentication)

