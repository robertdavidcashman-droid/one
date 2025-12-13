#!/usr/bin/env node

const https = require('https');

const token = process.env.VERCEL_TOKEN;
const projectId = 'prj_CYDRRsP52A9YVyp44NIT5omVcgQJ';

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
  console.log('🔓 Disabling deployment protection...\n');

  // Update project settings to disable protection
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // Disable various protection settings
  const updateData = {
    ssoProtection: null,
    passwordProtection: null,
    trustedIps: null,
    optionsAllowlist: null
  };

  const result = await makeRequest(options, updateData);
  console.log(`Update result (${result.status}):`, JSON.stringify(result.data, null, 2).slice(0, 500));

  // Also try to update deployment protection specifically
  const protectionOptions = {
    hostname: 'api.vercel.com',
    path: `/v1/projects/${projectId}/deployment-protection`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const protectionResult = await makeRequest(protectionOptions, {
    deploymentProtection: {
      deploymentType: 'prod_deployment_urls_and_all_previews',
      standard: { protectionMode: 'none' }
    }
  });
  console.log(`\nProtection update (${protectionResult.status}):`, JSON.stringify(protectionResult.data, null, 2).slice(0, 500));

  console.log('\n✅ Done! Try visiting the site again.');
}

main().catch(console.error);







