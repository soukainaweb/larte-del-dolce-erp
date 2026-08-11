import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LifeBuoy, BookOpen, Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FONT_HEADING = "'Cormorant Garamond', serif";

const HelpCenterPage = () => {
  const { t } = useTranslation();

  const faqItems = t('helpCenter.faq.items', { returnObjects: true }) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F8F5EF] text-[#B8863B]">
            <LifeBuoy size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
              {t('nav.helpCenter')}
            </h1>
            <p className="mt-1 text-sm text-[#6D6D6D]">{t('helpCenter.subtitle')}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#ECE8E1] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#B8863B] mb-2">
              <BookOpen size={18} />
              <h2 className="text-sm font-bold text-[#3D2F24]">{t('helpCenter.documentationCard.title')}</h2>
            </div>
            <p className="text-sm text-[#6D6D6D] mb-4">{t('helpCenter.documentationCard.description')}</p>
            <Link
              to="/dashboard/documentation"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B8863B] hover:text-[#96702E]"
            >
              {t('helpCenter.documentationCard.action')}
            </Link>
          </div>

          <div className="rounded-2xl border border-[#ECE8E1] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#B8863B] mb-2">
              <Mail size={18} />
              <h2 className="text-sm font-bold text-[#3D2F24]">{t('helpCenter.contactCard.title')}</h2>
            </div>
            <p className="text-sm text-[#6D6D6D] mb-2">{t('helpCenter.contactCard.description')}</p>
            <a
              href="mailto:support@larte.com"
              className="text-sm font-medium text-[#B8863B] hover:text-[#96702E]"
            >
              support@larte.com
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ECE8E1] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={18} className="text-[#B8863B]" />
            <h2 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
              {t('helpCenter.faq.title')}
            </h2>
          </div>
          <div className="space-y-4">
            {Array.isArray(faqItems) && faqItems.map((item) => (
              <div key={item.question} className="rounded-xl bg-[#F8F7F4] border border-[#ECE8E1] p-4">
                <h3 className="text-sm font-semibold text-[#3D2F24]">{item.question}</h3>
                <p className="mt-2 text-sm text-[#6D6D6D] leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#6D6D6D] hover:text-[#3D2F24]"
        >
          <ArrowLeft size={16} />
          {t('helpCenter.backToDashboard')}
        </Link>
      </motion.div>
    </div>
  );
};

export default HelpCenterPage;
