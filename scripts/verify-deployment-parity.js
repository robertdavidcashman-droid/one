#!/usr/bin/env node
/**
 * Deployment Parity Verification Script
 * 
 * Verifies that critical features are present and valid before deployment.
 * Fails build if critical issues are detected.
 */

const fs = require('fs');
const path = require('path');

let errors = [];
let warnings = [];

// Check 1: Admin page has auth protection
const adminPagePath = 'app/admin/page.tsx';
if (fs.existsSync(adminPagePath)) {
  const content = fs.readFileSync(adminPagePath, 'utf8');
  if (!content.includes('verifyAuth') && !content.includes('redirect')) {
    errors.push(`❌ ${adminPagePath}: Missing auth protection`);
  }
  if (!content.includes('AdminDashboard')) {
    errors.push(`❌ ${adminPagePath}: AdminDashboard component not rendered`);
  }
} else {
  errors.push(`❌ ${adminPagePath}: File missing`);
}

// Check 2: Service pages have default exports
const servicePages = [
  'app/services/bail-applications/page.tsx',
  'app/services/pre-charge-advice/page.tsx',
  'app/services/police-station-representation/page.tsx',
  'app/voluntary-interviews/page.tsx',
];

servicePages.forEach(pagePath => {
  if (!fs.existsSync(pagePath)) {
    errors.push(`❌ ${pagePath}: File missing`);
    return;
  }
  const content = fs.readFileSync(pagePath, 'utf8');
  if (!content.trim()) {
    errors.push(`❌ ${pagePath}: File is empty`);
  } else if (!content.includes('export default')) {
    errors.push(`❌ ${pagePath}: Missing default export`);
  }
});

// Check 3: Service pages linked in services page
const servicesPagePath = 'app/services/page.tsx';
if (fs.existsSync(servicesPagePath)) {
  const content = fs.readFileSync(servicesPagePath, 'utf8');
  if (!content.includes('/services/bail-applications')) {
    warnings.push(`⚠️  ${servicesPagePath}: Bail applications not linked`);
  }
  if (!content.includes('/services/pre-charge-advice')) {
    warnings.push(`⚠️  ${servicesPagePath}: Pre-charge advice not linked`);
  }
  if (!content.includes('/services/police-station-representation')) {
    warnings.push(`⚠️  ${servicesPagePath}: Police station representation not linked`);
  }
}

// Check 4: Service pages in sitemap
const sitemapPath = 'app/sitemap.ts';
if (fs.existsSync(sitemapPath)) {
  const content = fs.readFileSync(sitemapPath, 'utf8');
  if (!content.includes('/services/bail-applications')) {
    warnings.push(`⚠️  ${sitemapPath}: Bail applications not in sitemap`);
  }
  if (!content.includes('/services/pre-charge-advice')) {
    warnings.push(`⚠️  ${sitemapPath}: Pre-charge advice not in sitemap`);
  }
  if (!content.includes('/services/police-station-representation')) {
    warnings.push(`⚠️  ${sitemapPath}: Police station representation not in sitemap`);
  }
}

// Check 5: JWT_SECRET validation
const middlewarePath = 'lib/middleware.ts';
if (fs.existsSync(middlewarePath)) {
  const content = fs.readFileSync(middlewarePath, 'utf8');
  if (!content.includes('JWT_SECRET')) {
    warnings.push(`⚠️  ${middlewarePath}: JWT_SECRET validation missing`);
  }
}

// Report results
console.log('\n🔍 Deployment Parity Check\n');

if (warnings.length > 0) {
  console.log('Warnings:');
  warnings.forEach(w => console.log(' ', w));
  console.log('');
}

if (errors.length > 0) {
  console.log('Errors (build will fail):');
  errors.forEach(e => console.log(' ', e));
  console.log('\n❌ Deployment parity check FAILED');
  process.exit(1);
} else {
  console.log('✅ All critical checks passed');
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warning(s) - review recommended`);
  }
  process.exit(0);
}

