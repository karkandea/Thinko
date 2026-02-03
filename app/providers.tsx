'use client';

import { AuthProvider } from '@/lib/auth-context';
import { ReactNode, useEffect } from 'react';
import { initAnalytics } from '@/lib/firebase';

export function Providers({ children }: { children: ReactNode }) {
  // Initialize Firebase Analytics on client side
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
