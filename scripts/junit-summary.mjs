// Turns a Playwright JUnit file into a Markdown table for the GitHub Actions job summary.
// Usage: node scripts/junit-summary.mjs results.xml >> "$GITHUB_STEP_SUMMARY"
import { existsSync, readFileSync } from 'node:fs';

const file = process.argv[2] ?? 'results.xml';
if (!existsSync(file)) {
  console.log(`## ⚠️ Playwright results\n\nNo JUnit file found at \`${file}\`.`);
  process.exit(0);
}
const xml = readFileSync(file, 'utf8');

const decode = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const attrOf = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

const root = xml.match(/<testsuites\b[^>]*>/)?.[0] ?? '';
const num = (name) => Number(attrOf(root, name) ?? 0);

const total = num('tests');
const failed = num('failures') + num('errors');
const skipped = num('skipped');
const passed = total - failed - skipped;
const seconds = num('time').toFixed(1);

// Look inside each <testcase> body, since <failure> may follow <properties> or other children.
const testcases = [...xml.matchAll(/<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g)].map(([, attrs, body = '']) => ({
  label: `\`${decode(attrOf(attrs, 'classname') ?? '')}\` › ${decode(attrOf(attrs, 'name') ?? '')}`,
  body,
}));

const failures = testcases.filter(({ body }) => /<(failure|error)\b/.test(body)).map(({ label }) => `- ${label}`);

// Test annotations arrive as <property> entries. Heals mean a primary locator broke and
// a fallback was used: the run passed, but the page object needs fixing.
const propertyValues = (body, name) =>
  [...body.matchAll(new RegExp(`<property\\b[^>]*name="${name}"[^>]*value="([^"]*)"`, 'g'))].map(([, v]) => decode(v));
const heals = testcases
  .filter(({ body }) => propertyValues(body, 'expected-heal').length === 0)
  .flatMap(({ label, body }) => propertyValues(body, 'self-healed-locator').map((heal) => `- ${label}<br>${heal}`));

const lines = [
  `## ${failed === 0 ? '✅' : '❌'} Playwright results`,
  '',
  '| Total | Passed | Failed | Skipped | Duration |',
  '| ----: | -----: | -----: | ------: | -------: |',
  `| ${total} | ${passed} | ${failed} | ${skipped} | ${seconds}s |`,
];

if (failures.length) lines.push('', '### Failed tests', ...failures);
if (heals.length) {
  lines.push('', `### 🩹 Self-healed locators (${heals.length})`, 'These tests passed via a fallback locator. Update the primary locator in the page object.', ...heals);
}

console.log(lines.join('\n'));
