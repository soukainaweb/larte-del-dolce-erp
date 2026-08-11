import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FONT_HEADING = "'Cormorant Garamond', serif";

const DocumentationPage = () => {
  const { t } = useTranslation();

  const sections = t('documentation.sections', { returnObjects: true }) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F8F5EF] text-[#B8863B]">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
              {t('nav.documentation')}
            </h1>
            <p className="mt-1 text-sm text-[#6D6D6D]">{t('documentation.subtitle')}</p>
          </div>
        </div>

        <div className="space-y-4">
          {Array.isArray(sections) && sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-[#ECE8E1] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[#3D2F24] mb-2" style={{ fontFamily: FONT_HEADING }}>
                {section.title}
              </h2>
              <p className="text-sm text-[#6D6D6D] leading-relaxed mb-4">{section.description}</p>
              {section.route ? (
                <Link
                  to={section.route}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B8863B] hover:text-[#96702E]"
                >
                  {section.linkLabel || t('documentation.openModule')}
                  <ExternalLink size={14} />
                </Link>
              ) : null}
            </div>
          ))}
        </div>

        <Link
          to="/dashboard/help"
          className="inline-flex items-center gap-2 text-sm text-[#6D6D6D] hover:text-[#3D2F24]"
        >
          <ArrowLeft size={16} />
          {t('documentation.backToHelp')}
        </Link>
      </motion.div>
    </div>
  );
};

export default DocumentationPage;
