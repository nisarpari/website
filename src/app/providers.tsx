'use client';

import { ThemeProvider, CartProvider, WishlistProvider, LocaleProvider, VerificationProvider, VerificationModal, AdminProvider } from '@/context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AdminProvider>
          <VerificationProvider>
            <CartProvider>
              <WishlistProvider>
                {children}
                <VerificationModal />
              </WishlistProvider>
            </CartProvider>
          </VerificationProvider>
        </AdminProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
