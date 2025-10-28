const fs = require('fs');
const path = require('path');

const reportPath = path.resolve(__dirname, '../lighthouse-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('No lighthouse-report.json found at', reportPath);
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const audits = report.audits || report.reportCategories || report.categories || report;

function findColorContrast(auditObj) {
  if (!auditObj) return [];
  const results = [];
  // try known paths
  const contrastAudit = auditObj['color-contrast'] || auditObj['accessibility'] && auditObj['accessibility'].details && auditObj['accessibility'].details.items && auditObj['accessibility'].details.items.filter(i=>i.name==='color-contrast');
  if (report.audits && report.audits['color-contrast']) {
    const details = report.audits['color-contrast'].details;
    if (details && details.items) {
      details.items.forEach(item => results.push(item));
    }
  } else if (report.categories && report.categories.accessibility && report.categories.accessibility.auditRefs) {
    // older formats
  }
  return results;
}

const fails = findColorContrast(report);
if (!fails.length) {
  console.log('No color-contrast audit items found in report.');
  process.exit(0);
}

console.log('Found', fails.length, 'color-contrast items. Showing compact info:\n');
fails.forEach((it, idx) => {
  console.log(`Item ${idx+1}:`);
  console.log('  Node:', it.node || it.selector || it.selector || it.selector || JSON.stringify(it));
  console.log('  Foreground:', it.foregroundColor || it.fgColor || it.fg || it.color || 'N/A');
  console.log('  Background:', it.backgroundColor || it.bgColor || it.bg || 'N/A');
  console.log('  Ratio:', it.contrastRatio || it.ratio || 'N/A');
  console.log('  Failure Summary:', it.failureSummary || it.note || it.description || 'N/A');
  console.log('');
});

process.exit(0);
