'use client';

import { ThemeProvider, CartProvider, WishlistProvider, LocaleProvider, VerificationProvider, VerificationModal, AdminProvider } from '@/context';
import { MotionProvider } from '@/lib/animations';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MotionProvider>
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
      </MotionProvider>
    </ThemeProvider>
  );
}
