const { extractConsoleErrors, extractUnusedJs } = require('../../scripts/parse-lighthouse');
const { extractColorContrastItems } = require('../../scripts/parse-lighthouse-contrast');

const report = (id, items) => ({ audits: { [id]: { details: { items } } } });

describe.each([
  ['extractConsoleErrors', extractConsoleErrors, 'errors-in-console'],
  ['extractUnusedJs', extractUnusedJs, 'unused-javascript'],
])('%s', (_name, extract, auditId) => {
  test('returns the audit items', () => {
    expect(extract(report(auditId, [{ source: 'a' }]))).toEqual([{ source: 'a' }]);
  });

  test('returns [] when audits, details or items are missing', () => {
    expect(extract({})).toEqual([]);
    expect(extract({ audits: { [auditId]: {} } })).toEqual([]);
    expect(extract({ audits: { [auditId]: { details: {} } } })).toEqual([]);
  });
});

describe('extractColorContrastItems', () => {
  test('returns the color-contrast items', () => {
    expect(extractColorContrastItems(report('color-contrast', [{ node: 'p' }]))).toEqual([{ node: 'p' }]);
  });

  test('returns [] for null, empty or non-array items', () => {
    expect(extractColorContrastItems(null)).toEqual([]);
    expect(extractColorContrastItems({})).toEqual([]);
    expect(extractColorContrastItems(report('color-contrast', 'nope'))).toEqual([]);
  });
});
