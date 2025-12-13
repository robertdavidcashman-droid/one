# Base44 to Next.js Migration Plan

## Overview
Converting Base44 React Router components to Next.js pages with proper React components.

## Key Conversions Needed

### 1. Pages to Convert/Update
- ✅ `Areas.js` → `app/areas/page.tsx` (exists, needs content update)
- ✅ `ServicesVoluntaryInterviews.js` → `app/servicesvoluntaryinterviews/page.tsx` (exists, needs content update)
- ⏳ `ServicesPreChargeAdvice.js` → `app/services/pre-charge-advice/page.tsx` (needs creation)
- ⏳ `ServicesBailApplications.js` → `app/services/bail-applications/page.tsx` (needs creation)
- ⏳ `ServicesPoliceStationRepresentation.js` → `app/services/police-station-representation/page.tsx` (needs creation)

### 2. Individual Police Station Pages
All exist but may need content updates:
- `app/maidstone-police-station/page.tsx`
- `app/medway-police-station/page.tsx`
- `app/north-kent-gravesend-police-station/page.tsx`
- `app/tonbridge-police-station/page.tsx`
- `app/sevenoaks-police-station/page.tsx`
- `app/tunbridge-wells-police-station/page.tsx`
- `app/margate-police-station/page.tsx`
- `app/dover-police-station/page.tsx`
- `app/folkestone-police-station/page.tsx`
- `app/canterbury-police-station/page.tsx`

### 3. Components Needed
- ⏳ `NearestStationFinder` component (for Areas page)
- ⏳ `PoliceStationPageLayout` component (for individual station pages)

### 4. Backend Functions
- ⏳ `getBlogPost.js` → May not be needed (using SQLite)
- ⏳ `wpSync.js` → May not be needed (using SQLite)
- ✅ `sitemapXml.js` → Already exists as `app/sitemap.ts`
- ✅ `robotsTxt.js` → Already exists as `app/robots.ts`

### 5. Updates Required
- Phone numbers: `01732 247 427` → `0333 049 7036`
- Domains: `policestationagent.com` → `criminaldefencekent.co.uk`
- React Router `Link` → Next.js `Link`
- `createPageUrl` utility → Direct paths
- `SeoHead` component → Next.js `metadata` export

## Status
Starting conversion now...



