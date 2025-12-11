# Content Migration Guide

## From policestationagent.com to Web44AI

This guide helps you migrate content from your current Base44 AI website to the new Web44AI platform.

## Already Seeded Content

The following content has been automatically added to your database:

### Police Stations
- ✅ Maidstone Police Station
- ✅ North Kent Police Station
- ✅ Tonbridge Police Station

### Services
- ✅ Police Station Representation
- ✅ Criminal Defense
- ✅ Legal Advice

## Migration Steps

### 1. WordPress Blog Import

If your current site has a blog:

1. Export from WordPress/Base44:
   - Go to your current site's admin
   - Export content as XML
   - Download the export file

2. Import to Web44AI:
   - Login to admin dashboard: `/admin/login`
   - Go to "WordPress Import" tab
   - Upload your XML export file
   - Review imported posts

### 2. Additional Police Stations

To add more police stations:

**Via Admin Dashboard (when UI is ready):**
- Go to Admin → Police Stations
- Add new stations with name, slug, address, and content

**Via Database:**
```sql
INSERT INTO police_stations (name, slug, address, content) 
VALUES ('Station Name', 'station-slug', 'Address', 'Content HTML');
```

**Via API:**
```bash
POST /api/admin/police-stations
{
  "name": "Station Name",
  "slug": "station-slug",
  "address": "Address",
  "content": "<p>Content</p>"
}
```

### 3. Additional Services

To add more services:

**Via Admin Dashboard (when UI is ready):**
- Go to Admin → Services
- Add new services with title, slug, description, and content

**Via Database:**
```sql
INSERT INTO services (title, slug, description, content) 
VALUES ('Service Title', 'service-slug', 'Description', 'Content HTML');
```

**Via API:**
```bash
POST /api/admin/services
{
  "title": "Service Title",
  "slug": "service-slug",
  "description": "Description",
  "content": "<p>Content</p>"
}
```

### 4. Update Existing Content

All seeded content can be updated via:
- Admin dashboard (when UI is ready)
- Direct database access
- API endpoints

### 5. Homepage Customization

The homepage (`app/page.tsx`) can be customized to match your current site:
- Update hero text
- Modify service descriptions
- Add testimonials
- Update CTAs

### 6. Contact Information

Update contact details in:
- `app/contact/page.tsx` - Contact page
- `components/Footer.tsx` - Footer contact info
- Add contact form if needed

## Content Best Practices

### SEO Optimization
- Use descriptive titles and meta descriptions
- Include relevant keywords naturally
- Add canonical URLs (automatic)
- Optimize images with alt text

### Content Structure
- Use proper heading hierarchy (H1, H2, H3)
- Break content into readable paragraphs
- Use bullet points for lists
- Include clear calls-to-action

### Police Station Pages
- Include full address
- Add contact phone if available
- Provide detailed service information
- Include local area information

### Service Pages
- Clear service descriptions
- Benefits and features
- Who the service is for
- How to access the service

## Re-seeding Data

To re-run the seed script (will update existing records):

```bash
node scripts/seed-data.js
```

This will update existing police stations and services with the latest content.

## Need Help?

- Check `PROJECT_SUMMARY.md` for feature overview
- See `DEPLOYMENT.md` for deployment help
- Review API documentation in code comments

