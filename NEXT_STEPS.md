# ✅ What To Do Next

## Step 1: Wait for Deployment (2-3 minutes)

1. **Go to Vercel Dashboard**: https://vercel.com/robert-cashmans-projects/one
2. **Check "Deployments" tab**
3. **Wait for status to change from "Building" to "Ready" ✅**

---

## Step 2: Add Environment Variables (REQUIRED)

Once deployment succeeds, you MUST add these:

1. **In Vercel Dashboard** → Click **"Settings"** → **"Environment Variables"**
2. **Add these two variables:**

   ```
   Name: JWT_SECRET
   Value: [Generate a random string - at least 32 characters]
   ```
   
   To generate: Use https://randomkeygen.com/ or any random string generator
   
   ```
   Name: NEXT_PUBLIC_SITE_URL
   Value: https://one.vercel.app
   ```
   (Or your custom domain if you add one)

3. **Click "Save"**
4. **Redeploy**: Go to "Deployments" → Click the 3 dots on latest deployment → "Redeploy"

---

## Step 3: Test Your Website

1. **Visit your live site**: https://one.vercel.app
2. **Check these pages work:**
   - Homepage: `/`
   - Blog: `/blog`
   - Contact: `/contact`
   - Services: `/services`

---

## Step 4: Database Setup (IMPORTANT)

⚠️ **SQLite won't work in production on Vercel** (serverless functions don't have persistent storage).

### Option A: Use Vercel Postgres (Easiest - Recommended)

1. **In Vercel Dashboard** → Your Project → **"Storage"** tab
2. **Click "Create Database"**
3. **Select "Postgres"**
4. **Click "Create"**
5. **Copy the connection string**
6. **Update your code** to use Postgres instead of SQLite

### Option B: Use External Database (Free Options)

**Supabase (Recommended - Free Tier):**
1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Copy connection string
5. Add as `DATABASE_URL` environment variable in Vercel

**Other Free Options:**
- **Railway** (railway.app) - Free tier
- **Neon** (neon.tech) - Free tier

### Option C: Temporary (Testing Only)

- The site will work but data resets on each deployment
- Good for testing, not for production

---

## Step 5: Set Up Custom Domain (Optional)

1. **In Vercel Dashboard** → **"Settings"** → **"Domains"**
2. **Add Domain**: `policestationagent.com`
3. **Follow DNS instructions** (add CNAME record)
4. **SSL certificate is automatic!**

---

## Step 6: Create Admin User

Once database is set up:

1. **Run locally** (on your computer):
   ```bash
   npm install
   node scripts/init-admin.js
   ```
2. **Or use the admin API** after deployment

---

## ✅ Checklist

- [ ] Deployment shows "Ready" ✅
- [ ] Environment variables added (JWT_SECRET, NEXT_PUBLIC_SITE_URL)
- [ ] Site loads at https://one.vercel.app
- [ ] Database set up (Postgres or external)
- [ ] Admin user created
- [ ] Custom domain added (optional)

---

## 🆘 If Something Goes Wrong

### Deployment Still Failing?
- Check the build logs in Vercel Dashboard
- Look for error messages
- Common issues: Missing environment variables, build errors

### Site Not Loading?
- Check environment variables are set
- Wait 2-3 minutes after adding variables (may need redeploy)
- Check browser console for errors

### Database Issues?
- SQLite won't work - you MUST use Postgres or external database
- See Step 4 above

---

## 🎉 You're Done!

Once all steps are complete, your website is live and ready to use!

**Your live site**: https://one.vercel.app

