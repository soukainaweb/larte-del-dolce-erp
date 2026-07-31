/**
 * Bulk-replace common hardcoded French UI strings with i18n t() calls.
 * Run: node scripts/patch-french-ui.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src');

const TARGET_DIRS = [
  path.join(ROOT, 'pages'),
  path.join(ROOT, 'components'),
];

const REPLACEMENTS = [
  // Filters
  [/>Tous les statuts</g, ">{t('common.allStatuses')}</"],
  [/>Tous les types</g, ">{t('common.allTypes')}</"],
  [/>Toutes les catégories</g, ">{t('common.allCategories')}</"],
  [/>Tous les utilisateurs</g, ">{t('common.allUsers')}</"],
  [/>Tous les modules</g, ">{t('common.allModules')}</"],
  [/>Tous les niveaux</g, ">{t('common.allLevels')}</"],
  [/>Tous les paiements</g, ">{t('common.allPayments')}</"],
  [/>Tous</g, ">{t('common.all')}</"],

  // Buttons / actions
  [/>Annuler</g, ">{t('common.cancel')}</"],
  [/>Enregistrer</g, ">{t('common.save')}</"],
  [/>Sauvegarder</g, ">{t('common.save')}</"],
  [/>Supprimer</g, ">{t('common.delete')}</"],
  [/>Modifier</g, ">{t('common.edit')}</"],
  [/>Fermer</g, ">{t('common.close')}</"],
  [/>Confirmer</g, ">{t('common.confirm')}</"],
  [/>Ajouter</g, ">{t('common.add')}</"],
  [/"Actualiser"/g, "{t('common.refresh')}"],
  [/'Actualiser'/g, "{t('common.refresh')}"],

  // Table headers (common)
  [/>Statut</g, ">{t('common.status')}</"],
  [/>Produit</g, ">{t('common.product')}</"],
  [/>Client</g, ">{t('common.customer')}</"],
  [/>Commercial</g, ">{t('common.salesRep')}</"],
  [/>Actions</g, ">{t('common.actions')}</"],

  // Status options
  [/>Actif</g, ">{t('common.active')}</"],
  [/>Inactif</g, ">{t('common.inactive')}</"],
  [/>En attente</g, ">{t('common.pending')}</"],
  [/"Actif"/g, "{t('common.active')}"],
  [/"Inactif"/g, "{t('common.inactive')}"],
  [/"En attente"/g, "{t('common.pending')}"],

  // Priority
  [/>Basse</g, ">{t('orders.priority.low')}</"],
  [/>Moyenne</g, ">{t('orders.priority.medium')}</"],
  [/>Haute</g, ">{t('orders.priority.high')}</"],

  // Payment
  [/>Espèces</g, ">{t('common.paymentMethods.cash')}</"],
  [/"Espèces"/g, "{t('common.paymentMethods.cash')}"],
  [/>Comptant</g, ">{t('common.paymentMethods.cash')}</"],
  [/>Crédit</g, ">{t('common.paymentMethods.credit')}</"],
  [/>Mensuel</g, ">{t('common.paymentTerms.monthly')}</"],

  // Summary labels
  [/>Résumé</g, ">{t('orders.summary.title')}</"],
  [/>Sous-total</g, ">{t('orders.summary.subtotal')}</"],
  [/>Remise totale</g, ">{t('orders.summary.totalDiscount')}</"],
  [/>Total TTC</g, ">{t('orders.summary.grandTotal')}</"],
  [/>Remise \(%\)</g, ">{t('orders.fields.discount')}</"],

  // Sections
  [/>Informations client</g, ">{t('orders.sections.customerInfo')}</"],
  [/>Informations générales</g, ">{t('orders.sections.generalInfo')}</"],
  [/>Informations personnelles</g, ">{t('profile.personalInfo')}</"],
  [/>Informations professionnelles</g, ">{t('profile.professionalInfo')}</"],
  [/>Informations supplémentaires\.\.\.</g, ">{t('common.placeholders.additionalInfo')}</"],

  // Empty / loading patterns - module-specific handled separately
  [/"Non défini"/g, "{t('common.notProvided')}"],
  [/'Non défini'/g, "{t('common.notProvided')}"],
  [/"Non renseigné"/g, "{t('common.notProvided')}"],
  [/'Non renseigné'/g, "{t('common.notProvided')}"],

  // Date locale
  [/\.toLocaleDateString\(['"]fr-FR['"]\)/g, '.toLocaleDateString(DATE_LOCALE)'],
  [/\.toLocaleTimeString\(['"]fr-FR['"],/g, '.toLocaleTimeString(DATE_LOCALE,'],
  [/\.toLocaleString\(['"]fr-FR['"]\)/g, '.toLocaleString(DATE_LOCALE)'],

  // Sidebar nav
  [/>Clients</g, ">{t('nav.customers')}</"],
  [/>Produits</g, ">{t('nav.products')}</"],
];

const LOADING_EMPTY = [
  ['Chargement des livraisons...', "t('common.loadingModule', { module: t('nav.deliveries') })"],
  ['Chargement des dépenses...', "t('common.loadingModule', { module: t('nav.expenses') })"],
  ['Chargement des factures...', "t('common.loadingModule', { module: t('nav.invoices') })"],
  ['Chargement des paiements...', "t('common.loadingModule', { module: t('nav.payments') })"],
  ['Chargement des productions...', "t('common.loadingModule', { module: t('nav.production') })"],
  ['Chargement des fournisseurs...', "t('common.loadingModule', { module: t('nav.suppliers') })"],
  ['Chargement des entrepôts...', "t('common.loadingModule', { module: t('nav.warehouse') })"],
  ["Chargement de l'inventaire...", "t('common.loadingModule', { module: t('nav.inventory') })"],
  ['Chargement du profil...', "t('common.loadingModule', { module: t('nav.profile') })"],
  ['Aucune livraison trouvée', "t('deliveries.empty')"],
  ['Aucune dépense trouvée', "t('expenses.empty')"],
  ['Aucune facture trouvée', "t('invoices.empty')"],
  ['Aucun paiement trouvé', "t('payments.empty')"],
  ['Aucune production trouvée', "t('production.empty')"],
  ['Aucun fournisseur trouvé', "t('suppliers.empty')"],
  ['Aucun entrepôt trouvé', "t('warehouse.empty')"],
  ['Aucun produit trouvé', "t('products.empty')"],
  ['Aucune activité', "t('activityLog.empty')"],
  ['Aucune activité ne correspond à vos critères', "t('activityLog.emptyFiltered')"],
  ['Aucune notification', "t('notifications.noNotifications')"],
  ['Aucune notification ne correspond à vos filtres', "t('notifications.emptyFiltered')"],
  ['Aucune commande', "t('orders.empty')"],
  ['Aucune facture', "t('invoices.emptyShort')"],
  ['Aucune livraison', "t('deliveries.emptyShort')"],
  ['Aucun rapport', "t('reports.empty')"],
  ['Liste des livraisons', "t('deliveries.export.title')"],
  ['Liste des dépenses', "t('expenses.export.title')"],
  ['Liste des factures', "t('invoices.export.title')"],
  ['Liste des paiements', "t('payments.export.title')"],
  ['Liste des productions', "t('production.export.title')"],
  ['Liste des fournisseurs', "t('suppliers.export.title')"],
  ['Liste des entrepôts', "t('warehouse.export.title')"],
  ['Liste des notifications', "t('notifications.export.title')"],
  ['Ajouter une livraison', "t('deliveries.addDelivery')"],
  ['Nouvelle dépense', "t('expenses.addExpense')"],
  ['Nouvelle facture', "t('invoices.addInvoice')"],
  ['Enregistrer un paiement', "t('payments.addPayment')"],
  ['Nouvelle production', "t('production.addProduction')"],
  ['Ajouter un fournisseur', "t('suppliers.addSupplier')"],
  ['Ajouter un entrepôt', "t('warehouse.addWarehouse')"],
  ['Ajouter une dépense', "t('expenses.addExpense')"],
  ['Ajouter un mouvement', "t('inventory.addMovement')"],
  ['Ajouter un mouvement de stock', "t('inventory.addMovement')"],
  ['Ajouter produit', "t('orders.fields.addProduct')"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = walk(full, files);
    else if (/\.(jsx|tsx|js)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function ensureTranslationImport(content) {
  if (content.includes('usePageI18n') || content.includes('useTranslation')) return content;
  if (!content.includes("{t('") && !content.includes('{t("')) return content;

  const importLine = "import { useTranslation } from 'react-i18next';\n";
  if (content.includes("from 'react'")) {
    return content.replace(/(import React[^\n]+\n)/, `$1${importLine}`);
  }
  return importLine + content;
}

function ensureDateLocale(content) {
  if (!content.includes('DATE_LOCALE') && content.includes('.toLocaleDateString(DATE_LOCALE)')) {
    if (!content.includes("const DATE_LOCALE")) {
      const anchor = content.indexOf('\n\n');
      if (anchor > 0) {
        return `${content.slice(0, anchor)}\nconst DATE_LOCALE = 'ar-SA';\n${content.slice(anchor)}`;
      }
    }
  }
  return content;
}

let patched = 0;

for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    for (const [from, to] of REPLACEMENTS) {
      content = content.replace(from, to);
    }

    for (const [from, to] of LOADING_EMPTY) {
      content = content.split(from).join(`{${to}}`);
      content = content.split(`"${from}"`).join(`{${to}}`);
      content = content.split(`'${from}'`).join(`{${to}}`);
    }

    content = ensureTranslationImport(content);
    content = ensureDateLocale(content);

    if (content !== original) {
      fs.writeFileSync(file, content);
      patched += 1;
      console.log('patched', path.relative(ROOT, file));
    }
  }
}

console.log(`done — ${patched} files patched`);
