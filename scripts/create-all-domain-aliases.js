#!/usr/bin/env node

/**
 * Create production aliases for all domains
 */

const https = require('https');

const token = process.env.VERCEL_TOKEN;
const deploymentId = 'dpl_DadY5meizddVx6ipCNmULX8yU9ac';

const DOMAINS = [
  'policestationagent.com',
  'www.policestationagent.com',
  'policestationagent.net',
  'www.policestationagent.net',
  'policestationagent.org',
  'www.policestationagent.org',
  'criminaldefencekent.co.uk',
  'www.criminaldefencekent.co.uk',
  'policestationrepkent.co.uk',
  'www.policestationrepkent.co.uk',
];

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function createAlias(domain) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v2/deployments/${deploymentId}/aliases`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  return await makeRequest(options, { 
    alias: domain,
    redirect: null
  });
}

async function main() {
  console.log('🌐 Creating production aliases for all domains...\n');
  console.log(`Deployment ID: ${deploymentId}\n`);
  
  const results = [];
  
  for (const domain of DOMAINS) {
    try {
      console.log(`Creating alias: ${domain}...`);
      const result = await createAlias(domain);
      
      if (result.status === 200 || result.status === 201) {
        console.log(`✅ ${domain} - Alias created`);
        results.push({ domain, status: 'success' });
      } else if (result.status === 409) {
        console.log(`ℹ️  ${domain} - Already exists`);
        results.push({ domain, status: 'exists' });
      } else {
        console.log(`⚠️  ${domain} - Status ${result.status}:`, result.data);
        results.push({ domain, status: 'error', error: result.data });
      }
    } catch (error) {
      console.log(`❌ ${domain} - Error:`, error.message);
      results.push({ domain, status: 'error', error: error.message });
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n📋 Summary:');
  const success = results.filter(r => r.status === 'success').length;
  const exists = results.filter(r => r.status === 'exists').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`✅ Created: ${success}`);
  console.log(`ℹ️  Already exists: ${exists}`);
  console.log(`❌ Errors: ${errors}`);
  
  console.log('\n✅ Done! All domains should now point to production deployment.');
  console.log('\n⏱️  Wait 1-2 minutes for DNS propagation, then visit:');
  DOMAINS.filter(d => !d.startsWith('www.')).forEach(d => {
    console.log(`   https://${d}`);
  });
}

main().catch(console.error);











