# 🚀 Setup GitHub & Deploy to Vercel

## Current Status
✅ Code is committed locally
❌ Not yet on GitHub
✅ Ready to deploy

---

## Step 1: Create GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `web44ai` (or any name you prefer)
3. Description: "Police Station Agent Website - Next.js"
4. Choose: **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have code)
6. Click **"Create repository"**

---

## Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/web44ai.git

# Push your code
git push -u origin master
```

**Note:** Replace `yourusername` with your actual GitHub username.

---

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. Go to **https://vercel.com** (you're already logged in!)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your **web44ai** repository
5. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
6. **Environment Variables:**
   - Click **"Environment Variables"**
   - Add:
     - **Name:** `JWT_SECRET`
     - **Value:** (generate a secure random string, 32+ characters)
     - **Name:** `NEXT_PUBLIC_SITE_URL`
     - **Value:** `https://your-project.vercel.app` (or your custom domain)
7. Click **"Deploy"**
8. Wait 2-3 minutes - your site will be live! 🎉

### Option B: Via CLI

```bash
# Make sure you're in the project directory
cd C:\Users\rober\OneDrive\Desktop\web44ai

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Step 4: Add Custom Domain (Optional)

After deployment:

1. Go to your project in Vercel
2. Click **"Settings"** → **"Domains"**
3. Add your domain: `policestationagent.com`
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

---

## ✅ What Happens Next

- **Automatic Deployments:** Every time you push to GitHub, Vercel will automatically deploy
- **Preview URLs:** Each commit gets its own preview URL
- **Production:** Only `vercel --prod` or main branch deploys to production

---

## 🆘 Troubleshooting

**Git push fails?**
- Make sure you've created the GitHub repository first
- Check your GitHub username is correct
- You may need to authenticate (GitHub Desktop should handle this)

**Vercel build fails?**
- Check environment variables are set
- Verify `npm run build` works locally (it does!)

**Need help?**
- GitHub: https://docs.github.com
- Vercel: https://vercel.com/docs

