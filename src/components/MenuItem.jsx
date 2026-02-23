import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CustomizationModal from './CustomizationModal';
import styles from './MenuItem.module.css';

function MenuItem({ item }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);

  // Determine if item is customizable (has sizes = pizza)
  const isCustomizable = item.sizes && item.sizes.length > 0;

  const handleQuickAdd = () => {
    const defaultSize = item.sizes && item.sizes.length > 0 ? item.sizes[0] : null;

    const cartItem = {
      menuItemId: item._id,
      name: item.name,
      image: item.image,
      basePrice: item.basePrice,
      selectedSize: defaultSize,
      selectedToppings: [],
      includedToppings: [],
      extraToppings: [],
      quantity: 1,
    };

    addToCart(cartItem);
    alert(`${item.name} added to cart!`);
  };

  const handleCustomize = () => {
    if (!isAuthenticated) {
      alert('Please login to customize your order');
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <div className={styles.menuItem}>
        {item.image && (
          <div className={styles.imageWrapper}>
            <img
              src={item.image}
              alt={item.name}
              className={styles.image}
            />
          </div>
        )}
        
        <div className={styles.content}>
          <span className={styles.category}>{item.category}</span>
          <h3 className={styles.name}>{item.name}</h3>
          <p className={styles.price}>₹{(Number(item.basePrice) || 0).toFixed(2)}</p>
          
          {(item.sizes?.length > 0 || item.toppings?.length > 0) && (
            <div className={styles.details}>
              {item.sizes && item.sizes.length > 0 && (
                <span className={styles.badge}>
                  {item.sizes.length} size{item.sizes.length > 1 ? 's' : ''}
                </span>
              )}
              {item.toppings && item.toppings.length > 0 && (
                <span className={styles.badge}>
                  {item.toppings.length} topping{item.toppings.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
          
          {isCustomizable ? (
            <button
              onClick={handleCustomize}
              disabled={!isAuthenticated}
              className={styles.button}
            >
              {isAuthenticated ? 'Customize' : 'Login to Order'}
            </button>
          ) : (
            <button
              onClick={handleQuickAdd}
              disabled={!isAuthenticated}
              className={styles.button}
            >
              {isAuthenticated ? 'Add to Cart' : 'Login to Order'}
            </button>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {isCustomizable && (
        <CustomizationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          item={item}
        />
      )}
    </>
  );
}

export default MenuItem;
