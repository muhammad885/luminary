'use client';

import { createContext, useContext, useState, useEffect, startTransition } from 'react';
import { addToCart as addToCartAction, removeFromCart as removeFromCartAction, updateCartItem as updateCartItemAction } from '@/lib/actions/cart';
import { toast } from 'sonner';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    async function loadCart() {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    }
    loadCart();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    startTransition(() => {
      addToCartAction(product.id, quantity)
        .then((updatedCart) => {
          setCart(updatedCart);
          toast.success(`${quantity} ${product.name} added to your cart`, {
            description: 'Added to cart',
          });
        })
        .catch((error) => {
          toast.error('Error adding to cart', {
            description: error.message,
          });
        });
    });
  };

  const removeFromCart = async (productId) => {
    startTransition(() => {
      removeFromCartAction(productId)
        .then((updatedCart) => {
          setCart(updatedCart);
          toast.success('Item removed from your cart', {
            description: 'Removed from cart',
          });
        })
        .catch((error) => {
          toast.error('Error removing item', {
            description: error.message,
          });
        });
    });
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    startTransition(() => {
      updateCartItemAction(productId, quantity)
        .then((updatedCart) => {
          setCart(updatedCart);
        })
        .catch((error) => {
          toast.error('Error updating quantity', {
            description: error.message,
          });
        });
    });
  };

  const clearCart = async () => {
    setCart([]);
    toast.info('Cart cleared');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
