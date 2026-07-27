// src/services/dashboardService.js
import api from './api';

/**
 * Service Dashboard - Gère toutes les requêtes API liées au tableau de bord
 */
const dashboardService = {
  /**
   * Récupérer les statistiques globales du dashboard
   * @param {Object} params - Paramètres de filtrage (period, date_range, etc.)
   * @returns {Promise} Promise avec les statistiques
   * GET /api/dashboard/stats
   */
  getDashboardStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      
      const url = `/dashboard/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Récupérer les données d'analyse (graphiques)
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise} Promise avec les données analytiques
   * GET /api/dashboard/analytics
   */
  getDashboardAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.metric) queryParams.append('metric', params.metric);
      
      const url = `/dashboard/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  },

  /**
   * Récupérer les commandes récentes
   * @param {Object} params - Paramètres de pagination et filtrage
   * @param {number} params.limit - Nombre de commandes à récupérer
   * @param {number} params.page - Numéro de page
   * @param {string} params.status - Filtre par statut
   * @returns {Promise} Promise avec les commandes récentes
   * GET /api/dashboard/orders
   */
  getRecentOrders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.page) queryParams.append('page', params.page);
      if (params.status) queryParams.append('status', params.status);
      
      const url = `/dashboard/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  },

  /**
   * Récupérer les notifications
   * @param {Object} params - Paramètres de filtrage
   * @param {number} params.limit - Nombre de notifications à récupérer
   * @param {string} params.type - Filtre par type (success, danger, info, warning)
   * @param {boolean} params.unread_only - Filtrer les notifications non lues
   * @returns {Promise} Promise avec les notifications
   * GET /api/dashboard/notifications
   */
  getNotifications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.type) queryParams.append('type', params.type);
      if (params.unread_only) queryParams.append('unread_only', params.unread_only);
      
      const url = `/dashboard/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Récupérer l'état de la production en cours
   * @param {Object} params - Paramètres de filtrage
   * @param {number} params.limit - Nombre d'éléments à récupérer
   * @param {string} params.workshop - Filtre par atelier
   * @returns {Promise} Promise avec les données de production
   * GET /api/dashboard/production
   */
  getProductionStatus: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.workshop) queryParams.append('workshop', params.workshop);
      
      const url = `/dashboard/production${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching production status:', error);
      throw error;
    }
  },

  /**
   * Récupérer les meilleurs produits
   * @param {Object} params - Paramètres de filtrage
   * @param {number} params.limit - Nombre de produits à récupérer
   * @param {string} params.period - Période d'analyse (today, week, month, year)
   * @param {string} params.category - Filtre par catégorie
   * @returns {Promise} Promise avec les meilleurs produits
   * GET /api/dashboard/top-products
   */
  getTopProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.period) queryParams.append('period', params.period);
      if (params.category) queryParams.append('category', params.category);
      
      const url = `/dashboard/top-products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  },

  /**
   * Récupérer toutes les données du dashboard en une seule requête
   * @param {Object} params - Paramètres de filtrage
   * @param {string} params.period - Période (today, week, month, year)
   * @param {number} params.limit - Nombre d'éléments par section
   * @returns {Promise} Promise avec toutes les données du dashboard
   * GET /api/dashboard/summary
   */
  getDashboardSummary: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `/dashboard/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  /**
   * Marquer une notification comme lue
   * @param {number|string} notificationId - ID de la notification
   * @returns {Promise} Promise avec la réponse de l'API
   * PATCH /api/dashboard/notifications/{id}/read
   */
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/dashboard/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  },

  /**
   * Marquer toutes les notifications comme lues
   * @returns {Promise} Promise avec la réponse de l'API
   * PATCH /api/dashboard/notifications/read-all
   */
  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.patch('/dashboard/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Supprimer une notification
   * @param {number|string} notificationId - ID de la notification
   * @returns {Promise} Promise avec la réponse de l'API
   * DELETE /api/dashboard/notifications/{id}
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/dashboard/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  }
};

export default dashboardService;