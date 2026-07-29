const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const extra = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings-i18n-locales.json'), 'utf8'));

function mergeSettings(locale, lang) {
  const fp = path.join(ROOT, 'src', 'i18n', 'locales', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  data.settings = { ...data.settings, ...extra[lang] };
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n');
  console.log('merged settings into', lang);
}

['en', 'fr', 'ar'].forEach((lang) => mergeSettings(extra[lang], lang));

const pagePath = path.join(ROOT, 'src', 'pages', 'settings', 'SettingsPage.jsx');
let c = fs.readFileSync(pagePath, 'utf8');

// Remove redundant direct imports (usePageI18n provides these)
c = c.replace("import { getCurrentLanguage } from '../../i18n/language';\n", '');
c = c.replace("import { formatAppDate } from '../../utils/dateFormat';\n", '');

// ConfirmDialog: add dir
c = c.replace(
  `const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, description, confirmText, cancelText, isLoading = false }) => {
  const { t } = useTranslation();
  const resolvedConfirm = confirmText || t('common.confirm');
  const resolvedCancel = cancelText || t('common.cancel');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
      >`,
  `const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, description, confirmText, cancelText, isLoading = false }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const resolvedConfirm = confirmText || t('common.confirm');
  const resolvedCancel = cancelText || t('common.cancel');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        dir={isRTL ? 'rtl' : 'ltr'}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
      >`
);

// Modal component
c = c.replace(
  `const Modal = ({ isOpen, onClose, onSave, title, description, children, isLoading = false, saveText = 'Sauvegarder' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >`,
  `const Modal = ({ isOpen, onClose, onSave, title, description, children, isLoading = false, saveText }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const resolvedSave = saveText || t('common.save');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        dir={isRTL ? 'rtl' : 'ltr'}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >`
);

c = c.replace(
  `            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-[#B8863B] text-white rounded-lg hover:bg-[#A07532] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {saveText}`,
  `            {t('common.cancel')}
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-[#B8863B] text-white rounded-lg hover:bg-[#A07532] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {resolvedSave}`
);

// TestModal
c = c.replace(
  `const TestModal = ({ isOpen, onClose, onTest, title, description, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
      >`,
  `const TestModal = ({ isOpen, onClose, onTest, title, description, isLoading = false }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        dir={isRTL ? 'rtl' : 'ltr'}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
      >`
);

c = c.replace(
  `              <p className="text-center text-[#6D6D6D]">
                Le test va simuler une production avec les paramètres actuels.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#6D6D6D]">
                <span>⏱️ Durée estimée: 2-5 secondes</span>
                <span>📊 Données: 50 produits</span>
              </div>`,
  `              <p className="text-center text-[#6D6D6D]">
                {t('settings.modals.testBody')}
              </p>
              <div className="flex items-center gap-4 text-xs text-[#6D6D6D]">
                <span>{t('settings.modals.testDuration')}</span>
                <span>{t('settings.modals.testData')}</span>
              </div>`
);

c = c.replace(
  `          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#6D6D6D] hover:text-[#2B2B2B] hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onTest}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-[#B8863B] text-white rounded-lg hover:bg-[#A07532] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            <Play size={16} />
            Lancer le test
          </button>`,
  `          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#6D6D6D] hover:text-[#2B2B2B] hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onTest}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-[#B8863B] text-white rounded-lg hover:bg-[#A07532] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            <Play size={16} />
            {t('settings.actions.runTest')}
          </button>`
);

// InvoicePreviewModal
c = c.replace(
  `const InvoicePreviewModal = ({ isOpen, onClose, data, invoiceConfig, onExportPDF }) => {
  if (!isOpen || !data) return null;`,
  `const InvoicePreviewModal = ({ isOpen, onClose, data, invoiceConfig, onExportPDF }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  if (!isOpen || !data) return null;`
);

c = c.replace(
  `      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-[#2B2B2B]">Aperçu PDF de la facture</h3>
            <p className="text-sm text-[#6D6D6D]">Facture {data.id}</p>`,
  `      <motion.div
        dir={isRTL ? 'rtl' : 'ltr'}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-[#2B2B2B]">{t('settings.invoicePreview.title')}</h3>
            <p className="text-sm text-[#6D6D6D]">{t('settings.invoicePreview.invoiceLabel', { id: data.id })}</p>`
);

// Main component usePageI18n destructuring
c = c.replace(
  `  const { title, subtitle, searchPlaceholder, t, isRTL, locale } = usePageI18n('settings');`,
  `  const { title, subtitle, searchPlaceholder, t, isRTL, locale, formatAppDate, formatAppCurrency } = usePageI18n('settings');`
);

// openModal defaults
c = c.replace(
  `      title: title || 'Modifier',
      description: description || 'Mettez à jour les informations',`,
  `      title: title || t('settings.modals.edit'),
      description: description || t('settings.modals.defaultDescription'),`
);

c = c.replace(
  `      title: title || 'Test de simulation',
      description: description || 'Vérifiez les paramètres avant de lancer le test',`,
  `      title: title || t('settings.modals.testSimulation'),
      description: description || t('settings.modals.testDescription'),`
);

// Toast messages - strip emojis per pattern used elsewhere
const toastReplacements = [
  ["showToast('🔄 Données actualisées avec succès', 'success')", "showToast(t('settings.toasts.dataRefreshed'), 'success')"],
  ["showToast('✅ Tous les paramètres ont été sauvegardés avec succès', 'success')", "showToast(t('settings.toasts.allSaved'), 'success')"],
  ["showToast('🔄 Paramètres restaurés avec succès', 'success')", "showToast(t('settings.toasts.settingsRestored'), 'success')"],
  ["showToast('✅ PDF exporté avec succès', 'success')", "showToast(t('settings.toasts.pdfExported'), 'success')"],
  ["showToast('✅ Excel exporté avec succès', 'success')", "showToast(t('settings.toasts.excelExported'), 'success')"],
  ["showToast('✅ CSV exporté avec succès', 'success')", "showToast(t('settings.toasts.csvExported'), 'success')"],
  ["showToast('🖨️ Impression lancée', 'success')", "showToast(t('settings.toasts.printStarted'), 'success')"],
  ["showToast(`📄 Export ${type} en cours...`, 'info')", "showToast(t('settings.toasts.exportInProgress', { type }), 'info')"],
  ["showToast(`❌ Erreur lors de l'export ${type}`, 'error')", "showToast(t('settings.toasts.exportError', { type }), 'error')"],
  ["showToast('✅ Informations mises à jour avec succès', 'success')", "showToast(t('settings.toasts.companyUpdated'), 'success')"],
  ["showToast('✅ Paramètres de production mis à jour', 'success')", "showToast(t('settings.toasts.productionUpdated'), 'success')"],
  ["showToast('🧪 Test de production terminé avec succès! Résultats: 500 unités en 4.5h', 'success')", "showToast(t('settings.toasts.productionTestDone'), 'success')"],
  ["showToast('✅ Paramètres des commandes mis à jour', 'success')", "showToast(t('settings.toasts.ordersUpdated'), 'success')"],
  ["showToast('✅ Paramètres de facturation mis à jour', 'success')", "showToast(t('settings.toasts.invoicesUpdated'), 'success')"],
  ["showToast('📄 Facture exportée en PDF avec succès', 'success')", "showToast(t('settings.toasts.invoicePdfExported'), 'success')"],
  ["showToast('✅ Préférences de notifications sauvegardées', 'success')", "showToast(t('settings.toasts.notificationsSaved'), 'success')"],
  ["showToast('✅ Paramètres de sécurité mis à jour', 'success')", "showToast(t('settings.toasts.securityUpdated'), 'success')"],
  ["showToast('🔔 Notification test envoyée avec succès', 'success')", "showToast(t('settings.toasts.testNotificationSent'), 'success')"],
  ["showToast(security.twoFactorAuth ? '🔐 2FA désactivée' : '🔐 2FA activée avec succès', 'success')", "showToast(security.twoFactorAuth ? t('settings.toasts.twoFactorDisabled') : t('settings.toasts.twoFactorEnabled'), 'success')"],
  ["showToast('🔒 Tous les utilisateurs ont été déconnectés', 'success')", "showToast(t('settings.toasts.allUsersDisconnected'), 'success')"],
  ["showToast('👁️ Affichage des connexions actives', 'info')", "showToast(t('settings.toasts.viewingConnections'), 'info')"],
  ["showToast('⏳ Création de la sauvegarde en cours...', 'info')", "showToast(t('settings.toasts.backupCreating'), 'info')"],
  ["showToast('✅ Sauvegarde créée avec succès - 258.4 MB', 'success')", "showToast(t('settings.toasts.backupCreated'), 'success')"],
  ["showToast('📥 Téléchargement de la sauvegarde en cours...', 'info')", "showToast(t('settings.toasts.backupDownloading'), 'info')"],
  ["showToast('✅ Sauvegarde téléchargée avec succès', 'success')", "showToast(t('settings.toasts.backupDownloaded'), 'success')"],
  ["showToast('✅ Sauvegarde restaurée avec succès', 'success')", "showToast(t('settings.toasts.backupRestored'), 'success')"],
  ["showToast('🗑️ Sauvegarde supprimée avec succès', 'success')", "showToast(t('settings.toasts.backupDeleted'), 'success')"],
  ["showToast(`👁️ Consultation de l'activité #${activity.id}`, 'info')", "showToast(t('settings.toasts.viewingActivity', { id: activity.id }), 'info')"],
  ["showToast('📋 Informations copiées dans le presse-papier', 'success')", "showToast(t('settings.toasts.infoCopied'), 'success')"],
  ["showToast('📋 Informations prêtes à être copiées', 'info')", "showToast(t('settings.toasts.infoReadyToCopy'), 'info')"],
  ["showToast('📄 Export du journal des activités en cours...', 'info')", "showToast(t('settings.toasts.activityExporting'), 'info')"],
  ["showToast('✅ Journal des activités exporté avec succès', 'success')", "showToast(t('settings.toasts.activityExported'), 'success')"],
  ["showToast('🔄 Paramètres de production réinitialisés', 'success')", "showToast(t('settings.toasts.productionReset'), 'success')"],
  ["showToast('📋 Historique des modifications des commandes', 'info')", "showToast(t('settings.toasts.ordersHistory'), 'info')"],
  ["showToast('🔄 Paramètres des commandes réinitialisés', 'success')", "showToast(t('settings.toasts.ordersReset'), 'success')"],
  ["showToast('🖨️ Impression en cours...', 'info')", "showToast(t('settings.toasts.printing'), 'info')"],
  ["showToast(`📄 Export ${format} en cours...`, 'info')", "showToast(t('settings.toasts.exportInProgress', { type: format }), 'info')"],
  ["showToast('✅ JSON exporté avec succès', 'success')", "showToast(t('settings.toasts.jsonExported'), 'success')"],
];

for (const [from, to] of toastReplacements) {
  c = c.split(from).join(to);
}

// Confirm dialogs
c = c.replace(
  `    showConfirm(
      'Restaurer les paramètres',
      'Êtes-vous sûr de vouloir restaurer tous les paramètres par défaut ? Cette action est irréversible.',`,
  `    showConfirm(
      t('settings.confirm.restoreSettings.title'),
      t('settings.confirm.restoreSettings.description'),`
);

c = c.replace(
  `    showConfirm(
      'Déconnecter tous les utilisateurs',
      'Cette action déconnectera tous les utilisateurs actifs du système. Êtes-vous sûr ?',`,
  `    showConfirm(
      t('settings.confirm.disconnectAll.title'),
      t('settings.confirm.disconnectAll.description'),`
);

c = c.replace(
  `    showConfirm(
      'Restaurer la sauvegarde',
      'Cette action restaurera toutes les données à partir de la sauvegarde sélectionnée. Êtes-vous sûr ?',`,
  `    showConfirm(
      t('settings.confirm.restoreBackup.title'),
      t('settings.confirm.restoreBackup.description'),`
);

c = c.replace(
  `    showConfirm(
      'Supprimer la sauvegarde',
      'Êtes-vous sûr de vouloir supprimer cette sauvegarde ? Cette action est irréversible.',`,
  `    showConfirm(
      t('settings.confirm.deleteBackup.title'),
      t('settings.confirm.deleteBackup.description'),`
);

// Handler modal titles
const handlerReplacements = [
  ["'Modifier les informations de l\\'entreprise'", "t('settings.company.editTitle')"],
  ["'Mettez à jour les informations de votre entreprise'", "t('settings.company.editDescription')"],
  ["'Modifier les paramètres de production'", "t('settings.production.editTitle')"],
  ["'Configurez les paramètres de production'", "t('settings.production.editDescription')"],
  ["'Test de production'", "t('settings.production.testTitle')"],
  ["'Simulez la production avec les paramètres actuels'", "t('settings.production.testDescription')"],
  ["'Modifier les paramètres des commandes'", "t('settings.orders.editTitle')"],
  ["'Configurez les paramètres des commandes'", "t('settings.orders.editDescription')"],
  ["'Modifier les paramètres de facturation'", "t('settings.invoices.editTitle')"],
  ["'Configurez les paramètres de facturation'", "t('settings.invoices.editDescription')"],
  ["'Modifier les paramètres de notification'", "t('settings.notifications.editTitle')"],
  ["'Configurez les canaux et préférences de notification'", "t('settings.notifications.editDescription')"],
  ["'Modifier les paramètres de sécurité'", "t('settings.security.editTitle')"],
  ["'Configurez les paramètres de sécurité du système'", "t('settings.security.editDescription')"],
  ["title: 'Export des paramètres'", "title: t('settings.export.settingsTitle')"],
  ["title: 'Informations entreprise'", "title: t('settings.company.title')"],
  ["title: 'Facture'", "title: t('settings.export.invoiceTitle')"],
  ["userName: user?.firstName || 'Utilisateur'", "userName: user?.firstName || t('common.user')"],
  ["formatAppDate(new Date(), getCurrentLanguage())", "formatAppDate(new Date(), locale)"],
  ["formatAppDate(new Date(Date.now() + parseInt(invoiceConfig.paymentTerms) * 24 * 60 * 60 * 1000), getCurrentLanguage())", "formatAppDate(new Date(Date.now() + parseInt(invoiceConfig.paymentTerms) * 24 * 60 * 60 * 1000), locale)"],
];

for (const [from, to] of handlerReplacements) {
  c = c.split(from).join(to);
}

// Export data mock labels
c = c.replace(
  `{ id: 1, name: 'Paramètre 1', value: 'Valeur 1' },
        { id: 2, name: 'Paramètre 2', value: 'Valeur 2' },
        { id: 3, name: 'Paramètre 3', value: 'Valeur 3' }`,
  `{ id: 1, name: t('settings.export.parameterName', { n: 1 }), value: t('settings.export.parameterValue', { n: 1 }) },
        { id: 2, name: t('settings.export.parameterName', { n: 2 }), value: t('settings.export.parameterValue', { n: 2 }) },
        { id: 3, name: t('settings.export.parameterName', { n: 3 }), value: t('settings.export.parameterValue', { n: 3 }) }`
);

c = c.replace(
  `{ label: 'ID', accessor: 'id' },
        { label: 'Nom', accessor: 'name' },
        { label: 'Valeur', accessor: 'value' }`,
  `{ label: t('settings.export.columns.id'), accessor: 'id' },
        { label: t('settings.export.columns.name'), accessor: 'name' },
        { label: t('settings.export.columns.value'), accessor: 'value' }`
);

c = c.replace(
  `{ label: 'Nom', accessor: 'name' },
      { label: 'Site web', accessor: 'website' },
      { label: 'Adresse', accessor: 'address' },
      { label: 'Ville', accessor: 'city' },
      { label: 'Pays', accessor: 'country' },
      { label: 'Téléphone', accessor: 'phone' },
      { label: 'Email', accessor: 'email' },
      { label: 'ICE', accessor: 'ice' }`,
  `{ label: t('settings.company.fields.companyName'), accessor: 'name' },
      { label: t('settings.company.fields.website'), accessor: 'website' },
      { label: t('settings.company.fields.address'), accessor: 'address' },
      { label: t('settings.company.fields.city'), accessor: 'city' },
      { label: t('settings.company.fields.country'), accessor: 'country' },
      { label: t('settings.company.fields.phone'), accessor: 'phone' },
      { label: t('settings.company.fields.email'), accessor: 'email' },
      { label: t('settings.company.fields.ice'), accessor: 'ice' }`
);

c = c.replace(
  `{ label: 'N° Facture', accessor: 'id' },
      { label: 'Client', accessor: 'client' },
      { label: 'Total', accessor: 'total' },
      { label: 'Devise', accessor: 'currency' },
      { label: 'Date', accessor: 'date' }`,
  `{ label: t('settings.export.columns.invoiceNumber'), accessor: 'id' },
      { label: t('settings.export.columns.client'), accessor: 'client' },
      { label: t('settings.export.columns.total'), accessor: 'total' },
      { label: t('settings.export.columns.currency'), accessor: 'currency' },
      { label: t('settings.export.columns.date'), accessor: 'date' }`
);

// default form no form message
c = c.replace(
  `<p>Aucun formulaire disponible pour cette section</p>`,
  `<p>{t('settings.modals.noForm')}</p>`
);

// Main container dir
c = c.replace(
  `    <div className="w-full min-h-screen bg-[#FAF8F5] p-6" style={{ fontFamily: FONT_BODY }}>`,
  `    <div dir={isRTL ? 'rtl' : 'ltr'} className="w-full min-h-screen bg-[#FAF8F5] p-6" style={{ fontFamily: FONT_BODY }}>`
);

// Header buttons
c = c.replace(`title="Actualiser"`, `title={t('settings.refresh')}`);
c = c.replace(`            Sauvegarder tout`, `            {t('settings.saveAll')}`);
c = c.replace(`            Restaurer\n          </button>\n        </div>\n      </div>\n\n      {/* ===== TABS ===== */}`, `            {t('settings.restore')}\n          </button>\n        </div>\n      </div>\n\n      {/* ===== TABS ===== */}`);

// Filter options
c = c.replace(`<option value="all">Tous</option>`, `<option value="all">{t('settings.filters.all')}</option>`);
c = c.replace(`<option value="entreprise">Entreprise</option>`, `<option value="entreprise">{t('settings.filters.company')}</option>`);
c = c.replace(`<option value="commandes">Commandes</option>`, `<option value="commandes">{t('settings.filters.orders')}</option>`);
c = c.replace(`<option value="production">Production</option>`, `<option value="production">{t('settings.filters.production')}</option>`);
c = c.replace(`<option value="factures">Factures</option>`, `<option value="factures">{t('settings.filters.invoices')}</option>`);
c = c.replace(`<option value="notifications">Notifications</option>`, `<option value="notifications">{t('settings.filters.notifications')}</option>`);

// Search keywords
c = c.replace(
  `    const tabLabels = {
      company: 'entreprise company informations',
      production: 'production manufacture fabrication',
      orders: 'commandes orders',
      invoices: 'facturation invoices factures',
      notifications: 'notifications alertes',
      security: 'sécurité securite',
      backup: 'sauvegardes backup',
      export: 'export exporter',
      history: 'journal historique history'
    };`,
  `    const tabLabels = {
      company: t('settings.searchKeywords.company'),
      production: t('settings.searchKeywords.production'),
      orders: t('settings.searchKeywords.orders'),
      invoices: t('settings.searchKeywords.invoices'),
      notifications: t('settings.searchKeywords.notifications'),
      security: t('settings.searchKeywords.security'),
      backup: t('settings.searchKeywords.backup'),
      export: t('settings.searchKeywords.export'),
      history: t('settings.searchKeywords.history')
    };`
);

fs.writeFileSync(pagePath, c);
console.log('patched SettingsPage.jsx (phase 1)');
