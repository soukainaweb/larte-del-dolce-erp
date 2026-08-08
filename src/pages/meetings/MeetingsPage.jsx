import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit2, Trash2, Eye, X, RefreshCw,
  ChevronLeft, ChevronRight, Video, LogIn, Mail,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { unwrapData, unwrapPaginated, getApiErrorMessage, extractFieldErrors, normalizeCustomerList } from '../../utils/apiHelpers';
import { isAdminRole } from '../../utils/permissions';
import {
  getMeetings, createMeeting, updateMeeting, deleteMeeting, getMeetingStatistics, startMeeting, scheduleMeeting,
  getMeetingInvitees,
} from '../../services/meetingService';
import { getCustomers } from '../../services/customerService';
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
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
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

const formatCustomerLabel = (customer) => {
  const name = customer?.name || customer?.company_name || `#${customer?.id}`;
  const extra = [customer?.email, customer?.phone].filter(Boolean).join(' · ');
  return extra ? `${name} (${extra})` : name;
};

const formatOrderLabel = (order) => {
  const number = order?.order_number || order?.orderNumber || `#${order?.id}`;
  const customer = order?.customer?.name || order?.customer_name || '';
  const status = order?.status ? ` — ${order.status}` : '';
  return customer ? `${number} · ${customer}${status}` : `${number}${status}`;
};

const formatUserLabel = (user) => {
  const name = user?.fullName || user?.full_name
    || `${user?.firstName || user?.first_name || ''} ${user?.lastName || user?.last_name || ''}`.trim();
  return name ? `${name} (${user?.email || ''})` : (user?.email || `#${user?.id}`);
};

const MeetingModal = ({ isOpen, onClose, onSave, item, customers, orders, users, formLoading, isLoading, serverErrors, t }) => {
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [participantSearch, setParticipantSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

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
    setParticipantSearch('');
    setCustomerSearch('');
    setOrderSearch('');
  }, [item, isOpen]);

  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length) {
      setErrors((prev) => ({ ...prev, ...serverErrors }));
    }
  }, [serverErrors]);

  const filteredCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    const q = customerSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => formatCustomerLabel(c).toLowerCase().includes(q));
  }, [customers, customerSearch]);

  const filteredOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const q = orderSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((o) => formatOrderLabel(o).toLowerCase().includes(q));
  }, [orders, orderSearch]);

  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    const q = participantSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((u) => formatUserLabel(u).toLowerCase().includes(q));
  }, [users, participantSearch]);

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

  const handleSubmit = (e, publish = false) => {
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
      publish,
    }, publish);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {item ? t('meetings.editTitle') : t('meetings.addTitle')}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e, false); }} className="p-6 space-y-4">
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
                className={`w-full px-3 py-2 text-sm border rounded-lg ${errors.meeting_date ? 'border-rose-500' : 'border-[#ECE8E1]'}`} />
              {errors.meeting_date && <p className="text-xs text-rose-500 mt-1">{errors.meeting_date}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('meetings.fields.time')} *</label>
              <input type="time" name="meeting_time" value={form.meeting_time} onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg ${errors.meeting_time ? 'border-rose-500' : 'border-[#ECE8E1]'}`} />
              {errors.meeting_time && <p className="text-xs text-rose-500 mt-1">{errors.meeting_time}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('nav.customers')}</label>
            {customers.length > 8 && (
              <input
                type="search"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder={t('common.search')}
                className="w-full mb-2 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg"
              />
            )}
            <select name="customer_id" value={form.customer_id} onChange={handleChange} disabled={formLoading}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg disabled:opacity-60">
              <option value="">{formLoading ? t('common.loading') : t('common.selectOption')}</option>
              {filteredCustomers.map((c) => (
                <option key={c.id} value={c.id}>{formatCustomerLabel(c)}</option>
              ))}
            </select>
            {!formLoading && filteredCustomers.length === 0 && (
              <p className="text-xs text-[#6D6D6D] mt-1">{t('meetings.emptyCustomers', 'لا يوجد عملاء')}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('nav.orders')}</label>
            {orders.length > 8 && (
              <input
                type="search"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder={t('common.search')}
                className="w-full mb-2 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg"
              />
            )}
            <select name="order_id" value={form.order_id} onChange={handleChange} disabled={formLoading}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg disabled:opacity-60">
              <option value="">{formLoading ? t('common.loading') : t('common.selectOption')}</option>
              {filteredOrders.map((o) => (
                <option key={o.id} value={o.id}>{formatOrderLabel(o)}</option>
              ))}
            </select>
            {!formLoading && filteredOrders.length === 0 && (
              <p className="text-xs text-[#6D6D6D] mt-1">{t('meetings.emptyOrders', 'لا يوجد طلبات')}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('meetings.fields.invitees')}</label>
            <input
              type="search"
              value={participantSearch}
              onChange={(e) => setParticipantSearch(e.target.value)}
              placeholder={t('common.search')}
              className="w-full mb-2 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg"
            />
            <div className="max-h-40 overflow-y-auto border border-[#ECE8E1] rounded-lg p-2 space-y-1">
              {formLoading ? (
                <p className="text-sm text-[#6D6D6D] px-2 py-1">{t('common.loading')}</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-[#6D6D6D] px-2 py-1">{t('meetings.emptyParticipants', 'لا يوجد مشاركون')}</p>
              ) : filteredUsers.map((u) => (
                <label key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F8F7F4] cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={(form.invitee_user_ids || []).includes(u.id)}
                    onChange={() => toggleInvitee(u.id)}
                  />
                  <span className="truncate">{formatUserLabel(u)}</span>
                </label>
              ))}
            </div>
            {errors.invitee_user_ids && <p className="text-xs text-rose-500 mt-1">{errors.invitee_user_ids}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('common.notes')}</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-[#ECE8E1] rounded-xl">{t('common.cancel')}</button>
            <button type="button" disabled={isLoading} onClick={(e) => { e.preventDefault(); handleSubmit(e, false); }}
              className="px-4 py-2 text-sm rounded-xl border border-[#ECE8E1] disabled:opacity-50">
              {isLoading ? t('common.saving') : t('meetings.actions.saveDraft')}
            </button>
            <button type="button" disabled={isLoading} onClick={(e) => { e.preventDefault(); handleSubmit(e, true); }}
              className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white disabled:opacity-50">
              {isLoading ? t('common.saving') : t('meetings.actions.schedule')}
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
  const [stats, setStats] = useState({ total: 0, draft: 0, scheduled: 0, live: 0, finished: 0, cancelled: 0 });
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
  const [schedulingId, setSchedulingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const fetchFormOptions = async () => {
    setFormLoading(true);
    try {
      const [customersRes, ordersRes, inviteesRes] = await Promise.all([
        getCustomers({ per_page: 200 }),
        orderService.getOrders({ per_page: 200 }),
        getMeetingInvitees({ per_page: 200 }),
      ]);
      const { items: customerItems } = normalizeCustomerList(customersRes);
      const orderItems = Array.isArray(ordersRes?.data) ? ordersRes.data : [];
      const inviteeItems = unwrapData(inviteesRes) || [];
      setCustomers(customerItems);
      setOrders(orderItems);
      setUsers(Array.isArray(inviteeItems) ? inviteeItems : []);
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.loadFormOptions', 'تعذر تحميل بيانات النموذج')), 'error');
      setCustomers([]);
      setOrders([]);
      setUsers([]);
    } finally {
      setFormLoading(false);
    }
  };

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
  }, []);

  useEffect(() => {
    if (modal === 'form') {
      setFormErrors({});
      fetchFormOptions();
    }
  }, [modal]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const handleSave = async (payload, publish = false) => {
    setSaving(true);
    setFormErrors({});
    try {
      const body = {
        ...payload,
        customer_id: payload.customer_id ? Number(payload.customer_id) : null,
        order_id: payload.order_id ? Number(payload.order_id) : null,
        invitee_user_ids: (payload.invitee_user_ids || []).map((id) => Number(id)).filter(Boolean),
        publish: Boolean(publish),
      };
      if (selected) {
        await updateMeeting(selected.id, body);
        showToast(publish ? t('meetings.messages.scheduled') : t('meetings.messages.updated'), 'success');
      } else {
        await createMeeting(body);
        showToast(publish ? t('meetings.messages.scheduled') : t('meetings.messages.draftCreated'), 'success');
      }
      setModal(null);
      setSelected(null);
      fetchData();
      getMeetingStatistics().then((r) => setStats(unwrapData(r) || {}));
    } catch (err) {
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        setFormErrors(fieldErrors);
        showToast(t('meetings.errors.validation', 'يرجى تصحيح الأخطاء في النموذج'), 'error');
      } else {
        showToast(getApiErrorMessage(err, t('meetings.errors.save')), 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleDraft = async (item) => {
    setSchedulingId(item.id);
    try {
      await scheduleMeeting(item.id);
      showToast(t('meetings.messages.scheduled'), 'success');
      fetchData();
      getMeetingStatistics().then((r) => setStats(unwrapData(r) || {}));
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.save')), 'error');
    } finally {
      setSchedulingId(null);
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
      navigate(`/dashboard/meetings/${item.id}/room`);
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.save')), 'error');
    }
  };

  const filtered = useMemo(() => items, [items]);
  const statusOptions = ['draft', 'scheduled', 'live', 'finished', 'cancelled'];

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

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[
          { label: t('meetings.kpi.total'), value: stats.total, color: 'text-blue-600' },
          { label: t('meetings.status.draft'), value: stats.draft, color: 'text-amber-600' },
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
                  const isInvited = isHost || (row.invitees || []).some((inv) => Number(inv.user_id) === Number(user?.id));
                  const canJoin = row.status === 'live' && isInvited;
                  return (
                    <tr key={row.id} className="border-b border-[#ECE8E1] hover:bg-[#F8F7F4]">
                      <td className="px-4 py-3 text-sm font-medium">
                        <button type="button" onClick={() => navigate(`/dashboard/meetings/${row.id}`)}
                          className="text-left hover:text-[#B8863B] transition-colors">
                          {row.title}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
                        {row.meeting_date ? new Date(row.meeting_date).toLocaleDateString(DATE_LOCALE) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{(row.meeting_time || '').slice(0, 5)}</td>
                      <td className="px-4 py-3 text-sm">{row.customer?.name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status} t={t} /></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.status === 'draft' && isHost && (
                            <button type="button" onClick={() => handleScheduleDraft(row)} disabled={schedulingId === row.id}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 disabled:opacity-50">
                              <Mail size={14} />{t('meetings.actions.schedule')}
                            </button>
                          )}
                          {row.status === 'scheduled' && isHost && (
                            <button type="button" onClick={() => handleStartAndJoin(row)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Video size={14} />{t('meetings.room.startMeeting')}
                            </button>
                          )}
                          {row.status === 'live' && canJoin && (
                            <button type="button" onClick={() => navigate(`/dashboard/meetings/${row.id}/room`)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                              <LogIn size={14} />{t('meetings.room.joinMeeting')}
                            </button>
                          )}
                          <button type="button" onClick={() => navigate(`/dashboard/meetings/${row.id}`)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg"><Eye size={16} /></button>
                          {isHost && !['live'].includes(row.status) && (
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
            formLoading={formLoading} serverErrors={formErrors}
            onClose={() => { setModal(null); setSelected(null); }} onSave={handleSave} isLoading={saving} t={t} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingsPage;
