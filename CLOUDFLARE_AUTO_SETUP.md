# 🌐 Automated Cloudflare Domain Setup

This guide will help you connect your Cloudflare domain to Vercel automatically.

---

## 🚀 Quick Setup (Automated)

### Step 1: Get Your Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use **"Edit zone DNS"** template
4. Select your zone (domain)
5. Click **"Continue to summary"** → **"Create Token"**
6. **Copy the token** (you won't see it again!)

### Step 2: Add Domain in Vercel First

**IMPORTANT:** You must add your domain in Vercel before running the script.

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Domains**
4. Click **"Add Domain"**
5. Enter your domain (e.g., `policestationagent.com`)
6. Vercel will show you DNS configuration:
   - **CNAME target** (e.g., `cname.vercel-dns.com`) OR
   - **A record IP** (e.g., `76.76.21.21`)
7. **Copy this information** - you'll need it for the script

### Step 3: Run the Automated Script

```bash
node scripts/setup-cloudflare-domain.js
```

The script will:
- ✅ Ask for your Cloudflare API token
- ✅ Ask for your domain name
- ✅ Ask for Vercel DNS configuration
- ✅ Automatically configure DNS records
- ✅ Set SSL/TLS to Full mode
- ✅ Enable Always Use HTTPS
- ✅ Configure www subdomain (optional)

### Step 4: Wait for DNS Propagation

- Usually takes **5-15 minutes** with Cloudflare
- Check Vercel dashboard - domain should show **"Valid Configuration"** ✅

### Step 5: Update Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_SITE_URL`:
   ```
   NEXT_PUBLIC_SITE_URL = https://yourdomain.com
   ```
3. Click **"Save"**
4. **Redeploy** your project

---

## 🔧 Alternative: Manual Setup

If you prefer to set up manually, see: `CLOUDFLARE_DOMAIN_SETUP.md`

---

## 🐛 Troubleshooting

### "Domain not found in Cloudflare account"
- Make sure your domain is added to Cloudflare
- Verify you're using the correct domain name

### "Invalid API token"
- Check that your token has **Zone:Edit** and **DNS:Edit** permissions
- Make sure you copied the entire token

### "DNS not resolving"
- Wait 15-30 minutes for DNS propagation
- Check Cloudflare dashboard → DNS → Records
- Verify records are **Proxied** (orange cloud icon)

### "SSL certificate error"
- Make sure SSL/TLS mode is set to **"Full"** or **"Full (strict)"**
- Wait a few minutes for certificate to generate

---

## ✅ Verification Checklist

- [ ] Domain added in Vercel
- [ ] DNS records configured in Cloudflare
- [ ] Records show as **Proxied** (orange cloud)
- [ ] SSL/TLS mode set to **Full**
- [ ] Always Use HTTPS enabled
- [ ] Vercel shows "Valid Configuration"
- [ ] `NEXT_PUBLIC_SITE_URL` updated in Vercel
- [ ] Site loads at `https://yourdomain.com`

---

## 📞 Need Help?

If the automated script doesn't work, you can:
1. Check the manual setup guide: `CLOUDFLARE_DOMAIN_SETUP.md`
2. Review Cloudflare documentation: https://developers.cloudflare.com/dns/
3. Check Vercel domain docs: https://vercel.com/docs/concepts/projects/domains

