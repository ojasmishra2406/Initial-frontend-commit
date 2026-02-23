import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Price calculation helper
  const calculateItemPrice = (basePrice, selectedSize, selectedToppings) => {
    const base = Number(basePrice) || 0;
    const sizeMultiplier = Number(selectedSize?.priceMultiplier || selectedSize?.multiplier) || 1;
    const toppingsTotal = selectedToppings?.reduce((sum, topping) => {
      return sum + (Number(topping.price) || 0);
    }, 0) || 0;
    return (base * sizeMultiplier) + toppingsTotal;
  };

  // Check if two items are duplicates (same item, size, and toppings)
  const isDuplicate = (item1, item2) => {
    if (item1.menuItemId !== item2.menuItemId) return false;

    // Compare sizes
    const size1 = item1.selectedSize?.name || 'default';
    const size2 = item2.selectedSize?.name || 'default';
    if (size1 !== size2) return false;

    // Compare toppings
    const toppings1 = item1.selectedToppings?.map(t => t.name).sort().join(',') || '';
    const toppings2 = item2.selectedToppings?.map(t => t.name).sort().join(',') || '';
    
    return toppings1 === toppings2;
  };

  // Add item to cart
  const addToCart = (item) => {
    const { 
      menuItemId, 
      name, 
      image,
      basePrice, 
      selectedSize, 
      selectedToppings = [], 
      includedToppings = [],
      extraToppings = [],
      quantity = 1,
      unitPrice: providedUnitPrice,
      totalPrice: providedTotalPrice
    } = item;

    // Use provided prices (from customization modal) or calculate (for quick-add)
    const unitPrice = providedUnitPrice !== undefined 
      ? providedUnitPrice 
      : calculateItemPrice(basePrice, selectedSize, selectedToppings);
    
    const totalPrice = providedTotalPrice !== undefined
      ? providedTotalPrice
      : unitPrice * quantity;

    const newItem = {
      menuItemId,
      name,
      image,
      basePrice,
      selectedSize: selectedSize || null,
      selectedToppings,
      includedToppings,
      extraToppings,
      quantity,
      unitPrice,
      totalPrice,
    };

    setCartItems((prevCart) => {
      // Check for duplicate
      const existingItemIndex = prevCart.findIndex((cartItem) => isDuplicate(cartItem, newItem));

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: existingItem.unitPrice * newQuantity,
        };
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, newItem];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (index) => {
    setCartItems((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  // Update item quantity
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(index);
      return;
    }

    setCartItems((prevCart) => {
      const updatedCart = [...prevCart];
      const item = updatedCart[index];
      updatedCart[index] = {
        ...item,
        quantity: newQuantity,
        totalPrice: item.unitPrice * newQuantity,
      };
      return updatedCart;
    });
  };

  // Increment quantity
  const incrementQuantity = (index) => {
    updateQuantity(index, cartItems[index].quantity + 1);
  };

  // Decrement quantity
  const decrementQuantity = (index) => {
    updateQuantity(index, cartItems[index].quantity - 1);
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate grand total
  const getGrandTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      const itemTotal = Number(item.totalPrice) || 0;
      return sum + itemTotal;
    }, 0);
    return isNaN(total) ? 0 : total;
  };

  // Get total items count
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getGrandTotal,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
