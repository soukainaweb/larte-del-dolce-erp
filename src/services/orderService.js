// src/services/orderService.js
import api from './api';
import { unwrapData, unwrapPaginated } from '../utils/apiHelpers';

/**
 * Service de gestion des commandes
 * Compatible avec l'API Laravel
 */
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
      return { data: items, meta, success: true };
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
      return { data: unwrapData(response), success: true };
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Créer une nouvelle commande
   * @param {Object} data - Données de la commande
   * @param {string} data.customer - Nom du client
   * @param {string} data.rep - Commercial
   * @param {string} data.priority - Priorité (low, medium, high)
   * @param {string} data.deliveryDate - Date de livraison
   * @param {string} data.deliveryTime - Heure de livraison
   * @param {string} data.notes - Notes
   * @param {Array} data.products - Liste des produits
   * @param {string} data.paymentMethod - Méthode de paiement
   * @param {string} data.paymentStatus - Statut de paiement
   * @param {number} data.total - Total de la commande
   * @returns {Promise} Promise avec la réponse de l'API
   */
  createOrder: async (data) => {
    try {
      const response = await api.post('/orders', data);
      return { data: unwrapData(response), success: true };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
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
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
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
      return response.data;
    } catch (error) {
      console.error(`Error validating order ${id}:`, error);
      throw error;
    }
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