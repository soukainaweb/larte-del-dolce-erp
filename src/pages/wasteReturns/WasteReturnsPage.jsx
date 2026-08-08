import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recycle, Plus, Search, Edit2, Trash2, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import { unwrapData, unwrapPaginated, getApiErrorMessage } from '../../utils/apiHelpers';
import { getWasteReturns, createWasteReturn, updateWasteReturn, deleteWasteReturn, getWasteReturnStatistics } from '../../services/wasteReturnService';
import { getProducts } from '../../services/productService';

const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';

const emptyForm = () => ({
  type: 'waste',
  product_id: '',
  quantity: 1,
  reason: '',
  recorded_date: new Date().toISOString().split('T')[0],
  notes: '',
});

const WasteReturnsPage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
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
      const res = await getWasteReturns({ page, per_page: 10, search: search || undefined });
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
    getWasteReturnStatistics().then((r) => setStats(unwrapData(r) || {}));
    getProducts({ per_page: 200 }).then((r) => setProducts(unwrapPaginated(r).items));
  }, []);

  const openModal = (item = null) => {
    setSelected(item);
    if (item) {
      setForm({
        type: item.type || 'waste',
        product_id: item.product_id || item.product?.id || '',
        quantity: item.quantity ?? 1,
        reason: item.reason || '',
        recorded_date: item.recorded_date?.split?.('T')?.[0] || item.recorded_date || '',
        notes: item.notes || '',
      });
    } else setForm(emptyForm());
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, product_id: Number(form.product_id), quantity: Number(form.quantity) };
      if (selected) await updateWasteReturn(selected.id, payload);
      else await createWasteReturn(payload);
      showToast(t('common.saved'), 'success');
      setModal(false);
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(t('wasteReturns.confirmDelete'))) return;
    try {
      await deleteWasteReturn(item.id);
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] p-6" style={{ fontFamily: FONT_BODY }}>
      <div className="flex justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>{t('wasteReturns.title')}</h1><p className="text-sm text-[#6D6D6D]">{t('wasteReturns.subtitle')}</p></div>
        <button type="button" onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white"><Plus size={18} />{t('wasteReturns.addTitle')}</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{ k: 'total', l: t('wasteReturns.kpi.total') }, { k: 'waste', l: t('wasteReturns.types.waste') }, { k: 'returns', l: t('wasteReturns.types.return') }, { k: 'total_quantity', l: t('wasteReturns.kpi.quantity') }].map(({ k, l }) => (
          <div key={k} className="bg-white border border-[#ECE8E1] rounded-xl p-4"><p className="text-2xl font-bold">{stats[k] ?? 0}</p><p className="text-xs text-[#6D6D6D]">{l}</p></div>
        ))}
      </div>
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-4 flex gap-3">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t('wasteReturns.searchPlaceholder')} className="w-full pl-9 pr-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" /></div>
        <button type="button" onClick={fetchData} className="p-2 border rounded-lg"><RefreshCw size={16} /></button>
      </div>
      <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-x-auto">
        {loading ? <div className="p-12 text-center">{t('common.loading')}</div> : items.length === 0 ? <div className="p-12 text-center"><Recycle className="mx-auto mb-2" />{t('wasteReturns.empty')}</div> : (
          <table className="w-full">
            <thead className="bg-[#F8F7F4]"><tr>{[t('wasteReturns.fields.reference'), t('wasteReturns.fields.type'), t('nav.products'), t('wasteReturns.fields.quantity'), t('wasteReturns.fields.reason'), t('common.date'), t('common.actions')].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase">{h}</th>)}</tr></thead>
            <tbody>{items.map((row) => (
              <tr key={row.id} className="border-t hover:bg-[#F8F7F4]">
                <td className="px-4 py-3 text-sm font-mono">{row.reference}</td>
                <td className="px-4 py-3 text-sm">{t(`wasteReturns.types.${row.type}`)}</td>
                <td className="px-4 py-3 text-sm">{row.product?.name || '—'}</td>
                <td className="px-4 py-3 text-sm">{row.quantity}</td>
                <td className="px-4 py-3 text-sm">{row.reason}</td>
                <td className="px-4 py-3 text-sm">{row.recorded_date ? new Date(row.recorded_date).toLocaleDateString(DATE_LOCALE) : '—'}</td>
                <td className="px-4 py-3"><div className="flex gap-1"><button type="button" onClick={() => openModal(row)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg"><Edit2 size={16} /></button><button type="button" onClick={() => handleDelete(row)} className="p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 size={16} className="text-rose-500" /></button></div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && <div className="flex justify-center gap-2 mt-4"><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft /></button><span>{page}/{totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight /></button></div>}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSave} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex justify-between"><h3 className="text-lg font-bold" style={{ fontFamily: FONT_HEADING }}>{selected ? t('wasteReturns.editTitle') : t('wasteReturns.addTitle')}</h3><button type="button" onClick={() => setModal(false)}><X size={20} /></button></div>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg">{['waste', 'return'].map((ty) => <option key={ty} value={ty}>{t(`wasteReturns.types.${ty}`)}</option>)}</select>
              <select required value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg"><option value="">{t('common.selectProduct')}</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
              <input type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder={t('wasteReturns.fields.quantity')} className="w-full px-3 py-2 text-sm border rounded-lg" />
              <input required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder={t('wasteReturns.fields.reason')} className="w-full px-3 py-2 text-sm border rounded-lg" />
              <input type="date" required value={form.recorded_date} onChange={(e) => setForm({ ...form, recorded_date: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t('common.notes')} rows={2} className="w-full px-3 py-2 text-sm border rounded-lg" />
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setModal(false)} className="px-4 py-2 border rounded-xl">{t('common.cancel')}</button><button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white">{t('common.save')}</button></div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WasteReturnsPage;
