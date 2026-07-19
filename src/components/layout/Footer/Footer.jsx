import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  FileText,
  BookOpen,
  Headphones,
  Server,
  Activity
} from 'lucide-react';

// =============================================
// CONSTANTS
// =============================================

const FOOTER_LINKS = [
  { id: 'privacy', label: 'Privacy Policy', icon: Shield, href: '/privacy' },
  { id: 'terms', label: 'Terms of Service', icon: FileText, href: '/terms' },
  { id: 'docs', label: 'Documentation', icon: BookOpen, href: '/docs' },
  { id: 'support', label: 'Support', icon: Headphones, href: '/support' },
];

// =============================================
// MAIN COMPONENT
// =============================================

const Footer = React.memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-t border-border shadow-sm mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
          {/* Left Section - Brand */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">L</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-text leading-tight">
                  L'arte ERP
                </p>
                <p className="text-xs text-secondary-text leading-tight hidden sm:block">
                  Enterprise Management Platform
                </p>
              </div>
            </div>
          </div>

          {/* Center Section - Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p className="text-sm text-secondary-text">
              © {currentYear} L'arte ERP
            </p>
            <span className="hidden sm:inline text-secondary-text/40">•</span>
            <p className="text-xs text-secondary-text/80">
              All Rights Reserved
            </p>
          </div>

          {/* Right Section - Version & Status */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Version */}
            <div className="flex items-center gap-2">
              <Server size={14} className="text-secondary-text/60" />
              <span className="text-xs font-mono text-secondary-text/80">
                v1.0.0
              </span>
            </div>

            {/* Environment Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <Activity size={12} className="text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">
                Production
              </span>
            </div>

            {/* Online Status */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-600">
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 py-3 border-t border-border/50">
          {FOOTER_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.id}
                href={link.href}
                whileHover={{ y: -1 }}
                className="flex items-center gap-1.5 text-xs text-secondary-text hover:text-primary transition-colors duration-200"
              >
                <Icon size={12} className="text-secondary-text/60" />
                <span>{link.label}</span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </motion.footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;