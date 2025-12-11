console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                    CLOUDFLARE DNS FIX NEEDED                       ║
╚════════════════════════════════════════════════════════════════════╝

Your site works at: https://one-gamma-two.vercel.app ✅
But NOT at: https://criminaldefencekent.co.uk ❌

REASON: Cloudflare DNS is pointing to Base44 instead of Vercel.

═══════════════════════════════════════════════════════════════════════
                         HOW TO FIX
═══════════════════════════════════════════════════════════════════════

1. Go to: https://dash.cloudflare.com
2. Select domain: criminaldefencekent.co.uk
3. Click "DNS" in the left sidebar
4. DELETE or EDIT existing A/CNAME records for @ and www

5. ADD these records:

   ┌─────────┬──────────┬────────────────────────┬──────────┐
   │ Type    │ Name     │ Content                │ Proxy    │
   ├─────────┼──────────┼────────────────────────┼──────────┤
   │ CNAME   │ @        │ cname.vercel-dns.com   │ OFF (DNS)│
   │ CNAME   │ www      │ cname.vercel-dns.com   │ OFF (DNS)│
   └─────────┴──────────┴────────────────────────┴──────────┘

   IMPORTANT: Set Proxy Status to "DNS only" (grey cloud, NOT orange)

6. Wait 2-5 minutes for DNS propagation
7. Visit https://criminaldefencekent.co.uk

═══════════════════════════════════════════════════════════════════════
                      WHY PROXY MUST BE OFF
═══════════════════════════════════════════════════════════════════════

Vercel requires direct DNS (no Cloudflare proxy) for:
- SSL certificate generation
- Proper domain verification
- Correct deployment routing

You can enable Cloudflare proxy AFTER the site works, but start with it OFF.

`);

