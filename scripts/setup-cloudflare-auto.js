/**
 * Fully Automated Cloudflare Domain Setup
 * 
 * Uses environment variables - no prompts needed!
 * 
 * Usage:
 *   CLOUDFLARE_API_TOKEN=your_token DOMAIN=yourdomain.com VERCEL_TARGET=cname.vercel-dns.com node scripts/setup-cloudflare-auto.js
 * 
 * Or create a .env file:
 *   CLOUDFLARE_API_TOKEN=your_token
 *   DOMAIN=yourdomain.com
 *   VERCEL_TARGET=cname.vercel-dns.com
 *   USE_CNAME=true
 *   SETUP_WWW=true
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const https = require('https');

// Cloudflare API functions
async function cloudflareRequest(method, endpoint, token, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.success === false) {
            reject(new Error(parsed.errors?.[0]?.message || 'Cloudflare API error'));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getZoneId(token, domain) {
  console.log(`🔍 Looking up zone for ${domain}...`);
  const response = await cloudflareRequest('GET', `/client/v4/zones?name=${domain}`, token);
  
  if (!response.result || response.result.length === 0) {
    throw new Error(`Domain ${domain} not found in your Cloudflare account. Make sure the domain is added to Cloudflare first.`);
  }
  
  return response.result[0].id;
}

async function getExistingRecords(token, zoneId) {
  const response = await cloudflareRequest('GET', `/client/v4/zones/${zoneId}/dns_records`, token);
  return response.result || [];
}

async function createOrUpdateDNSRecord(token, zoneId, type, name, content, proxied = true) {
  const existing = await getExistingRecords(token, zoneId);
  const existingRecord = existing.find(r => r.type === type && r.name === name);
  
  if (existingRecord) {
    console.log(`   ↻ Updating existing ${type} record for ${name}...`);
    const response = await cloudflareRequest(
      'PUT',
      `/client/v4/zones/${zoneId}/dns_records/${existingRecord.id}`,
      token,
      {
        type,
        name,
        content,
        proxied,
        ttl: 1
      }
    );
    return response.result;
  } else {
    console.log(`   ➕ Creating ${type} record for ${name}...`);
    const response = await cloudflareRequest(
      'POST',
      `/client/v4/zones/${zoneId}/dns_records`,
      token,
      {
        type,
        name,
        content,
        proxied,
        ttl: 1
      }
    );
    return response.result;
  }
}

async function configureSSL(token, zoneId, mode = 'full') {
  console.log(`🔒 Configuring SSL/TLS mode to "${mode}"...`);
  try {
    await cloudflareRequest(
      'PATCH',
      `/client/v4/zones/${zoneId}/settings/ssl`,
      token,
      { value: mode }
    );
    console.log(`   ✅ SSL/TLS mode set to "${mode}"`);
  } catch (error) {
    console.warn(`   ⚠️  Could not set SSL mode: ${error.message}`);
  }
}

async function enableAlwaysHTTPS(token, zoneId) {
  console.log(`🔒 Enabling "Always Use HTTPS"...`);
  try {
    await cloudflareRequest(
      'PATCH',
      `/client/v4/zones/${zoneId}/settings/always_use_https`,
      token,
      { value: 'on' }
    );
    console.log(`   ✅ Always Use HTTPS enabled`);
  } catch (error) {
    console.warn(`   ⚠️  Could not enable Always Use HTTPS: ${error.message}`);
  }
}

async function main() {
  console.log('🌐 Automated Cloudflare Domain Setup for Vercel\n');

  // Get credentials from environment
  const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
  const domain = process.env.DOMAIN;
  const vercelTarget = process.env.VERCEL_TARGET;
  const useCNAME = process.env.USE_CNAME !== 'false';
  const setupWWW = process.env.SETUP_WWW !== 'false';
  const sslMode = process.env.SSL_MODE || 'full';

  // Validate required variables
  if (!cloudflareToken) {
    console.error('❌ Error: CLOUDFLARE_API_TOKEN environment variable is required');
    console.error('\nUsage:');
    console.error('  CLOUDFLARE_API_TOKEN=your_token DOMAIN=yourdomain.com VERCEL_TARGET=cname.vercel-dns.com node scripts/setup-cloudflare-auto.js');
    process.exit(1);
  }

  if (!domain) {
    console.error('❌ Error: DOMAIN environment variable is required');
    process.exit(1);
  }

  if (!vercelTarget) {
    console.error('❌ Error: VERCEL_TARGET environment variable is required');
    console.error('   Get this from Vercel dashboard → Settings → Domains → Your domain');
    process.exit(1);
  }

  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();

  console.log('📋 Configuration:');
  console.log(`   Domain: ${cleanDomain}`);
  console.log(`   Vercel Target: ${vercelTarget}`);
  console.log(`   Use CNAME: ${useCNAME}`);
  console.log(`   Setup WWW: ${setupWWW}`);
  console.log(`   SSL Mode: ${sslMode}\n`);

  try {
    // Get zone ID
    const zoneId = await getZoneId(cloudflareToken, cleanDomain);
    console.log(`   ✅ Found zone: ${zoneId}\n`);

    // Configure DNS records
    console.log('📝 Configuring DNS records...\n');

    if (useCNAME) {
      // Try CNAME first
      try {
        await createOrUpdateDNSRecord(cloudflareToken, zoneId, 'CNAME', cleanDomain, vercelTarget, true);
        console.log(`   ✅ Root domain CNAME configured\n`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('CNAME')) {
          console.log(`   ⚠️  CNAME for root domain not supported, using A record instead\n`);
          // Fall back to A record if CNAME not supported
          await createOrUpdateDNSRecord(cloudflareToken, zoneId, 'A', cleanDomain, vercelTarget, true);
          console.log(`   ✅ Root domain A record configured\n`);
        } else {
          throw error;
        }
      }
    } else {
      // A record for root domain
      await createOrUpdateDNSRecord(cloudflareToken, zoneId, 'A', cleanDomain, vercelTarget, true);
      console.log(`   ✅ Root domain A record configured\n`);
    }

    // WWW subdomain
    if (setupWWW) {
      if (useCNAME) {
        await createOrUpdateDNSRecord(cloudflareToken, zoneId, 'CNAME', `www.${cleanDomain}`, vercelTarget, true);
        console.log(`   ✅ www subdomain CNAME configured\n`);
      } else {
        await createOrUpdateDNSRecord(cloudflareToken, zoneId, 'A', `www.${cleanDomain}`, vercelTarget, true);
        console.log(`   ✅ www subdomain A record configured\n`);
      }
    }

    // Configure SSL
    console.log('🔒 Configuring SSL/TLS...\n');
    await configureSSL(cloudflareToken, zoneId, sslMode);
    await enableAlwaysHTTPS(cloudflareToken, zoneId);

    console.log('\n✅ Configuration Complete!\n');
    console.log('📋 Next Steps:');
    console.log('  1. Wait 5-15 minutes for DNS propagation');
    console.log('  2. Check Vercel dashboard - domain should show "Valid Configuration"');
    console.log('  3. Visit your domain to verify it\'s working');
    console.log('  4. Update NEXT_PUBLIC_SITE_URL in Vercel environment variables');
    console.log(`     Set it to: https://${cleanDomain}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  - Verify your Cloudflare API token has correct permissions');
    console.error('  - Make sure the domain is added to your Cloudflare account');
    console.error('  - Check that you entered the correct Vercel DNS target');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };

