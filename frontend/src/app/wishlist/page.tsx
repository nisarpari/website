'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useCart, useWishlist, useVerification } from '@/context';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { countryConfig, formatPrice, t } = useLocale();
  const { isVerified } = useVerification();

  const handleAddToCart = (item: typeof wishlist[0]) => {
    addToCart(item, 1);
    removeFromWishlist(item.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-bella-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bella-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-bella-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Your wishlist is empty</h1>
          <p className="text-bella-600 mb-6">Save items you love for later</p>
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
        <h1 className="font-display text-3xl font-bold text-navy mb-8">{t('wishlist')} ({wishlist.length})</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-56 bg-bella-100">
                <Image
                  src={item.image || item.thumbnail || '/placeholder.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center shadow-md transition-colors"
                >
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <p className="text-bella-500 text-xs uppercase tracking-wide">{item.category}</p>
                <h3 className="font-display text-lg font-semibold text-navy mt-1 line-clamp-2">{item.name}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xl font-bold text-navy">{countryConfig.currencySymbol} {formatPrice(item.price)}</span>
                </div>
                {isVerified && (
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full mt-4 bg-gold hover:bg-gold-dark text-navy py-2 rounded-lg font-medium transition-colors"
                  >
                    {t('addToCart')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
