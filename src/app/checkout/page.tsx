'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useCart, useVerification } from '@/context';
import { GCC_COUNTRIES_LIST } from '@/context/VerificationContext';
import { ODOO_CONFIG } from '@/lib/api/config';

type CheckoutStep = 'form' | 'processing' | 'success' | 'error';

interface OrderInfo {
  quotationName: string;
  orderRef: string;
}

export default function CheckoutPage() {
  const { cart, clearCart, cartTotal } = useCart();
  const { countryConfig, formatPrice, country } = useLocale();
  const { verifiedPhone } = useVerification();

  const [step, setStep] = useState<CheckoutStep>('form');
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: verifiedPhone || '',
    countryCode: GCC_COUNTRIES_LIST.find(c => c.code === country)?.code || 'OM',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    setStep('processing');
    setError('');

    try {
      const selectedCountry = GCC_COUNTRIES_LIST.find(c => c.code === formData.countryCode);
      // Only add dial code if phone doesn't already start with + or the dial code
      const phoneNumber = formData.phone.trim();
      const fullPhone = selectedCountry && !phoneNumber.startsWith('+') && !phoneNumber.startsWith(selectedCountry.dialCode.replace('+', ''))
        ? `${selectedCountry.dialCode}${phoneNumber}`
        : phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      // Submit quotation request to Odoo (creates estimate/draft order)
      const response = await fetch(`${ODOO_CONFIG.proxyUrl}/api/quotation/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email || '',
            phone: fullPhone
          },
          cart: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price, // Original OMR price
            quantity: item.quantity,
            variantIds: item.variantIds || []
          })),
          country: selectedCountry?.code || 'OM'
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrderInfo({
          quotationName: data.quotationName,
          orderRef: data.orderRef
        });
        clearCart();
        setStep('success');
      } else {
        throw new Error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to submit request. Please try again.');
      setStep('error');
    }
  };

  if (cart.length === 0 && step === 'form') {
    return (
      <div className="min-h-screen bg-bella-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">Your cart is empty</h1>
          <Link href="/shop" className="text-gold hover:text-gold-dark">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-bella-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-navy mb-4">Request Submitted!</h1>
          <p className="text-bella-600 mb-2">Thank you for your interest in Bella products.</p>
          {orderInfo?.quotationName && (
            <p className="text-lg font-semibold text-navy mb-6">
              Reference: {orderInfo.quotationName}
            </p>
          )}
          <p className="text-bella-500 text-sm mb-8">
            Our team will contact you shortly to discuss your requirements and provide a detailed quotation.
          </p>
          <div className="space-y-3">
            <Link href="/track" className="block bg-gold hover:bg-gold-dark text-navy px-8 py-3 rounded-full font-semibold">
              Track Your Order
            </Link>
            <Link href="/" className="block text-gold hover:text-gold-dark">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-bella-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loader mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-navy mb-2">Submitting Your Request</h1>
          <p className="text-bella-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bella-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-navy mb-8">Checkout</h1>

        {step === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-6">
              <h2 className="font-semibold text-navy text-lg mb-4">Contact Information</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Country *</label>
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold"
                  >
                    {GCC_COUNTRIES_LIST.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9XXXXXXX"
                    className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold"
                  placeholder="Any special requirements or questions..."
                />
              </div>

              {/* What Happens Next */}
              <div className="pt-4 border-t border-bella-100">
                <h3 className="font-semibold text-navy mb-3">What Happens Next?</h3>
                <div className="flex items-center gap-3 p-4 bg-bella-50 rounded-xl">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-navy">We&apos;ll Contact You</p>
                    <p className="text-sm text-bella-500">Our team will call to confirm details, pricing, and arrange delivery</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gold hover:bg-gold-dark text-white py-4 rounded-xl font-semibold text-lg transition-all"
              >
                Submit Order Request
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-28">
              <h2 className="font-semibold text-navy text-lg mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || item.thumbnail || '/placeholder.webp'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-navy text-sm font-medium truncate">{item.name}</p>
                      <p className="text-bella-500 text-xs">Qty: {item.quantity}</p>
                      <p className="text-gold text-sm font-semibold">{countryConfig.currencySymbol} {formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-bella-100 pt-4 space-y-3">
                <div className="flex justify-between text-bella-600">
                  <span>Subtotal</span>
                  <span>{countryConfig.currencySymbol} {formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-bella-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-bella-100 pt-3 flex justify-between font-bold text-navy text-lg">
                  <span>Total</span>
                  <span>{countryConfig.currencySymbol} {formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
