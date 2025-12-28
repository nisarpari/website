'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ODOO_CONFIG } from '@/lib/api/config';

// GCC countries for verification
export const GCC_COUNTRIES_LIST = [
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' }
];

export interface GCCCountry {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

interface VerificationContextType {
  isVerified: boolean;
  verifiedPhone: string | null;
  showVerificationModal: boolean;
  setShowVerificationModal: (show: boolean) => void;
  markAsVerified: (phone: string, token: string) => void;
  clearVerification: () => void;
  requestVerification: () => void;
  gccCountries: GCCCountry[];
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) throw new Error('useVerification must be used within VerificationProvider');
  return context;
};

interface VerificationProviderProps {
  children: ReactNode;
}

export const VerificationProvider = ({ children }: VerificationProviderProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('bella_verified');
    const storedPhone = sessionStorage.getItem('bella_verified_phone');
    setIsVerified(stored === 'true');
    setVerifiedPhone(storedPhone);
  }, []);

  // Save verification status
  const markAsVerified = (phone: string, token: string) => {
    setIsVerified(true);
    setVerifiedPhone(phone);
    sessionStorage.setItem('bella_verified', 'true');
    sessionStorage.setItem('bella_verified_phone', phone);
    sessionStorage.setItem('bella_verification_token', token);
    setShowVerificationModal(false);
  };

  // Clear verification
  const clearVerification = () => {
    setIsVerified(false);
    setVerifiedPhone(null);
    sessionStorage.removeItem('bella_verified');
    sessionStorage.removeItem('bella_verified_phone');
    sessionStorage.removeItem('bella_verification_token');
  };

  // Open verification modal
  const requestVerification = () => {
    setShowVerificationModal(true);
  };

  return (
    <VerificationContext.Provider value={{
      isVerified,
      verifiedPhone,
      showVerificationModal,
      setShowVerificationModal,
      markAsVerified,
      clearVerification,
      requestVerification,
      gccCountries: GCC_COUNTRIES_LIST
    }}>
      {children}
    </VerificationContext.Provider>
  );
};

// Verification Modal Component
export const VerificationModal = () => {
  const { showVerificationModal, setShowVerificationModal, markAsVerified, gccCountries } = useVerification();
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [selectedCountry, setSelectedCountry] = useState(gccCountries[0]);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullPhone, setFullPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  if (!showVerificationModal) return null;

  const handleSendOTP = async () => {
    if (!phone || phone.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${ODOO_CONFIG.proxyUrl}/api/verify/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          countryCode: selectedCountry.code
        })
      });

      const data = await response.json();

      if (data.success) {
        setFullPhone(data.phone);
        if (data.devOtp) setDevOtp(data.devOtp);
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    }

    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${ODOO_CONFIG.proxyUrl}/api/verify/check-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          otp: otp
        })
      });

      const data = await response.json();

      if (data.success && data.verified) {
        markAsVerified(data.phone, data.token);
        setStep('success');
        setTimeout(() => {
          setShowVerificationModal(false);
          setStep('phone');
          setPhone('');
          setOtp('');
        }, 2000);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch {
      setError('Failed to verify OTP. Please try again.');
    }

    setLoading(false);
  };

  const handleClose = () => {
    setShowVerificationModal(false);
    setStep('phone');
    setPhone('');
    setOtp('');
    setError('');
    setDevOtp('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-navy-dark p-6 text-white relative">
          <button onClick={handleClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Verify Your Phone</h2>
              <p className="text-bella-300 text-sm">Get access to exclusive prices</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'phone' && (
            <div>
              <p className="text-bella-600 mb-4">
                Enter your phone number to receive a verification code via WhatsApp.
              </p>

              {/* Country Selector */}
              <label className="block text-sm font-medium text-navy mb-2">Country</label>
              <div className="relative mb-4">
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const found = gccCountries.find(c => c.code === e.target.value);
                    if (found) setSelectedCountry(found);
                  }}
                  className="w-full px-4 py-3 pr-10 border border-bella-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                >
                  {gccCountries.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
                <svg className="w-5 h-5 text-bella-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Phone Input */}
              <label className="block text-sm font-medium text-navy mb-2">Phone Number</label>
              <div className="flex gap-2 mb-4">
                <div className="px-4 py-3 bg-bella-50 border border-bella-200 rounded-xl text-navy font-medium min-w-[80px] text-center">
                  {selectedCountry.dialCode}
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9XXXXXXX"
                  className="flex-1 px-4 py-3 border border-bella-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50"
                  maxLength={10}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-gold hover:bg-gold-dark text-navy py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>

              <p className="text-bella-500 text-xs text-center mt-4">
                Available for GCC countries only. We&apos;ll send a code via WhatsApp.
              </p>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <p className="text-bella-600 mb-4">
                Enter the 6-digit code sent to <span className="font-semibold text-navy">{fullPhone}</span>
              </p>

              {/* Dev mode OTP hint */}
              {devOtp && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Dev Mode:</strong> OTP is <span className="font-mono font-bold">{devOtp}</span>
                  </p>
                </div>
              )}

              {/* OTP Input */}
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-4 border border-bella-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 text-center text-2xl font-mono tracking-widest mb-4"
                maxLength={6}
              />

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-gold hover:bg-gold-dark text-navy py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              <button
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                className="w-full text-bella-500 hover:text-navy py-2 mt-2 text-sm"
              >
                Change phone number
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">Verified!</h3>
              <p className="text-bella-600">You now have access to all prices.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
