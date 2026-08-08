import orderService from '../services/orderService';
import { getCustomerById } from '../services/customerService';
import { getProductById } from '../services/productService';
import deliveryService from '../services/deliveryService';
import { getInvoiceById } from '../services/invoiceService';
import { getPaymentById } from '../services/paymentService';
import { getProductionById } from '../services/productionService';
import { getUserById } from '../services/userServicePage';

/**
 * Deep-link config: /dashboard/{module}/:id → list page + detail modal.
 */
export const ENTITY_DETAIL_CONFIG = {
  order: {
    listPath: '/dashboard/orders',
    viewStateKey: 'viewOrderId',
    editStateKey: 'editOrderId',
    fetch: (id) => orderService.getOrderById(id),
  },
  customer: {
    listPath: '/dashboard/customers',
    viewStateKey: 'viewCustomerId',
    editStateKey: 'editCustomerId',
    fetch: (id) => getCustomerById(id),
  },
  product: {
    listPath: '/dashboard/products',
    viewStateKey: 'viewProductId',
    editStateKey: 'editProductId',
    fetch: (id) => getProductById(id),
  },
  production: {
    listPath: '/dashboard/production',
    viewStateKey: 'viewProductionId',
    editStateKey: 'editProductionId',
    fetch: (id) => getProductionById(id),
  },
  delivery: {
    listPath: '/dashboard/deliveries',
    viewStateKey: 'viewDeliveryId',
    editStateKey: 'editDeliveryId',
    fetch: (id) => deliveryService.getDeliveryById(id),
  },
  invoice: {
    listPath: '/dashboard/invoices',
    viewStateKey: 'viewInvoiceId',
    editStateKey: 'editInvoiceId',
    fetch: (id) => getInvoiceById(id),
  },
  payment: {
    listPath: '/dashboard/payments',
    viewStateKey: 'viewPaymentId',
    editStateKey: 'editPaymentId',
    fetch: (id) => getPaymentById(id),
  },
  user: {
    listPath: '/dashboard/users',
    viewStateKey: 'viewUserId',
    editStateKey: 'editUserId',
    fetch: (id) => getUserById(id),
  },
};

export default ENTITY_DETAIL_CONFIG;
