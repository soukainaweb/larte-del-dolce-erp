const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'pages');

const FILES = [
  'suppliers/SuppliersPage.jsx',
  'deliveries/DeliveriesPage.jsx',
  'categories/CategoriesPage.jsx',
  'inventory/InventoryPage.jsx',
  'warehouse/WarehousePage.jsx',
  'payments/PaymentsPage.jsx',
  'expenses/ExpensesPage.jsx',
  'production/ProductionPage.jsx',
  'finance/FinancePage.jsx',
  'settings/SettingsPage.jsx',
  'dashboardhome/DashboardHome.jsx',
  'reports/ReportsPage.jsx',
  'analytics/AnalyticsPage.jsx',
  'notifications/NotificationsPage.jsx',
  'activitylog/ActivityLogPage.jsx',
  'myprofile/MyProfilePage.jsx',
  'RolesPermissions/RolesPermissionsPage.jsx',
  'RolesPermissions/components/UsersManagement.jsx',
  'RolesPermissions/components/ViewRoleModal.jsx',
  'RolesPermissions/components/RoleCard.jsx',
  'RolesPermissions/components/DeleteConfirmModal.jsx',
  'RolesPermissions/components/RoleUsersModal.jsx',
  'RolesPermissions/components/PermissionsModal.jsx',
];

function depthPrefix(content) {
  if (content.includes("'../../hooks/usePageI18n'") || content.includes("'../../contexts/")) return '../../';
  if (content.includes("'../../../")) return '../../../';
  return '../../';
}

function ensureImports(content) {
  const d = depthPrefix(content);
  let c = content;

  if (!c.includes("from 'react-i18next'")) {
    if (c.includes("import { usePageI18n }")) {
      c = c.replace("import { usePageI18n }", "import { useTranslation } from 'react-i18next';\nimport { usePageI18n }");
    } else if (c.includes("import { useAuth }")) {
      c = c.replace("import { useAuth }", "import { useTranslation } from 'react-i18next';\nimport { useAuth }");
    }
  }

  if (!c.includes('formatAppDate')) {
    const anchor = c.match(/import.*usePageI18n.*\n/);
    if (anchor) {
      c = c.replace(anchor[0], `${anchor[0]}import { getCurrentLanguage } from '${d}i18n/language';\nimport { formatAppDate } from '${d}utils/dateFormat';\n`);
    }
  }

  return c;
}

function replaceDates(content) {
  return content
    .replace(/new Date\(([^)]+)\)\.toLocaleDateString\(['"]fr-FR['"]\)/g, 'formatAppDate($1, getCurrentLanguage())')
    .replace(/(\w+)\.toLocaleDateString\(['"]fr-FR['"]\)/g, 'formatAppDate($1, getCurrentLanguage())')
    .replace(/new Date\(([^)]+)\)\.toLocaleTimeString\(['"]fr-FR['"],\s*\{[^}]+\}\)/g, "formatAppDate($1, getCurrentLanguage(), 'HH:mm')");
}

const COMMON = [
  ["'Enregistrement...'", "t('common.saving', { defaultValue: t('form.saving', { defaultValue: 'Saving...' }) })"],
  ["'Suppression...'", "t('common.deleting', { defaultValue: 'Deleting...' })"],
  ["'Mettre à jour'", "t('common.update')"],
  ["'Ajouter'", "t('common.add')"],
  ["'Annuler'", "t('common.cancel')"],
  ["'Fermer'", "t('common.close')"],
  ["'Supprimer'", "t('common.delete')"],
  ["'Confirmer'", "t('common.confirm')"],
  ["'Impossible'", "t('common.cannotDelete', { defaultValue: 'Cannot delete' })"],
  ["'Sauvegarder'", "t('common.save')"],
  ["'Actif'", "t('common.active')"],
  ["'Inactif'", "t('common.inactive')"],
  ["'En attente'", "t('common.pending')"],
];

for (const rel of FILES) {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) {
    console.log('missing', rel);
    continue;
  }
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;
  c = ensureImports(c);
  c = replaceDates(c);
  if (c !== orig) {
    fs.writeFileSync(fp, c);
    console.log('patched', rel);
  }
}

console.log('done');
