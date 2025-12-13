#!/usr/bin/env node

/**
 * Promote deployment to production using Vercel API
 */

const https = require('https');

const token = process.env.VERCEL_TOKEN;
const deploymentId = 'dpl_DadY5meizddVx6ipCNmULX8yU9ac';

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

async function main() {
  console.log('🚀 Attempting to promote deployment to production...\n');
  
  // Method 1: Try v13 promote endpoint
  console.log('Trying v13 API...');
  const options1 = {
    hostname: 'api.vercel.com',
    path: `/v13/deployments/${deploymentId}/promote`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  let result = await makeRequest(options1, { target: 'production' });
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, JSON.stringify(result.data, null, 2));
  
  if (result.status === 200 || result.status === 201) {
    console.log('\n✅ Successfully promoted to production!');
    return;
  }
  
  // Method 2: Try creating a production alias
  console.log('\nTrying to create production alias...');
  const options2 = {
    hostname: 'api.vercel.com',
    path: `/v2/deployments/${deploymentId}/aliases`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  result = await makeRequest(options2, { 
    alias: 'policestationagent.com',
    redirect: null
  });
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, JSON.stringify(result.data, null, 2));
  
  if (result.status === 200 || result.status === 201) {
    console.log('\n✅ Successfully created production alias!');
  } else {
    console.log('\n⚠️  API promotion failed. Please promote manually via Vercel Dashboard:');
    console.log('   1. Go to: https://vercel.com/dashboard');
    console.log('   2. Select project "one"');
    console.log('   3. Deployments → Find deployment → 3 dots → "Promote to Production"');
  }
}

main().catch(console.error);











