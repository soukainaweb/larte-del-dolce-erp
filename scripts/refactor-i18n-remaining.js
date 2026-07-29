/**
 * Mechanical i18n fixes: imports + toLocaleDateString('fr-FR') -> formatAppDate
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'pages');

const PAGE_FILES = [
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

function ensureImports(content) {
  let updated = content;

  if (!updated.includes("from 'react-i18next'") && !updated.includes('from "react-i18next"')) {
    if (updated.includes("import { usePageI18n }")) {
      updated = updated.replace(
        "import { usePageI18n }",
        "import { useTranslation } from 'react-i18next';\nimport { usePageI18n }"
      );
    } else if (updated.includes('useTranslation')) {
      // already has useTranslation somewhere
    } else if (updated.match(/\.jsx$/)) {
      const lucideMatch = updated.match(/} from 'lucide-react';/);
      if (lucideMatch) {
        updated = updated.replace(
          "} from 'lucide-react';",
          "} from 'lucide-react';\nimport { useTranslation } from 'react-i18next';"
        );
      }
    }
  }

  if (!updated.includes("from '../../utils/dateFormat'") && !updated.includes("from '../utils/dateFormat'")) {
    const depth = updated.includes("'../../hooks/usePageI18n'") ? '../../' : '../'.repeat(3);
    const hookLine = updated.match(/import.*usePageI18n.*\n/);
    if (hookLine) {
      updated = updated.replace(
        hookLine[0],
        hookLine[0] + `import { getCurrentLanguage } from '${depth}i18n/language';\nimport { formatAppDate } from '${depth}utils/dateFormat';\n`
      );
    }
  }

  if (!updated.includes("from '../../utils/currencyFormat'") && !updated.includes("from '../utils/currencyFormat'")) {
    if (updated.includes('formatAppDate') && (updated.includes('toLocaleString') || updated.includes('CURRENCY'))) {
      const depth = updated.includes("'../../hooks/usePageI18n'") ? '../../' : '../'.repeat(3);
      updated = updated.replace(
        /import \{ formatAppDate \}.*\n/,
        (m) => m + `import { formatAppCurrency } from '${depth}utils/currencyFormat';\n`
      );
    }
  }

  return updated;
}

function replaceDateFormats(content) {
  let updated = content;

  // new Date(x).toLocaleDateString('fr-FR')
  updated = updated.replace(
    /new Date\(([^)]+)\)\.toLocaleDateString\(['"]fr-FR['"]\)/g,
    'formatAppDate($1, getCurrentLanguage())'
  );

  // variable.toLocaleDateString('fr-FR') where variable is already a Date
  updated = updated.replace(
    /(\w+)\.toLocaleDateString\(['"]fr-FR['"]\)/g,
    'formatAppDate($1, getCurrentLanguage())'
  );

  // toLocaleTimeString('fr-FR', ...)
  updated = updated.replace(
    /new Date\(([^)]+)\)\.toLocaleTimeString\(['"]fr-FR['"],\s*\{([^}]+)\}\)/g,
    "formatAppDate($1, getCurrentLanguage(), 'HH:mm')"
  );

  return updated;
}

function replaceStatusBadgePattern(content, namespace) {
  // Generic status badge with French labels
  const pattern = /const StatusBadge = \(\{ status \}\) => \{\s*const statusConfig = \{\s*active: \{ label: 'Actif'/;
  if (!pattern.test(content)) return content;

  return content.replace(
    /const StatusBadge = \(\{ status \}\) => \{[\s\S]*?return \(\s*<span className=\{`text-\[10px\][\s\S]*?<\/span>\s*\);\s*\};/,
    `const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const statusConfig = {
    active: { class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    inactive: { class: 'bg-gray-50 text-gray-600 border-gray-200' },
    pending: { class: 'bg-amber-50 text-amber-700 border-amber-200' },
    archived: { class: 'bg-gray-50 text-gray-500 border-gray-200' },
    maintenance: { class: 'bg-amber-50 text-amber-700 border-amber-200' },
    suspended: { class: 'bg-amber-50 text-amber-700 border-amber-200' }
  };
  const config = statusConfig[status] || statusConfig.inactive;
  return (
    <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full border \${config.class}\`}>
      {t(\`${namespace}.status.\${status}\`, { defaultValue: t(\`common.\${status}\`, { defaultValue: status }) })}
    </span>
  );
};`
  );
}

for (const rel of PAGE_FILES) {
  const filePath = path.join(ROOT, rel);
  if (!fs.existsSync(filePath)) {
    console.log('Skip (missing):', rel);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = ensureImports(content);
  content = replaceDateFormats(content);

  const ns = rel.split('/')[0].toLowerCase().replace('rolespermissions', 'roles');
  if (['suppliers', 'categories', 'warehouse', 'payments', 'expenses', 'production'].some((n) => rel.includes(n))) {
    const namespace = rel.includes('Suppliers') ? 'suppliers'
      : rel.includes('Categories') ? 'categories'
      : rel.includes('Warehouse') ? 'warehouse'
      : rel.includes('Payments') ? 'payments'
      : rel.includes('Expenses') ? 'expenses'
      : 'production';
    content = replaceStatusBadgePattern(content, namespace);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated:', rel);
  } else {
    console.log('No change:', rel);
  }
}

console.log('Done.');
