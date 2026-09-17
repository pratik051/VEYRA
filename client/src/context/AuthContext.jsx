import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data?.user || null);
    } catch (err) {
      console.error('Auth check error:', err?.message || err);
      setUser(null);
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
    if (data.token) {
      localStorage.setItem('sajilomarts_session', data.token);
    }
    setUser(data.user || null);
    // Return unified object with both data.role and data.user.role for full backward compatibility
    return {
      ...data,
      role: data.user?.role || data.role
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
    if (data.token) {
      localStorage.setItem('sajilomarts_session', data.token);
    }
    setUser(data.user || null);
    return {
      ...data,
      role: data.user?.role || data.role
    };
  };

  const loginWithFirebase = async ({ idToken, provider = 'google', fullName, email, phone }) => {
    const res = await api.post('/api/auth/firebase', { idToken, provider, fullName, email, phone });
    const data = res.data || {};
    if (data.token) {
      localStorage.setItem('sajilomarts_session', data.token);
    }
    setUser(data.user || null);
    return {
      ...data,
      role: data.user?.role || data.role
    };
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.warn('Logout API notice:', e?.message || e);
    }
    localStorage.removeItem('sajilomarts_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, loginWithFirebase, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
