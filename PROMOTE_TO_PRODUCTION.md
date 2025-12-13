# 🚀 Promote Deployment to Production - All Domains

## Quick Method: Vercel Dashboard (2 minutes)

### Step 1: Promote Deployment
1. Go to: https://vercel.com/dashboard
2. Select project: **"one"**
3. Go to **"Deployments"** tab
4. Find the latest deployment (commit `8072ad9`)
5. Click **3 dots** (⋯) → **"Promote to Production"**
6. Wait 30 seconds ✅

### Step 2: Verify/Add Domains
1. Go to **Settings** → **Domains**
2. Click **"Add"** for each domain if not already listed:
   - `policestationagent.com`
   - `www.policestationagent.com`
   - `policestationagent.net`
   - `www.policestationagent.net`
   - `policestationagent.org`
   - `www.policestationagent.org`
   - `criminaldefencekent.co.uk`
   - `www.criminaldefencekent.co.uk`
   - `policestationrepkent.co.uk`
   - `www.policestationrepkent.co.uk`
3. Each domain should show **"Valid Configuration"** ✅

### Step 3: Configure Production Branch
1. Go to **Settings** → **Git**
2. Under **"Production Branch"**, set to **"master"**
3. Save

**Done!** All domains will update in 1-2 minutes.

---

## Automated Method: Using Script

### Step 1: Get Vercel Token
1. Go to: https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name it: "Production Deploy"
4. Copy the token

### Step 2: Run Script
```powershell
$env:VERCEL_TOKEN="your-token-here"
node scripts/promote-to-production-all-domains.js
```

The script will:
- ✅ Find latest deployment
- ✅ Promote it to production
- ✅ Configure all domains automatically

---

## Domains Being Configured

- ✅ policestationagent.com
- ✅ www.policestationagent.com
- ✅ policestationagent.net
- ✅ www.policestationagent.net
- ✅ policestationagent.org
- ✅ www.policestationagent.org
- ✅ criminaldefencekent.co.uk
- ✅ www.criminaldefencekent.co.uk
- ✅ policestationrepkent.co.uk
- ✅ www.policestationrepkent.co.uk

---

## After Promotion

Wait 1-2 minutes, then verify:
- https://policestationagent.com
- https://policestationagent.net
- https://policestationagent.org
- https://criminaldefencekent.co.uk
- https://policestationrepkent.co.uk

All should show your latest deployment with admin auth fixes! 🎉











