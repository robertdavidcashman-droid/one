/**
 * Automatically set up domain and environment variables in Vercel
 */

const { execSync } = require('child_process');
const https = require('https');

const DOMAIN = 'criminaldefencekent.co.uk';
const SITE_URL = `https://${DOMAIN}`;

function runCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return { success: true, output: output.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Automatic Domain Setup for Vercel\n');
  console.log('='.repeat(60));

  // Step 1: Check if logged in
  console.log('\n📋 Step 1: Checking Vercel authentication...');
  const whoami = runCommand('vercel whoami');
  
  if (!whoami.success) {
    console.log('❌ Not logged in to Vercel');
    console.log('\n📝 Please run: vercel login');
    console.log('   Then run this script again.');
    process.exit(1);
  }

  console.log(`✅ Logged in as: ${whoami.output}\n`);

  // Step 2: Get project info
  console.log('📋 Step 2: Getting project information...');
  const projectInfo = runCommand('vercel ls --json');
  
  if (!projectInfo.success) {
    console.log('⚠️  Could not get project list');
    console.log('   Continuing with manual steps...\n');
  } else {
    console.log('✅ Project information retrieved\n');
  }

  // Step 3: Add domain (if not already added)
  console.log('📋 Step 3: Adding domain to Vercel...');
  console.log(`   Domain: ${DOMAIN}`);
  
  const addDomain = runCommand(`vercel domains add ${DOMAIN}`);
  
  if (addDomain.success) {
    console.log(`✅ Domain added successfully\n`);
  } else {
    if (addDomain.error.includes('already') || addDomain.error.includes('exists')) {
      console.log(`✅ Domain already exists\n`);
    } else {
      console.log(`⚠️  Could not add domain automatically: ${addDomain.error}`);
      console.log(`   Please add it manually in Vercel dashboard\n`);
    }
  }

  // Step 4: Set environment variable
  console.log('📋 Step 4: Setting environment variable...');
  console.log(`   NEXT_PUBLIC_SITE_URL = ${SITE_URL}`);
  
  // Try to set via CLI
  const setEnv = runCommand(`vercel env add NEXT_PUBLIC_SITE_URL production`);
  
  if (setEnv.success) {
    console.log('✅ Environment variable added\n');
  } else {
    // If it requires interactive input, provide instructions
    if (setEnv.error.includes('interactive') || setEnv.error.includes('input')) {
      console.log('⚠️  Environment variable requires interactive input');
      console.log('\n📝 Please set it manually:');
      console.log('   1. Go to: https://vercel.com/dashboard');
      console.log('   2. Select your project');
      console.log('   3. Settings → Environment Variables');
      console.log(`   4. Add: NEXT_PUBLIC_SITE_URL = ${SITE_URL}`);
      console.log('   5. Select "Production" environment');
      console.log('   6. Click "Save"\n');
    } else if (setEnv.error.includes('already exists')) {
      console.log('✅ Environment variable already exists');
      console.log('   Updating value...\n');
      
      // Try to remove and re-add
      runCommand(`vercel env rm NEXT_PUBLIC_SITE_URL production --yes`);
      runCommand(`vercel env add NEXT_PUBLIC_SITE_URL production`);
    } else {
      console.log(`⚠️  Could not set automatically: ${setEnv.error}`);
      console.log('   Please set manually in Vercel dashboard\n');
    }
  }

  // Step 5: Deploy to production
  console.log('📋 Step 5: Deploying to production...');
  console.log('   This will assign the domain to the deployment...\n');
  
  const deploy = runCommand('vercel --prod --yes');
  
  if (deploy.success) {
    console.log('✅ Deployment successful!\n');
  } else {
    console.log('⚠️  Deployment may have issues');
    console.log('   Check Vercel dashboard for details\n');
  }

  console.log('='.repeat(60));
  console.log('\n✅ Setup Complete!\n');
  console.log('📋 Next Steps:');
  console.log('   1. Check Vercel dashboard → Deployments');
  console.log('   2. Verify domain is assigned to latest deployment');
  console.log('   3. Wait 2-3 minutes for deployment to complete');
  console.log(`   4. Visit: ${SITE_URL}\n`);
  console.log('💡 If domain still shows 404:');
  console.log('   - Go to Deployments → Latest → Assign Domain');
  console.log('   - Or wait a few minutes for auto-assignment\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };





