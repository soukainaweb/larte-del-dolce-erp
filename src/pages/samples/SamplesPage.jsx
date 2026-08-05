import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Plus, Search, Edit2, Trash2, Eye, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { unwrapData, unwrapPaginated, getApiErrorMessage } from '../../utils/apiHelpers';
import { isSalesRepRole } from '../../utils/roleMapping';
import { getSamples, createSample, updateSample, deleteSample, getSampleStatistics } from '../../services/sampleService';
import { getProducts } from '../../services/productService';
import { getUsers } from '../../services/userServicePage';

const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

const emptyForm = () => ({ name: '', product_id: '', quantity: 1, status: 'pending', salesperson_id: '', notes: '' });

const StatusBadge = ({ status, t }) => {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    returned: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${map[status] || map.pending}`}>{t(`samples.status.${status}`, status)}</span>;
};

const SampleModal = ({ isOpen, onClose, onSave, item, products, users, isLoading, t, lockSalesperson }) => {
  const [form, setForm] = useState(emptyForm());
  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        product_id: item.product_id || item.product?.id || '',
        quantity: item.quantity ?? 1,
        status: item.status || 'pending',
        salesperson_id: item.salesperson_id || item.salesperson?.id || '',
        notes: item.notes || '',
      });
    } else setForm(emptyForm());
  }, [item, isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between"><h3 className="text-lg font-bold" style={{ fontFamily: FONT_HEADING }}>{item ? t('samples.editTitle') : t('samples.addTitle')}</h3><button type="button" onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, product_id: form.product_id || null, salesperson_id: form.salesperson_id || null, quantity: Number(form.quantity) }); }} className="p-6 space-y-4">
          <div><label className="text-xs font-semibold text-[#6D6D6D] uppercase">{t('samples.fields.name')} *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" /></div>
          <div><label className="text-xs font-semibold text-[#6D6D6D] uppercase">{t('nav.products')}</label><select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg"><option value="">{t('common.selectOption')}</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-[#6D6D6D] uppercase">{t('samples.fields.quantity')}</label><input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" /></div>
            <div><label className="text-xs font-semibold text-[#6D6D6D] uppercase">{t('common.status')}</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg">{['pending', 'delivered', 'returned', 'cancelled'].map((s) => <option key={s} value={s}>{t(`samples.status.${s}`)}</option>)}</select></div>
          </div>
          {!lockSalesperson && (
          <div><label className="text-xs font-semibold text-[#6D6D6D] uppercase">{t('samples.fields.salesperson')}</label><select value={form.salesperson_id} onChange={(e) => setForm({ ...form, salesperson_id: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg"><option value="">{t('common.selectOption')}</option>{users.map((u) => <option key={u.id} value={u.id}>{u.first_name || u.firstName} {u.last_name || u.lastName}</option>)}</select></div>
          )}
          <div><label className="text-xs font-semibold text-[#6D6D6D] uppercase">{t('common.notes')}</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" /></div>
          <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">{t('common.cancel')}</button><button type="submit" disabled={isLoading} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white">{t('common.save')}</button></div>
        </form>
      </motion.div>
    </div>
  );
};

const SamplesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isSalesRep = isSalesRepRole(user);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getSamples({ page, per_page: 10, search: search || undefined });
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
    getSampleStatistics().then((r) => setStats(unwrapData(r) || {}));
    getProducts({ per_page: 200 }).then((r) => setProducts(unwrapPaginated(r).items));
    if (!isSalesRep) {
      getUsers({ per_page: 200 }).then((r) => setUsers(unwrapPaginated(r).items));
    }
  }, [isSalesRep]);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (selected) await updateSample(selected.id, payload);
      else await createSample(payload);
      showToast(t('common.saved'), 'success');
      setModal(false);
      setSelected(null);
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(t('samples.confirmDelete'))) return;
    try {
      await deleteSample(item.id);
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] p-6" style={{ fontFamily: FONT_BODY }}>
      <div className="flex justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>{t('samples.title')}</h1><p className="text-sm text-[#6D6D6D]">{t('samples.subtitle')}</p></div>
        <button type="button" onClick={() => { setSelected(null); setModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white"><Plus size={18} />{t('samples.addTitle')}</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{ k: 'total', l: t('samples.kpi.total') }, { k: 'pending', l: t('samples.status.pending') }, { k: 'delivered', l: t('samples.status.delivered') }, { k: 'returned', l: t('samples.status.returned') }].map(({ k, l }) => (
          <div key={k} className="bg-white border border-[#ECE8E1] rounded-xl p-4"><p className="text-2xl font-bold">{stats[k] ?? 0}</p><p className="text-xs text-[#6D6D6D]">{l}</p></div>
        ))}
      </div>
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-4 flex gap-3">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t('samples.searchPlaceholder')} className="w-full pl-9 pr-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" /></div>
        <button type="button" onClick={fetchData} className="p-2 border rounded-lg"><RefreshCw size={16} /></button>
      </div>
      <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-x-auto">
        {loading ? <div className="p-12 text-center">{t('common.loading')}</div> : items.length === 0 ? <div className="p-12 text-center"><FlaskConical className="mx-auto mb-2 text-[#ECE8E1]" />{t('samples.empty')}</div> : (
          <table className="w-full">
            <thead className="bg-[#F8F7F4]"><tr>{[t('samples.fields.code'), t('samples.fields.name'), t('nav.products'), t('samples.fields.quantity'), t('samples.fields.salesperson'), t('common.status'), t('common.actions')].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase">{h}</th>)}</tr></thead>
            <tbody>{items.map((row) => (
              <tr key={row.id} className="border-t border-[#ECE8E1] hover:bg-[#F8F7F4]">
                <td className="px-4 py-3 text-sm font-mono">{row.sample_code}</td>
                <td className="px-4 py-3 text-sm">{row.name}</td>
                <td className="px-4 py-3 text-sm">{row.product?.name || '—'}</td>
                <td className="px-4 py-3 text-sm">{row.quantity}</td>
                <td className="px-4 py-3 text-sm">{row.salesperson ? `${row.salesperson.first_name || ''} ${row.salesperson.last_name || ''}`.trim() : '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={row.status} t={t} /></td>
                <td className="px-4 py-3"><div className="flex gap-1"><button type="button" onClick={() => { setSelected(row); setModal(true); }} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg"><Edit2 size={16} /></button><button type="button" onClick={() => handleDelete(row)} className="p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 size={16} className="text-rose-500" /></button></div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && <div className="flex justify-center gap-2 mt-4"><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft /></button><span>{page}/{totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight /></button></div>}
      <AnimatePresence>{modal && <SampleModal isOpen onClose={() => { setModal(false); setSelected(null); }} onSave={handleSave} item={selected} products={products} users={users} isLoading={saving} t={t} lockSalesperson={isSalesRep} />}</AnimatePresence>
    </div>
  );
};

export default SamplesPage;
