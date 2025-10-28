const fs = require('fs');
const path = require('path');

const reportPath = path.resolve(__dirname, '../lighthouse-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('No lighthouse-report.json found at', reportPath);
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

function extractColorContrastItems(report) {
  if (!report || !report.audits) return [];
  const audit = report.audits['color-contrast'];
  if (audit && audit.details && Array.isArray(audit.details.items)) return audit.details.items;
  return [];
}

const fails = extractColorContrastItems(report);
if (!fails.length) {
  console.log('No color-contrast audit items found in report.');
  process.exit(0);
}

console.log('Found', fails.length, 'color-contrast items. Showing compact info:\n');
fails.forEach((it, idx) => {
  console.log(`Item ${idx+1}:`);
  console.log('  Node:', it.node || it.selector || JSON.stringify(it));
  console.log('  Foreground:', it.foregroundColor || it.fgColor || it.color || 'N/A');
  console.log('  Background:', it.backgroundColor || it.bgColor || 'N/A');
  console.log('  Ratio:', it.contrastRatio || it.ratio || 'N/A');
  console.log('  Failure Summary:', it.failureSummary || it.note || it.description || 'N/A');
  console.log('');
});

process.exit(0);
