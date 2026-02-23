import api from '../api/axios';

// Create payment order
export const createPaymentOrder = async (orderId) => {
  const response = await api.post('/payments/create', { orderId });
  return response.data;
};

// Verify payment
export const verifyPayment = async (paymentData) => {
  const response = await api.post('/payments/verify', paymentData);
  return response.data;
};

// Handle payment failure
export const handlePaymentFailure = async (orderId, error) => {
  const response = await api.post('/payments/failure', { orderId, error });
  return response.data;
};

// Load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  loadRazorpayScript,
};
