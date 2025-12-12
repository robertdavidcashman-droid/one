/**
 * Apply menu approvals from config
 */

import * as fs from 'fs';
import * as path from 'path';

const CONFIG_DIR = path.join(__dirname, '..', 'config');
const CONFIG_PATH = path.join(CONFIG_DIR, 'menu-approval.json');

interface MenuConfig {
  approvedRoutes: string[];
  rejectedRoutes: string[];
  customLabels: { [route: string]: string };
  customSection: { [route: string]: string };
}

function loadConfig(): MenuConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found: ${CONFIG_PATH}\nRun 'npm run site:propose-menu' first.`);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function validateConfig(config: MenuConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(config.approvedRoutes)) {
    errors.push('approvedRoutes must be an array');
  }
  if (!Array.isArray(config.rejectedRoutes)) {
    errors.push('rejectedRoutes must be an array');
  }
  if (typeof config.customLabels !== 'object') {
    errors.push('customLabels must be an object');
  }
  if (typeof config.customSection !== 'object') {
    errors.push('customSection must be an object');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function applyMenu() {
  console.log('🔧 Applying menu configuration...\n');

  const config = loadConfig();
  const validation = validateConfig(config);

  if (!validation.valid) {
    console.error('❌ Configuration errors:');
    validation.errors.forEach(err => console.error(`   - ${err}`));
    process.exit(1);
  }

  console.log(`✅ Configuration loaded:\n`);
  console.log(`   Approved routes: ${config.approvedRoutes.length}`);
  console.log(`   Rejected routes: ${config.rejectedRoutes.length}`);
  console.log(`   Custom labels: ${Object.keys(config.customLabels).length}`);
  console.log(`   Custom sections: ${Object.keys(config.customSection).length}\n`);

  if (config.approvedRoutes.length > 0) {
    console.log('📋 Approved routes to add to menu:\n');
    config.approvedRoutes.forEach(route => {
      const label = config.customLabels[route] || route;
      const section = config.customSection[route] || 'Information';
      console.log(`   - ${label} (${route}) → ${section}`);
    });
  }

  console.log('\n✅ Menu configuration validated.');
  console.log('   Note: Menu rendering must be updated in Header.tsx to use this config.\n');
}

if (require.main === module) {
  applyMenu();
}

export { loadConfig, validateConfig };

