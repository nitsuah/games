const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('coverage/coverage-final.json', 'utf8'));
  const files = Object.keys(data);
  console.log('Total files tracked:', files.length);

  let fileStats = [];
  files.forEach(f => {
    const cov = data[f];
    const sMap = cov.s;
    const totalStatements = Object.keys(sMap).length;
    if (totalStatements === 0) return;
    const coveredStatements = Object.values(sMap).filter(v => v > 0).length;
    const pct = (coveredStatements / totalStatements) * 100;
    
    fileStats.push({
      file: f.replace('/app/', ''),
      pct: parseFloat(pct.toFixed(2)),
      total: totalStatements,
      covered: coveredStatements
    });
  });

  // Sort: lowest coverage first, then by total statements descending (bigger files first)
  fileStats.sort((a, b) => {
    if (a.pct !== b.pct) {
      return a.pct - b.pct;
    }
    return b.total - a.total;
  });

  console.log('\n--- COVERAGE SUMMARY (Sorted by lowest coverage) ---');
  fileStats.forEach(item => {
    if (item.pct < 75) {
      console.log(`${item.file}: ${item.pct}% (${item.covered}/${item.total} statements covered)`);
    }
  });

  const aggregate = fileStats.reduce((acc, curr) => {
    acc.total += curr.total;
    acc.covered += curr.covered;
    return acc;
  }, { total: 0, covered: 0 });
  
  const overallPct = (aggregate.covered / aggregate.total) * 100;
  console.log(`\nOverall Statements Coverage: ${overallPct.toFixed(2)}% (${aggregate.covered}/${aggregate.total})`);

} catch (err) {
  console.error('Error reading coverage-final.json:', err);
}
