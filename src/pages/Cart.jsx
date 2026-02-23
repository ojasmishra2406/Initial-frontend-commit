import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const {
    cartItems,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getGrandTotal,
  } = useCart();
  const navigate = useNavigate();

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h1>Your Cart</h1>
        <div
          style={{
            border: '2px dashed #ddd',
            borderRadius: '8px',
            padding: '60px 20px',
            marginTop: '40px',
          }}
        >
          <p style={{ fontSize: '24px', color: '#666', marginBottom: '20px' }}>
            🛒 Your cart is empty
          </p>
          <p style={{ fontSize: '16px', color: '#888', marginBottom: '30px' }}>
            Add some delicious items to get started!
          </p>
          <button
            onClick={() => navigate('/menu')}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Your Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</h1>
        <button
          onClick={clearCart}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Clear Cart
        </button>
      </div>

      {/* Cart Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
        {cartItems.map((item, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            {/* Item Info */}
            <div style={{ flex: '1', minWidth: '200px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>{item.name}</h3>
              
              {/* Size info */}
              {item.selectedSize && (
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  Size: <strong>{item.selectedSize.name}</strong> (×{item.selectedSize.priceMultiplier})
                </p>
              )}

              {/* Toppings info */}
              {item.selectedToppings && item.selectedToppings.length > 0 && (
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  Toppings: <strong>{item.selectedToppings.map(t => t.name).join(', ')}</strong>
                </p>
              )}

              {/* Price breakdown */}
              <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#888' }}>
                Unit Price: ₹{(Number(item.unitPrice) || 0).toFixed(2)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button
                onClick={() => decrementQuantity(index)}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                -
              </button>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  minWidth: '40px',
                  textAlign: 'center',
                }}
              >
                {item.quantity}
              </span>
              <button
                onClick={() => incrementQuantity(index)}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                +
              </button>
            </div>

            {/* Total Price */}
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#007bff',
                minWidth: '100px',
                textAlign: 'right',
              }}
            >
              ₹{(Number(item.totalPrice) || 0).toFixed(2)}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeFromCart(index)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Grand Total Section */}
      <div
        style={{
          border: '2px solid #007bff',
          borderRadius: '8px',
          padding: '30px',
          backgroundColor: '#f8f9fa',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: '0', fontSize: '28px' }}>Grand Total:</h2>
          <h2 style={{ margin: '0', fontSize: '32px', color: '#007bff' }}>
            ₹{getGrandTotal().toFixed(2)}
          </h2>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;
