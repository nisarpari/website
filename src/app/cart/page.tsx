'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useCart, useWishlist } from '@/context';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { countryConfig, formatPrice, t } = useLocale();

  const handleMoveToWishlist = (item: typeof cart[0]) => {
    addToWishlist(item);
    removeFromCart(item.id);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-bella-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bella-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-bella-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Your cart is empty</h1>
          <p className="text-bella-600 mb-6">Add some products to get started</p>
          <Link href="/shop" className="bg-gold hover:bg-gold-dark text-navy px-8 py-3 rounded-full font-semibold transition-all">
            {t('shopNow')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bella-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-navy mb-8">{t('cart')}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || item.thumbnail || '/placeholder.webp'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-navy">{item.name}</h3>
                  <p className="text-gold font-bold mt-1">{countryConfig.currencySymbol} {formatPrice(item.price)}</p>

                  {/* Quantity */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-bella-200 flex items-center justify-center hover:bg-bella-50"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-bella-200 flex items-center justify-center hover:bg-bella-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleMoveToWishlist(item)}
                    className="text-bella-500 hover:text-gold text-sm"
                    disabled={isInWishlist(item.id)}
                  >
                    {isInWishlist(item.id) ? 'In Wishlist' : 'Move to Wishlist'}
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-bella-500 hover:text-red-500 text-sm"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-28">
              <h2 className="font-semibold text-navy text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-bella-600">
                  <span>Subtotal</span>
                  <span>{countryConfig.currencySymbol} {formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-bella-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-bella-100 pt-3 flex justify-between font-bold text-navy">
                  <span>Total</span>
                  <span>{countryConfig.currencySymbol} {formatPrice(cartTotal)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block w-full bg-gold hover:bg-gold-dark text-navy text-center py-4 rounded-full font-semibold transition-all"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/shop"
                className="block w-full text-center text-gold hover:text-gold-dark mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
