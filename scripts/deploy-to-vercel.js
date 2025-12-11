/**
 * Automatic Deployment to Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function checkVercelAuth() {
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🚀 Automatic Deployment to Vercel\n');
  console.log('='.repeat(60));

  // Step 1: Check if logged in
  console.log('\n📋 Step 1: Checking Vercel authentication...');
  const isLoggedIn = await checkVercelAuth();

  if (!isLoggedIn) {
    console.log('⚠️  Not logged in to Vercel');
    console.log('\n📝 Please run these commands:');
    console.log('   1. vercel login');
    console.log('   2. Then run this script again: node scripts/deploy-to-vercel.js');
    process.exit(1);
  }

  console.log('✅ Logged in to Vercel');

  // Step 2: Check for .vercelignore
  console.log('\n📋 Step 2: Setting up deployment configuration...');
  const vercelIgnore = `.next
node_modules
.git
.env.local
.env*.local
legacy
*.md
scripts
.gitignore
`;
  await fs.writeFile('.vercelignore', vercelIgnore);
  console.log('✅ Created .vercelignore');

  // Step 3: Deploy
  console.log('\n📋 Step 3: Deploying to Vercel...');
  console.log('   This may take a few minutes...\n');

  try {
    execSync('vercel --yes', { stdio: 'inherit' });
    console.log('\n✅ Deployment successful!');
    console.log('\n📝 Next steps:');
    console.log('   1. Set environment variables in Vercel dashboard:');
    console.log('      - JWT_SECRET');
    console.log('      - NEXT_PUBLIC_SITE_URL');
    console.log('   2. Run: vercel --prod (for production deployment)');
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.log('\n💡 Try running manually: vercel');
  }
}

main().catch(console.error);



