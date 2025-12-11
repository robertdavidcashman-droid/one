/**
 * MASTER SCRIPT: Full Import + Automatic Rebuild
 * 
 * This script orchestrates the complete import and rebuild process:
 * 1. Crawls policestationagent.com (depth-3)
 * 2. Extracts all pages
 * 3. Automatically rebuilds Next.js pages
 * 4. Generates reports
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');

async function runFullImportRebuild() {
  console.log('🚀 Starting FULL IMPORT + AUTOMATIC REBUILD\n');
  console.log('='.repeat(60));
  console.log('PHASE 1: Crawling and Importing Site');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Run full site import
    console.log('\n📥 Step 1: Crawling policestationagent.com...\n');
    const { stdout: importOutput, stderr: importError } = await execPromise(
      'node scripts/full-site-import.js',
      { cwd: path.join(__dirname, '..'), maxBuffer: 10 * 1024 * 1024 }
    );
    console.log(importOutput);
    if (importError) console.error(importError);
    
    console.log('\n' + '='.repeat(60));
    console.log('PHASE 2: Automatic Rebuild');
    console.log('='.repeat(60));
    
    // Step 2: Rebuild all pages
    console.log('\n🔨 Step 2: Rebuilding Next.js pages...\n');
    const { stdout: rebuildOutput, stderr: rebuildError } = await execPromise(
      'node scripts/auto-rebuild-all-pages.js',
      { cwd: path.join(__dirname, '..'), maxBuffer: 10 * 1024 * 1024 }
    );
    console.log(rebuildOutput);
    if (rebuildError) console.error(rebuildError);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ FULL IMPORT + REBUILD COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Check reports in: legacy/import-reports/');
    console.log('📁 Scraped files in: legacy/scraped/');
    console.log('📄 Rebuilt pages in: app/');
    
  } catch (error) {
    console.error('\n❌ Error during import/rebuild:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runFullImportRebuild();
}

module.exports = { runFullImportRebuild };


