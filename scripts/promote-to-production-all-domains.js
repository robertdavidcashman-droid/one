#!/usr/bin/env node

/**
 * Promote latest deployment to production and configure all domains
 * Domains: policestationagent.com, policestationagent.net, policestationagent.org,
 *          criminaldefencekent.co.uk, policestationrepkent.co.uk
 */

const https = require('https');

const token = process.env.VERCEL_TOKEN;
const projectId = 'prj_CYDRRsP52A9YVyp44NIT5omVcgQJ';

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

async function promoteDeployment(deploymentId) {
  console.log(`\n🚀 Promoting deployment ${deploymentId} to production...`);
  
  // Try v13 API first
  const options = {
    hostname: 'api.vercel.com',
    path: `/v13/deployments/${deploymentId}/promote`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  let result = await makeRequest(options, { target: 'production' });
  
  // If v13 fails, try v6 with different endpoint
  if (result.status === 404 || result.status >= 400) {
    console.log('   Trying alternative API endpoint...');
    const altOptions = {
      hostname: 'api.vercel.com',
      path: `/v6/deployments/${deploymentId}/promote`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    result = await makeRequest(altOptions, { target: 'production' });
  }
  
  return result;
}

async function addDomain(domain) {
  console.log(`\n📌 Adding domain: ${domain}...`);
  
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${projectId}/domains`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const result = await makeRequest(options, { name: domain });
  return result;
}

async function getLatestDeployment() {
  console.log('🔍 Finding latest deployment...');
  
  const options = {
    hostname: 'api.vercel.com',
    path: `/v6/deployments?projectId=${projectId}&limit=1`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const result = await makeRequest(options);
  
  if (result.data.deployments && result.data.deployments.length > 0) {
    return result.data.deployments[0];
  }
  
  return null;
}

async function main() {
  if (!token) {
    console.error('❌ VERCEL_TOKEN environment variable is not set.');
    console.log('\nTo get your Vercel token:');
    console.log('1. Go to https://vercel.com/account/tokens');
    console.log('2. Create a new token');
    console.log('3. Run: $env:VERCEL_TOKEN="your-token-here"');
    console.log('4. Then run this script again');
    process.exit(1);
  }

  console.log('🚀 Promoting deployment to production and configuring domains...\n');

  // Get latest deployment
  const deployment = await getLatestDeployment();
  
  if (!deployment) {
    console.error('❌ No deployments found');
    process.exit(1);
  }

  console.log(`✅ Found deployment: ${deployment.url}`);
  console.log(`   ID: ${deployment.uid}`);
  console.log(`   State: ${deployment.state || deployment.readyState}`);
  console.log(`   Target: ${deployment.target || 'preview'}`);

  // If not production, promote it
  if (deployment.target !== 'production') {
    console.log('\n📤 Promoting to production...');
    const promoteResult = await promoteDeployment(deployment.uid);
    
    if (promoteResult.status === 200 || promoteResult.status === 201) {
      console.log('✅ Successfully promoted to production!');
    } else {
      console.log(`⚠️  Promote result (${promoteResult.status}):`, promoteResult.data);
      // Continue anyway - might already be production
    }
  } else {
    console.log('\n✅ Deployment is already in production');
  }

  // Add/verify all domains
  console.log('\n🌐 Configuring domains...');
  
  for (const domain of DOMAINS) {
    try {
      const result = await addDomain(domain);
      
      if (result.status === 200 || result.status === 201) {
        console.log(`✅ ${domain} - Added/Updated`);
      } else if (result.status === 409) {
        console.log(`ℹ️  ${domain} - Already exists`);
      } else {
        console.log(`⚠️  ${domain} - Status ${result.status}:`, result.data);
      }
    } catch (error) {
      console.log(`❌ ${domain} - Error:`, error.message);
    }
  }

  console.log('\n✅ Done!');
  console.log('\n📋 Domains configured:');
  DOMAINS.forEach(d => console.log(`   - ${d}`));
  console.log('\n⏱️  Wait 1-2 minutes for DNS propagation, then visit:');
  console.log('   https://policestationagent.com');
  console.log('   https://policestationagent.net');
  console.log('   https://policestationagent.org');
  console.log('   https://criminaldefencekent.co.uk');
  console.log('   https://policestationrepkent.co.uk');
}

main().catch(console.error);

