# Quick Start Guide

## Installation

1. **Navigate to project:**
```bash
cd web44ai
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment:**
```bash
# Create .env.local file
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env.local
echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000" >> .env.local
```

4. **Seed initial data (police stations and services):**
```bash
node scripts/seed-data.js
```

5. **Create admin user:**
```bash
node scripts/init-admin.js
```

6. **Start development server:**
```bash
npm run dev
```

6. **Access the site:**
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin/login

## First Steps

1. **Login to Admin Dashboard:**
   - Go to `/admin/login`
   - Use the credentials you created

2. **Import WordPress Content (Optional):**
   - Go to Admin Dashboard → WordPress Import
   - Upload your WordPress XML export file

3. **Create Your First Blog Post:**
   - Go to Admin Dashboard → Blog Posts → New Post
   - Fill in title, content, and publish

4. **Add Police Stations:**
   - Use the admin API or add directly to database
   - Format: `/police-stations/[slug]`

5. **Add Services:**
   - Use the admin API or add directly to database
   - Format: `/services/[slug]`

## Default Content

The site includes default services:
- Police Station Representation
- Criminal Defense
- Legal Advice

You can customize these via the admin dashboard.

## Database Location

The SQLite database is created at:
```
web44ai/data/web44ai.db
```

This file is automatically created on first run.

## Production Deployment

See `DEPLOYMENT.md` for full deployment instructions.

**Quick Deploy to Vercel:**
```bash
npm i -g vercel
vercel
```

Then add environment variables in Vercel dashboard.

