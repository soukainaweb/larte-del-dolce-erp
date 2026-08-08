import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createCustomerQuick } from '../../services/customerService';
import { extractFieldErrors, getApiErrorMessage } from '../../utils/apiHelpers';

const FONT_HEADING = "'Cormorant Garamond', serif";

const emptyForm = () => ({
  name: '',
  address: '',
  city: '',
});

const AddCustomerModal = ({ isOpen, onClose, onCreated, showToast }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(emptyForm());
    setErrors({});
    setIsSaving(false);
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});
    try {
      const customer = await createCustomerQuick(form);
      showToast?.(t('orders.customerModal.success', 'تمت إضافة العميل بنجاح'), 'success');
      onCreated?.(customer);
      onClose?.();
    } catch (err) {
      const fieldErrors = extractFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        showToast?.(getApiErrorMessage(err, t('customers.errors.save', 'خطأ أثناء حفظ العميل')), 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {t('orders.customerModal.title', 'إضافة عميل')}
          </h3>
          <button type="button" onClick={onClose} disabled={isSaving} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">
              {t('orders.customerModal.name', 'اسم العميل')} *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg ${errors.name ? 'border-rose-500' : 'border-[#ECE8E1]'}`}
              autoComplete="name"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">
              {t('orders.customerModal.address', 'العنوان')} *
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg ${errors.address ? 'border-rose-500' : 'border-[#ECE8E1]'}`}
              autoComplete="street-address"
            />
            {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase">
              {t('orders.customerModal.city', 'المدينة')} *
            </label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg ${errors.city ? 'border-rose-500' : 'border-[#ECE8E1]'}`}
              autoComplete="address-level2"
            />
            {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-2.5 text-sm border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4]"
            >
              {t('common.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 text-sm text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg disabled:opacity-50"
            >
              {isSaving ? t('common.saving', 'جاري الحفظ...') : t('orders.customerModal.save', 'حفظ العميل')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddCustomerModal;
