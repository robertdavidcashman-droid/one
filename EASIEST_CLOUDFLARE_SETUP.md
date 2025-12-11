# 🎯 Easiest Way: Connect Cloudflare to Vercel

## ⚡ 3 Simple Steps (5 minutes)

### Step 1: Add Domain in Vercel (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click **"Settings"** → **"Domains"**
4. Click **"Add"**
5. Type your domain: `yourdomain.com`
6. Click **"Add"**
7. **Copy the DNS value** that Vercel shows you:
   - Either: `cname.vercel-dns.com` (CNAME)
   - Or: `76.76.21.21` (A record IP)

---

### Step 2: Add DNS Record in Cloudflare (1 minute)

1. Go to: https://dash.cloudflare.com
2. Click your domain
3. Click **"DNS"** in left sidebar
4. Click **"Add record"**

**If Vercel gave you a CNAME:**
- **Type**: `CNAME`
- **Name**: `@` (or leave blank for root domain)
- **Target**: `cname.vercel-dns.com` (paste what Vercel gave you)
- **Proxy status**: ✅ **ON** (orange cloud)
- Click **"Save"**

**If Vercel gave you an A record:**
- **Type**: `A`
- **Name**: `@` (or leave blank for root domain)
- **IPv4 address**: `76.76.21.21` (paste what Vercel gave you)
- **Proxy status**: ✅ **ON** (orange cloud)
- Click **"Save"**

---

### Step 3: Set SSL Mode (30 seconds)

1. Still in Cloudflare dashboard
2. Click **"SSL/TLS"** in left sidebar
3. Set to **"Full"** (or "Full (strict)" if available)
4. Click **"Edge Certificates"**
5. Toggle **"Always Use HTTPS"** to **ON**

---

## ✅ Done!

- Wait 5-15 minutes
- Check Vercel dashboard - should show "Valid Configuration" ✅
- Visit your domain - it should work!

---

## 🎁 Bonus: Add WWW Subdomain (Optional)

1. In Cloudflare → DNS → Add record
2. **Type**: `CNAME`
3. **Name**: `www`
4. **Target**: Same as root domain (e.g., `cname.vercel-dns.com`)
5. **Proxy**: ✅ ON
6. Click **"Save"**

---

## 📝 Update Environment Variable

1. Vercel Dashboard → Settings → Environment Variables
2. Update `NEXT_PUBLIC_SITE_URL` to: `https://yourdomain.com`
3. Click **"Save"**
4. Redeploy

---

**That's it! No scripts, no API tokens needed - just 3 simple steps!** 🎉

