#!/usr/bin/env node

/**
 * FORESIGHT PARITY & PRODUCTION DOMAIN AUDIT
 * 
 * Comprehensive audit of all pages across all production domains
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Production domains
const PRODUCTION_DOMAINS = [
  'policestationagent.com',
  'policestationagent.net',
  'policestationagent.org',
  'criminaldefencekent.co.uk',
  'policestationrepkent.co.uk',
];

// Non-production domains to check
const NON_PROD_DOMAINS = [
  'one-git-master-robert-cashmans-projects.vercel.app',
  'one-*.vercel.app', // Preview domains
];

// Expected pages from codebase
const EXPECTED_STATIC_PAGES = [
  '/',
  '/about',
  '/accessibility',
  '/accreditedpolicerep',
  '/after-a-police-interview',
  '/afterapoliceinterview',
  '/areas',
  '/arrested-what-to-do',
  '/arrestednow',
  '/arrival-times-delays',
  '/article-interview-under-caution',
  '/article-loved-one-arrested-kent',
  '/article-police-caution-before-interview',
  '/article-rights-kent-police-station-2025',
  '/ashford-police-station',
  '/ashford-psa-station',
  '/ashford-solicitor',
  '/attendanceterms',
  '/blog',
  '/bluewater-police-station',
  '/bluewater-psa-station',
  '/bluewater-solicitor',
  '/booking-in-procedure-in-kent',
  '/bromley-solicitor',
  '/can-we-help',
  '/canterbury-police-station',
  '/canterbury-psa-station',
  '/canterbury-solicitor',
  '/canwehelp',
  '/case-status',
  '/chatham-solicitor',
  '/christmashours',
  '/coldharbour-police-station',
  '/complaints',
  '/contact',
  '/cookies',
  '/court-representation',
  '/courtrepresentation',
  '/coverage',
  '/dartford-solicitor',
  '/deal-solicitor',
  '/dover-police-station',
  '/dover-psa-station',
  '/dover-solicitor',
  '/emergency-police-station-representation',
  '/extendedhours',
  '/f-a-q',
  '/faq',
  '/faversham-solicitor',
  '/fees',
  '/folkestone-police-station',
  '/folkestone-psa-station',
  '/folkestone-solicitor',
  '/for-clients',
  '/for-solicitors',
  '/forsolicitors',
  '/freelegaladvice',
  '/g-d-p-r',
  '/gdpr',
  '/gillingham-solicitor',
  '/gravesend-police-station',
  '/gravesend-solicitor',
  '/guided-assistant',
  '/herne-bay-solicitor',
  '/home',
  '/hours',
  '/importance-of-early-legal-advice',
  '/join',
  '/kent-police-station-reps',
  '/kent-police-stations',
  '/maidstone-police-station',
  '/maidstone-psa-station',
  '/maidstone-solicitor',
  '/margate-police-station',
  '/margate-psa-station',
  '/margate-solicitor',
  '/medway-police-station',
  '/medway-psa-station',
  '/medway-solicitor',
  '/nofurtheractionafterpoliceinterview',
  '/north-kent-gravesend-police-station',
  '/north-kent-gravesend-psa-station',
  '/out-of-area',
  '/outofarea',
  '/police-custody-rights',
  '/police-interview-rights',
  '/police-station-agent-ashford',
  '/police-station-agent-canterbury',
  '/police-station-agent-dartford',
  '/police-station-agent-folkestone',
  '/police-station-agent-gravesend',
  '/police-station-agent-kent',
  '/police-station-agent-maidstone',
  '/police-station-agent-medway',
  '/police-station-agent-sevenoaks',
  '/police-station-agent-sittingbourne',
  '/police-station-agent-tonbridge',
  '/police-station-interviews-kent-rights',
  '/police-stations',
  '/policeinterviewhelp',
  '/policestationreps',
  '/post',
  '/preparing-for-police-interview',
  '/privacy',
  '/private-crime',
  '/privateclientfaq',
  '/privatecrime',
  '/psastations',
  '/ramsgate-solicitor',
  '/refusingpoliceinterview',
  '/repcover',
  '/rochester-solicitor',
  '/sandwich-solicitor',
  '/servicerates',
  '/services',
  '/services/bail-applications',
  '/services/police-station-representation',
  '/services/pre-charge-advice',
  '/servicesvoluntaryinterviews',
  '/sevenoaks-police-station',
  '/sevenoaks-psa-station',
  '/sevenoaks-solicitor',
  '/sittingbourne-police-station',
  '/sittingbourne-psa-station',
  '/sittingbourne-solicitor',
  '/swanley-police-station',
  '/swanley-psa-station',
  '/swanley-solicitor',
  '/terms-and-conditions',
  '/termsandconditions',
  '/testimonials',
  '/tonbridge-police-station',
  '/tonbridge-psa-station',
  '/tonbridge-solicitor',
  '/tunbridge-wells-police-station',
  '/tunbridge-wells-psa-station',
  '/tunbridge-wells-solicitor',
  '/voluntary-interviews',
  '/voluntary-police-interview-risks',
  '/voluntaryinterviews',
  '/vulnerable-adults-in-custody',
  '/what-happens-if-ignore-police-interview',
  '/what-is-a-criminal-solicitor',
  '/what-is-a-police-station-rep',
  '/what-to-do-if-a-loved-one-is-arrested',
  '/what-to-expect-at-a-police-interview-in-kent',
  '/what-we-do',
  '/whatisapolicestationrep',
  '/whitstable-solicitor',
  '/why-use-us',
  '/your-rights-in-custody',
];

function checkPage(domain, path) {
  return new Promise((resolve) => {
    const url = `https://${domain}${path}`;
    const options = {
      hostname: domain,
      path: path,
      method: 'HEAD',
      timeout: 5000,
    };

    const req = https.request(options, (res) => {
      resolve({
        url,
        domain,
        path,
        status: res.statusCode,
        canonical: res.headers['link'] || null,
        location: res.headers['location'] || null,
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        domain,
        path,
        status: 'ERROR',
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        domain,
        path,
        status: 'TIMEOUT',
      });
    });

    req.end();
  });
}

async function checkSitemap(domain) {
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      path: '/sitemap.xml',
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          content: data,
        });
      });
    });

    req.on('error', () => {
      resolve({ status: 'ERROR', content: '' });
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 FORESIGHT PARITY & PRODUCTION DOMAIN AUDIT\n');
  console.log('='.repeat(60));
  console.log('Expected Pages:', EXPECTED_STATIC_PAGES.length);
  console.log('Production Domains:', PRODUCTION_DOMAINS.length);
  console.log('='.repeat(60) + '\n');

  const results = {
    confirmed: [],
    missing: [],
    wrongDomain: [],
    errors: [],
    sitemaps: {},
  };

  // Check sitemaps first
  console.log('📋 Checking sitemaps...\n');
  for (const domain of PRODUCTION_DOMAINS) {
    const sitemap = await checkSitemap(domain);
    results.sitemaps[domain] = sitemap;
    if (sitemap.status === 200) {
      console.log(`✅ ${domain}/sitemap.xml - OK`);
    } else {
      console.log(`❌ ${domain}/sitemap.xml - Status: ${sitemap.status}`);
    }
  }

  // Sample check of key pages on each domain
  console.log('\n🔍 Checking key pages across domains...\n');
  const keyPages = ['/', '/about', '/services', '/blog', '/contact', '/police-stations'];
  
  for (const domain of PRODUCTION_DOMAINS) {
    console.log(`\nChecking ${domain}...`);
    for (const page of keyPages) {
      const result = await checkPage(domain, page);
      if (result.status === 200) {
        console.log(`  ✅ ${page} - OK`);
        results.confirmed.push(result);
      } else if (result.status === 301 || result.status === 302) {
        console.log(`  ↪️  ${page} - Redirects to: ${result.location}`);
        results.wrongDomain.push(result);
      } else {
        console.log(`  ❌ ${page} - Status: ${result.status}`);
        results.missing.push(result);
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Confirmed: ${results.confirmed.length}`);
  console.log(`❌ Missing: ${results.missing.length}`);
  console.log(`⚠️  Wrong Domain/Redirects: ${results.wrongDomain.length}`);
  console.log(`📋 Sitemaps: ${Object.keys(results.sitemaps).filter(d => results.sitemaps[d].status === 200).length}/${PRODUCTION_DOMAINS.length}`);

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    expectedPages: EXPECTED_STATIC_PAGES.length,
    productionDomains: PRODUCTION_DOMAINS,
    results: {
      confirmed: results.confirmed,
      missing: results.missing,
      wrongDomain: results.wrongDomain,
      sitemaps: results.sitemaps,
    },
  };

  fs.writeFileSync(
    'FORESIGHT_PARITY_AUDIT_REPORT.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n✅ Detailed report saved to: FORESIGHT_PARITY_AUDIT_REPORT.json');
  console.log('\n📝 Next: Review the report and check for missing pages.');
}

main().catch(console.error);











