# 🚀 How to Publish Your Website

## Quick Overview

Your Next.js website can be published to several platforms. **Vercel** is the easiest and recommended option since it's made by the creators of Next.js.

---

## ⚠️ Important Considerations

### 1. **SQLite Database**
Your project uses SQLite (`better-sqlite3`), which stores data in a local file. For production:
- **Option A:** Use a cloud database (PostgreSQL, MySQL) - Recommended for production
- **Option B:** Use Vercel's serverless functions with SQLite (limited, not ideal for production)
- **Option C:** Use a file-based database service

### 2. **Environment Variables**
You'll need to set these in your hosting platform:
- `JWT_SECRET` - Secret key for authentication
- `NEXT_PUBLIC_SITE_URL` - Your website URL (e.g., `https://policestationagent.com`)

---

## 🎯 Option 1: Vercel (Recommended - Easiest)

### Why Vercel?
- ✅ Made by Next.js creators
- ✅ Automatic deployments from Git
- ✅ Free tier available
- ✅ Built-in SSL certificates
- ✅ Global CDN
- ✅ Zero configuration needed

### Steps:

1. **Create a Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub (recommended) or email

2. **Connect Your Repository**
   - Click "Add New Project"
   - Import your Git repository (GitHub, GitLab, or Bitbucket)
   - Or use Vercel CLI (see below)

3. **Configure Environment Variables**
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add:
     ```
     JWT_SECRET=your-secret-key-here
     NEXT_PUBLIC_SITE_URL=https://your-domain.com
     ```

4. **Deploy**
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Your site will be live in ~2 minutes!

5. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your domain (policestationagent.com)
   - Follow DNS configuration instructions

### Using Vercel CLI (Alternative):

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 🌐 Option 2: Netlify

### Steps:

1. **Create Netlify Account**
   - Go to https://netlify.com
   - Sign up with GitHub

2. **Deploy**
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

3. **Environment Variables**
   - Site settings → Environment variables
   - Add your variables

---

## 🖥️ Option 3: Traditional Hosting (VPS/Shared Hosting)

### Requirements:
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx or Apache for reverse proxy

### Steps:

1. **Build Your Site**
   ```bash
   npm run build
   ```

2. **Upload Files**
   - Upload entire project folder
   - Or use Git to clone on server

3. **Install Dependencies**
   ```bash
   npm install --production
   ```

4. **Start Server**
   ```bash
   npm start
   # Or use PM2:
   pm2 start npm --name "policestationagent" -- start
   ```

5. **Configure Reverse Proxy**
   - Set up Nginx/Apache to proxy to `localhost:3000`

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] **Test Build Locally**
  ```bash
  npm run build
  npm start
  ```
  Visit `http://localhost:3000` to verify everything works

- [ ] **Create `.env.production` file** (if using file-based env vars)
  ```
  JWT_SECRET=your-production-secret-key
  NEXT_PUBLIC_SITE_URL=https://policestationagent.com
  ```

- [ ] **Update Database Path** (if using SQLite)
  - Consider using a cloud database for production
  - Or ensure database file is in a persistent location

- [ ] **Check All Links**
  - Verify all internal links work
  - Test navigation

- [ ] **SEO Settings**
  - Verify sitemap.xml is accessible
  - Check robots.txt
  - Verify canonical URLs

- [ ] **Security**
  - Use strong JWT_SECRET
  - Enable HTTPS (automatic on Vercel/Netlify)

---

## 🔧 Database Migration (Recommended)

For production, consider migrating from SQLite to a cloud database:

### Option A: PostgreSQL (Recommended)
- Use services like:
  - **Supabase** (free tier available)
  - **Railway** (free tier)
  - **Neon** (free tier)
  - **AWS RDS** (paid)

### Option B: MySQL
- Use services like:
  - **PlanetScale** (free tier)
  - **AWS RDS**
  - **DigitalOcean Managed Database**

### Migration Steps:
1. Set up cloud database
2. Update `lib/db.ts` to use new database
3. Run migration scripts
4. Update environment variables

---

## 🚀 Quick Start: Deploy to Vercel Now

### Fastest Method:

1. **Push to GitHub** (if not already):
   ```bash
   # Create a new GitHub repository
   # Then:
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin master
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to vercel.com
   - Click "Add New Project"
   - Import from GitHub
   - Click "Deploy"

3. **Add Environment Variables**:
   - In Vercel dashboard → Settings → Environment Variables
   - Add `JWT_SECRET` and `NEXT_PUBLIC_SITE_URL`

4. **Done!** Your site is live at `your-project.vercel.app`

---

## 📝 Environment Variables Template

Create a `.env.local` file (for local development) and set these in your hosting platform:

```env
# Authentication
JWT_SECRET=your-very-secure-random-string-here-min-32-chars

# Site URL
NEXT_PUBLIC_SITE_URL=https://policestationagent.com

# Database (if using cloud database)
DATABASE_URL=your-database-connection-string
```

---

## 🆘 Troubleshooting

### Build Fails
- Check Node.js version (need 18+)
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run lint`

### Database Issues
- SQLite won't work on serverless platforms
- Migrate to cloud database for production

### Environment Variables Not Working
- Restart deployment after adding variables
- Check variable names match exactly
- Use `NEXT_PUBLIC_` prefix for client-side variables

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Netlify Docs:** https://docs.netlify.com

---

## ✅ Recommended: Vercel + Cloud Database

**Best Setup:**
1. Deploy to **Vercel** (free, easy, fast)
2. Use **Supabase** for PostgreSQL (free tier)
3. Connect custom domain
4. Enable automatic deployments from Git

This gives you:
- ✅ Free hosting
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Automatic deployments
- ✅ Scalable database
- ✅ Professional setup

