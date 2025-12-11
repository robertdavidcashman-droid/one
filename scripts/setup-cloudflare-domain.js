/**
 * Automated Cloudflare Domain Setup for Vercel
 * 
 * This script automatically configures your Cloudflare domain to work with Vercel.
 * 
 * Requirements:
 * 1. Cloudflare API Token (with Zone:Edit and DNS:Edit permissions)
 * 2. Your domain name (e.g., policestationagent.com)
 * 3. Vercel project name (optional - will try to detect)
 * 
 * Usage:
 *   node scripts/setup-cloudflare-domain.js
 * 
 * Or with environment variables:
 *   CLOUDFLARE_API_TOKEN=your_token DOMAIN=yourdomain.com node scripts/setup-cloudflare-domain.js
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

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
        ttl: 1 // Auto TTL
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
        ttl: 1 // Auto TTL
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

// Get Vercel domain configuration
async function getVercelDomainConfig(domain) {
  // Vercel typically uses cname.vercel-dns.com for CNAME records
  // For root domains, they provide A records
  return {
    cname: 'cname.vercel-dns.com',
    // Common Vercel A record IPs (these may change, user should check Vercel dashboard)
    aRecords: ['76.76.21.21']
  };
}

async function main() {
  console.log('🌐 Cloudflare Domain Setup for Vercel\n');
  console.log('This script will:');
  console.log('  1. Configure DNS records to point to Vercel');
  console.log('  2. Set SSL/TLS mode to Full');
  console.log('  3. Enable Always Use HTTPS');
  console.log('  4. Configure www subdomain (if needed)\n');

  // Get credentials
  let cloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
  let domain = process.env.DOMAIN;

  if (!cloudflareToken) {
    console.log('📝 Cloudflare API Token');
    console.log('   Get it from: https://dash.cloudflare.com/profile/api-tokens');
    console.log('   Required permissions: Zone:Edit, DNS:Edit\n');
    cloudflareToken = await question('Enter your Cloudflare API Token: ');
  }

  if (!domain) {
    domain = await question('Enter your domain (e.g., policestationagent.com): ');
  }

  // Clean domain
  domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();

  // Get Vercel configuration
  console.log('\n📋 Vercel Configuration');
  console.log('   You need to add your domain in Vercel first:');
  console.log('   1. Go to: https://vercel.com/dashboard');
  console.log('   2. Select your project');
  console.log('   3. Go to Settings → Domains');
  console.log('   4. Add your domain');
  console.log('   5. Vercel will show you DNS configuration\n');

  const useCNAME = await question('Does Vercel show a CNAME record? (y/n): ');
  const useCNAMEBool = useCNAME.toLowerCase() === 'y' || useCNAME.toLowerCase() === 'yes';

  let vercelTarget = '';
  if (useCNAMEBool) {
    vercelTarget = await question('Enter the CNAME target from Vercel (e.g., cname.vercel-dns.com): ');
  } else {
    vercelTarget = await question('Enter the A record IP address from Vercel (e.g., 76.76.21.21): ');
  }

  const setupWWW = await question('Set up www subdomain? (y/n): ');
  const setupWWWBool = setupWWW.toLowerCase() === 'y' || setupWWW.toLowerCase() === 'yes';

  try {
    // Get zone ID
    const zoneId = await getZoneId(cloudflareToken, domain);
    console.log(`   ✅ Found zone: ${zoneId}\n`);

    // Configure DNS records
    console.log('📝 Configuring DNS records...\n');

    if (useCNAMEBool) {
      // Root domain CNAME (if Cloudflare supports it)
      try {
        await createOrUpdateDNSRecord(cloudflareToken, zoneId, 'CNAME', domain, vercelTarget, true);
        console.log(`   ✅ Root domain CNAME configured\n`);
      } catch (error) {
        console.log(`   ⚠️  CNAME for root domain not supported, using A record instead\n`);
        // Fall back to A record
        await createOrUpdateDNSRecord(cloudflareToken, zoneId, 'A', domain, vercelTarget, true);
        console.log(`   ✅ Root domain A record configured\n`);
      }
    } else {
      // A record for root domain
      await createOrUpdateDNSRecord(cloudflareToken, zoneId, 'A', domain, vercelTarget, true);
      console.log(`   ✅ Root domain A record configured\n`);
    }

    // WWW subdomain
    if (setupWWWBool) {
      if (useCNAMEBool) {
        await createOrUpdateDNSRecord(cloudflareToken, zoneId, 'CNAME', `www.${domain}`, vercelTarget, true);
        console.log(`   ✅ www subdomain CNAME configured\n`);
      } else {
        await createOrUpdateDNSRecord(cloudflareToken, zoneId, 'A', `www.${domain}`, vercelTarget, true);
        console.log(`   ✅ www subdomain A record configured\n`);
      }
    }

    // Configure SSL
    console.log('🔒 Configuring SSL/TLS...\n');
    await configureSSL(cloudflareToken, zoneId, 'full');
    await enableAlwaysHTTPS(cloudflareToken, zoneId);

    console.log('\n✅ Configuration Complete!\n');
    console.log('📋 Next Steps:');
    console.log('  1. Wait 5-15 minutes for DNS propagation');
    console.log('  2. Check Vercel dashboard - domain should show "Valid Configuration"');
    console.log('  3. Visit your domain to verify it\'s working');
    console.log('  4. Update NEXT_PUBLIC_SITE_URL in Vercel environment variables');
    console.log(`     Set it to: https://${domain}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  - Verify your Cloudflare API token has correct permissions');
    console.error('  - Make sure the domain is added to your Cloudflare account');
    console.error('  - Check that you entered the correct Vercel DNS target');
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };

