import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './CustomizationModal.module.css';

// Master list of ALL available toppings
const ALL_TOPPINGS = [
  { name: 'Paneer', price: 5 },
  { name: 'Mushroom', price: 5 },
  { name: 'Corn', price: 5 },
  { name: 'Capsicum', price: 5 },
  { name: 'Onion', price: 5 },
  { name: 'Tomato', price: 5 },
];

function CustomizationModal({ isOpen, onClose, item }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  // State management
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Initialize state when modal opens or item changes
  useEffect(() => {
    if (isOpen && item) {
      // Set default base (first available size)
      if (item.sizes && item.sizes.length > 0) {
        setSelectedBase(item.sizes[0]);
      }

      // Set included toppings as initially selected
      // item.toppings represents the included toppings for this pizza
      if (item.toppings && item.toppings.length > 0) {
        setSelectedToppings(item.toppings.map(t => t.name));
      } else {
        setSelectedToppings([]);
      }

      setQuantity(1);
    }
  }, [isOpen, item]);

  // Calculate extra toppings (toppings NOT included with the pizza)
  const getExtraToppings = () => {
    const includedToppingNames = item.toppings ? item.toppings.map(t => t.name) : [];
    return selectedToppings.filter(topping => !includedToppingNames.includes(topping));
  };

  // Calculate unit price
  const calculateUnitPrice = () => {
    if (!item || !selectedBase) return 0;

    const basePrice = item.basePrice;
    const multiplier = selectedBase.priceMultiplier || selectedBase.multiplier || 1;
    const extraToppings = getExtraToppings();
    const toppingPrice = 5; // ₹5 per extra topping

    return (basePrice * multiplier) + (extraToppings.length * toppingPrice);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return calculateUnitPrice() * quantity;
  };

  // Handle topping toggle
  const handleToppingToggle = (toppingName) => {
    setSelectedToppings(prev => {
      if (prev.includes(toppingName)) {
        return prev.filter(t => t !== toppingName);
      } else {
        return [...prev, toppingName];
      }
    });
  };

  // Check if topping is included with the pizza
  const isToppingIncluded = (toppingName) => {
    return item.toppings ? item.toppings.some(t => t.name === toppingName) : false;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    if (!selectedBase) {
      alert('Please select a base');
      return;
    }

    const extraToppings = getExtraToppings();
    const unitPrice = calculateUnitPrice();
    const totalPrice = calculateTotalPrice();

    const cartItem = {
      menuItemId: item._id,
      name: item.name,
      image: item.image,
      basePrice: item.basePrice,
      selectedSize: selectedBase,
      selectedToppings: selectedToppings.map(name => {
        const topping = ALL_TOPPINGS.find(t => t.name === name);
        return { name, price: topping?.price || 5 };
      }),
      includedToppings: item.toppings || [],
      extraToppings: extraToppings.map(name => {
        const topping = ALL_TOPPINGS.find(t => t.name === name);
        return { name, price: topping?.price || 5 };
      }),
      quantity,
      unitPrice,
      totalPrice,
    };

    addToCart(cartItem);
    alert(`${item.name} added to cart!`);
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !item) return null;

  const includedToppingNames = item.toppings ? item.toppings.map(t => t.name) : [];
  const extraToppings = getExtraToppings();
  const unitPrice = calculateUnitPrice();
  const totalPrice = calculateTotalPrice();

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Customize Your Pizza</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Pizza Info */}
        <div className={styles.pizzaInfo}>
          <img src={item.image} alt={item.name} className={styles.pizzaImage} />
          <h3 className={styles.pizzaName}>{item.name}</h3>
        </div>

        {/* Base Selection */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Choose Your Base</h4>
          <div className={styles.baseOptions}>
            {item.sizes && item.sizes.map((size) => (
              <label key={size.name} className={styles.baseOption}>
                <input
                  type="radio"
                  name="base"
                  checked={selectedBase?.name === size.name}
                  onChange={() => setSelectedBase(size)}
                  className={styles.radioInput}
                />
                <span className={styles.baseName}>{size.name}</span>
                <span className={styles.baseMultiplier}>
                  {size.multiplier > 1 ? `+${((size.multiplier - 1) * 100).toFixed(0)}%` : 'Standard'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Toppings Selection */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Select Toppings</h4>
          <p className={styles.toppingHint}>
            Included toppings are free. Extra toppings are ₹5 each.
          </p>
          <div className={styles.toppingGrid}>
            {ALL_TOPPINGS.map((topping) => {
              const isIncluded = isToppingIncluded(topping.name);
              const isSelected = selectedToppings.includes(topping.name);
              const isExtra = isSelected && !isIncluded;

              return (
                <label
                  key={topping.name}
                  className={`${styles.toppingOption} ${isSelected ? styles.selected : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToppingToggle(topping.name)}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.toppingName}>{topping.name}</span>
                  {isIncluded && (
                    <span className={styles.includedBadge}>Included</span>
                  )}
                  {isExtra && (
                    <span className={styles.extraBadge}>+₹{topping.price}</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Quantity */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Quantity</h4>
          <div className={styles.quantityControl}>
            <button
              className={styles.quantityButton}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className={styles.quantityValue}>{quantity}</span>
            <button
              className={styles.quantityButton}
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div className={styles.priceSummary}>
          <div className={styles.priceRow}>
            <span>Unit Price:</span>
            <span>₹{unitPrice.toFixed(2)}</span>
          </div>
          {extraToppings.length > 0 && (
            <div className={styles.priceDetail}>
              <span>Extra Toppings ({extraToppings.length}):</span>
              <span>+₹{(extraToppings.length * 5).toFixed(2)}</span>
            </div>
          )}
          <div className={styles.priceRow}>
            <span>Quantity:</span>
            <span>× {quantity}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Total:</span>
            <span className={styles.totalPrice}>₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.addButton}
            onClick={handleAddToCart}
            disabled={!isAuthenticated}
          >
            {isAuthenticated ? 'Add to Cart' : 'Login to Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizationModal;
