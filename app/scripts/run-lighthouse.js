#!/usr/bin/env node

/**
 * Run Lighthouse audit locally in desktop mode
 * Generates lighthouse-report.json for analysis
 */

const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runLighthouse() {
  const url = 'http://localhost:3000';
  
  console.log('🚀 Starting Chrome (non-headless for WebGL support)...');
  const chrome = await chromeLauncher.launch({
    // Don't use headless - WebGL/Three.js needs real GPU context
    chromeFlags: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
    // Desktop configuration to match CI
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
  };

  console.log(`📊 Running Lighthouse audit on ${url}...`);
  console.log('⚙️  Configuration: Desktop mode, 1350x940');
  
  try {
    const runnerResult = await lighthouse(url, options);

    // Save the report
    const reportPath = path.join(__dirname, '..', 'lighthouse-report.json');
    fs.writeFileSync(reportPath, runnerResult.report);
    console.log(`✅ Report saved to: ${reportPath}`);

    // Print summary
    const { lhr } = runnerResult;
    console.log('\n📈 Lighthouse Scores:');
    console.log(`  Performance: ${Math.round(lhr.categories.performance.score * 100)}`);
    console.log(`  Accessibility: ${Math.round(lhr.categories.accessibility.score * 100)}`);
    console.log(`  Best Practices: ${Math.round(lhr.categories['best-practices'].score * 100)}`);
    console.log(`  SEO: ${Math.round(lhr.categories.seo.score * 100)}`);

    // Check for critical issues
    const errors = [];
    Object.values(lhr.audits).forEach(audit => {
      if (audit.score !== null && audit.score < 1 && audit.scoreDisplayMode === 'binary') {
        errors.push(`  ❌ ${audit.title}`);
      }
    });

    if (errors.length > 0) {
      console.log('\n⚠️  Failed Audits:');
      errors.forEach(err => console.log(err));
    } else {
      console.log('\n✅ All critical audits passed!');
    }

  } catch (error) {
    console.error('❌ Lighthouse failed:', error.message);
    process.exit(1);
  } finally {
    await chrome.kill();
  }
}

// Check if server is running
console.log('⚠️  Make sure dev server is running: npm run dev');
console.log('   (or build + start for production test)\n');

runLighthouse().catch(err => {
  console.error(err);
  process.exit(1);
});
