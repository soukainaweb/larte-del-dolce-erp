import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, UserPlus, X } from 'lucide-react';
import { usePageI18n } from '../../hooks/usePageI18n';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';
import orderService from '../../services/orderService';
import AddCustomerModal from './AddCustomerModal';
import { extractFieldErrors, getApiErrorMessage } from '../../utils/apiHelpers';
import { isSalesRepRole } from '../../utils/roleMapping';

const FONT_HEADING = "'Cormorant Garamond', serif";
const CURRENCY_SYMBOL = 'ر.س';

const emptyLine = () => ({
  key: Date.now() + Math.random(),
  product_id: '',
  quantity: 1,
  price: 0,
  discount: 0,
});

const emptyForm = (salesRepId = '') => ({
  customer_id: '',
  sales_rep_id: salesRepId,
  priority: 'medium',
  delivery_date: '',
  delivery_time: '',
  payment_method: 'cash',
  notes: '',
  items: [emptyLine()],
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const calcLine = (line) => {
  const qty = Math.max(0, Number(line.quantity) || 0);
  const price = Math.max(0, Number(line.price) || 0);
  const discount = clamp(Number(line.discount) || 0, 0, 100);
  const lineSubtotal = qty * price;
  const lineDiscount = lineSubtotal * (discount / 100);
  const lineTotal = lineSubtotal - lineDiscount;
  return { lineSubtotal, lineDiscount, lineTotal, qty, price, discount };
};

const formatCustomerLabel = (c) => {
  const lines = [c?.name].filter(Boolean);
  const details = [c?.city, c?.phone, c?.email].filter(Boolean);
  if (details.length) {
    return `${lines[0]}\n${details.join(' · ')}`;
  }
  return lines[0] || '—';
};

const customerMatchesSearch = (customer, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    customer?.name,
    customer?.city,
    customer?.phone,
    customer?.email,
    customer?.address,
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(q);
};

const filterSalesReps = (users) =>
  (Array.isArray(users) ? users : []).filter((user) => isSalesRepRole(user));

const formatRepLabel = (u) => {
  const name = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim();
  return name ? `${name} (${u.email || ''})` : (u.email || `#${u.id}`);
};

const OrderFormModal = ({
  isOpen,
  onClose,
  onSaved,
  order,
  isLoading,
  isSalesRep,
  currentUserId,
  showToast,
}) => {
  const { user, roleKey, permissions } = useAuth();
  const { t, tc } = usePageI18n('orders');
  const canCreateCustomer = hasPermission('customers.create', permissions, user?.role ?? roleKey);
  const [form, setForm] = useState(emptyForm(isSalesRep ? String(currentUserId || '') : ''));
  const [errors, setErrors] = useState({});
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const loadFormOptions = async () => {
    setOptionsLoading(true);
    try {
      const opts = await orderService.getOrderFormOptions();
      setCustomers(Array.isArray(opts.customers) ? opts.customers : []);
      setProducts(Array.isArray(opts.products) ? opts.products : []);
      setSalesReps(filterSalesReps(opts.sales_reps));
      if (isSalesRep && currentUserId) {
        setForm((prev) => ({ ...prev, sales_rep_id: String(currentUserId) }));
      }
    } catch (err) {
      showToast?.(getApiErrorMessage(err, t('orders.errors.loadFormOptions', 'تعذر تحميل بيانات النموذج')), 'error');
      setCustomers([]);
      setProducts([]);
      setSalesReps([]);
    } finally {
      setOptionsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setCustomerSearch('');
    setProductSearch('');
    setIsAddCustomerOpen(false);
    setForm(emptyForm(isSalesRep ? String(currentUserId || '') : ''));
    loadFormOptions();
  }, [isOpen, isSalesRep, currentUserId]);

  const filteredCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    return list.filter((c) => customerMatchesSearch(c, customerSearch));
  }, [customers, customerSearch]);

  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const q = productSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => `${p.name} ${p.sku || ''}`.toLowerCase().includes(q));
  }, [products, productSearch]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let total = 0;
    form.items.forEach((line) => {
      const { lineSubtotal, lineDiscount, lineTotal } = calcLine(line);
      subtotal += lineSubtotal;
      totalDiscount += lineDiscount;
      total += lineTotal;
    });
    return { subtotal, totalDiscount, total };
  }, [form.items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLineChange = (index, field, rawValue) => {
    setForm((prev) => {
      const items = [...prev.items];
      const line = { ...items[index] };
      if (field === 'product_id') {
        line.product_id = rawValue;
        const product = products.find((p) => String(p.id) === String(rawValue));
        if (product) line.price = Number(product.price) || 0;
      } else if (field === 'quantity') {
        line.quantity = Math.max(1, parseInt(rawValue, 10) || 1);
      } else if (field === 'price') {
        line.price = Math.max(0, parseFloat(rawValue) || 0);
      } else if (field === 'discount') {
        line.discount = clamp(parseFloat(rawValue) || 0, 0, 100);
      }
      items[index] = line;
      return { ...prev, items };
    });
    if (errors.items) setErrors((prev) => ({ ...prev, items: '' }));
  };

  const addLine = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyLine()] }));
  };

  const removeLine = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items,
    }));
  };

  const validate = () => {
    const next = {};
    if (!form.customer_id) next.customer_id = t('orders.validation.customerRequired');
    if (!form.sales_rep_id) next.sales_rep_id = t('orders.validation.repRequired');
    if (!form.items.length) next.items = t('orders.validation.productsRequired');
    if (form.items.some((l) => !l.product_id)) next.items = t('orders.validation.productNameRequired');
    if (form.items.some((l) => (Number(l.quantity) || 0) < 1)) next.items = t('orders.validation.quantityInvalid', 'الكمية غير صحيحة');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCustomerCreated = async (customer) => {
    if (customer?.id) {
      setForm((prev) => ({ ...prev, customer_id: String(customer.id) }));
      setErrors((prev) => ({ ...prev, customer_id: '' }));
    }
    try {
      const opts = await orderService.getOrderFormOptions();
      const nextCustomers = Array.isArray(opts.customers) ? opts.customers : [];
      setCustomers(nextCustomers);
      if (customer?.id) {
        setForm((prev) => ({ ...prev, customer_id: String(customer.id) }));
      }
    } catch (err) {
      if (customer?.id) {
        setCustomers((prev) => {
          const exists = prev.some((c) => String(c.id) === String(customer.id));
          return exists ? prev : [...prev, customer];
        });
      }
      showToast?.(getApiErrorMessage(err, t('orders.errors.loadFormOptions', 'تعذر تحديث قائمة العملاء')), 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});
    try {
      const payload = orderService.buildCreateOrderPayload(form);
      const response = await orderService.createOrder(payload);
      showToast?.(t('orders.messages.created', 'تم إنشاء الطلب بنجاح'), 'success');
      onSaved?.(response.data);
      onClose?.();
    } catch (err) {
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        const mapped = { ...fieldErrors };
        Object.entries(fieldErrors).forEach(([key, message]) => {
          if (key.startsWith('items')) mapped.items = message;
          if (key === 'customer_id') mapped.customer_id = message;
          if (key === 'sales_rep_id') mapped.sales_rep_id = message;
        });
        setErrors(mapped);
        showToast?.(t('orders.errors.validation', 'يرجى تصحيح الأخطاء في النموذج'), 'error');
      } else {
        showToast?.(getApiErrorMessage(err, t('orders.errors.save', 'حدث خطأ أثناء حفظ الطلب')), 'error');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {order ? t('orders.modals.editTitle') : t('orders.addOrder')}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1]">
            <h4 className="text-sm font-bold text-[#3D2F24] mb-3">{t('orders.sections.customerInfo')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('orders.table.customer')} *</label>
                <input
                  type="search"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder={tc('search')}
                  className="w-full mb-2 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg"
                />
                <select
                  name="customer_id"
                  value={form.customer_id}
                  onChange={handleChange}
                  disabled={optionsLoading}
                  className={`w-full px-3 py-2 text-sm border rounded-lg ${errors.customer_id ? 'border-rose-500' : 'border-[#ECE8E1]'}`}
                >
                  <option value="">{optionsLoading ? tc('loading') : t('orders.fields.selectCustomer', 'اختر عميلاً...')}</option>
                  {filteredCustomers.map((c) => (
                    <option key={c.id} value={c.id}>{formatCustomerLabel(c).replace('\n', ' — ')}</option>
                  ))}
                </select>
                {errors.customer_id && <p className="text-xs text-rose-500 mt-1">{errors.customer_id}</p>}
                {canCreateCustomer && (
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerOpen(true)}
                    disabled={optionsLoading}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#B8863B] border border-[#B8863B]/30 rounded-lg hover:bg-[#F8F5EF] disabled:opacity-50"
                  >
                    <UserPlus size={14} />
                    {t('orders.fields.addCustomer', '+ إضافة عميل')}
                  </button>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('orders.table.rep')} *</label>
                <select
                  name="sales_rep_id"
                  value={form.sales_rep_id}
                  onChange={handleChange}
                  disabled={optionsLoading}
                  className={`w-full px-3 py-2 text-sm border rounded-lg ${errors.sales_rep_id ? 'border-rose-500' : 'border-[#ECE8E1]'} disabled:opacity-70`}
                >
                  <option value="">{optionsLoading ? tc('loading') : tc('selectOption')}</option>
                  {salesReps.map((u) => (
                    <option key={u.id} value={u.id}>{formatRepLabel(u)}</option>
                  ))}
                </select>
                {errors.sales_rep_id && <p className="text-xs text-rose-500 mt-1">{errors.sales_rep_id}</p>}
              </div>
            </div>
          </div>

          <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1]">
            <h4 className="text-sm font-bold text-[#3D2F24] mb-3">{t('orders.sections.generalInfo')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{tc('priority')}</label>
                <select name="priority" value={form.priority} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg">
                  <option value="low">{t('orders.priority.low')}</option>
                  <option value="medium">{t('orders.priority.medium')}</option>
                  <option value="high">{t('orders.priority.high')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('orders.table.deliveryDate')}</label>
                <input type="date" name="delivery_date" value={form.delivery_date} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('orders.fields.deliveryTime')}</label>
                <input type="time" name="delivery_time" value={form.delivery_time} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{t('orders.fields.paymentMethod')}</label>
                <select name="payment_method" value={form.payment_method} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg">
                  <option value="cash">{t('orders.paymentMethods.cash', 'نقداً')}</option>
                  <option value="card">{t('orders.paymentMethods.card', 'بطاقة بنكية')}</option>
                  <option value="transfer">{t('orders.paymentMethods.transfer', 'تحويل')}</option>
                  <option value="credit">{t('orders.paymentMethods.credit', 'أجل')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[#3D2F24]">{tc('product')}</h4>
              <button type="button" onClick={addLine} disabled={optionsLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#B8863B] rounded-lg">
                <Plus size={14} />
                {t('orders.fields.addProduct')}
              </button>
            </div>
            {products.length > 8 && (
              <input
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={tc('search')}
                className="w-full mb-3 px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg"
              />
            )}
            {errors.items && <p className="text-xs text-rose-500 mb-2">{errors.items}</p>}
            <div className="space-y-3">
              {form.items.map((line, index) => {
                const { lineTotal } = calcLine(line);
                return (
                  <div key={line.key} className="bg-white rounded-lg p-3 border border-[#ECE8E1]">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">{tc('product')}</label>
                        <select
                          value={line.product_id}
                          onChange={(e) => handleLineChange(index, 'product_id', e.target.value)}
                          disabled={optionsLoading}
                          className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg"
                        >
                          <option value="">{optionsLoading ? tc('loading') : tc('selectOption')}</option>
                          {filteredProducts.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">{t('orders.fields.quantity')}</label>
                        <input type="number" min="1" value={line.quantity} onChange={(e) => handleLineChange(index, 'quantity', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">{tc('price')} ({CURRENCY_SYMBOL})</label>
                        <input type="number" min="0" step="0.01" value={line.price} onChange={(e) => handleLineChange(index, 'price', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">{t('orders.fields.discount')}</label>
                        <input type="number" min="0" max="100" step="0.01" value={line.discount} onChange={(e) => handleLineChange(index, 'discount', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-[#ECE8E1] rounded-lg" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <label className="block text-[10px] font-semibold text-[#6D6D6D] mb-1">{tc('total')}</label>
                          <p className="text-sm font-bold text-[#3D2F24]">{lineTotal.toFixed(2)} {CURRENCY_SYMBOL}</p>
                        </div>
                        {form.items.length > 1 && (
                          <button type="button" onClick={() => removeLine(index)} className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#F8F7F4] rounded-xl p-4 border border-[#ECE8E1]">
            <h4 className="text-sm font-bold text-[#3D2F24] mb-3">{t('orders.summary.title')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">{t('orders.summary.subtotal')}</span>
                <span>{totals.subtotal.toFixed(2)} {CURRENCY_SYMBOL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6D6D]">{t('orders.summary.totalDiscount')}</span>
                <span>{totals.totalDiscount.toFixed(2)} {CURRENCY_SYMBOL}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#ECE8E1] font-bold text-lg">
                <span>{t('orders.summary.grandTotal')}</span>
                <span>{totals.total.toFixed(2)} {CURRENCY_SYMBOL}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">{tc('notes')}</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#ECE8E1]">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm border border-[#ECE8E1] rounded-lg">{tc('cancel')}</button>
            <button type="submit" disabled={isLoading || optionsLoading} className="flex-1 py-2.5 text-sm text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg disabled:opacity-50">
              {isLoading ? tc('saving') : t('orders.addOrder')}
            </button>
          </div>
        </form>
      </motion.div>

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onCreated={handleCustomerCreated}
        showToast={showToast}
      />
    </div>
  );
};

export default OrderFormModal;
