# 🌐 Connect Your Website to Cloudflare Domain

## Overview

This guide will help you connect your Vercel-deployed website to a domain managed by Cloudflare.

---

## Prerequisites

- ✅ Website deployed on Vercel (https://one.vercel.app)
- ✅ Domain registered and managed by Cloudflare
- ✅ Access to Cloudflare dashboard

---

## Step 1: Add Domain to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/robert-cashmans-projects/one
   - Click **"Settings"** tab
   - Click **"Domains"** in the left sidebar

2. **Add Your Domain**
   - Click **"Add"** button
   - Enter your domain (e.g., `policestationagent.com`)
   - Click **"Add"**

3. **Vercel will show DNS instructions**
   - You'll see something like:
     ```
     Type: CNAME
     Name: @ (or www)
     Value: cname.vercel-dns.com
     ```
   - **Don't configure this yet** - we'll use Cloudflare's proxy instead

---

## Step 2: Configure DNS in Cloudflare

### Option A: Using Cloudflare Proxy (Recommended - Free SSL)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Select your domain

2. **Go to DNS Settings**
   - Click **"DNS"** in the left sidebar
   - Click **"Records"** tab

3. **Add CNAME Record for Root Domain**
   - Click **"Add record"**
   - **Type**: `CNAME`
   - **Name**: `@` (or your root domain)
   - **Target**: `cname.vercel-dns.com`
   - **Proxy status**: ✅ **Proxied** (orange cloud icon)
   - Click **"Save"**

4. **Add CNAME Record for WWW (Optional)**
   - Click **"Add record"** again
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Target**: `cname.vercel-dns.com`
   - **Proxy status**: ✅ **Proxied** (orange cloud icon)
   - Click **"Save"**

### Option B: Using A Record (If CNAME doesn't work for root)

If Cloudflare doesn't allow CNAME for root domain:

1. **Get Vercel's IP addresses**
   - Vercel will show A record IPs in the domain settings
   - Usually: `76.76.21.21` (check Vercel dashboard for current IPs)

2. **Add A Record**
   - **Type**: `A`
   - **Name**: `@`
   - **IPv4 address**: `76.76.21.21` (use IP from Vercel)
   - **Proxy status**: ✅ **Proxied**
   - Click **"Save"**

---

## Step 3: Configure SSL/TLS in Cloudflare

1. **Go to SSL/TLS Settings**
   - In Cloudflare dashboard, click **"SSL/TLS"** in left sidebar

2. **Set Encryption Mode**
   - Select **"Full"** or **"Full (strict)"**
   - **Full (strict)** is recommended if available
   - This ensures end-to-end encryption

3. **Enable Always Use HTTPS**
   - Go to **"SSL/TLS"** → **"Edge Certificates"**
   - Toggle **"Always Use HTTPS"** to ON

---

## Step 4: Update Vercel Environment Variables

1. **Go to Vercel Project Settings**
   - Settings → Environment Variables

2. **Update NEXT_PUBLIC_SITE_URL**
   - Change from: `https://one.vercel.app`
   - To: `https://policestationagent.com` (or your domain)
   - Click **"Save"**

3. **Redeploy**
   - Go to **"Deployments"** tab
   - Click 3 dots on latest deployment
   - Click **"Redeploy"**

---

## Step 5: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours**
- Usually takes **15-30 minutes** with Cloudflare
- Check status in Vercel dashboard - it will show "Valid Configuration" when ready

---

## Step 6: Verify It's Working

1. **Check Vercel Domain Status**
   - Go to Vercel → Settings → Domains
   - Should show "Valid Configuration" ✅

2. **Test Your Domain**
   - Visit: `https://policestationagent.com`
   - Should load your website
   - Check SSL certificate (lock icon in browser)

3. **Test WWW Subdomain** (if configured)
   - Visit: `https://www.policestationagent.com`
   - Should redirect or load correctly

---

## Troubleshooting

### Domain Not Resolving

1. **Check DNS Records**
   - Verify CNAME/A record is correct in Cloudflare
   - Ensure proxy is enabled (orange cloud)

2. **Check Vercel Configuration**
   - Verify domain is added in Vercel
   - Check for any error messages

3. **Clear DNS Cache**
   - Wait 15-30 minutes
   - Try accessing from different network
   - Use: https://www.whatsmydns.net to check propagation

### SSL Certificate Issues

1. **Check SSL/TLS Mode**
   - Should be "Full" or "Full (strict)"
   - Not "Flexible" (this can cause issues)

2. **Wait for Certificate**
   - Vercel automatically provisions SSL certificates
   - Can take up to 24 hours
   - Usually ready within 1 hour

### Redirect Issues

1. **Check Next.js Redirects**
   - Verify `next.config.js` redirects are correct
   - Ensure canonical URLs use your domain

2. **Update Canonical URLs**
   - All pages should use your domain in canonical tags
   - Check `app/sitemap.ts` uses correct domain

---

## Quick Checklist

- [ ] Domain added to Vercel
- [ ] CNAME/A record added in Cloudflare (proxied)
- [ ] SSL/TLS mode set to "Full" or "Full (strict)"
- [ ] "Always Use HTTPS" enabled
- [ ] NEXT_PUBLIC_SITE_URL updated in Vercel
- [ ] Site redeployed
- [ ] DNS propagated (checked after 15-30 min)
- [ ] Domain loads correctly
- [ ] SSL certificate working (lock icon)

---

## Additional Cloudflare Optimizations (Optional)

### 1. Enable Caching
- **Caching** → **Configuration**
- Set caching level to "Standard"
- Browser Cache TTL: "Respect Existing Headers"

### 2. Enable Auto Minify
- **Speed** → **Optimization**
- Enable: JavaScript, CSS, HTML minification

### 3. Enable Brotli Compression
- **Speed** → **Optimization**
- Enable Brotli compression

### 4. Enable HTTP/2 and HTTP/3
- **Network** → **Protocols**
- Enable HTTP/2 and HTTP/3 (QUIC)

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs/concepts/projects/domains
- **Cloudflare Docs**: https://developers.cloudflare.com/dns/
- **Check DNS**: https://www.whatsmydns.net

---

## Summary

1. Add domain to Vercel → Get DNS instructions
2. Add CNAME/A record in Cloudflare → Enable proxy
3. Set SSL/TLS to "Full" → Enable "Always Use HTTPS"
4. Update environment variables → Redeploy
5. Wait for DNS propagation → Test domain

Your website will be live at your custom domain! 🎉


