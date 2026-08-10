// src/services/orderService.js
import api from './api';
import { unwrapData, unwrapPaginated } from '../utils/apiHelpers';

/**
 * Service de gestion des commandes
 * Compatible avec l'API Laravel
 */
export const buildCreateOrderPayload = (form) => {
  const items = (form.items || [])
    .filter((line) => line.product_id)
    .map((line) => ({
      product_id: Number(line.product_id),
      quantity: Math.max(1, parseInt(line.quantity, 10) || 1),
      price: Math.max(0, Number(line.price) || 0),
      discount: Math.min(100, Math.max(0, Number(line.discount) || 0)),
    }));

  const payload = {
    customer_id: Number(form.customer_id),
    items,
    priority: form.priority || 'medium',
    payment_method: form.payment_method || 'cash',
    notes: form.notes?.trim() || null,
  };

  if (form.sales_rep_id) {
    payload.sales_rep_id = Number(form.sales_rep_id);
  }
  if (form.delivery_date) {
    payload.delivery_date = form.delivery_date;
  }
  if (form.delivery_time) {
    payload.delivery_time = form.delivery_time.length === 5 ? form.delivery_time : form.delivery_time.slice(0, 5);
  }

  return payload;
};

export const normalizeOrder = (order) => {
  if (!order) return order;

  const items = order.products ?? order.items ?? [];
  const customerName = typeof order.customer === 'string'
    ? order.customer
    : (order.customer?.name ?? order.customer_name ?? '—');
  const repName = order.rep
    ?? (order.user ? `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() : '—');

  return {
    ...order,
    orderNumber: order.orderNumber ?? order.order_number ?? `#${order.id}`,
    total: Number(order.total ?? order.total_amount ?? 0),
    paymentStatus: order.paymentStatus ?? order.payment_status,
    createdAt: order.createdAt ?? order.created_at,
    customer: customerName,
    rep: repName || '—',
    products: items.map((item) => ({
      ...item,
      name: item.name ?? item.product?.name ?? '—',
      total: Number(item.total ?? item.subtotal ?? 0),
    })),
    approval_history: order.approval_history ?? order.approvalHistory ?? [],
    approval_progress: order.approval_progress ?? order.approvalProgress ?? [],
    can_approve: Boolean(order.can_approve ?? order.canApprove),
    can_reject: Boolean(order.can_reject ?? order.canReject),
    can_factory_accept: Boolean(order.can_factory_accept ?? order.canFactoryAccept),
    can_factory_postpone: Boolean(order.can_factory_postpone ?? order.canFactoryPostpone),
    can_factory_ready: Boolean(order.can_factory_ready ?? order.canFactoryReady),
    can_factory_assign_rep: Boolean(order.can_factory_assign_rep ?? order.canFactoryAssignRep),
    can_confirm_pickup: Boolean(order.can_confirm_pickup ?? order.canConfirmPickup),
    can_confirm_delivery: Boolean(order.can_confirm_delivery ?? order.canConfirmDelivery),
    pickup_photo: order.pickup_photo ?? order.pickupPhoto ?? null,
    delivery_photo: order.delivery_photo ?? order.deliveryPhoto ?? null,
    pickup_at: order.pickup_at ?? order.pickupAt ?? null,
    delivered_at: order.delivered_at ?? order.deliveredAt ?? null,
    assigned_rep_id: order.assigned_rep_id ?? order.assignedRepId ?? null,
    rejection: order.rejection ?? null,
  };
};

const orderService = {
  /**
   * Récupérer la liste des commandes avec pagination et filtres
   * @param {Object} params - Paramètres de requête
   * @param {number} params.page - Numéro de page
   * @param {number} params.per_page - Nombre d'éléments par page
   * @param {string} params.search - Terme de recherche
   * @param {string} params.status - Filtre par statut
   * @param {string} params.priority - Filtre par priorité
   * @param {string} params.payment_status - Filtre par statut de paiement
   * @param {string} params.date_from - Date de début
   * @param {string} params.date_to - Date de fin
   * @param {string} params.sort_by - Champ de tri
   * @param {string} params.sort_order - Ordre de tri (asc/desc)
   * @returns {Promise} Promise avec la réponse de l'API
   */
  getOrders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.per_page) queryParams.append('per_page', params.per_page);
      
      // Filtres
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.payment_status) queryParams.append('payment_status', params.payment_status);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      // Tri
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_order) queryParams.append('sort_order', params.sort_order);
      
      const url = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      const { items, meta } = unwrapPaginated(response);
      return { data: items.map(normalizeOrder), meta, success: true };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Récupérer une commande par son ID
   * @param {number|string} id - ID de la commande
   * @returns {Promise} Promise avec la réponse de l'API
   */
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return { data: normalizeOrder(unwrapData(response)), success: true };
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Form options for order creation (customers, products, sales reps).
   * Uses orders.create permission — does not require products.view.
   */
  getOrderFormOptions: async () => {
    const response = await api.get('/orders/form-options');
    return unwrapData(response) || {};
  },

  buildCreateOrderPayload,

  /**
   * Créer une nouvelle commande
   */
  createOrder: async (data) => {
    const payload = (data && data.customer_id && Array.isArray(data.items))
      ? data
      : buildCreateOrderPayload(data);
    const response = await api.post('/orders', payload);
    return { data: normalizeOrder(unwrapData(response)), success: true };
  },

  /**
   * Mettre à jour une commande existante
   * @param {number|string} id - ID de la commande
   * @param {Object} data - Données de la commande
   * @returns {Promise} Promise avec la réponse de l'API
   */
  updateOrder: async (id, data) => {
    try {
      const response = await api.put(`/orders/${id}`, data);
      return { data: unwrapData(response), success: true };
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer une commande
   * @param {number|string} id - ID de la commande
   * @returns {Promise} Promise avec la réponse de l'API
   */
  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Mettre à jour le statut d'une commande
   * @param {number|string} id - ID de la commande
   * @param {string} status - Nouveau statut
   * @returns {Promise} Promise avec la réponse de l'API
   */
  updateOrderStatus: async (id, status, comment = null) => {
    try {
      const payload = { status };
      if (comment) payload.comment = comment;
      const response = await api.patch(`/orders/${id}/status`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      throw error;
    }
  },

  /**
   * Récupérer l'historique des statuts d'une commande
   * @param {number|string} id - ID de la commande
   * @returns {Promise} Promise avec l'historique des transitions
   */
  getOrderStatusHistory: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/status-history`);
      return unwrapData(response);
    } catch (error) {
      console.error(`Error fetching order ${id} status history:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les transitions de statut autorisées pour une commande
   * @param {number|string} id - ID de la commande
   * @returns {Promise} Promise avec la liste des statuts cibles autorisés
   */
  getAllowedTransitions: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/allowed-transitions`);
      return unwrapData(response);
    } catch (error) {
      console.error(`Error fetching allowed transitions for order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Mettre à jour le statut de paiement d'une commande
   * @param {number|string} id - ID de la commande
   * @param {string} paymentStatus - Nouveau statut de paiement
   * @param {number} paidAmount - Montant payé
   * @returns {Promise} Promise avec la réponse de l'API
   */
  updateOrderPayment: async (id, paymentStatus, paidAmount = null) => {
    try {
      const data = { paymentStatus };
      if (paidAmount !== null) data.paidAmount = paidAmount;
      const response = await api.patch(`/orders/${id}/payment`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id} payment:`, error);
      throw error;
    }
  },

  /**
   * Valider une commande
   * @param {number|string} id - ID de la commande
   * @returns {Promise} Promise avec la réponse de l'API
   */
  validateOrder: async (id) => {
    try {
      const response = await api.post(`/orders/${id}/validate`);
      return { data: normalizeOrder(unwrapData(response)), success: true };
    } catch (error) {
      console.error(`Error validating order ${id}:`, error);
      throw error;
    }
  },

  approveOrder: async (id) => {
    const response = await api.post(`/orders/${id}/approve`);
    return { data: normalizeOrder(unwrapData(response)), success: true };
  },

  rejectOrder: async (id, reason) => {
    const response = await api.post(`/orders/${id}/reject`, { reason });
    return { data: normalizeOrder(unwrapData(response)), success: true };
  },

  factoryAccept: async (id) => {
    const response = await api.post(`/orders/${id}/factory/accept`);
    return { data: normalizeOrder(unwrapData(response)), success: true };
  },

  factoryPostpone: async (id, reason, until = null) => {
    const response = await api.post(`/orders/${id}/factory/postpone`, { reason, until });
    return { data: normalizeOrder(unwrapData(response)), success: true };
  },

  factoryMarkReady: async (id) => {
    const response = await api.post(`/orders/${id}/factory/ready`);
    return { data: normalizeOrder(unwrapData(response)), success: true };
  },

  factoryAssignRepresentative: async (id, representativeId) => {
    const response = await api.post(`/orders/${id}/factory/assign-representative`, {
      representative_id: representativeId,
    });
    return { data: normalizeOrder(unwrapData(response)), success: true };
  },

  getAvailableRepresentatives: async () => {
    const response = await api.get('/orders/available-representatives');
    return unwrapData(response) || [];
  },

  confirmPickup: async (id, photo) => {
    const response = await api.post(`/orders/${id}/pickup`, { photo });
    return { data: normalizeOrder(unwrapData(response)), success: true };
  },

  confirmDelivery: async (id, photo) => {
    const response = await api.post(`/orders/${id}/delivery`, { photo });
    return { data: normalizeOrder(unwrapData(response)), success: true };
  },

  updateAvailability: async (availabilityStatus) => {
    const response = await api.put('/profile/availability', { availability_status: availabilityStatus });
    return unwrapData(response);
  },

  getApprovalHistory: async (id) => {
    const response = await api.get(`/orders/${id}/approval-history`);
    return unwrapData(response) || [];
  },

  /**
   * Annuler une commande
   * @param {number|string} id - ID de la commande
   * @param {string} reason - Raison de l'annulation
   * @returns {Promise} Promise avec la réponse de l'API
   */
  cancelOrder: async (id, reason = '') => {
    try {
      const response = await api.post(`/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Démarrer la production d'une commande
   * @param {number|string} id - ID de la commande
   * @param {Object} data - Données de production
   * @param {string} data.workshop - Atelier
   * @param {number} data.estimatedTime - Temps estimé
   * @returns {Promise} Promise avec la réponse de l'API
   */
  startOrderProduction: async (id, data = {}) => {
    try {
      const response = await api.post(`/orders/${id}/start-production`, data);
      return response.data;
    } catch (error) {
      console.error(`Error starting production for order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les statistiques des commandes
   * @param {Object} params - Paramètres de filtrage
   * @param {string} params.period - Période (today, week, month, year)
   * @param {string} params.status - Filtre par statut
   * @returns {Promise} Promise avec les statistiques
   */
  getOrderStatistics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.status) queryParams.append('status', params.status);
      
      const url = `/orders/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  },

  /**
   * Exporter les commandes dans différents formats
   * @param {Object} params - Paramètres d'export
   * @param {string} params.format - Format d'export (pdf, excel, csv)
   * @param {string} params.search - Filtre de recherche
   * @param {string} params.status - Filtre par statut
   * @param {string} params.date_from - Date de début
   * @param {string} params.date_to - Date de fin
   * @returns {Promise} Promise avec le blob du fichier
   */
  exportOrders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.format) queryParams.append('format', params.format);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      const url = `/orders/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  },

  /**
   * Récupérer les produits d'une commande
   * @param {number|string} orderId - ID de la commande
   * @returns {Promise} Promise avec les produits de la commande
   */
  getOrderProducts: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/products`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching products for order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Ajouter un produit à une commande
   * @param {number|string} orderId - ID de la commande
   * @param {Object} product - Données du produit
   * @param {string} product.productId - ID du produit
   * @param {number} product.quantity - Quantité
   * @param {number} product.price - Prix unitaire
   * @param {number} product.discount - Remise (%)
   * @returns {Promise} Promise avec la réponse de l'API
   */
  addOrderProduct: async (orderId, product) => {
    try {
      const response = await api.post(`/orders/${orderId}/products`, product);
      return response.data;
    } catch (error) {
      console.error(`Error adding product to order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer un produit d'une commande
   * @param {number|string} orderId - ID de la commande
   * @param {number|string} productId - ID du produit dans la commande
   * @returns {Promise} Promise avec la réponse de l'API
   */
  removeOrderProduct: async (orderId, productId) => {
    try {
      const response = await api.delete(`/orders/${orderId}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing product from order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Mettre à jour la quantité d'un produit dans une commande
   * @param {number|string} orderId - ID de la commande
   * @param {number|string} productId - ID du produit dans la commande
   * @param {number} quantity - Nouvelle quantité
   * @returns {Promise} Promise avec la réponse de l'API
   */
  updateOrderProductQuantity: async (orderId, productId, quantity) => {
    try {
      const response = await api.patch(`/orders/${orderId}/products/${productId}`, { quantity });
      return response.data;
    } catch (error) {
      console.error(`Error updating product quantity in order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer l'historique des commandes
   * @param {Object} params - Paramètres de filtrage
   * @param {number} params.limit - Nombre d'éléments
   * @param {string} params.date_from - Date de début
   * @param {string} params.date_to - Date de fin
   * @returns {Promise} Promise avec l'historique des commandes
   */
  getOrderHistory: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      const url = `/orders/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }
};

export default orderService;