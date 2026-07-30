#!/usr/bin/env node
/**
 * Phase 2: Replace remaining French UI strings with t()/tc() calls.
 */
import fs from 'fs';
import path from 'path';

const ROOT = '/workspace';

const PAGES = [
  'src/pages/orders/OrdersPage.jsx',
  'src/pages/invoices/InvoicesPage.jsx',
  'src/pages/payments/PaymentsPage.jsx',
  'src/pages/expenses/ExpensesPage.jsx',
  'src/pages/deliveries/DeliveriesPage.jsx',
  'src/pages/production/ProductionPage.jsx',
  'src/pages/inventory/InventoryPage.jsx',
  'src/pages/warehouse/WarehousePage.jsx',
  'src/pages/suppliers/SuppliersPage.jsx',
  'src/pages/notifications/NotificationsPage.jsx',
  'src/pages/reports/ReportsPage.jsx',
  'src/pages/analytics/AnalyticsPage.jsx',
  'src/pages/activitylog/ActivityLogPage.jsx',
  'src/pages/settings/SettingsPage.jsx',
  'src/pages/myprofile/MyProfilePage.jsx',
];

/** [from, to] – longer strings first */
const REPLACEMENTS = [
  // Ternary / button leftovers
  ["'Créer la commande'", "t('orders.addOrder')"],
  ["'Enregistrer le paiement'", "t('payments.addPayment')"],
  ["'Enregistrer'", "tc('save')"],
  ["'Créer'", "tc('create')"],
  ["'Ajouter'", "tc('add')"],
  ["'Supprimer'", "tc('delete')"],
  ["'Impossible'", "tc('impossible')"],
  ["'Confirmer'", "tc('confirm')"],
  ["'Fermer'", "tc('close')"],
  ["'Annuler'", "tc('cancel')"],
  ["'Modifier'", "tc('edit')"],
  ["'Activer'", "tc('activate')"],
  ["'Désactiver'", "tc('deactivate')"],
  ["'Déconnecter'", "t('profile.sessions.disconnect')"],
  ["'Tout déconnecter'", "t('profile.sessions.disconnectAll')"],

  // Common labels in columns/export
  ["'N° Commande'", "t('orders.table.orderNumber')"],
  ["'N° Facture'", "t('invoices.table.invoiceNumber')"],
  ["'N° Commande'", "t('orders.table.orderNumber')"],
  ["'N° Facture'", "t('invoices.table.invoiceNumber')"],
  ["'Échéance'", "t('invoices.table.dueDate')"],
  ["'Payé'", "t('common.labels.paidAmount')"],
  ["'Payée'", "t('common.paymentStatus.paid')"],
  ["'Payées'", "t('invoices.kpi.paid')"],
  ["'Payé'", "t('common.labels.paidAmount')"],
  ["'Non payée'", "t('common.paymentStatus.unpaid')"],
  ["'Non payées'", "t('invoices.kpi.unpaid')"],
  ["'Non payé'", "t('common.paymentStatus.unpaid')"],
  ["'Partielle'", "t('common.paymentStatus.partial')"],
  ["'Partiel'", "t('common.paymentStatus.partial')"],
  ["'En retard'", "t('common.statuses.overdue')"],
  ["'Envoyée'", "t('common.statuses.sent')"],
  ["'Annulée'", "t('common.cancelled')"],
  ["'Brouillon'", "t('orders.status.draft')"],
  ["'En attente'", "t('common.pending')"],
  ["'Validée'", "t('orders.status.validated')"],
  ["'Validées'", "t('orders.kpi.validated')"],
  ["'En production'", "t('orders.status.in_production')"],
  ["'Prête'", "t('orders.status.ready')"],
  ["'Prêtes'", "t('orders.kpi.ready')"],
  ["'En livraison'", "t('orders.status.in_delivery')"],
  ["'Livrée'", "t('orders.status.delivered')"],
  ["'Livrées'", "t('orders.kpi.delivered')"],
  ["'Refusée'", "t('orders.status.rejected')"],
  ["'Archivée'", "t('common.statuses.archived')"],
  ["'Annulées'", "t('orders.kpi.cancelled')"],
  ["'Haute'", "t('orders.priority.high')"],
  ["'Moyenne'", "t('orders.priority.medium')"],
  ["'Basse'", "t('orders.priority.low')"],
  ["'Faible'", "t('orders.priority.low')"],
  ["'Critique'", "t('notifications.kpi.critical')"],
  ["'Espèces'", "t('common.paymentMethods.cash')"],
  ["'Carte bancaire'", "t('common.paymentMethods.card')"],
  ["'Carte'", "t('common.paymentMethods.card')"],
  ["'Virement'", "t('common.paymentMethods.transfer')"],
  ["'Virement bancaire'", "t('common.paymentMethods.bank_transfer')"],
  ["'En ligne'", "t('common.paymentMethods.online')"],
  ["'Crédit'", "t('common.paymentMethods.credit')"],
  ["'Comptant'", "t('common.paymentTerms.cash')"],
  ["'Mensuel'", "t('common.paymentTerms.monthly')"],
  ["'Actif'", "tc('active')"],
  ["'Inactif'", "tc('inactive')"],
  ["'Utilisateur'", "t('users.table.user')"],
  ["'Utilisateur inconnu'", "t('activityLog.unknownUser')"],
  ["'Aujourd\\'hui'", "tc('today')"],
  ["\"Aujourd'hui\"", "tc('today')"],
  ["'Revenu total'", "t('finance.kpi.totalRevenue')"],
  ["'Total commandes'", "t('orders.kpi.total')"],
  ["'Total factures'", "t('invoices.kpi.total')"],
  ["'Total des paiements'", "t('payments.kpi.total')"],
  ["'Liste des commandes'", "t('orders.export.title')"],
  ["'Liste des factures'", "t('invoices.export.title')"],
  ["'Tous les statuts'", "tc('allStatuses')"],
  ["'Tous les paiements'", "t('payments.filters.allPayments')"],
  ["'Chargement des commandes...'", "tc('loadingModule', { module: t('nav.orders') })"],
  ["'Chargement des factures...'", "tc('loadingModule', { module: t('nav.invoices') })"],
  ["'Chargement du profil...'", "t('profile.loading')"],
  ["'Aucune commande trouvée'", "t('orders.empty')"],
  ["'Aucune facture trouvée'", "t('invoices.empty')"],
  ["'Créer une commande'", "t('orders.addOrder')"],
  ["'Créer une facture'", "t('invoices.addInvoice')"],
  ["'Nouvelle commande'", "t('orders.addOrder')"],
  ["'Nouvelle facture'", "t('invoices.addInvoice')"],
  ["'Erreur lors du chargement des commandes'", "t('orders.errors.load')"],
  ["'Le client est requis'", "t('orders.validation.customerRequired')"],
  ["'Le commercial est requis'", "t('orders.validation.repRequired')"],
  ["'Au moins un produit est requis'", "t('orders.validation.productsRequired')"],
  ["'Tous les produits doivent avoir un nom'", "t('orders.validation.productNameRequired')"],
  ["'La commande est requise'", "t('invoices.validation.orderRequired')"],
  ["'Modifier la commande'", "t('orders.modals.editTitle')"],
  ["'Nouvelle commande'", "t('orders.modals.addTitle')"],
  ["'Supprimer la commande ?'", "t('orders.modals.deleteTitle')"],
  ["'Détails de la commande'", "t('orders.modals.detailsTitle')"],
  ["'Modifier la facture'", "t('invoices.modals.editTitle')"],
  ["'Supprimer la facture ?'", "t('invoices.modals.deleteTitle')"],
  ["'Détails de la facture'", "t('invoices.modals.detailsTitle')"],
  ["'Informations client'", "t('orders.sections.customerInfo')"],
  ["'Informations générales'", "t('orders.sections.generalInfo')"],
  ["'Informations personnelles'", "t('profile.personalInfo')"],
  ["'Informations professionnelles'", "t('profile.professionalInfo')"],
  ["'Modifier le profil'", "t('profile.editProfile')"],
  ["'Consultez et gérez vos informations personnelles et professionnelles'", "t('profile.pageDescription')"],
  ["'Résumé'", "t('common.summary')"],
  ["'Sous-total'", "t('common.subtotal')"],
  ["'Remise totale'", "t('common.totalDiscount')"],
  ["'Total TTC'", "t('common.totalInclTax')"],
  ["'Remise (%)'", "t('common.discountPercent')"],
  ["'Qté'", "t('common.qty')"],
  ["'Prix (DH)'", "t('common.priceDh')"],
  ["'TVA (%)'", "t('common.vatPercent')"],
  ["'TVA'", "t('common.vat')"],
  ["'Livraison'", "t('common.delivery')"],
  ["'Date livraison'", "t('orders.table.deliveryDate')"],
  ["'Heure livraison'", "t('orders.fields.deliveryTime')"],
  ["'Méthode paiement'", "t('orders.fields.paymentMethod')"],
  ["'Méthode de paiement'", "t('orders.fields.paymentMethod')"],
  ["'Date facture'", "t('invoices.table.issueDate')"],
  ["'Date échéance'", "t('invoices.table.dueDate')"],
  ["'Montant payé'", "t('invoices.fields.paidAmount')"],
  ["'Statut paiement'", "t('invoices.fields.paymentStatus')"],
  ["'Date de création'", "t('common.table.columns.createdAt')"],
  ["'Ajouter produit'", "t('common.addProduct')"],
  ["'Commande:'", "t('common.orderLabel')"],
  ["'Quantité:'", "t('common.quantityLabel')"],
  ["'Montant restant:'", "t('invoices.fields.remainingAmount')"],
  ["'Non défini'", "tc('notProvided')"],
  ["'Matières premières'", "t('suppliers.types.raw')"],
  ["'Emballages'", "t('suppliers.types.packaging')"],
  ["'Équipements'", "t('suppliers.types.equipment')"],
  ["'Services'", "t('suppliers.types.services')"],
  ["'Autre'", "t('suppliers.types.other')"],
  ["'Détails de l\\'activité'", "t('activityLog.modals.detailsTitle')"],
  ["'Nouvelle valeur'", "t('activityLog.newValue')"],
  ["'Erreur lors du chargement du journal'", "t('activityLog.errors.load')"],
  ["'Actions critiques'", "t('activityLog.kpi.critical')"],
  ["'Utilisateurs actifs'", "t('activityLog.activeUsers')"],
  ["'Informations de l\\'entreprise'", "t('settings.sections.company')"],
  ["'Gérez les informations de votre entreprise'", "t('settings.companyDescription')"],
  ["'Aucun formulaire disponible pour cette section'", "t('settings.noForm')"],
  ["'Aucune activité récente'", "t('profile.noActivity')"],
  ["'Aucune session active'", "t('profile.noSessions')"],
  ["'Aucun document'", "t('profile.noDocuments')"],
  ["'Aucune permission'", "t('profile.noPermissions')"],
  ["'Activités récentes'", "t('profile.recentActivity')"],
  ["'Activé'", "tc('active')"],
  ["'Désactivé'", "tc('inactive')"],
  ["'Français'", "t('common.languages.ar')"],
  ["'Minimum 8 caractères'", "t('profile.validation.minPassword')"],
  ["'Données invalides'", "t('errors.invalidData')"],
  ["'Session expirée'", "t('errors.unauthorized')"],
  ["'Permission refusée'", "t('errors.forbidden')"],
  ["'Ressource non trouvée'", "t('errors.notFound')"],
  ["'Erreur réseau'", "t('errors.networkError')"],
  ["'Erreur serveur'", "t('errors.serverError')"],
  ["'Une erreur est survenue'", "t('common.error')"],
  ["'Erreur interne du serveur.'", "t('errors.serverError')"],
  ["'Profil mis à jour avec succès'", "t('profile.messages.updated')"],
  ["'Modifications annulées'", "t('profile.messages.cancelled')"],
  ["'Export réalisé avec succès'", "tc('exportSuccess', { type: 'PDF', count: 0 })"],
  ["'Téléphone'", "tc('phone')"],
  ["'Département'", "tc('department')"],
  ["'Employé'", "t('common.employee')"],
  ["'Partiellement payées'", "t('payments.kpi.partial')"],
  ["'En attente'", "t('payments.kpi.pending')"],
  ["'Payé'", "t('payments.kpi.received')"],
  ["produits", "{t('orders.table.products')}"],
];

function fixStatusBadge(content, ns) {
  // Generic: replace label: 'French' in statusConfig with statusLabel
  content = content.replace(
    /const StatusBadge = \(\{ status \}\) => \{[\s\S]*?const statusConfig = \{[\s\S]*?\};[\s\S]*?const config = statusConfig\[status\][\s\S]*?\};/,
    `const StatusBadge = ({ status }) => {
  const { statusLabel } = usePageI18n('${ns}');
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
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-gray-50 text-gray-600 border-gray-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
    overdue: 'bg-red-50 text-red-700 border-red-200',
    sent: 'bg-blue-50 text-blue-700 border-blue-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    preparing: 'bg-purple-50 text-purple-700 border-purple-200',
    out_for_delivery: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };
  const key = status || 'draft';
  return (
    <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full border \${classes[key] || classes.draft}\`}>
      {statusLabel(key)}
    </span>
  );
};`
  );
  return content;
}

function fixPriorityBadge(content, ns) {
  return content.replace(
    /const PriorityBadge = \(\{ priority \}\) => \{[\s\S]*?\};/,
    `const PriorityBadge = ({ priority }) => {
  const { t } = usePageI18n('${ns}');
  const classes = {
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  const key = priority || 'medium';
  const label = t(\`${ns === 'orders' ? 'orders' : ns}.priority.\${key}\`, t('orders.priority.' + key));
  return (
    <span className={\`text-[10px] font-semibold px-2.5 py-1 rounded-full border \${classes[key] || classes.medium}\`}>
      {label}
    </span>
  );
};`
  );
}

function fixPaymentBadge(content) {
  return content.replace(
    /const PaymentBadge = \(\{ status \}\) => \{[\s\S]*?\};/,
    `const PaymentBadge = ({ status }) => {
  const { tc } = usePageI18n('orders');
  const classes = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
    unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  const key = status || 'unpaid';
  return (
    <span className={\`text-[10px] font-semibold px-2.5 py-1 rounded-full border \${classes[key] || classes.unpaid}\`}>
      {tc('paymentStatus.' + key)}
    </span>
  );
};`
  );
}

function processFile(relPath) {
  const full = path.join(ROOT, relPath);
  let content = fs.readFileSync(full, 'utf8');
  const orig = content;
  const ns = relPath.includes('myprofile') ? 'profile' :
    relPath.includes('activitylog') ? 'activityLog' :
    relPath.match(/pages\/(\w+)\//)?.[1] || 'common';

  for (const [from, to] of REPLACEMENTS) {
    content = content.split(from).join(to);
  }

  if (relPath.includes('OrdersPage')) {
    content = fixStatusBadge(content, 'orders');
    content = fixPriorityBadge(content, 'orders');
    content = fixPaymentBadge(content);
  }

  if (content !== orig) {
    fs.writeFileSync(full, content);
    console.log('Updated:', relPath);
    return true;
  }
  return false;
}

let n = 0;
for (const f of PAGES) {
  if (processFile(f)) n++;
}
console.log(`Phase 2: ${n} files updated.`);
