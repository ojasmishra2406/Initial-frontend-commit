import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as menuService from '../services/menuService';
import orderService from '../services/orderService';

function AdminDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'pizza',
    basePrice: '',
    image: '',
    sizes: [],
    toppings: [],
  });

  useEffect(() => {
    if (activeTab === 'menu') {
      fetchMenuItems();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await menuService.getAllMenuItems();
      setMenuItems(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      setOrders(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await menuService.toggleAvailability(id);
      fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle availability');
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const parsedPrice = parseFloat(formData.basePrice);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setError('Please enter a valid price');
        setLoading(false);
        return;
      }
      await menuService.createMenuItem({
        ...formData,
        basePrice: parsedPrice,
      });
      setShowAddForm(false);
      setFormData({
        name: '',
        category: 'pizza',
        basePrice: '',
        image: '',
        sizes: [],
        toppings: [],
      });
      fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name}</p>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'menu' ? '#007bff' : '#ccc',
            color: activeTab === 'menu' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Menu Management
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'orders' ? '#007bff' : '#ccc',
            color: activeTab === 'orders' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Orders Management
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#fee' }}>
          {error}
        </div>
      )}

      {activeTab === 'menu' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Menu Items</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {showAddForm ? 'Cancel' : 'Add New Item'}
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleAddMenuItem}
              style={{
                border: '1px solid #ddd',
                padding: '20px',
                marginBottom: '20px',
                borderRadius: '8px',
              }}
            >
              <h3>Add New Menu Item</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="pizza">Pizza</option>
                  <option value="drinks">Drinks</option>
                  <option value="sides">Sides</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Base Price</label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleFormChange}
                  required
                  step="0.01"
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Adding...' : 'Add Item'}
              </button>
            </form>
          )}

          {loading && !showAddForm ? (
            <div>Loading...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{item.name}</td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{item.category}</td>
                    <td style={{ padding: '12px' }}>₹{item.basePrice.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: item.isAvailable ? '#d4edda' : '#f8d7da',
                          color: item.isAvailable ? '#155724' : '#721c24',
                        }}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleToggleAvailability(item._id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: item.isAvailable ? '#dc3545' : '#28a745',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                        }}
                      >
                        {item.isAvailable ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {menuItems.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No menu items found. Add your first item!
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h2>Orders Management ({orders.length})</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No orders found.
            </div>
          ) : (
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
                      alignItems: 'start',
                      paddingBottom: '15px',
                      borderBottom: '2px solid #f0f0f0',
                      marginBottom: '15px',
                      flexWrap: 'wrap',
                      gap: '15px',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>Order #{order._id.slice(-8)}</h3>
                      <p style={{ margin: '3px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Customer:</strong> {order.userId?.name || 'N/A'}
                      </p>
                      <p style={{ margin: '3px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Email:</strong> {order.userId?.email || 'N/A'}
                      </p>
                      <p style={{ margin: '3px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Date:</strong>{' '}
                        {new Date(order.createdAt).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Payment Status */}
                      <div>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>
                          Payment Status
                        </p>
                        <span
                          style={{
                            padding: '6px 12px',
                            backgroundColor:
                              order.paymentStatus === 'paid'
                                ? '#28a745'
                                : order.paymentStatus === 'failed'
                                ? '#dc3545'
                                : '#ffc107',
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
                      
                      {/* Order Status with Dropdown */}
                      <div>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>
                          Order Status
                        </p>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '2px solid #007bff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                        >
                          <option value="placed">Placed</option>
                          <option value="preparing">Preparing</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                        </select>
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
                          padding: '8px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '4px',
                          marginBottom: '6px',
                        }}
                      >
                        <div>
                          <strong>
                            {item.name} × {item.quantity}
                          </strong>
                          {item.selectedSize && (
                            <span style={{ fontSize: '13px', color: '#666', marginLeft: '8px' }}>
                              ({item.selectedSize.name})
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 'bold', color: '#007bff' }}>
                          ₹{item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location */}
                  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Delivery:</strong> {order.deliveryLocation}
                  </div>

                  {/* Total */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '15px',
                      borderTop: '2px solid #007bff',
                    }}
                  >
                    <h3 style={{ margin: 0 }}>Total Amount:</h3>
                    <h3 style={{ margin: 0, color: '#007bff', fontSize: '24px' }}>
                      ₹{order.totalAmount.toFixed(2)}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
