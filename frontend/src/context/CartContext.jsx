import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (medicine, quantity = 1) => {
    console.log('🛒 Adding to cart:', {
      name: medicine.name,
      medicine_id: medicine.medicine_id,
      quantity: quantity
    });

    setCartItems(prevItems => {
      console.log('📦 Current cart items:', prevItems.map(i => ({
        name: i.name,
        id: i.medicine_id,
        qty: i.quantity
      })));

      const existingItem = prevItems.find(item => item.medicine_id === medicine.medicine_id);

      if (existingItem) {
        console.log('✅ Item already in cart, updating quantity');
        return prevItems.map(item =>
          item.medicine_id === medicine.medicine_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      console.log('➕ Adding new item to cart');
      return [...prevItems, { ...medicine, quantity }];
    });
  };

  const removeFromCart = (medicine_id) => {
    setCartItems(prevItems => prevItems.filter(item => item.medicine_id !== medicine_id));
  };

  const updateQuantity = (medicine_id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(medicine_id);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.medicine_id === medicine_id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

