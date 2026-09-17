import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const SESSION_STORAGE_KEY = 'sajilomarts_session';
const USER_STORAGE_KEY = 'sajilomarts_user';

export function normalizeUser(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const id = rawUser.id || rawUser._id || rawUser.userId || '';
  return {
    ...rawUser,
    id: String(id),
    _id: String(id),
    role: rawUser.role || 'customer'
  };
}

export function AuthProvider({ children }) {
  // Synchronously restore user from localStorage if a valid token exists
  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem(SESSION_STORAGE_KEY);
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedToken && savedToken !== 'null' && savedToken !== 'undefined' && savedUser) {
        const parsed = JSON.parse(savedUser);
        return normalizeUser(parsed);
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  // Track initialization status to prevent showing login before validation completes
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const savedToken = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!savedToken || savedToken === 'null' || savedToken === 'undefined') {
      setUser(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/api/auth/me');
      if (res.data?.user) {
        const normalized = normalizeUser(res.data.user);
        setUser(normalized);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
      } else {
        // Session invalid on server
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      }
    } catch (err) {
      console.warn('Auth session verification notice:', err?.message || err);
      // If 401 Unauthorized, session is definitely expired
      if (err.status === 401 || err.response?.status === 401) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      }
      // If network offline error, keep cached user so the page doesn't break
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const data = res.data || {};
    const normalized = normalizeUser(data.user);

    if (data.token) {
      localStorage.setItem(SESSION_STORAGE_KEY, data.token);
    }
    if (normalized) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
    }

    setUser(normalized);

    return {
      ...data,
      user: normalized,
      role: normalized?.role || data.role
    };
  };

  const signup = async (arg1, arg2, arg3, arg4) => {
    let payload = {};
    if (typeof arg1 === 'object' && arg1 !== null) {
      payload = {
        fullName: arg1.fullName,
        email: arg1.email,
        phone: arg1.phone,
        password: arg1.password
      };
    } else {
      payload = {
        fullName: arg1,
        email: arg2,
        phone: arg3,
        password: arg4
      };
    }

    const res = await api.post('/api/auth/signup', payload);
    const data = res.data || {};
    const normalized = normalizeUser(data.user);

    if (data.token) {
      localStorage.setItem(SESSION_STORAGE_KEY, data.token);
    }
    if (normalized) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
    }

    setUser(normalized);

    return {
      ...data,
      user: normalized,
      role: normalized?.role || data.role
    };
  };

  const loginWithFirebase = async ({ idToken, provider = 'google', fullName, email, phone }) => {
    const res = await api.post('/api/auth/firebase', { idToken, provider, fullName, email, phone });
    const data = res.data || {};
    const normalized = normalizeUser(data.user);

    if (data.token) {
      localStorage.setItem(SESSION_STORAGE_KEY, data.token);
    }
    if (normalized) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
    }

    setUser(normalized);

    return {
      ...data,
      user: normalized,
      role: normalized?.role || data.role
    };
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.warn('Logout API notice:', e?.message || e);
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        signup,
        loginWithFirebase,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
