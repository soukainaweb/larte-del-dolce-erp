import fs from 'fs';
import { execSync } from 'child_process';

const files = execSync("rg -l \"tc\\\\('\" src/pages/ --glob '*.jsx'", { cwd: '/workspace' })
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);

for (const f of files) {
  const full = `/workspace/${f}`;
  let c = fs.readFileSync(full, 'utf8');
  const orig = c;
  c = c.replace(/tc\('([^']+)'\)\}\s*:/g, "tc('$1') :");
  if (c !== orig) {
    fs.writeFileSync(full, c);
    console.log('fixed', f);
  }
}
