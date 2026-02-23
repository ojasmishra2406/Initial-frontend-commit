import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders();
      setOrders(response.data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      placed: '#007bff',
      preparing: '#ffc107',
      dispatched: '#17a2b8',
      delivered: '#28a745',
    };
    return colors[status] || '#6c757d';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      paid: '#28a745',
      failed: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h1>Your Orders</h1>
        <p style={{ fontSize: '18px', color: '#666', marginTop: '40px' }}>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1>Your Orders</h1>
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            marginTop: '20px',
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h1>Your Orders</h1>
        <div
          style={{
            border: '2px dashed #ddd',
            borderRadius: '8px',
            padding: '60px 20px',
            marginTop: '40px',
          }}
        >
          <p style={{ fontSize: '24px', color: '#666', marginBottom: '20px' }}>
            📦 No orders yet
          </p>
          <p style={{ fontSize: '16px', color: '#888', marginBottom: '30px' }}>
            Start ordering delicious pizzas!
          </p>
          <button
            onClick={() => (window.location.href = '/menu')}
            style={{
              padding: '12px 30px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Your Orders ({orders.length})</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fff',
            }}
          >
            {/* Order Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '15px',
                borderBottom: '2px solid #f0f0f0',
                marginBottom: '15px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>Order #{order._id.slice(-8)}</h3>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                  {new Date(order.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>
                    Payment Method
                  </p>
                  <span
                    style={{
                      padding: '6px 12px',
                      backgroundColor: order.paymentMethod === 'COD' ? '#28a745' : '#007bff',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    {order.paymentMethod || 'ONLINE'}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>
                    Payment Status
                  </p>
                  <span
                    style={{
                      padding: '6px 12px',
                      backgroundColor: getPaymentStatusColor(order.paymentStatus),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                    }}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>
                    Order Status
                  </p>
                  <span
                    style={{
                      padding: '6px 12px',
                      backgroundColor: getStatusColor(order.orderStatus),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                    }}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Items:</h4>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                      {item.name} × {item.quantity}
                    </p>
                    {item.selectedSize && (
                      <p style={{ margin: '3px 0', fontSize: '13px', color: '#666' }}>
                        Size: {item.selectedSize.name}
                      </p>
                    )}
                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                      <p style={{ margin: '3px 0', fontSize: '13px', color: '#666' }}>
                        Toppings: {item.selectedToppings.map((t) => t.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#007bff', fontSize: '16px' }}>
                    ₹{item.totalPrice.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Location */}
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <p style={{ margin: '0', fontSize: '14px' }}>
                <strong>Delivery Address:</strong> {order.deliveryLocation}
              </p>
            </div>

            {/* Order Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '15px',
                borderTop: '2px solid #007bff',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '20px' }}>Total Amount:</h3>
              <h3 style={{ margin: 0, fontSize: '24px', color: '#007bff' }}>
                ₹{order.totalAmount.toFixed(2)}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
