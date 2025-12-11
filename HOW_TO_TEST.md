# 🚀 How to Test Your Website

## Easiest Way: Development Server

### Step 1: Start the Server

The development server is already starting! In a few seconds, you should see:

```
✓ Ready in X seconds
○ Local:        http://localhost:3000
```

### Step 2: Open in Browser

**Simply open your web browser and go to:**

```
http://localhost:3000
```

That's it! Your website will be running locally.

---

## Alternative: If Server Didn't Start

If you need to start it manually:

```bash
npm run dev
```

Then open: **http://localhost:3000**

---

## What You'll See

- ✅ **Homepage** at `http://localhost:3000/`
- ✅ **All 65 pages** accessible via navigation
- ✅ **Blog posts** at `http://localhost:3000/post?slug=...`
- ✅ **Police stations** at `http://localhost:3000/police-stations/[slug]`
- ✅ **All services** and content pages

---

## Testing Checklist

1. ✅ **Homepage loads** - Check `/`
2. ✅ **Navigation works** - Click through menu items
3. ✅ **Blog posts load** - Visit `/blog` and click a post
4. ✅ **Police stations** - Visit `/police-stations` and click a station
5. ✅ **All pages accessible** - Test links in footer
6. ✅ **Mobile menu** - Resize browser to test mobile navigation

---

## Common Issues

### Port 3000 Already in Use?

If you see "Port 3000 is already in use", either:
- Close the other application using port 3000, OR
- Run: `npm run dev -- -p 3001` (uses port 3001 instead)

### Database Errors?

Make sure the database is initialized:
```bash
npm run init-db  # If this script exists
```

### Images Not Showing?

Images are still pointing to the live site. To fix:
```bash
node scripts/download-images.js
```

---

## Production Build (Optional)

To test a production build:

```bash
npm run build
npm start
```

This creates an optimized production build.

---

## Quick Access URLs

- **Homepage:** http://localhost:3000/
- **Blog:** http://localhost:3000/blog
- **Services:** http://localhost:3000/services
- **Contact:** http://localhost:3000/contact
- **About:** http://localhost:3000/about

---

**That's it! Your website is ready to test! 🎉**



