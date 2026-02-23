import api from '../api/axios';

// Create new order
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Get user's orders
export const getUserOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// Get single order
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Admin: Get all orders
export const getAllOrders = async () => {
  const response = await api.get('/orders/admin/all');
  return response.data;
};

// Admin: Update order status
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/admin/${orderId}`, {
    orderStatus: status,
  });
  return response.data;
};

export default {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
