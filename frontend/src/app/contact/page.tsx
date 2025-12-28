'use client';

import { useState } from 'react';
import { useLocale } from '@/context';

export default function ContactPage() {
  const { t } = useLocale();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bella-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-navy to-navy-light py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-4">{t('contact')}</h1>
          <p className="text-bella-300 max-w-xl mx-auto">Get in touch with our team for any inquiries</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-bold text-navy mb-6">Get in Touch</h2>
            <p className="text-bella-600 mb-8">
              We&apos;re here to help with any questions about our products, orders, or services.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-navy mb-1">Visit Us</h3>
                  <p className="text-bella-600">Bella Bathwares Showroom<br />Al Khuwair, Muscat, Oman</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-navy mb-1">Call Us</h3>
                  <p className="text-bella-600">+968 99999999<br />Sun - Thu: 9am - 6pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-navy mb-1">Email Us</h3>
                  <p className="text-bella-600">info@bellabathwares.com<br />support@bellabathwares.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.47,14.38c-.29-.14-1.7-.84-1.96-.94s-.46-.14-.65.14-.75.94-.92,1.13-.34.21-.63.07a7.94,7.94,0,0,1-2.34-1.44,8.77,8.77,0,0,1-1.62-2.01c-.17-.29,0-.45.13-.59s.29-.34.44-.51a2,2,0,0,0,.29-.48.53.53,0,0,0,0-.51c-.07-.14-.65-1.57-.89-2.15s-.47-.49-.65-.5-.36,0-.55,0a1.06,1.06,0,0,0-.77.36,3.22,3.22,0,0,0-1,2.4,5.59,5.59,0,0,0,1.17,2.97,12.82,12.82,0,0,0,4.9,4.33,16.17,16.17,0,0,0,1.64.61,3.94,3.94,0,0,0,1.81.11,2.96,2.96,0,0,0,1.94-1.37,2.4,2.4,0,0,0,.17-1.37C17.94,14.52,17.76,14.45,17.47,14.38Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-navy mb-1">WhatsApp</h3>
                  <a href="https://wa.me/96899999999" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                    Chat with us on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Message Sent!</h3>
                <p className="text-bella-600">Thank you for contacting us. We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-navy mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">Message *</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gold hover:bg-gold-dark text-navy py-4 rounded-full font-semibold transition-all"
                  >
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
