import fs from 'fs';
import { execSync } from 'child_process';

const files = execSync(
  'rg -l "api\\.(get|post|put|patch|delete)" src/services src/pages --glob "*.{js,jsx}"',
  { encoding: 'utf8', cwd: '/workspace' }
)
  .trim()
  .split('\n')
  .filter(Boolean);

const calls = new Set();
const re = /api\.(get|post|put|patch|delete)\(\s*[`'"]([^`'"]+)[`'"]/g;

for (const file of files) {
  const content = fs.readFileSync(`/workspace/${file}`, 'utf8');
  let match;
  while ((match = re.exec(content))) {
    const method = match[1].toUpperCase();
    const path = match[2]
      .replace(/\$\{[^}]+\}/g, '*')
      .replace(/^\//, '');
    calls.add(`${method} ${path}`);
  }
}

const backend = new Set(
  fs.readFileSync('/tmp/backend_routes.txt', 'utf8').trim().split('\n')
);

const missing = [...calls].filter((call) => !backend.has(call)).sort();

console.log(`Frontend API calls: ${calls.size}`);
console.log(`Backend routes: ${backend.size}`);
console.log(`Potentially missing: ${missing.length}`);
missing.forEach((entry) => console.log(` - ${entry}`));
