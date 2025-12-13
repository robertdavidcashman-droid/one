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
  console.log('🚀 Promoting latest deployment to production...\n');

  // Get latest deployment
  const options = {
    hostname: 'api.vercel.com',
    path: `/v6/deployments?projectId=${projectId}&limit=1&target=production`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const result = await makeRequest(options);
  
  if (result.data.deployments && result.data.deployments.length > 0) {
    const latestDeployment = result.data.deployments[0];
    console.log(`Latest deployment: ${latestDeployment.url}`);
    console.log(`State: ${latestDeployment.state || latestDeployment.readyState}`);
    console.log(`Created: ${new Date(latestDeployment.created).toLocaleString()}`);
    
    // Check if it's the production deployment
    if (latestDeployment.target === 'production') {
      console.log('\n✅ This deployment is already targeted for production');
    }
  }

  // Get all deployments and find the newest ready one
  const allOptions = {
    hostname: 'api.vercel.com',
    path: `/v6/deployments?projectId=${projectId}&limit=10`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const allResult = await makeRequest(allOptions);
  
  if (allResult.data.deployments) {
    const readyDeployments = allResult.data.deployments.filter(d => 
      d.state === 'READY' || d.readyState === 'READY'
    );
    
    if (readyDeployments.length > 0) {
      const newest = readyDeployments[0];
      console.log(`\nNewest ready deployment: ${newest.url}`);
      console.log(`ID: ${newest.uid}`);
      
      // Promote to production by creating an alias
      console.log('\n📌 Setting production alias...');
      
      const aliasOptions = {
        hostname: 'api.vercel.com',
        path: `/v2/deployments/${newest.uid}/aliases`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Set the custom domain alias
      const aliasResult = await makeRequest(aliasOptions, { alias: 'criminaldefencekent.co.uk' });
      console.log(`Alias result (${aliasResult.status}):`, aliasResult.data);
      
      // Also set www
      const wwwResult = await makeRequest(aliasOptions, { alias: 'www.criminaldefencekent.co.uk' });
      console.log(`WWW Alias result (${wwwResult.status}):`, wwwResult.data);
    }
  }

  console.log('\n✅ Done! Try visiting https://criminaldefencekent.co.uk now');
  console.log('If still blank, wait 1-2 minutes and hard refresh (Ctrl+Shift+R)');
}

main().catch(console.error);

















