#!/usr/bin/env node

/**
 * Automatically fix domain assignment in Vercel
 * Moves criminaldefencekent.co.uk from Base44 to the "one" project
 */

const https = require('https');
const readline = require('readline');

const DOMAIN = 'criminaldefencekent.co.uk';
const TARGET_PROJECT = 'one';

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

async function getProjects(token) {
  const options = {
    hostname: 'api.vercel.com',
    path: '/v9/projects',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options);
}

async function getProjectDomains(token, projectId) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/domains`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options);
}

async function removeDomainFromProject(token, projectId, domain) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${projectId}/domains/${domain}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options);
}

async function addDomainToProject(token, projectId, domain) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${projectId}/domains`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  return makeRequest(options, { name: domain });
}

async function main() {
  console.log('🔧 Vercel Domain Assignment Fix\n');
  console.log(`Domain: ${DOMAIN}`);
  console.log(`Target Project: ${TARGET_PROJECT}\n`);

  // Get token from environment or prompt
  let token = process.env.VERCEL_TOKEN;
  
  if (!token) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    token = await new Promise(resolve => {
      console.log('To get a Vercel token:');
      console.log('1. Go to https://vercel.com/account/tokens');
      console.log('2. Click "Create" to create a new token');
      console.log('3. Copy the token and paste it below\n');
      rl.question('Enter your Vercel API token: ', answer => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  if (!token) {
    console.error('❌ No token provided');
    process.exit(1);
  }

  console.log('\n📋 Fetching projects...');
  
  // Get all projects
  const projectsResult = await getProjects(token);
  if (projectsResult.status !== 200) {
    console.error('❌ Failed to fetch projects:', projectsResult.data);
    process.exit(1);
  }

  const projects = projectsResult.data.projects || [];
  console.log(`Found ${projects.length} projects\n`);

  // Find target project and any project that has the domain
  let targetProject = null;
  let projectWithDomain = null;

  for (const project of projects) {
    console.log(`Checking project: ${project.name}`);
    
    if (project.name.toLowerCase() === TARGET_PROJECT.toLowerCase()) {
      targetProject = project;
      console.log(`  ✅ This is the target project`);
    }

    // Check domains for this project
    const domainsResult = await getProjectDomains(token, project.id);
    if (domainsResult.status === 200 && domainsResult.data.domains) {
      for (const domain of domainsResult.data.domains) {
        if (domain.name === DOMAIN || domain.name === `www.${DOMAIN}`) {
          console.log(`  ⚠️  Has domain: ${domain.name}`);
          if (project.name.toLowerCase() !== TARGET_PROJECT.toLowerCase()) {
            projectWithDomain = { project, domain: domain.name };
          }
        }
      }
    }
  }

  if (!targetProject) {
    console.error(`\n❌ Target project "${TARGET_PROJECT}" not found`);
    process.exit(1);
  }

  console.log(`\n📦 Target project ID: ${targetProject.id}`);

  // Remove domain from wrong project if needed
  if (projectWithDomain) {
    console.log(`\n🔄 Removing ${DOMAIN} from "${projectWithDomain.project.name}"...`);
    const removeResult = await removeDomainFromProject(token, projectWithDomain.project.id, projectWithDomain.domain);
    if (removeResult.status === 200 || removeResult.status === 204) {
      console.log('  ✅ Domain removed successfully');
    } else {
      console.log(`  ⚠️  Remove result: ${removeResult.status}`, removeResult.data);
    }
  }

  // Add domain to target project
  console.log(`\n➕ Adding ${DOMAIN} to "${TARGET_PROJECT}"...`);
  const addResult = await addDomainToProject(token, targetProject.id, DOMAIN);
  
  if (addResult.status === 200 || addResult.status === 201) {
    console.log('  ✅ Domain added successfully!');
  } else if (addResult.status === 409) {
    console.log('  ℹ️  Domain already exists on this project');
  } else {
    console.log(`  ⚠️  Add result: ${addResult.status}`, addResult.data);
  }

  // Also add www subdomain
  console.log(`\n➕ Adding www.${DOMAIN} to "${TARGET_PROJECT}"...`);
  const addWwwResult = await addDomainToProject(token, targetProject.id, `www.${DOMAIN}`);
  
  if (addWwwResult.status === 200 || addWwwResult.status === 201) {
    console.log('  ✅ WWW domain added successfully!');
  } else if (addWwwResult.status === 409) {
    console.log('  ℹ️  WWW domain already exists');
  } else {
    console.log(`  ⚠️  Add WWW result: ${addWwwResult.status}`, addWwwResult.data);
  }

  console.log('\n✅ Domain assignment complete!');
  console.log('\nNext steps:');
  console.log('1. Wait 2-3 minutes for DNS propagation');
  console.log('2. Visit https://criminaldefencekent.co.uk');
  console.log('3. If still blank, hard refresh with Ctrl+Shift+R');
}

main().catch(console.error);

