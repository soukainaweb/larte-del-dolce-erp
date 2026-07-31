import fs from 'fs';
import { execSync } from 'child_process';

const files = execSync("rg -l \"usePageI18n\" src/pages/ --glob '*.jsx'", { cwd: '/workspace' })
  .toString().trim().split('\n').filter(Boolean);

const hookLine = /^\s*const \{[^}]+\} = usePageI18n\([^)]+\);\s*$/;
const isHandlerOpen = (line) =>
  /=>\s*\{\s*$/.test(line) &&
  (/const handle\w+\s*=/.test(line) ||
    /const \w+Change\s*=/.test(line) ||
    /const \w+ = \(e\) =>/.test(line) ||
    /const \w+ = \(index/.test(line) ||
    /const \w+ = \(key/.test(line) ||
    /const \w+ = \(type/.test(line) ||
    /const \w+ = \(page/.test(line) ||
    /const \w+ = \(item/.test(line) ||
    /const \w+ = \(error/.test(line) ||
    /const \w+ = \(formData/.test(line) ||
    /const \w+ = \(file/.test(line) ||
    /const \w+ = \(field/.test(line) ||
    /const \w+ = \(event/.test(line) ||
    /const \w+ = \(value/.test(line) ||
    /const \w+ = \(status/.test(line) ||
    /const \w+ = \(notification/.test(line) ||
    /const \w+ = \(activity/.test(line) ||
    /const \w+ = \(section/.test(line) ||
    /const \w+ = \(tab/.test(line) ||
    /const \w+ = \(role/.test(line) ||
    /const \w+ = \(user/.test(line) ||
    /const \w+ = \(order/.test(line) ||
    /const \w+ = \(invoice/.test(line) ||
    /const \w+ = \(payment/.test(line) ||
    /const \w+ = \(expense/.test(line) ||
    /const \w+ = \(delivery/.test(line) ||
    /const \w+ = \(supplier/.test(line) ||
    /const \w+ = \(warehouse/.test(line) ||
    /const \w+ = \(product/.test(line) ||
    /const \w+ = \(report/.test(line) ||
    /const \w+ = \(filter/.test(line) ||
    /const \w+ = \(row/.test(line) ||
    /const \w+ = \(col/.test(line) ||
    /const \w+ = \(data/.test(line) ||
    /const \w+ = \(response/.test(line) ||
    /const \w+ = \(result/.test(line) ||
    /const \w+ = \(err/.test(line) ||
    /const \w+ = \(id/.test(line) ||
    /const \w+ = \(name/.test(line) ||
    /const \w+ = \(date/.test(line) ||
    /const \w+ = \(time/.test(line) ||
    /const \w+ = \(amount/.test(line) ||
    /const \w+ = \(method/.test(line) ||
    /const \w+ = \(priority/.test(line) ||
    /const \w+ = \(module/.test(line) ||
    /const \w+ = \(action/.test(line) ||
    /const \w+ = \(level/.test(line) ||
    /const \w+ = \(period/.test(line) ||
    /const \w+ = \(mode/.test(line) ||
    /const \w+ = \(view/.test(line) ||
    /const \w+ = \(sort/.test(line) ||
    /const \w+ = \(query/.test(line) ||
    /const \w+ = \(term/.test(line) ||
    /const \w+ = \(search/.test(line) ||
    /const \w+ = \(selected/.test(line) ||
    /const \w+ = \(checked/.test(line) ||
    /const \w+ = \(open/.test(line) ||
    /const \w+ = \(close/.test(line) ||
    /const \w+ = \(toggle/.test(line) ||
    /const \w+ = \(reset/.test(line) ||
    /const \w+ = \(apply/.test(line) ||
    /const \w+ = \(confirm/.test(line) ||
    /const \w+ = \(cancel/.test(line) ||
    /const \w+ = \(save/.test(line) ||
    /const \w+ = \(submit/.test(line) ||
    /const \w+ = \(load/.test(line) ||
    /const \w+ = \(fetch/.test(line) ||
    /const \w+ = \(refresh/.test(line) ||
    /const \w+ = \(export/.test(line) ||
    /const \w+ = \(import/.test(line) ||
    /const \w+ = \(print/.test(line) ||
    /const \w+ = \(download/.test(line) ||
    /const \w+ = \(upload/.test(line) ||
    /const \w+ = \(delete/.test(line) ||
    /const \w+ = \(remove/.test(line) ||
    /const \w+ = \(add/.test(line) ||
    /const \w+ = \(create/.test(line) ||
    /const \w+ = \(update/.test(line) ||
    /const \w+ = \(edit/.test(line) ||
    /const \w+ = \(view/.test(line) ||
    /const \w+ = \(show/.test(line) ||
    /const \w+ = \(hide/.test(line) ||
    /const \w+ = \(navigate/.test(line) ||
    /const \w+ = \(copy/.test(line) ||
    /const \w+ = \(format/.test(line) ||
    /const \w+ = \(parse/.test(line) ||
    /const \w+ = \(validate/.test(line) ||
    /const \w+ = \(calculate/.test(line) ||
    /const \w+ = \(compute/.test(line) ||
    /const \w+ = \(get/.test(line) ||
    /const \w+ = \(set/.test(line) ||
    /const \w+ = \(on/.test(line));

for (const f of files) {
  const full = `/workspace/${f}`;
  const lines = fs.readFileSync(full, 'utf8').split('\n');
  const out = [];
  let removed = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prev = out[out.length - 1] || '';
    if (hookLine.test(line) && isHandlerOpen(prev)) {
      removed++;
      continue;
    }
    out.push(line);
  }
  if (removed > 0) {
    fs.writeFileSync(full, out.join('\n'));
    console.log(`Removed ${removed} invalid hooks from ${f}`);
  }
}
