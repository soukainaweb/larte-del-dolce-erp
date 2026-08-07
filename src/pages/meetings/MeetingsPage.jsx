import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Plus, Search, Edit2, Trash2, Eye, X, RefreshCw,
  ChevronLeft, ChevronRight, Users, ClipboardList, Video, LogIn,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { unwrapData, unwrapPaginated, getApiErrorMessage } from '../../utils/apiHelpers';
import { isAdminRole } from '../../utils/permissions';
import {
  getMeetings, createMeeting, updateMeeting, deleteMeeting, getMeetingStatistics, startMeeting,
} from '../../services/meetingService';
import { getCustomers } from '../../services/customerService';
import { getUsers } from '../../services/userServicePage';
import orderService from '../../services/orderService';

const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';

const emptyForm = () => ({
  title: '',
  meeting_date: new Date().toISOString().split('T')[0],
  meeting_time: '10:00',
  customer_id: '',
  order_id: '',
  notes: '',
  invitee_user_ids: [],
});

const StatusBadge = ({ status, t }) => {
  const map = {
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    live: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse',
    finished: 'bg-slate-50 text-slate-700 border-slate-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    completed: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  const key = status === 'completed' ? 'finished' : status;
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${map[status] || map.scheduled}`}>
      {t(`meetings.status.${key}`, status)}
    </span>
  );
};

const canManageMeeting = (meeting, user) => {
  if (!meeting || !user) return false;
  if (isAdminRole(user.role)) return true;
  return Number(meeting.created_by) === Number(user.id);
};

const MeetingModal = ({ isOpen, onClose, onSave, item, customers, orders, users, isLoading, t }) => {
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        meeting_date: item.meeting_date?.split?.('T')?.[0] || item.meeting_date || '',
        meeting_time: (item.meeting_time || '10:00').slice(0, 5),
        customer_id: item.customer_id || item.customer?.id || '',
        order_id: item.order_id || item.order?.id || '',
        notes: item.notes || '',
        invitee_user_ids: (item.invitees || []).map((i) => i.user_id).filter(Boolean),
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [item, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleInvitee = (userId) => {
    setForm((prev) => {
      const ids = prev.invitee_user_ids || [];
      const next = ids.includes(userId)
        ? ids.filter((id) => id !== userId)
        : [...ids, userId];
      return { ...prev, invitee_user_ids: next };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = t('common.validation.nameRequired');
    if (!form.meeting_date) next.meeting_date = t('common.validation.dateRequired');
    if (!form.meeting_time) next.meeting_time = t('common.validation.required');
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    onSave({
      ...form,
      customer_id: form.customer_id || null,
      order_id: form.order_id || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {item ? t('meetings.editTitle') : t('meetings.addTitle')}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('meetings.fields.title')} *</label>
            <input name="title" value={form.title} onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#B8863B]/30 ${errors.title ? 'border-rose-500' : 'border-[#ECE8E1]'}`} />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('common.date')} *</label>
              <input type="date" name="meeting_date" value={form.meeting_date} onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('meetings.fields.time')} *</label>
              <input type="time" name="meeting_time" value={form.meeting_time} onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('nav.customers')}</label>
            <select name="customer_id" value={form.customer_id} onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg">
              <option value="">{t('common.selectOption')}</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('nav.orders')}</label>
            <select name="order_id" value={form.order_id} onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg">
              <option value="">{t('common.selectOption')}</option>
              {orders.map((o) => <option key={o.id} value={o.id}>{o.order_number || o.orderNumber || `#${o.id}`}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('meetings.fields.invitees')}</label>
            <div className="max-h-40 overflow-y-auto border border-[#ECE8E1] rounded-lg p-2 space-y-1">
              {users.map((u) => {
                const label = u.fullName || `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.trim() || u.email;
                return (
                  <label key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F8F7F4] cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={(form.invitee_user_ids || []).includes(u.id)}
                      onChange={() => toggleInvitee(u.id)}
                    />
                    <span className="truncate">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('common.notes')}</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-[#ECE8E1] rounded-xl">{t('common.cancel')}</button>
            <button type="submit" disabled={isLoading}
              className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white disabled:opacity-50">
              {isLoading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const MeetingsPage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, live: 0, finished: 0, cancelled: 0 });
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMeetings({
        page, per_page: perPage,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      const { items: rows, meta } = unwrapPaginated(res);
      setItems(rows);
      setTotal(meta.total || rows.length);
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.load')), 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search, statusFilter]);
  useEffect(() => {
    getMeetingStatistics().then((r) => setStats(unwrapData(r) || {})).catch(() => {});
    getCustomers({ per_page: 200 }).then((r) => {
      const { items } = unwrapPaginated(r);
      setCustomers(items);
    }).catch(() => {});
    orderService.getOrders({ per_page: 200 }).then((r) => setOrders(r.data || [])).catch(() => {});
    getUsers({ per_page: 200 }).then((r) => {
      const { items } = unwrapPaginated(r);
      setUsers(items);
    }).catch(() => {});
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (selected) {
        await updateMeeting(selected.id, payload);
        showToast(t('meetings.messages.updated'), 'success');
      } else {
        await createMeeting(payload);
        showToast(t('meetings.messages.created'), 'success');
      }
      setModal(null);
      setSelected(null);
      fetchData();
      getMeetingStatistics().then((r) => setStats(unwrapData(r) || {}));
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.save')), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(t('meetings.confirmDelete'))) return;
    try {
      await deleteMeeting(item.id);
      showToast(t('meetings.messages.deleted'), 'success');
      fetchData();
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.delete')), 'error');
    }
  };

  const handleStartAndJoin = async (item) => {
    try {
      if (item.status === 'scheduled' && canManageMeeting(item, user)) {
        await startMeeting(item.id);
      }
      navigate(`/dashboard/meetings/${item.id}`);
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.save')), 'error');
    }
  };

  const filtered = useMemo(() => items, [items]);
  const statusOptions = ['scheduled', 'live', 'finished', 'cancelled'];

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] p-6" style={{ fontFamily: FONT_BODY }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>{t('meetings.title')}</h1>
          <p className="text-sm text-[#6D6D6D]">{t('meetings.subtitle')}</p>
        </div>
        <button type="button" onClick={() => { setSelected(null); setModal('form'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white">
          <Plus size={18} />{t('meetings.addTitle')}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: t('meetings.kpi.total'), value: stats.total, color: 'text-blue-600' },
          { label: t('meetings.status.scheduled'), value: stats.scheduled, color: 'text-indigo-600' },
          { label: t('meetings.status.live'), value: stats.live, color: 'text-emerald-600' },
          { label: t('meetings.status.finished'), value: stats.finished ?? stats.completed, color: 'text-slate-600' },
          { label: t('meetings.status.cancelled'), value: stats.cancelled, color: 'text-rose-600' },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-[#ECE8E1] rounded-xl p-4">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value ?? 0}</p>
            <p className="text-xs text-[#6D6D6D]">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('meetings.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg">
          <option value="all">{t('common.allStatuses')}</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{t(`meetings.status.${s}`)}</option>
          ))}
        </select>
        <button type="button" onClick={fetchData} className="p-2 border border-[#ECE8E1] rounded-lg"><RefreshCw size={16} /></button>
      </div>

      <div className="bg-white border border-[#ECE8E1] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#6D6D6D]">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#6D6D6D]">{t('meetings.empty')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                <tr>
                  {[t('meetings.fields.title'), t('common.date'), t('meetings.fields.time'), t('nav.customers'), t('common.status'), t('common.actions')].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const isHost = canManageMeeting(row, user);
                  const canJoin = row.status === 'live' || (row.status === 'scheduled' && isHost);
                  return (
                    <tr key={row.id} className="border-b border-[#ECE8E1] hover:bg-[#F8F7F4]">
                      <td className="px-4 py-3 text-sm font-medium">{row.title}</td>
                      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
                        {row.meeting_date ? new Date(row.meeting_date).toLocaleDateString(DATE_LOCALE) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{(row.meeting_time || '').slice(0, 5)}</td>
                      <td className="px-4 py-3 text-sm">{row.customer?.name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status} t={t} /></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.status === 'scheduled' && isHost && (
                            <button type="button" onClick={() => handleStartAndJoin(row)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Video size={14} />{t('meetings.room.startMeeting')}
                            </button>
                          )}
                          {row.status === 'live' && canJoin && (
                            <button type="button" onClick={() => navigate(`/dashboard/meetings/${row.id}`)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                              <LogIn size={14} />{t('meetings.room.joinMeeting')}
                            </button>
                          )}
                          <button type="button" onClick={() => setViewItem(row)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg"><Eye size={16} /></button>
                          {isHost && row.status !== 'live' && (
                            <button type="button" onClick={() => { setSelected(row); setModal('form'); }} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg"><Edit2 size={16} /></button>
                          )}
                          {isHost && (
                            <button type="button" onClick={() => handleDelete(row)} className="p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 size={16} className="text-rose-500" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 border rounded-lg disabled:opacity-50"><ChevronLeft size={16} /></button>
          <span className="text-sm">{page} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-2 border rounded-lg disabled:opacity-50"><ChevronRight size={16} /></button>
        </div>
      )}

      <AnimatePresence>
        {modal === 'form' && (
          <MeetingModal isOpen customers={customers} orders={orders} users={users} item={selected}
            onClose={() => { setModal(null); setSelected(null); }} onSave={handleSave} isLoading={saving} t={t} />
        )}
      </AnimatePresence>

      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold" style={{ fontFamily: FONT_HEADING }}>{viewItem.title}</h3>
              <button type="button" onClick={() => setViewItem(null)}><X size={20} /></button>
            </div>
            <StatusBadge status={viewItem.status} t={t} />
            <p className="text-sm flex items-center gap-2"><CalendarDays size={14} />{viewItem.meeting_date} {(viewItem.meeting_time || '').slice(0, 5)}</p>
            <p className="text-sm flex items-center gap-2"><Users size={14} />{viewItem.customer?.name || '—'}</p>
            <p className="text-sm flex items-center gap-2"><ClipboardList size={14} />{viewItem.order?.order_number || '—'}</p>
            {viewItem.invitees?.length > 0 && (
              <div className="text-sm">
                <p className="font-semibold mb-1">{t('meetings.fields.invitees')}</p>
                <ul className="text-[#6D6D6D] space-y-0.5">
                  {viewItem.invitees.map((inv) => (
                    <li key={inv.id}>{inv.user?.first_name ? `${inv.user.first_name} ${inv.user.last_name || ''}` : inv.email}</li>
                  ))}
                </ul>
              </div>
            )}
            {viewItem.notes && <p className="text-sm text-[#6D6D6D]">{viewItem.notes}</p>}
            {(viewItem.status === 'live' || (viewItem.status === 'scheduled' && canManageMeeting(viewItem, user))) && (
              <button type="button" onClick={() => { setViewItem(null); handleStartAndJoin(viewItem); }}
                className="w-full mt-2 px-4 py-2 rounded-xl bg-[#B8863B] text-white text-sm">
                {viewItem.status === 'live' ? t('meetings.room.joinMeeting') : t('meetings.room.startMeeting')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
