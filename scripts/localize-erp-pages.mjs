#!/usr/bin/env node
/**
 * Applies Arabic i18n patterns to ERP page components.
 * Replaces fr-FR dates, injects usePageI18n in subcomponents, maps French UI strings.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATE_LOCALE = 'ar-SA';

const PAGES = [
  { file: 'src/pages/orders/OrdersPage.jsx', ns: 'orders' },
  { file: 'src/pages/invoices/InvoicesPage.jsx', ns: 'invoices' },
  { file: 'src/pages/payments/PaymentsPage.jsx', ns: 'payments' },
  { file: 'src/pages/expenses/ExpensesPage.jsx', ns: 'expenses' },
  { file: 'src/pages/deliveries/DeliveriesPage.jsx', ns: 'deliveries' },
  { file: 'src/pages/production/ProductionPage.jsx', ns: 'production' },
  { file: 'src/pages/inventory/InventoryPage.jsx', ns: 'inventory' },
  { file: 'src/pages/warehouse/WarehousePage.jsx', ns: 'warehouse' },
  { file: 'src/pages/suppliers/SuppliersPage.jsx', ns: 'suppliers' },
  { file: 'src/pages/notifications/NotificationsPage.jsx', ns: 'notifications' },
  { file: 'src/pages/reports/ReportsPage.jsx', ns: 'reports' },
  { file: 'src/pages/analytics/AnalyticsPage.jsx', ns: 'analytics' },
  { file: 'src/pages/activitylog/ActivityLogPage.jsx', ns: 'activityLog' },
  { file: 'src/pages/settings/SettingsPage.jsx', ns: 'settings' },
  { file: 'src/pages/myprofile/MyProfilePage.jsx', ns: 'profile' },
];

const FRENCH_RE = /[àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ]|Brouillon|En attente|Annul|Modifier|Supprimer|Voir|Chargement|Aucun|Nouvelle|Liste des|Tous les|Informations|Résumé|Sous-total|Remise|Enregistrement|Mettre|Créer|Fermer|Actualiser|Commercial|Priorité|Payée|Partielle|Espèces|Carte|Virement|Crédit|Ajouter|Quantité|Erreur|Affichage|Validée|Livrée|Refusée|Archivée|Prête|Impossible|Attention|Sélectionner|Comptant|Mensuel|Actif|Inactif|Matières|Emballages|Équipements|Services|Autre|Non défini|Non pay|En retard|Envoyée|Échéance|Livraison|TVA|Montant|Détails|Faible|Moyenne|Haute|Critique|Partiel|Employé|profil|personnelles|professionnelles|Utilisateur|produits|commandes|factures|paiements|dépenses|livraisons|fournisseurs|marchandises|entrepôt|production|rapports|analyses|notifications|paramètres|activité/i;

/** Global JSX text / attribute replacements (order matters – longer first) */
const GLOBAL_REPLACEMENTS = [
  ["title=\"Actualiser\"", 'title={actions.refresh}'],
  ["title=\"Vue tableau\"", "title={tc('tableView')}"],
  ["title=\"Vue grille\"", "title={tc('gridView')}"],
  ["title=\"Voir\"", 'title={actions.view}'],
  ["title=\"Modifier\"", 'title={actions.edit}'],
  ["title=\"Supprimer\"", 'title={actions.delete}'],
  ['>Annuler<', '>{tc(\'cancel\')}<'],
  ['>Supprimer<', '>{tc(\'delete\')}<'],
  ['>Fermer<', '>{tc(\'close\')}<'],
  ['>Modifier<', '>{tc(\'edit\')}<'],
  ['>Créer<', '>{tc(\'create\')}<'],
  ['>Notes<', '>{tc(\'notes\')}<'],
  ['>Client<', '>{tc(\'customer\')}<'],
  ['>Statut<', '>{tc(\'status\')}<'],
  ['>Actions<', '>{tc(\'actions\')}<'],
  ['>Date<', '>{tc(\'date\')}<'],
  ['>Total<', '>{tc(\'total\')}<'],
  ['>Produits<', '>{tc(\'product\')}<'],
  ['>Priorité<', '>{tc(\'priority\')}<'],
  ['>Commercial<', ">{t('orders.table.rep')}<"],
  ['>Montant<', '>{tc(\'amount\')}<'],
  ['>Méthode<', '>{tc(\'method\')}<'],
  ['>Payé<', ">{t('common.statuses.paid')}<"],
  ['>Sélectionner<', ">{tc('selectOption')}<"],
  ['>Impossible<', ">{tc('impossible')}<"],
  ["'Enregistrement...'", "{tc('saving')}"],
  ["'Suppression...'", "{tc('deleting')}"],
  ["'Mettre à jour'", "{tc('update')}"],
  ["toLocaleDateString('fr-FR')", 'toLocaleDateString(DATE_LOCALE)'],
  ["toLocaleString('fr-FR')", 'toLocaleString(DATE_LOCALE)'],
  ["toLocaleDateString(\"fr-FR\")", 'toLocaleDateString(DATE_LOCALE)'],
  ["toLocaleString(\"fr-FR\")", 'toLocaleString(DATE_LOCALE)'],
];

function ensureImport(content) {
  if (!content.includes("usePageI18n")) {
    content = content.replace(
      /(import \{ useAuth \} from ['"][^'"]+['"];?\n)/,
      `$1import { usePageI18n } from '../../hooks/usePageI18n';\n`
    );
  }
  return content;
}

function ensureDateLocale(content) {
  if (!content.includes('DATE_LOCALE')) {
    content = content.replace(
      /(const FONT_BODY = [^;]+;)/,
      `$1\nconst DATE_LOCALE = '${DATE_LOCALE}';`
    );
  }
  return content;
}

function upgradeMainHook(content, ns) {
  // Expand minimal hook destructuring in main page component
  const patterns = [
    [
      new RegExp(`const \\{ title, subtitle, searchPlaceholder, t \\} = usePageI18n\\('${ns}'\\);`, 'g'),
      `const { title, subtitle, searchPlaceholder, t, tc, actions, commonStatus, statusLabel } = usePageI18n('${ns}');`,
    ],
    [
      new RegExp(`const \\{ title, subtitle, searchPlaceholder, t, tc \\} = usePageI18n\\('${ns}'\\);`, 'g'),
      `const { title, subtitle, searchPlaceholder, t, tc, actions, commonStatus, statusLabel } = usePageI18n('${ns}');`,
    ],
  ];
  for (const [re, repl] of patterns) {
    content = content.replace(re, repl);
  }
  return content;
}

function injectHooksInComponents(content, ns) {
  const componentRe = /const (\w+) = \(([^)]*)\) => \{/g;
  let match;
  const inserts = [];

  while ((match = componentRe.exec(content)) !== null) {
    const name = match[1];
    const start = match.index + match[0].length;
    // Find end of this component (rough: next same-level const or export)
    const rest = content.slice(start);
    const endMatch = rest.match(/\nconst \w+ = |\nexport default/);
    const bodyLen = endMatch ? endMatch.index : Math.min(rest.length, 8000);
    const body = rest.slice(0, bodyLen);

    if (!FRENCH_RE.test(body)) continue;
    if (body.includes('usePageI18n')) continue;
    if (name === 'OrdersPage' || name.endsWith('Page')) continue; // main handled separately

    const needsStatus = /statusConfig|StatusBadge|priorityConfig|PaymentBadge|paymentStatus|status ===/.test(body);
    const needsActions = /title=\{actions|title=\"Voir\"|title=\"Modifier\"|title=\"Supprimer\"|title=\"Actualiser\"/.test(body);
    const hookParts = ['t', 'tc'];
    if (needsActions || /actions\./.test(body)) hookParts.push('actions');
    if (needsStatus) hookParts.push('statusLabel', 'commonStatus');

    const hookLine = `\n  const { ${[...new Set(hookParts)].join(', ')} } = usePageI18n('${ns}');`;
    inserts.push({ pos: start, line: hookLine });
  }

  // Apply inserts in reverse order to preserve positions
  inserts.sort((a, b) => b.pos - a.pos);
  for (const { pos, line } of inserts) {
    content = content.slice(0, pos) + line + content.slice(pos);
  }
  return content;
}

function applyGlobalReplacements(content) {
  for (const [from, to] of GLOBAL_REPLACEMENTS) {
    content = content.split(from).join(to);
  }
  return content;
}

function localizeOrdersStatusBadge(content) {
  const old = `const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { label: 'Brouillon', class: 'bg-gray-50 text-gray-600 border-gray-200' },
    pending: { label: 'En attente', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    validated: { label: 'Validée', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    in_production: { label: 'En production', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    ready: { label: 'Prête', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    in_delivery: { label: 'En livraison', class: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    delivered: { label: 'Livrée', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Annulée', class: 'bg-rose-50 text-rose-700 border-rose-200' },
    rejected: { label: 'Refusée', class: 'bg-red-50 text-red-700 border-red-200' },
    archived: { label: 'Archivée', class: 'bg-gray-50 text-gray-500 border-gray-200' }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full border \${config.class}\`}>
      {config.label}
    </span>
  );
};`;

  const neu = `const StatusBadge = ({ status }) => {
  const { statusLabel } = usePageI18n('orders');
  const classes = {
    draft: 'bg-gray-50 text-gray-600 border-gray-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    validated: 'bg-blue-50 text-blue-700 border-blue-200',
    in_production: 'bg-purple-50 text-purple-700 border-purple-200',
    ready: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    in_delivery: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    archived: 'bg-gray-50 text-gray-500 border-gray-200',
  };
  const key = status || 'draft';
  return (
    <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full border \${classes[key] || classes.draft}\`}>
      {statusLabel(key)}
    </span>
  );
};`;

  if (content.includes(old)) content = content.replace(old, neu);
  return content;
}

function processFile({ file, ns }) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    console.warn('Skip missing:', file);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  content = ensureImport(content);
  content = ensureDateLocale(content);
  content = upgradeMainHook(content, ns);
  content = injectHooksInComponents(content, ns);
  content = applyGlobalReplacements(content);

  if (ns === 'orders') {
    content = localizeOrdersStatusBadge(content);
  }

  if (content !== original) {
    fs.writeFileSync(fullPath, content);
    console.log('Updated:', file);
    return true;
  }
  console.log('No changes:', file);
  return false;
}

let count = 0;
for (const page of PAGES) {
  if (processFile(page)) count++;
}
console.log(`\nModified ${count} files.`);
