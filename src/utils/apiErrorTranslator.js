/**
 * Translates common Laravel / API error messages to Arabic for UI toasts.
 * Keeps already-Arabic messages unchanged.
 */

const ARABIC_CHAR_RE = /[\u0600-\u06FF]/;

const FIELD_LABELS = {
  email: 'البريد الإلكتروني',
  name: 'الاسم',
  phone: 'الهاتف',
  password: 'كلمة المرور',
  title: 'العنوان',
  code: 'الرمز',
  visible: 'الظهور',
  featured: 'مميز',
  show_on_pos: 'عرض في نقطة البيع',
  available_online: 'التوفر عبر الإنترنت',
  price: 'السعر',
  stock: 'المخزون',
  sku: 'رمز المنتج',
  category: 'الفئة',
  category_id: 'الفئة',
  customer: 'العميل',
  customer_id: 'العميل',
  status: 'الحالة',
  type: 'النوع',
  address: 'العنوان',
  city: 'المدينة',
  description: 'الوصف',
};

/** Exact English/French server messages → Arabic */
const EXACT_MESSAGES = {
  'The email has already been taken.': 'البريد الإلكتروني مُستعمل بالفعل.',
  'The phone has already been taken.': 'رقم الهاتف مُستعمل بالفعل.',
  'The name field is required.': 'حقل الاسم مطلوب.',
  'The email field is required.': 'حقل البريد الإلكتروني مطلوب.',
  'The password field is required.': 'حقل كلمة المرور مطلوب.',
  'The visible field must be true or false.': 'قيمة الظهور يجب أن تكون صحيحة أو خاطئة.',
  'The featured field must be true or false.': 'قيمة «مميز» يجب أن تكون صحيحة أو خاطئة.',
  'The show on pos field must be true or false.': 'قيمة عرض نقطة البيع يجب أن تكون صحيحة أو خاطئة.',
  'The available online field must be true or false.': 'قيمة التوفر عبر الإنترنت يجب أن تكون صحيحة أو خاطئة.',
  Unauthenticated: 'يرجى تسجيل الدخول للوصول لهذه الصفحة.',
  'Unauthenticated.': 'يرجى تسجيل الدخول للوصول لهذه الصفحة.',
  'Server Error': 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً.',
  'Too Many Attempts.': 'محاولات كثيرة جداً. يرجى المحاولة لاحقاً.',
  'This action is unauthorized.': 'ليس لديك الصلاحيات اللازمة.',
  'Invalid credentials.': 'بيانات الدخول غير صحيحة.',
  'These credentials do not match our records.': 'بيانات الدخول غير صحيحة.',
  'Resource not found': 'العنصر المطلوب غير موجود.',
  'Endpoint not found': 'مسار واجهة البرمجة غير موجود. تحقق من إعدادات الخادم.',
  'Not Found': 'المورد غير موجود.',
  // French Laravel fallbacks
  'Le champ email est obligatoire.': 'حقل البريد الإلكتروني مطلوب.',
  'Le champ nom est obligatoire.': 'حقل الاسم مطلوب.',
  'Ces identifiants ne correspondent pas à nos enregistrements.': 'بيانات الدخول غير صحيحة.',
};

const fieldLabel = (raw) => {
  const key = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return FIELD_LABELS[key] || raw;
};

const PATTERNS = [
  {
    regex: /^The (.+) field is required\.?$/i,
    translate: (m) => `حقل ${fieldLabel(m[1])} مطلوب.`,
  },
  {
    regex: /^The (.+) has already been taken\.?$/i,
    translate: (m) => `${fieldLabel(m[1])} مُستعمل بالفعل.`,
  },
  {
    regex: /^The (.+) must be a boolean\.?$/i,
    translate: (m) => `قيمة ${fieldLabel(m[1])} يجب أن تكون صحيحة أو خاطئة.`,
  },
  {
    regex: /^The (.+) must be true or false\.?$/i,
    translate: (m) => `قيمة ${fieldLabel(m[1])} يجب أن تكون صحيحة أو خاطئة.`,
  },
  {
    regex: /^The selected (.+) is invalid\.?$/i,
    translate: (m) => `${fieldLabel(m[1])} المحدد غير صالح.`,
  },
  {
    regex: /^The (.+) must be a number\.?$/i,
    translate: (m) => `${fieldLabel(m[1])} يجب أن يكون رقماً.`,
  },
  {
    regex: /^The (.+) must be at least (\d+) characters\.?$/i,
    translate: (m) => `${fieldLabel(m[1])} يجب أن يكون ${m[2]} أحرف على الأقل.`,
  },
];

/**
 * @param {string|null|undefined} message
 * @returns {string|null}
 */
export const translateApiErrorMessage = (message) => {
  if (!message || typeof message !== 'string') return message ?? null;

  const trimmed = message.trim();
  if (!trimmed) return null;

  if (ARABIC_CHAR_RE.test(trimmed)) {
    return trimmed;
  }

  if (EXACT_MESSAGES[trimmed]) {
    return EXACT_MESSAGES[trimmed];
  }

  for (const { regex, translate } of PATTERNS) {
    const match = trimmed.match(regex);
    if (match) {
      return translate(match);
    }
  }

  return trimmed;
};

export default translateApiErrorMessage;
