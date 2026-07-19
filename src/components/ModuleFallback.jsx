// src/components/ModuleFallback.jsx
import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  ShoppingBag, 
  Users, 
  FileText, 
  Truck, 
  Factory,
  CreditCard,
  User,
  Settings,
  Layers,
  Tag,
  Calendar,
  Activity,
  Bell,
  BarChart3,
  Boxes,
  ShieldCheck,
  Briefcase,
  History,
  FolderTree
} from 'lucide-react';

// Mapping des modules vers leurs routes de liste
const MODULE_LIST_ROUTES = {
  order: '/dashboard/orders',
  customer: '/dashboard/customers',
  client: '/dashboard/customers',
  product: '/dashboard/products',
  category: '/dashboard/categories',
  classification: '/dashboard/categories',
  invoice: '/dashboard/invoices',
  payment: '/dashboard/payments',
  production: '/dashboard/production',
  delivery: '/dashboard/deliveries',
  user: '/dashboard/users',
  employee: '/dashboard/users',
  report: '/dashboard/reports',
  analytics: '/dashboard/analytics',
  stock: '/dashboard/inventory',
  settings: '/dashboard/settings',
  notification: '/dashboard/notifications',
  activity: '/dashboard/activity-logs',
  calendar: '/dashboard/calendar',
  roles: '/dashboard/users',
  employees: '/dashboard/users'
};

// Mapping des modules vers leurs icônes
const MODULE_ICONS = {
  order: ShoppingBag,
  customer: Users,
  client: Users,
  product: Package,
  category: Layers,
  classification: Tag,
  invoice: FileText,
  payment: CreditCard,
  production: Factory,
  delivery: Truck,
  user: User,
  employee: User,
  report: FileText,
  analytics: BarChart3,
  stock: Boxes,
  settings: Settings,
  notification: Bell,
  activity: Activity,
  calendar: Calendar,
  roles: ShieldCheck,
  employees: Briefcase
};

// Mapping des modules vers leurs labels
const MODULE_LABELS = {
  order: 'Commandes',
  customer: 'Clients',
  client: 'Clients',
  product: 'Produits',
  category: 'Catégories',
  classification: 'Classifications',
  invoice: 'Factures',
  payment: 'Paiements',
  production: 'Production',
  delivery: 'Livraisons',
  user: 'Utilisateurs',
  employee: 'Employés',
  report: 'Rapports',
  analytics: 'Analytics',
  stock: 'Stock',
  settings: 'Paramètres',
  notification: 'Notifications',
  activity: "Journal d'activité",
  calendar: 'Calendrier',
  roles: 'Rôles & Permissions',
  employees: 'Employés'
};

/**
 * Composant de fallback pour les pages en cours de développement
 * Redirige vers la liste du module correspondant
 */
const ModuleFallback = ({ module }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const Icon = MODULE_ICONS[module] || Package;
  const label = MODULE_LABELS[module] || module || 'Module';
  const listRoute = MODULE_LIST_ROUTES[module] || '/dashboard';

  // Redirection automatique vers la liste après 2 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(listRoute, { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, listRoute]);

  // Redirection manuelle
  const handleRedirect = () => {
    navigate(listRoute);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="w-20 h-20 rounded-full bg-[#B8863B]/10 flex items-center justify-center mb-6">
        <Icon size={40} className="text-[#B8863B]" />
      </div>

      <h2 className="text-2xl font-bold text-[#3D2F24] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        {label}
      </h2>

      <p className="text-[#6D6D6D] mb-1">
        La page de détail n'est pas encore disponible
      </p>

      {id && (
        <p className="text-sm text-[#6D6D6D] mb-4">
          Référence : <span className="font-mono font-medium text-[#B8863B]">{id}</span>
        </p>
      )}

      <p className="text-sm text-[#6D6D6D] mb-6">
        Redirection vers la liste des {label.toLowerCase()}...
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={handleRedirect}
          className="px-6 py-2.5 bg-[#B8863B] text-white rounded-xl hover:bg-[#A07532] transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Retour à la liste
        </button>
      </div>

      {/* Barre de progression de redirection */}
      <div className="mt-6 w-48 h-1 bg-[#F8F7F4] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'linear' }}
          className="h-full bg-[#B8863B] rounded-full"
        />
      </div>
    </motion.div>
  );
};

export default ModuleFallback;