// src/pages/Customers/CustomersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Download,
  Eye,
  Edit2,
  Trash2,
  Globe,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ExportButtons from '../../components/ExportButtons';

// ==========================================
// TYPOGRAPHY SYSTEM
// ==========================================
const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

// ==========================================
// STATUS BADGE
// ==========================================
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { label: 'Actif', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    inactive: { label: 'Inactif', class: 'bg-gray-50 text-gray-600 border-gray-200' },
    suspended: { label: 'Suspendu', class: 'bg-amber-50 text-amber-700 border-amber-200' }
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// TYPE BADGE
// ==========================================
const TypeBadge = ({ type }) => {
  const typeConfig = {
    enterprise: { label: 'Entreprise', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    individual: { label: 'Particulier', class: 'bg-purple-50 text-purple-700 border-purple-200' }
  };

  const config = typeConfig[type] || typeConfig.individual;

  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${config.class}`}>
      {config.label}
    </span>
  );
};

// ==========================================
// CLIENT CARD (Mobile)
// ==========================================
const ClientCard = ({ client, onEdit, onDelete, onView }) => {
  return (
    <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#B8863B]/10 flex items-center justify-center text-[#B8863B] font-bold">
            {client.name?.[0] || 'C'}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3D2F24]">{client.name}</p>
            <p className="text-xs text-[#6D6D6D]">{client.email}</p>
          </div>
        </div>
        <StatusBadge status={client.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <TypeBadge type={client.type} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#6D6D6D]">
        <div className="flex items-center gap-1">
          <Phone size={12} />
          {client.phone || 'Non renseigné'}
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={12} />
          {client.city || 'Non renseigné'}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#ECE8E1]">
        <div className="text-xs text-[#6D6D6D]">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(client.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onView(client)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onEdit(client)} className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button onClick={() => onDelete(client)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CLIENT TABLE ROW (Desktop)
// ==========================================
const ClientTableRow = ({ client, onEdit, onDelete, onView, index }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F8F7F4] transition-colors border-b border-[#ECE8E1]"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#B8863B]/10 flex items-center justify-center text-[#B8863B] font-bold text-sm">
            {client.name?.[0] || 'C'}
          </div>
          <div>
            <p className="text-sm font-medium text-[#3D2F24]">{client.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{client.email}</td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">{client.phone || '—'}</td>
      <td className="px-4 py-3">
        <TypeBadge type={client.type} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={client.status} />
      </td>
      <td className="px-4 py-3 text-sm text-[#6D6D6D]">
        {new Date(client.createdAt).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onView(client)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Voir"
          >
            <Eye size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onEdit(client)}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 size={16} className="text-[#6D6D6D]" />
          </button>
          <button
            onClick={() => onDelete(client)}
            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 size={16} className="text-rose-500" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ==========================================
// CLIENT MODAL
// ==========================================
const ClientModal = ({ isOpen, onClose, onSave, client, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Maroc',
    type: 'individual',
    status: 'active',
    taxId: '',
    website: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        country: client.country || 'Maroc',
        type: client.type || 'individual',
        status: client.status || 'active',
        taxId: client.taxId || '',
        website: client.website || '',
        notes: client.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'Maroc',
        type: 'individual',
        status: 'active',
        taxId: '',
        website: '',
        notes: ''
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.email) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-[#ECE8E1] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            {client ? 'Modifier le client' : 'Ajouter un client'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Nom *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.name ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all ${
                  errors.email ? 'border-rose-500' : 'border-[#ECE8E1]'
                }`}
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              >
                <option value="individual">Particulier</option>
                <option value="enterprise">Entreprise</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Adresse</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Ville</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Pays</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">N° TVA</label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Site web</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6D6D6D] mb-1.5 uppercase tracking-wide">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-[#ECE8E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#ECE8E1]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : client ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// DELETE MODAL
// ==========================================
const DeleteModal = ({ isOpen, onClose, onConfirm, client, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
      >
        <div className="flex items-center justify-center w-14 h-14 mx-auto bg-rose-50 rounded-full mb-4">
          <Trash2 size={28} className="text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-[#3D2F24] text-center" style={{ fontFamily: FONT_HEADING }}>
          Supprimer le client ?
        </h3>
        <p className="text-sm text-[#6D6D6D] text-center mt-2">
          Vous êtes sur le point de supprimer le client{' '}
          <span className="font-semibold text-[#3D2F24]">
            {client?.name}
          </span>.
          Cette action est irréversible.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-[#6D6D6D] border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// CLIENT DETAILS MODAL
// ==========================================
const ClientDetailsModal = ({ isOpen, onClose, client }) => {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
      >
        <div className="p-6 border-b border-[#ECE8E1] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Détails du client
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F7F4] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6D6D6D]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-[#ECE8E1]">
            <div className="w-16 h-16 rounded-full bg-[#B8863B]/10 flex items-center justify-center text-[#B8863B] text-2xl font-bold">
              {client.name?.[0] || 'C'}
            </div>
            <div>
              <p className="text-lg font-semibold text-[#3D2F24]">{client.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <TypeBadge type={client.type} />
                <StatusBadge status={client.status} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone size={18} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={18} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">{client.address}, {client.city}, {client.country}</span>
              </div>
            )}
            {client.taxId && (
              <div className="flex items-center gap-3 text-sm">
                <Building size={18} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">N° TVA: {client.taxId}</span>
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-3 text-sm">
                <Globe size={18} className="text-[#6D6D6D]" />
                <span className="text-[#3D2F24]">{client.website}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={18} className="text-[#6D6D6D]" />
              <span className="text-[#3D2F24]">Créé le {new Date(client.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            {client.notes && (
              <div className="flex items-start gap-3 text-sm">
                <FileText size={18} className="text-[#6D6D6D] mt-0.5" />
                <span className="text-[#3D2F24]">{client.notes}</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#B8863B] to-[#C89B5A] rounded-lg hover:shadow-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN CUSTOMERS PAGE
// ==========================================
const CustomersPage = () => {
  const { user } = useAuth();

  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockClients = [
          {
            id: 1,
            name: 'Café Al Amir',
            email: 'contact@cafealamir.com',
            phone: '+212 5 22 12 34 56',
            address: '12 Rue Al Amir, Quartier Maarif',
            city: 'Casablanca',
            country: 'Maroc',
            type: 'enterprise',
            status: 'active',
            taxId: '12345678',
            website: 'www.cafealamir.com',
            notes: 'Client régulier, commandes importantes',
            createdAt: new Date('2024-01-15')
          },
          {
            id: 2,
            name: 'Pâtisserie Nour',
            email: 'contact@patisserienour.ma',
            phone: '+212 5 37 65 43 21',
            address: '45 Avenue Hassan II',
            city: 'Rabat',
            country: 'Maroc',
            type: 'enterprise',
            status: 'active',
            taxId: '87654321',
            website: 'www.patisserienour.ma',
            notes: 'Commande de pâtisseries chaque semaine',
            createdAt: new Date('2024-02-01')
          },
          {
            id: 3,
            name: 'Restaurant La Table',
            email: 'info@restaurantlatable.com',
            phone: '+212 5 29 98 76 54',
            address: '8 Rue de la Plage',
            city: 'Agadir',
            country: 'Maroc',
            type: 'enterprise',
            status: 'active',
            taxId: '45678912',
            website: 'www.restaurantlatable.com',
            notes: 'Client premium, commandes de grandes quantités',
            createdAt: new Date('2024-02-15')
          },
          {
            id: 4,
            name: 'Snack City',
            email: 'snackcity@gmail.com',
            phone: '+212 6 12 34 56 78',
            address: '23 Rue de la Liberté',
            city: 'Casablanca',
            country: 'Maroc',
            type: 'individual',
            status: 'inactive',
            taxId: '',
            website: '',
            notes: 'Ancien client, plus de commandes depuis 3 mois',
            createdAt: new Date('2024-03-01')
          },
          {
            id: 5,
            name: 'Boissons du Maroc',
            email: 'contact@boissonsdumaroc.ma',
            phone: '+212 5 22 98 76 54',
            address: '56 Boulevard Mohammed V',
            city: 'Casablanca',
            country: 'Maroc',
            type: 'enterprise',
            status: 'suspended',
            taxId: '78912345',
            website: 'www.boissonsdumaroc.ma',
            notes: 'Compte suspendu pour non-paiement',
            createdAt: new Date('2024-03-15')
          }
        ];
        setClients(mockClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    let filtered = clients;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    return filtered;
  }, [clients, searchTerm, typeFilter, statusFilter]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // ==========================================
  // EXPORT CONFIGURATION
  // ==========================================
  const columns = [
    { label: 'Nom', accessor: 'name', width: 20 },
    { label: 'Email', accessor: 'email', width: 20 },
    { label: 'Téléphone', accessor: 'phone', width: 15 },
    { label: 'Type', accessor: 'type', width: 12 },
    { label: 'Statut', accessor: 'status', width: 12 },
    { label: 'Ville', accessor: 'city', width: 10 },
    { label: 'Pays', accessor: 'country', width: 6 },
    { label: 'Date d\'inscription', accessor: 'createdAt', width: 15 }
  ];

  const rowFormatter = (item) => ({
    name: item.name,
    email: item.email,
    phone: item.phone || '—',
    type: item.type === 'enterprise' ? 'Entreprise' : 'Particulier',
    status: item.status === 'active' ? 'Actif' : item.status === 'inactive' ? 'Inactif' : 'Suspendu',
    city: item.city || '—',
    country: item.country || '—',
    createdAt: new Date(item.createdAt).toLocaleDateString('fr-FR')
  });

  // Calculate summary
  const summary = useMemo(() => {
    const total = filteredClients.length;
    const active = filteredClients.filter(c => c.status === 'active').length;
    const inactive = filteredClients.filter(c => c.status === 'inactive').length;
    const suspended = filteredClients.filter(c => c.status === 'suspended').length;
    const enterprise = filteredClients.filter(c => c.type === 'enterprise').length;
    const individual = filteredClients.filter(c => c.type === 'individual').length;

    return [
      { label: 'Total clients', value: total },
      { label: 'Actifs', value: active },
      { label: 'Inactifs', value: inactive },
      { label: 'Suspendus', value: suspended },
      { label: 'Entreprises', value: enterprise },
      { label: 'Particuliers', value: individual }
    ];
  }, [filteredClients]);

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================
  const handleExportSuccess = () => {
    // Toast notification handled by ExportButtons
  };

  const handleExportError = () => {
    // Toast notification handled by ExportButtons
  };

  const handleCreateClient = async (formData) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newClient = {
        id: clients.length + 1,
        ...formData,
        createdAt: new Date()
      };
      setClients(prev => [newClient, ...prev]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClient = async (formData) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setClients(prev => prev.map(c =>
        c.id === selectedClient.id ? { ...c, ...formData } : c
      ));
      setIsEditModalOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setClients(prev => prev.filter(c => c.id !== selectedClient.id));
      setIsDeleteModalOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(clients.map(c => c.type));
    return Array.from(types);
  }, [clients]);

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#202020] p-6" style={{ fontFamily: FONT_BODY }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
            Clients
          </h1>
          <p className="text-sm text-[#6D6D6D]">Gérez vos clients et leurs informations</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Buttons */}
          <ExportButtons
            data={filteredClients}
            columns={columns}
            title="Liste des clients"
            subtitle={`${filteredClients.length} clients`}
            filename={`clients_${new Date().toISOString().split('T')[0]}`}
            summary={summary}
            rowFormatter={rowFormatter}
            userName={user?.firstName}
            onSuccess={handleExportSuccess}
            onError={handleExportError}
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white font-medium hover:shadow-lg transition-all"
          >
            <UserPlus size={18} />
            Ajouter un client
          </button>
          <button
            className="p-2.5 rounded-xl border border-[#ECE8E1] bg-white hover:bg-[#F8F7F4] transition-colors"
            title="Actualiser"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={18} className="text-[#6D6D6D]" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#ECE8E1] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D6D6D]" size={18} />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-[#F8F7F4] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">Tous les types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'enterprise' ? 'Entreprise' : 'Particulier'}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#ECE8E1] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30 focus:border-[#B8863B] transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table - Desktop */}
      <div className="hidden md:block bg-white border border-[#ECE8E1] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#ECE8E1]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Téléphone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Date d'inscription</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6D6D6D] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-[#6D6D6D]">Chargement des clients...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={40} className="text-[#ECE8E1]" />
                      <p className="text-sm text-[#6D6D6D]">Aucun client trouvé</p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-sm text-[#B8863B] font-medium hover:underline"
                      >
                        Ajouter un client
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client, index) => (
                  <ClientTableRow
                    key={client.id}
                    client={client}
                    index={index}
                    onView={(c) => {
                      setSelectedClient(c);
                      setIsDetailsModalOpen(true);
                    }}
                    onEdit={(c) => {
                      setSelectedClient(c);
                      setIsEditModalOpen(true);
                    }}
                    onDelete={(c) => {
                      setSelectedClient(c);
                      setIsDeleteModalOpen(true);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clients Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-[#B8863B] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6D6D6D]">Chargement des clients...</p>
          </div>
        ) : paginatedClients.length === 0 ? (
          <div className="bg-white border border-[#ECE8E1] rounded-xl p-8 text-center">
            <Users size={40} className="text-[#ECE8E1] mx-auto mb-3" />
            <p className="text-sm text-[#6D6D6D]">Aucun client trouvé</p>
          </div>
        ) : (
          paginatedClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onView={(c) => {
                setSelectedClient(c);
                setIsDetailsModalOpen(true);
              }}
              onEdit={(c) => {
                setSelectedClient(c);
                setIsEditModalOpen(true);
              }}
              onDelete={(c) => {
                setSelectedClient(c);
                setIsDeleteModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredClients.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-[#6D6D6D]">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, filteredClients.length)} sur {filteredClients.length} clients
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="text-[#6D6D6D]" />
            </button>
            <span className="text-sm font-medium text-[#3D2F24]">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-[#ECE8E1] rounded-lg hover:bg-[#F8F7F4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} className="text-[#6D6D6D]" />
            </button>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-[#ECE8E1] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B8863B]/30"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {/* Modals - CORRIGÉ AVEC DES CLÉS UNIQUES */}
      <AnimatePresence mode="wait">
        {isCreateModalOpen && (
          <ClientModal
            key="create-modal"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateClient}
            isLoading={isSaving}
          />
        )}

        {isEditModalOpen && selectedClient && (
          <ClientModal
            key="edit-modal"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedClient(null);
            }}
            onSave={handleEditClient}
            client={selectedClient}
            isLoading={isSaving}
          />
        )}

        {isDeleteModalOpen && selectedClient && (
          <DeleteModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedClient(null);
            }}
            onConfirm={handleDeleteClient}
            client={selectedClient}
            isLoading={isSaving}
          />
        )}

        {isDetailsModalOpen && selectedClient && (
          <ClientDetailsModal
            key="details-modal"
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedClient(null);
            }}
            client={selectedClient}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomersPage;