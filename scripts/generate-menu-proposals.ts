/**
 * Generate menu proposals for hidden pages
 */

import * as fs from 'fs';
import * as path from 'path';
import { runAudit } from './site-audit';

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const CONFIG_DIR = path.join(__dirname, '..', 'config');

interface MenuProposal {
  route: string;
  title: string;
  suggestedSection: string;
  suggestedLabel: string;
  confidence: number;
  reason: string;
}

/**
 * Infer menu section from route
 */
function inferSection(route: string, title?: string): string {
  const routeLower = route.toLowerCase();
  const titleLower = (title || '').toLowerCase();

  if (routeLower.includes('police-station') || routeLower.includes('station') || routeLower.includes('coverage')) {
    return 'Coverage';
  }
  if (routeLower.includes('service') || routeLower.includes('what-we-do')) {
    return 'Services';
  }
  if (routeLower.includes('solicitor') || routeLower.includes('agent')) {
    return 'Coverage';
  }
  if (routeLower.includes('blog') || routeLower.includes('article')) {
    return 'Articles';
  }
  if (routeLower.includes('about') || routeLower.includes('why-use')) {
    return 'About';
  }
  if (routeLower.includes('contact') || routeLower.includes('help')) {
    return 'Contact';
  }
  if (routeLower.includes('faq') || routeLower.includes('information')) {
    return 'Information';
  }
  
  return 'Information';
}

/**
 * Generate label from route and title
 */
function generateLabel(route: string, title?: string, h1?: string): string {
  if (h1) return h1;
  if (title) {
    // Remove site name suffix if present
    return title.replace(/\s*\|\s*Police Station Agent.*$/i, '').trim();
  }
  
  // Generate from route
  return route
    .split('/')
    .filter(Boolean)
    .map(part => part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
    .join(' - ') || 'Home';
}

/**
 * Calculate confidence score
 */
function calculateConfidence(route: string, title?: string, h1?: string): number {
  let score = 0.5; // Base score
  
  if (title) score += 0.2;
  if (h1) score += 0.2;
  if (route.length < 30) score += 0.1; // Shorter routes are usually more important
  
  // Penalize certain patterns
  if (route.includes('article-')) score -= 0.1;
  if (route.includes('psa-')) score -= 0.1;
  
  return Math.min(1.0, Math.max(0.0, score));
}

function generateProposals() {
  console.log('📋 Generating menu proposals...\n');

  const auditReport = runAudit();
  const proposals: MenuProposal[] = [];

  auditReport.hiddenRoutes.forEach(route => {
    const section = inferSection(route.route, route.title);
    const label = generateLabel(route.route, route.title, route.h1);
    const confidence = calculateConfidence(route.route, route.title, route.h1);

    proposals.push({
      route: route.route,
      title: route.title || route.h1 || route.route,
      suggestedSection: section,
      suggestedLabel: label,
      confidence,
      reason: confidence > 0.7 ? 'High confidence - has title/H1' : 'Medium confidence - inferred from route',
    });
  });

  // Sort by confidence
  proposals.sort((a, b) => b.confidence - a.confidence);

  // Write proposals
  const proposalsPath = path.join(REPORTS_DIR, 'hidden-pages-proposed-menu.json');
  fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2));

  console.log(`✅ Generated ${proposals.length} menu proposals`);
  console.log(`   Saved to: ${proposalsPath}\n`);

  console.log('📊 Top proposals:\n');
  proposals.slice(0, 10).forEach((proposal, i) => {
    console.log(`   ${i + 1}. ${proposal.suggestedLabel} (${proposal.confidence.toFixed(2)})`);
    console.log(`      Route: ${proposal.route}`);
    console.log(`      Section: ${proposal.suggestedSection}\n`);
  });

  // Create default config if it doesn't exist
  const configPath = path.join(CONFIG_DIR, 'menu-approval.json');
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      approvedRoutes: [] as string[],
      rejectedRoutes: [] as string[],
      customLabels: {} as { [route: string]: string },
      customSection: {} as { [route: string]: string },
    };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(`✅ Created default config at: ${configPath}`);
    console.log(`   Edit this file to approve/reject menu items\n`);
  }

  return proposals;
}

if (require.main === module) {
  generateProposals();
}

export { generateProposals };













