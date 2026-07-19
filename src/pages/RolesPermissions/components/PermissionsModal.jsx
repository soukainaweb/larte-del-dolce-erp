// src/pages/RolesPermissions/components/PermissionsModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  RotateCcw,
  Check,
  Square,
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  Factory,
  Truck,
  FileText,
  CreditCard,
  DollarSign, // ⭐ AJOUTÉ
  BarChart3,
  PieChart,
  Bell,
  Settings,
  Briefcase,
  Calendar,
  Activity
} from 'lucide-react';

// ... le reste du code

const PermissionsModal = ({ isOpen, onClose, role, permissions, onSave, isLoading }) => {
  const [localPermissions, setLocalPermissions] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  const modules = [
    { id: 'dashboard', name: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'orders', name: 'Commandes', icon: ClipboardList },
    { id: 'customers', name: 'Clients', icon: Users },
    { id: 'products', name: 'Produits', icon: Package },
    { id: 'production', name: 'Production', icon: Factory },
    { id: 'inventory', name: 'Inventaire', icon: Package },
    { id: 'deliveries', name: 'Livraisons', icon: Truck },
    { id: 'invoices', name: 'Factures', icon: FileText },
    { id: 'payments', name: 'Paiements', icon: CreditCard },
    { id: 'finance', name: 'Finance', icon: DollarSign },
    { id: 'reports', name: 'Rapports', icon: BarChart3 },
    { id: 'analytics', name: 'Analytics', icon: PieChart },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'settings', name: 'Paramètres', icon: Settings },
    { id: 'employees', name: 'Employés', icon: Briefcase },
    { id: 'calendar', name: 'Calendrier', icon: Calendar },
    { id: 'activity', name: "Journal d'activité", icon: Activity }
  ];

  const permissionTypes = [
    { id: 'view', label: 'Voir' },
    { id: 'create', label: 'Créer' },
    { id: 'edit', label: 'Modifier' },
    { id: 'delete', label: 'Supprimer' },
    { id: 'export', label: 'Exporter' },
    { id: 'validate', label: 'Valider' },
    { id: 'approve', label: 'Approuver' }
  ];

  useEffect(() => {
    if (permissions) {
      setLocalPermissions(permissions);
    } else if (role) {
      // Générer des permissions par défaut
      const defaultPerms = {};
      modules.forEach(module => {
        defaultPerms[module.id] = {};
        permissionTypes.forEach(perm => {
          defaultPerms[module.id][perm.id] = role.id === 1;
        });
      });
      setLocalPermissions(defaultPerms);
    }
  }, [permissions, role]);

  const handlePermissionChange = (moduleId, permId, value) => {
    setLocalPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [permId]: value
      }
    }));
  };

  const handleSelectAll = () => {
    const newState = !selectAll;
    setSelectAll(newState);
    const newPerms = {};
    modules.forEach(module => {
      newPerms[module.id] = {};
      permissionTypes.forEach(perm => {
        newPerms[module.id][perm.id] = newState;
      });
    });
    setLocalPermissions(newPerms);
  };

  const handleReset = () => {
    if (permissions) {
      setLocalPermissions(permissions);
    } else {
      const defaultPerms = {};
      modules.forEach(module => {
        defaultPerms[module.id] = {};
        permissionTypes.forEach(perm => {
          defaultPerms[module.id][perm.id] = false;
        });
      });
      setLocalPermissions(defaultPerms);
    }
    setSelectAll(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#EAE6DF] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h3 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Gestion des permissions
            </h3>
            <p className="text-sm text-[#7A7A7A]">
              {role?.name} • {role?.description}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F8F7F4] rounded-xl transition-colors">
            <X size={20} className="text-[#7A7A7A]" />
          </button>
        </div>

        <div className="p-6">
          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 text-sm font-medium text-[#C8A45D] border border-[#C8A45D] rounded-xl hover:bg-[#F8F7F4] transition-colors flex items-center gap-2"
            >
              {selectAll ? <Square size={16} /> : <Check size={16} />}
              {selectAll ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-xl hover:bg-[#F8F7F4] transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Réinitialiser
            </button>
          </div>

          {/* Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F7F4] border-b border-[#EAE6DF]">
                <tr>
                  <th className="sticky left-0 bg-[#F8F7F4] px-4 py-3 text-left text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider min-w-[160px]">
                    Module
                  </th>
                  {permissionTypes.map((perm) => (
                    <th key={perm.id} className="px-3 py-3 text-center text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider min-w-[70px]">
                      {perm.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF]">
                {modules.map((module) => {
                  const modulePerms = localPermissions[module.id] || {};
                  return (
                    <tr key={module.id} className="hover:bg-[#F8F7F4] transition-colors">
                      <td className="sticky left-0 bg-white hover:bg-[#F8F7F4] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <module.icon size={16} className="text-[#7A7A7A]" />
                          <span className="text-sm font-medium text-[#2B2B2B]">{module.name}</span>
                        </div>
                      </td>
                      {permissionTypes.map((perm) => (
                        <td key={perm.id} className="px-3 py-3 text-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={modulePerms[perm.id] === true}
                              onChange={(e) => handlePermissionChange(module.id, perm.id, e.target.checked)}
                              className="w-5 h-5 rounded border-[#EAE6DF] text-[#C8A45D] focus:ring-[#C8A45D]/30 focus:ring-2 transition-all"
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-[#EAE6DF]">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#7A7A7A] border border-[#EAE6DF] rounded-xl hover:bg-[#F8F7F4] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => onSave(localPermissions)}
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#C8A45D] to-[#B08A4A] rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {isLoading ? 'Enregistrement...' : 'Appliquer'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PermissionsModal;