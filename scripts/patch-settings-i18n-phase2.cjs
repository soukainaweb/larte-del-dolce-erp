const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const extra = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings-i18n-locales.json'), 'utf8'));

// Merge ar only
const arPath = path.join(ROOT, 'src', 'i18n', 'locales', 'ar.json');
const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
arData.settings = { ...arData.settings, ...extra.ar };
fs.writeFileSync(arPath, JSON.stringify(arData, null, 2) + '\n');
console.log('merged settings into ar');

// JSX patch - read from patch-settings-i18n.cjs logic
require('./patch-settings-i18n-jsx.cjs');
