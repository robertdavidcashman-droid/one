# 🚀 Quick Start: Connect Cloudflare Domain to Vercel

## ⚡ Fully Automated Setup (30 seconds)

### Step 1: Get Your Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use **"Edit zone DNS"** template
4. Select your zone (domain)
5. Click **"Create Token"**
6. **Copy the token**

### Step 2: Add Domain in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project → **Settings** → **Domains**
3. Click **"Add Domain"**
4. Enter your domain
5. **Copy the DNS target** (CNAME or A record IP)

### Step 3: Run the Automated Script

**Option A: Using Environment Variables (Recommended)**

```bash
CLOUDFLARE_API_TOKEN=your_token_here DOMAIN=yourdomain.com VERCEL_TARGET=cname.vercel-dns.com node scripts/setup-cloudflare-auto.js
```

**Option B: Create .env file**

1. Create `.env` file in project root:
```env
CLOUDFLARE_API_TOKEN=your_token_here
DOMAIN=yourdomain.com
VERCEL_TARGET=cname.vercel-dns.com
USE_CNAME=true
SETUP_WWW=true
```

2. Run:
```bash
node scripts/setup-cloudflare-auto.js
```

**Option C: Interactive Script**

```bash
npm run setup:cloudflare
# or
node scripts/setup-cloudflare-domain.js
```

---

## ✅ What the Script Does

- ✅ Configures DNS records (CNAME or A record)
- ✅ Enables Cloudflare proxy (orange cloud)
- ✅ Sets SSL/TLS mode to "Full"
- ✅ Enables "Always Use HTTPS"
- ✅ Configures www subdomain (optional)

---

## 📋 After Running the Script

1. **Wait 5-15 minutes** for DNS propagation
2. **Check Vercel dashboard** - domain should show "Valid Configuration" ✅
3. **Update environment variable** in Vercel:
   - Go to **Settings** → **Environment Variables**
   - Update `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com`
   - Click **"Save"** and **Redeploy**

---

## 🐛 Troubleshooting

### "Domain not found"
- Make sure domain is added to Cloudflare first

### "Invalid API token"
- Check token has **Zone:Edit** and **DNS:Edit** permissions

### "DNS not resolving"
- Wait 15-30 minutes
- Check Cloudflare dashboard → DNS → Records are **Proxied**

---

## 📚 Full Documentation

- **Automated Setup**: `CLOUDFLARE_AUTO_SETUP.md`
- **Manual Setup**: `CLOUDFLARE_DOMAIN_SETUP.md`

---

## 🎯 That's It!

Your domain will be connected automatically! 🎉

