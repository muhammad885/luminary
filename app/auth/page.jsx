'use client'

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    cartCount,
    clearCart
  } = useCart();

  if (cartCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-600 mt-2">Continue shopping to add items to your cart</p>
        <Link 
          href="/" 
          className="mt-6 inline-block bg-gray-900 text-white px-6 py-3 font-medium hover:bg-gray-700 transition duration-300"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-serif font-bold text-gray-900">Your Cart ({cartCount})</h1>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="border-b border-gray-200 pb-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6 font-medium text-gray-900">Product</div>
              <div className="col-span-3 font-medium text-gray-900">Price</div>
              <div className="col-span-2 font-medium text-gray-900">Quantity</div>
              <div className="col-span-1 font-medium text-gray-900"></div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {cart.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 py-4 items-center">
                <div className="col-span-6 flex items-center">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      <Link href={`/products/${item.id}`}>
                        {item.name}
                      </Link>
                    </h3>
                  </div>
                </div>
                <div className="col-span-3 text-gray-900">${item.price}</div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-center"
                  />
                </div>
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={clearCart}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear cart
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">Free</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-4">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-lg font-medium text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="mt-6 w-full bg-gray-900 text-white px-6 py-3 font-medium hover:bg-gray-700 transition duration-300"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}