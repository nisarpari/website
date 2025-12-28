'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useVerification } from '@/context';
import { ODOO_CONFIG } from '@/lib/api/config';

interface OrderLine {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: number;
  reference: string;
  clientRef?: string;
  status: string;
  statusKey: string;
  date: string;
  total: number;
  itemCount: number;
  customerName: string;
  lines?: OrderLine[];
}

interface Delivery {
  id: number;
  reference: string;
  origin: string;
  status: string;
  statusKey: string;
  scheduledDate: string;
  doneDate?: string;
  customerName: string;
  itemCount: number;
}

interface Ticket {
  id: number;
  reference: string;
  subject: string;
  status: string;
  date: string;
  customerName: string;
  priority: string;
}

interface Repair {
  id: number;
  reference: string;
  status: string;
  statusKey: string;
  date: string;
  customerName: string;
  product: string;
  total: number;
}

interface TrackData {
  orders: Order[];
  deliveries: Delivery[];
  helpdesk: Ticket[];
  repairs: Repair[];
  customer: { name: string; phone: string; email: string } | null;
}

type TabType = 'orders' | 'deliveries' | 'tickets' | 'repairs';

export default function TrackOrderPage() {
  const { t, countryConfig, formatPrice } = useLocale();
  const { isVerified, verifiedPhone, requestVerification } = useVerification();
  const [loading, setLoading] = useState(false);
  const [trackData, setTrackData] = useState<TrackData>({ orders: [], deliveries: [], helpdesk: [], repairs: [], customer: null });
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState<number | null>(null);

  // Auto-search when user is verified
  useEffect(() => {
    if (isVerified && verifiedPhone) {
      searchData(verifiedPhone);
    }
  }, [isVerified, verifiedPhone]);

  const searchData = async (phoneNumber: string) => {
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await fetch(`${ODOO_CONFIG.proxyUrl}/api/track/search?query=${encodeURIComponent(phoneNumber)}`);
      const data = await response.json();

      if (data.success) {
        setTrackData({
          orders: data.orders || [],
          deliveries: data.deliveries || [],
          helpdesk: data.helpdesk || [],
          repairs: data.repairs || [],
          customer: data.customer || null
        });
      } else {
        setTrackData({ orders: [], deliveries: [], helpdesk: [], repairs: [], customer: null });
      }
    } catch {
      setTrackData({ orders: [], deliveries: [], helpdesk: [], repairs: [], customer: null });
      setError('Failed to fetch data. Please try again.');
    }

    setLoading(false);
  };

  const loadOrderDetails = async (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setLoadingOrderDetails(orderId);
    try {
      const response = await fetch(`${ODOO_CONFIG.proxyUrl}/api/track/order/${orderId}`);
      const data = await response.json();

      if (data.success && data.order) {
        // Update the order with line items
        setTrackData(prev => ({
          ...prev,
          orders: prev.orders.map(order =>
            order.id === orderId ? { ...order, lines: data.order.lines } : order
          )
        }));
      }
    } catch {
      console.error('Failed to load order details');
    }
    setLoadingOrderDetails(null);
    setExpandedOrder(orderId);
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('cancel')) return 'bg-red-100 text-red-700';
    if (s.includes('draft') || s.includes('quotation')) return 'bg-bella-100 text-bella-700';
    if (s.includes('confirm') || s.includes('processing') || s.includes('waiting') || s.includes('ready')) return 'bg-blue-100 text-blue-700';
    if (s.includes('ship') || s.includes('transit') || s.includes('repair')) return 'bg-yellow-100 text-yellow-700';
    if (s.includes('deliver') || s.includes('done') || s.includes('complete') || s.includes('sale')) return 'bg-green-100 text-green-700';
    return 'bg-bella-100 text-bella-700';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const tabs: { key: TabType; label: string; count: number; icon: JSX.Element }[] = [
    {
      key: 'orders',
      label: 'Orders',
      count: trackData.orders.length,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    },
    {
      key: 'deliveries',
      label: 'Deliveries',
      count: trackData.deliveries.length,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
    },
    {
      key: 'tickets',
      label: 'Tickets',
      count: trackData.helpdesk.length,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
    },
    {
      key: 'repairs',
      label: 'Repairs',
      count: trackData.repairs.length,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    }
  ];

  return (
    <div className="min-h-screen bg-bella-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-navy-light py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-4">{t('trackOrder')}</h1>
          <p className="text-bella-300 max-w-xl mx-auto">Track your orders, deliveries, tickets and repairs</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Not logged in - show login prompt */}
        {!isVerified && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy mb-3">Login to View Your Orders</h2>
            <p className="text-bella-600 mb-6 max-w-md mx-auto">
              Verify your phone number via WhatsApp to securely access your order history, deliveries, and support tickets.
            </p>
            <button
              onClick={requestVerification}
              className="bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-full font-semibold transition-colors text-lg"
            >
              Login with WhatsApp
            </button>
            <p className="text-bella-500 text-sm mt-4">
              Your privacy is protected. You can only view records linked to your verified phone number.
            </p>
          </div>
        )}

        {/* Logged in - show data */}
        {isVerified && (
          <>
            {/* Customer Info & Refresh */}
            <div className="bg-white rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-navy">
                    {trackData.customer?.name || 'Your Account'}
                  </h2>
                  <p className="text-bella-600 text-sm">{verifiedPhone}</p>
                </div>
                <button
                  onClick={() => verifiedPhone && searchData(verifiedPhone)}
                  disabled={loading}
                  className="text-gold hover:text-gold-dark font-medium flex items-center gap-2"
                >
                  <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                <p className="text-bella-600">Loading your data...</p>
              </div>
            )}

            {searched && !loading && (
              <>
                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'bg-gold text-white'
                          : 'bg-white text-bella-600 hover:bg-bella-100'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activeTab === tab.key ? 'bg-white/20' : 'bg-bella-100'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="bg-white rounded-2xl p-6">
                    <h3 className="font-semibold text-navy text-lg mb-4">Sales Orders & Quotations</h3>
                    {trackData.orders.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-bella-500">No orders found</p>
                        <Link href="/shop" className="text-gold hover:text-gold-dark font-medium mt-2 inline-block">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {trackData.orders.map(order => (
                          <div key={order.id} className="border border-bella-200 rounded-xl overflow-hidden">
                            {/* Order Header */}
                            <div
                              className="p-4 cursor-pointer hover:bg-bella-50 transition-colors"
                              onClick={() => loadOrderDetails(order.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <svg
                                    className={`w-5 h-5 text-bella-400 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <div>
                                    <span className="text-navy font-semibold">{order.reference}</span>
                                    {order.clientRef && (
                                      <span className="text-bella-500 text-sm ml-2">({order.clientRef})</span>
                                    )}
                                    <p className="text-bella-500 text-sm">{formatDate(order.date)} · {order.itemCount} item(s)</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                  <p className="text-navy font-semibold mt-1">
                                    {countryConfig.currencySymbol} {formatPrice(order.total)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Order Details (Expanded) */}
                            {expandedOrder === order.id && (
                              <div className="border-t border-bella-200 bg-bella-50 p-4">
                                {loadingOrderDetails === order.id ? (
                                  <div className="text-center py-4">
                                    <div className="w-6 h-6 mx-auto border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                ) : order.lines && order.lines.length > 0 ? (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-navy mb-3">Order Items:</p>
                                    {order.lines.map((line, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg">
                                        <div>
                                          <p className="text-navy">{line.productName}</p>
                                          <p className="text-bella-500">Qty: {line.quantity} × {countryConfig.currencySymbol} {formatPrice(line.unitPrice)}</p>
                                        </div>
                                        <p className="font-medium text-navy">
                                          {countryConfig.currencySymbol} {formatPrice(line.subtotal)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-bella-500 text-sm">No line items available</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Deliveries Tab */}
                {activeTab === 'deliveries' && (
                  <div className="bg-white rounded-2xl p-6">
                    <h3 className="font-semibold text-navy text-lg mb-4">Delivery Orders</h3>
                    {trackData.deliveries.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-bella-500">No deliveries found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {trackData.deliveries.map(delivery => (
                          <div key={delivery.id} className="border border-bella-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-navy font-semibold">{delivery.reference}</span>
                                {delivery.origin && (
                                  <span className="text-bella-500 text-sm ml-2">from {delivery.origin}</span>
                                )}
                                <p className="text-bella-500 text-sm">
                                  Scheduled: {formatDate(delivery.scheduledDate)}
                                  {delivery.doneDate && ` · Delivered: ${formatDate(delivery.doneDate)}`}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                                {delivery.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                  <div className="bg-white rounded-2xl p-6">
                    <h3 className="font-semibold text-navy text-lg mb-4">Support Tickets</h3>
                    {trackData.helpdesk.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-bella-500">No support tickets found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {trackData.helpdesk.map(ticket => (
                          <div key={ticket.id} className="border border-bella-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-navy font-semibold">#{ticket.reference}</span>
                                <p className="text-navy">{ticket.subject}</p>
                                <p className="text-bella-500 text-sm">{formatDate(ticket.date)}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Repairs Tab */}
                {activeTab === 'repairs' && (
                  <div className="bg-white rounded-2xl p-6">
                    <h3 className="font-semibold text-navy text-lg mb-4">Repair Orders</h3>
                    {trackData.repairs.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-bella-500">No repair orders found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {trackData.repairs.map(repair => (
                          <div key={repair.id} className="border border-bella-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-navy font-semibold">{repair.reference}</span>
                                <p className="text-bella-600">{repair.product}</p>
                                <p className="text-bella-500 text-sm">{formatDate(repair.date)}</p>
                              </div>
                              <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.status)}`}>
                                  {repair.status}
                                </span>
                                {repair.total > 0 && (
                                  <p className="text-navy font-semibold mt-1">
                                    {countryConfig.currencySymbol} {formatPrice(repair.total)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Contact Support */}
        <div className="mt-8 bg-white rounded-2xl p-8 text-center">
          <h3 className="font-semibold text-navy mb-2">Need Help?</h3>
          <p className="text-bella-600 mb-4">Contact our support team for assistance</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="https://wa.me/96899999999" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.47,14.38c-.29-.14-1.7-.84-1.96-.94s-.46-.14-.65.14-.75.94-.92,1.13-.34.21-.63.07a7.94,7.94,0,0,1-2.34-1.44,8.77,8.77,0,0,1-1.62-2.01c-.17-.29,0-.45.13-.59s.29-.34.44-.51a2,2,0,0,0,.29-.48.53.53,0,0,0,0-.51c-.07-.14-.65-1.57-.89-2.15s-.47-.49-.65-.5-.36,0-.55,0a1.06,1.06,0,0,0-.77.36,3.22,3.22,0,0,0-1,2.4,5.59,5.59,0,0,0,1.17,2.97,12.82,12.82,0,0,0,4.9,4.33,16.17,16.17,0,0,0,1.64.61,3.94,3.94,0,0,0,1.81.11,2.96,2.96,0,0,0,1.94-1.37,2.4,2.4,0,0,0,.17-1.37C17.94,14.52,17.76,14.45,17.47,14.38Z" />
              </svg>
              WhatsApp Support
            </a>
            <Link href="/contact" className="flex items-center gap-2 text-gold hover:text-gold-dark">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
