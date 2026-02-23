import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';

function Checkout() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { cartItems, getGrandTotal, clearCart } = useCart();

  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h1>Checkout</h1>
        <p style={{ fontSize: '18px', color: '#666', marginTop: '40px' }}>
          Your cart is empty. Add items before checking out.
        </p>
        <button
          onClick={() => navigate('/menu')}
          style={{
            marginTop: '20px',
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
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Not authorized. Please log in again.');
      navigate('/login');
      return;
    }

    if (!deliveryLocation.trim()) {
      setError('Please enter delivery location');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order
      const orderData = {
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          selectedSize: item.selectedSize,
          selectedToppings: item.selectedToppings,
          quantity: item.quantity,
        })),
        deliveryLocation: deliveryLocation.trim(),
        paymentMethod,
      };

      const orderResponse = await orderService.createOrder(orderData);
      const order = orderResponse.data;

      // If COD, skip payment gateway
      if (paymentMethod === 'COD') {
        clearCart();
        alert('Order placed successfully! Pay cash on delivery.');
        navigate('/orders');
        setLoading(false);
        return;
      }

      // Step 2: Load Razorpay script
      const scriptLoaded = await paymentService.loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      // Step 3: Create payment order
      const paymentResponse = await paymentService.createPaymentOrder(order._id);
      const { razorpayOrderId, amount, currency, keyId } = paymentResponse.data;

      // Step 4: Open Razorpay checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Pizza Ordering App',
        description: `Order #${order._id}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Step 5: Verify payment
            const verifyData = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            };

            await paymentService.verifyPayment(verifyData);

            // Step 6: Clear cart and redirect
            clearCart();
            alert('Payment successful! Your order has been placed.');
            navigate('/orders');
          } catch (error) {
            console.error('Payment verification failed:', error);
            setError('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#007bff',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled. You can retry from Orders page.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', async function (response) {
        console.error('Payment failed:', response.error);
        await paymentService.handlePaymentFailure(order._id, response.error);
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      razorpay.open();
      setLoading(false);
    } catch (error) {
      console.error('Order/Payment error:', error);
      setError(error.response?.data?.message || 'Failed to process order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Checkout</h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', 
        gap: '30px' 
      }}>
        {/* Order Summary */}
        <div>
          <h2 style={{ marginBottom: '20px' }}>Order Summary</h2>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
            {cartItems.map((item, index) => (
              <div
                key={index}
                style={{
                  paddingBottom: '15px',
                  marginBottom: '15px',
                  borderBottom: index < cartItems.length - 1 ? '1px solid #eee' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
                    {item.selectedSize && (
                      <p style={{ margin: '3px 0', fontSize: '14px', color: '#666' }}>
                        Size: {item.selectedSize.name}
                      </p>
                    )}
                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                      <p style={{ margin: '3px 0', fontSize: '14px', color: '#666' }}>
                        Toppings: {item.selectedToppings.map((t) => t.name).join(', ')}
                      </p>
                    )}
                    <p style={{ margin: '3px 0', fontSize: '14px', color: '#666' }}>
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#007bff' }}>
                    ₹{(Number(item.totalPrice) || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '2px solid #007bff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0 }}>Grand Total:</h3>
              <h3 style={{ margin: 0, color: '#007bff', fontSize: '28px' }}>
                ₹{(getGrandTotal() || 0).toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        {/* Delivery Form */}
        <div>
          <h2 style={{ marginBottom: '20px' }}>Delivery Details</h2>
          <form onSubmit={handlePlaceOrder}>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
              {error && (
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    borderRadius: '4px',
                    marginBottom: '20px',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor="deliveryLocation"
                  style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
                >
                  Delivery Address *
                </label>
                <textarea
                  id="deliveryLocation"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="Enter your complete delivery address..."
                  required
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                  Payment Method *
                </label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <label
                    style={{
                      flex: 1,
                      padding: '15px',
                      border: paymentMethod === 'COD' ? '2px solid #28a745' : '2px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: paymentMethod === 'COD' ? '#f0fff4' : 'white',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    <strong>Cash on Delivery</strong>
                    <p style={{ margin: '5px 0 0 24px', fontSize: '13px', color: '#666' }}>
                      Pay when you receive
                    </p>
                  </label>
                  <label
                    style={{
                      flex: 1,
                      padding: '15px',
                      border: paymentMethod === 'ONLINE' ? '2px solid #007bff' : '2px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: paymentMethod === 'ONLINE' ? '#f0f8ff' : 'white',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    <strong>Online Payment</strong>
                    <p style={{ margin: '5px 0 0 24px', fontSize: '13px', color: '#666' }}>
                      UPI, Cards, Net Banking
                    </p>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Customer Details</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Name:</strong> {user?.name}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Email:</strong> {user?.email}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: loading ? '#6c757d' : (paymentMethod === 'COD' ? '#28a745' : '#007bff'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Processing...' : (paymentMethod === 'COD' ? 'Place Order (COD)' : 'Place Order & Pay Online')}
              </button>

              <p style={{ marginTop: '15px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                {paymentMethod === 'ONLINE' ? 'You will be redirected to payment gateway' : 'Pay cash when your order arrives'}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
