import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Search, Edit2, Trash2, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import { unwrapData, unwrapPaginated, getApiErrorMessage } from '../../utils/apiHelpers';
import { getPurchases, createPurchase, updatePurchase, deletePurchase, getPurchaseStatistics } from '../../services/purchaseService';
import { getProducts } from '../../services/productService';
import { getSuppliers } from '../../services/supplierService';

const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';
const CURRENCY = 'SAR';

const emptyForm = () => ({
  material_name: '',
  product_id: '',
  supplier_id: '',
  quantity: 1,
  unit_price: 0,
  purchase_date: new Date().toISOString().split('T')[0],
  status: 'pending',
  notes: '',
});

const PurchasesPage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPurchases({ page, per_page: 10, search: search || undefined });
      const { items: rows, meta } = unwrapPaginated(res);
      setItems(rows);
      setTotal(meta.total || rows.length);
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search]);
  useEffect(() => {
    getPurchaseStatistics().then((r) => setStats(unwrapData(r) || {}));
    getProducts({ per_page: 200 }).then((r) => setProducts(unwrapPaginated(r).items));
    getSuppliers({ per_page: 200 }).then((r) => setSuppliers(unwrapPaginated(r).items));
  }, []);

  const openModal = (item = null) => {
    setSelected(item);
    if (item) {
      setForm({
        material_name: item.material_name || '',
        product_id: item.product_id || item.product?.id || '',
        supplier_id: item.supplier_id || item.supplier?.id || '',
        quantity: item.quantity ?? 1,
        unit_price: item.unit_price ?? 0,
        purchase_date: item.purchase_date?.split?.('T')?.[0] || item.purchase_date || '',
        status: item.status || 'pending',
        notes: item.notes || '',
      });
    } else setForm(emptyForm());
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        product_id: form.product_id ? Number(form.product_id) : null,
        supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
      };
      if (selected) await updatePurchase(selected.id, payload);
      else await createPurchase(payload);
      showToast(t('common.saved'), 'success');
      setModal(false);
      fetchData();
      getPurchaseStatistics().then((r) => setStats(unwrapData(r) || {}));
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(t('purchases.confirmDelete'))) return;
    try {
      await deletePurchase(item.id);
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] p-6" style={{ fontFamily: FONT_BODY }}>
      <div className="flex justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>{t('purchases.title')}</h1><p className="text-sm text-[#6D6D6D]">{t('purchases.subtitle')}</p></div>
        <button type="button" onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white"><Plus size={18} />{t('purchases.addTitle')}</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{ k: 'total', l: t('purchases.kpi.total') }, { k: 'pending', l: t('purchases.status.pending') }, { k: 'received', l: t('purchases.status.received') }, { k: 'total_amount', l: t('purchases.kpi.amount') }].map(({ k, l }) => (
          <div key={k} className="bg-white border border-[#ECE8E1] rounded-xl p-4">
            <p className="text-2xl font-bold">{k === 'total_amount' ? `${Number(stats[k] || 0).toLocaleString()} ${CURRENCY}` : (stats[k] ?? 0)}</p>
            <p className="text-xs text-[#6D6D6D]">{l}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-4 flex gap-3">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t('purchases.searchPlaceholder')} className="w-full pl-9 pr-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" /></div>
        <button type="button" onClick={fetchData} className="p-2 border rounded-lg"><RefreshCw size={16} /></button>
      </div>
      <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-x-auto">
        {loading ? <div className="p-12 text-center">{t('common.loading')}</div> : items.length === 0 ? <div className="p-12 text-center"><ShoppingBag className="mx-auto mb-2" />{t('purchases.empty')}</div> : (
          <table className="w-full">
            <thead className="bg-[#F8F7F4]"><tr>{[t('purchases.fields.number'), t('purchases.fields.material'), t('purchases.fields.quantity'), t('purchases.fields.price'), t('purchases.fields.supplier'), t('common.date'), t('common.status'), t('common.actions')].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase">{h}</th>)}</tr></thead>
            <tbody>{items.map((row) => (
              <tr key={row.id} className="border-t hover:bg-[#F8F7F4]">
                <td className="px-4 py-3 text-sm font-mono">{row.purchase_number}</td>
                <td className="px-4 py-3 text-sm">{row.material_name}</td>
                <td className="px-4 py-3 text-sm">{row.quantity}</td>
                <td className="px-4 py-3 text-sm">{Number(row.total_price || 0).toLocaleString()} {CURRENCY}</td>
                <td className="px-4 py-3 text-sm">{row.supplier?.name || '—'}</td>
                <td className="px-4 py-3 text-sm">{row.purchase_date ? new Date(row.purchase_date).toLocaleDateString(DATE_LOCALE) : '—'}</td>
                <td className="px-4 py-3 text-sm">{t(`purchases.status.${row.status}`)}</td>
                <td className="px-4 py-3"><div className="flex gap-1"><button type="button" onClick={() => openModal(row)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg"><Edit2 size={16} /></button><button type="button" onClick={() => handleDelete(row)} className="p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 size={16} className="text-rose-500" /></button></div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && <div className="flex justify-center gap-2 mt-4"><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft /></button><span>{page}/{totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight /></button></div>}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSave} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between"><h3 className="text-lg font-bold" style={{ fontFamily: FONT_HEADING }}>{selected ? t('purchases.editTitle') : t('purchases.addTitle')}</h3><button type="button" onClick={() => setModal(false)}><X size={20} /></button></div>
              <input required value={form.material_name} onChange={(e) => setForm({ ...form, material_name: e.target.value })} placeholder={t('purchases.fields.material')} className="w-full px-3 py-2 text-sm border rounded-lg" />
              <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg"><option value="">{t('nav.products')} ({t('common.optional')})</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
              <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg"><option value="">{t('purchases.fields.supplier')}</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder={t('purchases.fields.quantity')} className="w-full px-3 py-2 text-sm border rounded-lg" />
                <input type="number" min="0" step="0.01" required value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder={t('purchases.fields.unitPrice')} className="w-full px-3 py-2 text-sm border rounded-lg" />
              </div>
              <input type="date" required value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg">{['pending', 'received', 'cancelled'].map((s) => <option key={s} value={s}>{t(`purchases.status.${s}`)}</option>)}</select>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t('common.notes')} rows={2} className="w-full px-3 py-2 text-sm border rounded-lg" />
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setModal(false)} className="px-4 py-2 border rounded-xl">{t('common.cancel')}</button><button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white">{t('common.save')}</button></div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurchasesPage;
