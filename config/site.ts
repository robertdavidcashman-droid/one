// Canonical domain (must match live hosting primary domain to avoid redirect loops)
export const SITE_DOMAIN = "criminaldefencekent.co.uk";
export const SITE_URL = `https://${SITE_DOMAIN}`;

// Legacy domains that should redirect to canonical
export const LEGACY_DOMAINS = [
  "www.criminaldefencekent.co.uk",
  "policestationagent.com",
  "www.policestationagent.com",
];
