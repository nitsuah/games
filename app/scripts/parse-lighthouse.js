const fs = require('fs');
const path = require('path');

const reportPath = process.argv[2] || path.resolve(__dirname, '../lighthouse-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('No lighthouse report found at', reportPath);
  console.error('Usage: node scripts/parse-lighthouse.js /path/to/lighthouse.json');
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

function extractConsoleErrors(report) {
  const audit = report.audits && report.audits['errors-in-console'];
  if (!audit || !audit.details || !audit.details.items) return [];
  return audit.details.items;
}

function extractUnusedJs(report) {
  const audit = report.audits && report.audits['unused-javascript'];
  if (!audit || !audit.details || !audit.details.items) return [];
  return audit.details.items;
}

const consoleErrors = extractConsoleErrors(report);
const unusedJs = extractUnusedJs(report);

console.log('Console errors found:', consoleErrors.length);
consoleErrors.forEach((it, i) => {
  console.log(`--- Error ${i+1} ---`);
  console.log(it.source || it.url || it.message || JSON.stringify(it));
});

console.log('\nUnused JS entries found:', unusedJs.length);
unusedJs.slice(0, 20).forEach((it, i) => {
  console.log(`--- Unused ${i+1} ---`);
  console.log('  URL:', it.url || it.source || 'N/A');
  console.log('  Wasted bytes:', it.wastedBytes || it.wasted || it.totalBytes || 'N/A');
});

process.exit(0);
