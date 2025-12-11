/**
 * Fix Build Errors - Fix broken metadata strings
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

async function fixBrokenMetadata(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let fixed = false;

    // Fix broken title strings
    const brokenTitlePattern = /title:\s*"\s*\n\s*Police Station Agent\s*\n\s*\|\s*Police Station Agent"/g;
    if (brokenTitlePattern.test(content)) {
      const route = filePath.replace(/.*app[\\\/]([^\\\/]+)[\\\/]page\.tsx$/, '$1');
      const pageName = route.split(/[\/\\-]/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      content = content.replace(brokenTitlePattern, `title: "${pageName} | Police Station Agent"`);
      fixed = true;
    }

    // Fix broken description strings
    const brokenDescPattern = /description:\s*"\s*\n\s*Police Station Agent\s*\n\s*"/g;
    if (brokenDescPattern.test(content)) {
      content = content.replace(brokenDescPattern, 'description: "Police Station Agent services and information"');
      fixed = true;
    }

    if (fixed) {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing build errors...\n');

  // Find all page.tsx files with broken metadata
  const files = await glob('app/**/page.tsx', { ignore: ['node_modules/**'] });
  
  let fixedCount = 0;
  for (const file of files) {
    if (await fixBrokenMetadata(file)) {
      fixedCount++;
      console.log(`✅ Fixed: ${file}`);
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} files`);

  // Check if PostDetail component exists
  const postDetailPath = path.join('components', 'PostDetail.tsx');
  try {
    await fs.access(postDetailPath);
    console.log('✅ PostDetail component exists');
  } catch {
    console.log('⚠️  PostDetail component missing - creating placeholder...');
    const postDetailContent = `'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PostDetail() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !slug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
        <Header />
        <main className="flex-grow p-8">
          <div className="max-w-4xl mx-auto">
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 flex flex-col">
      <Header />
      <main className="flex-grow p-8">
        <div className="max-w-4xl mx-auto">
          <h1>Blog Post: {slug}</h1>
          <p>Post content will be loaded here.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
`;
    await fs.writeFile(postDetailPath, postDetailContent, 'utf8');
    console.log('✅ Created PostDetail component');
  }

  console.log('\n✅ Build errors fixed! Try running: npm run build');
}

main().catch(console.error);

