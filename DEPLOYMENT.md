# Deployment Guide - Web44AI Platform

## Hosting Recommendation: Vercel

**Vercel** is the best hosting target for this Next.js application because:
- Built by the Next.js team - perfect integration
- Free tier with automatic SSL/CDN
- One-click deployments from GitHub
- Edge functions and serverless support
- Great for professional sites
- Automatic deployments on git push

## Pre-Deployment Setup

### 1. Environment Variables

Create a `.env.local` file (or set in Vercel dashboard):

```env
JWT_SECRET=your-strong-random-secret-key-here
NEXT_PUBLIC_SITE_URL=https://policestationagent.com
```

**Important:** Generate a strong JWT_SECRET:
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use an online generator
```

### 2. Initialize Admin User

Before deploying, create your admin user:

```bash
npm install
node scripts/init-admin.js
```

This will prompt you for:
- Admin username
- Admin password

### 3. Database Setup

The SQLite database will be created automatically on first run. For production, consider:
- Using Vercel's serverless functions (SQLite works but has limitations)
- Or migrate to PostgreSQL with Vercel Postgres

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
cd web44ai
vercel
```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `JWT_SECRET` and `NEXT_PUBLIC_SITE_URL`

### Option 2: Deploy via GitHub

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. Import to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables
   - Deploy

## Post-Deployment

1. **Access Admin Dashboard:**
   - Visit: `https://your-domain.com/admin/login`
   - Use the credentials you created

2. **Import WordPress Content:**
   - Go to Admin Dashboard → WordPress Import
   - Upload your WordPress XML export file

3. **Add Police Stations:**
   - Use the admin dashboard to add police station pages

4. **Create Blog Posts:**
   - Use the admin dashboard to create and manage blog posts

## Database Considerations

**For Production:**
- SQLite works for small to medium sites
- For high traffic, consider migrating to PostgreSQL
- Vercel Postgres is a good option for Next.js apps

## Custom Domain Setup

1. In Vercel dashboard, go to Project Settings → Domains
2. Add your custom domain (e.g., policestationagent.com)
3. Update DNS records as instructed by Vercel
4. Update `NEXT_PUBLIC_SITE_URL` in environment variables

## Security Checklist

- [ ] Strong JWT_SECRET set
- [ ] Admin password changed from default
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables secured
- [ ] Database backups configured (if using external DB)

## Monitoring

- Vercel provides built-in analytics
- Check Vercel dashboard for:
  - Deployment status
  - Function logs
  - Performance metrics

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- Next.js documentation: https://nextjs.org/docs

