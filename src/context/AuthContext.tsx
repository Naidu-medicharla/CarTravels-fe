import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import type { User } from '../lib/api';

interface DecodedJwt {
  user_id?: number;
  id?: number;
  email: string;
  role: string;
  name?: string;
  exp: number; // Unix timestamp
}

/**
 * Decodes a JWT token, checks expiration, and returns the user payload.
 * Returns null if the token is invalid OR already expired.
 */
const decodeAndValidateJwt = (token: string): { user: User; expiresAt: number } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map((c) =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );

    const parsed: DecodedJwt = JSON.parse(jsonPayload);

    // Check expiration immediately
    const nowSec = Math.floor(Date.now() / 1000);
    if (!parsed.exp || parsed.exp <= nowSec) {
      return null; // Token already expired
    }

    return {
      user: {
        id: parsed.user_id || parsed.id || 0,
        email: parsed.email,
        role: parsed.role,
        name: parsed.name,
      },
      expiresAt: parsed.exp,
    };
  } catch {
    return null;
  }
};

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const performLogout = () => {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setUser(null);
    clearLogoutTimer();
  };

  /**
   * Schedules an automatic logout exactly when the JWT expires.
   */
  const scheduleAutoLogout = (expiresAtSec: number) => {
    clearLogoutTimer();
    const msUntilExpiry = expiresAtSec * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      performLogout();
      return;
    }
    logoutTimerRef.current = setTimeout(() => {
      performLogout();
    }, msUntilExpiry);
  };

  // On app mount: restore session from localStorage, validate token expiry
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const result = decodeAndValidateJwt(token);
      if (result) {
        setIsLoggedIn(true);
        setUser(result.user);
        scheduleAutoLogout(result.expiresAt);
      } else {
        // Token was expired or invalid — clean up silently
        localStorage.removeItem('auth_token');
      }
    }
    return () => clearLogoutTimer();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('auth_token', token);
    setIsLoggedIn(true);
    setUser(userData);
    // Schedule auto-logout based on the new token's expiry
    const result = decodeAndValidateJwt(token);
    if (result) {
      scheduleAutoLogout(result.expiresAt);
    }
  };

  const logout = performLogout;

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
