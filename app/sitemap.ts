import { MetadataRoute } from 'next';
import db from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://policestationagent.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/coverage`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/for-solicitors`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-clients`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/voluntary-interviews`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/why-use-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/what-we-do`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/what-is-a-police-station-rep`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/what-is-a-criminal-solicitor`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/after-a-police-interview`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/complaints`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/accessibility`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gdpr`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/police-stations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/fees`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/courtrepresentation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/canwehelp`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/outofarea`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privatecrime`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privateclientfaq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/your-rights-in-custody`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/voluntary-police-interview-risks`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/areas`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/christmashours`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hours`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/psastations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/arrested-what-to-do`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Police Station Pages
    {
      url: `${baseUrl}/medway-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/north-kent-gravesend-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/canterbury-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/folkestone-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/maidstone-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tonbridge-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ashford-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dover-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/margate-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sevenoaks-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tunbridge-wells-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/swanley-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bluewater-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sittingbourne-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gravesend-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/coldharbour-police-station`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Police stations (with error handling for build time)
  let stationPages: MetadataRoute.Sitemap = [];
  try {
    const stations = db.prepare('SELECT slug, updated_at FROM police_stations').all() as Array<{
      slug: string;
      updated_at: string | null;
    }>;
    
    stationPages = stations.map((station) => ({
      url: `${baseUrl}/police-stations/${station.slug}`,
      lastModified: station.updated_at ? new Date(station.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    // Database not available during build - skip dynamic pages
    console.warn('Skipping dynamic police stations in sitemap (build time)');
  }

  // Services (with error handling for build time)
  let servicePages: MetadataRoute.Sitemap = [];
  try {
    const services = db.prepare('SELECT slug, updated_at FROM services').all() as Array<{
      slug: string;
      updated_at: string | null;
    }>;
    
    servicePages = services.map((service) => ({
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: service.updated_at ? new Date(service.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    // Database not available during build - skip dynamic pages
    console.warn('Skipping dynamic services in sitemap (build time)');
  }

  // Blog posts (with error handling for build time)
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = db.prepare(`
      SELECT slug, published_at, updated_at 
      FROM blog_posts 
      WHERE published = 1
    `).all() as Array<{
      slug: string;
      published_at: string | null;
      updated_at: string | null;
    }>;
    
    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at 
        ? new Date(post.updated_at) 
        : post.published_at 
          ? new Date(post.published_at) 
          : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    // Database not available during build - skip dynamic pages
    console.warn('Skipping dynamic blog posts in sitemap (build time)');
  }

  return [...staticPages, ...stationPages, ...servicePages, ...blogPages];
}

