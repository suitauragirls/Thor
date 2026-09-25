import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: { email: string; uid: string; displayName?: string } | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: async () => {} });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; uid: string; displayName?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check custom pattern login first
    const localUser = localStorage.getItem('sba_custom_user');
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
        setLoading(false);
      } catch (e) {
        // Fallback
      }
    }

    // 2. Also listen to firebase auth
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      const hasLocalUser = localStorage.getItem('sba_custom_user');
      if (hasLocalUser) {
        return; // Pattern user is active, prefer that
      }
      if (fbUser) {
        setUser({
          email: fbUser.email || '',
          uid: fbUser.uid,
          displayName: fbUser.displayName || ''
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const handleAuthChange = () => {
      const updatedUser = localStorage.getItem('sba_custom_user');
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    window.addEventListener('sba-auth-state-change', handleAuthChange);

    return () => {
      unsubscribe();
      window.removeEventListener('sba-auth-state-change', handleAuthChange);
    };
  }, []);

  const logout = async () => {
    try {
      localStorage.removeItem('sba_custom_user');
      localStorage.removeItem('sba_orders_v1');
      localStorage.removeItem('sba_guest_orders');
      localStorage.removeItem('sba_last_guest_email');
      localStorage.removeItem('sba_last_guest_phone');
      localStorage.removeItem('sba_last_guest_name');
      localStorage.removeItem('sba_user_profile_current');
      localStorage.removeItem('sba_cart_v1');
      localStorage.removeItem('sba_cart_backup');
      localStorage.removeItem('sba_wishlist_v1');
      sessionStorage.clear();
    } catch {}

    try {
      await fbSignOut(auth);
    } catch (e) {
      // Ignored
    }
    setUser(null);
    window.dispatchEvent(new Event('sba-auth-state-change'));
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
