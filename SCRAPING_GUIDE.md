# Automated Site Scraping Guide

This guide explains how to automatically scrape and import all pages from `policestationagent.com` to rebuild them in Next.js.

## Quick Start

### 1. Install Puppeteer

```bash
npm install puppeteer
```

### 2. Run the Scraper

**Scrape all pages:**
```bash
npm run scrape
```

**Scrape a specific page:**
```bash
npm run scrape:page /about
```

**List all available pages:**
```bash
npm run scrape:list
```

## What It Does

The scraper (`scripts/scrape-site.js`) will:

1. ✅ Launch a headless browser (Puppeteer)
2. ✅ Navigate to each page on policestationagent.com
3. ✅ Wait for React to fully render the content
4. ✅ Save the complete HTML to `legacy/scraped/` directory
5. ✅ Generate a summary report

## Output

All scraped pages are saved to:
```
legacy/scraped/
├── home.html
├── about.html
├── contact.html
├── blog.html
├── blog-what-is-the-police-caution.html
├── station-maidstone.html
├── ...
└── scraping-summary.json
```

## Pages Scraped

### Main Pages
- Homepage (/)
- About, Contact, Blog, Services
- Coverage, FAQ
- For Solicitors, For Clients
- All static pages (Privacy, Terms, etc.)

### Blog Posts
- All 9 blog posts from the original site

### Police Stations
- All 16 police station pages

## Next Steps After Scraping

1. **Review scraped files** in `legacy/scraped/`
2. **Extract content** from HTML files
3. **Rebuild pages** using the extracted structure
4. **Update database** with scraped content

## Manual Scraping

If you prefer to manually save pages:

1. Visit each page on policestationagent.com
2. Use browser extension (SingleFile, etc.) to save HTML
3. Save to `legacy/` directory
4. I'll extract and rebuild from those files

## Notes

- The scraper waits 1 second between requests to be respectful
- It handles React SPAs by waiting for network idle
- Failed pages are logged in the summary
- All HTML is saved with full styling and structure


