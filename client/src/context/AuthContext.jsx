import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('sajilomarts_session');
      const headers = { 'Content-Type': 'application/json' };
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers,
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Login failed.');
    if (data.token) {
      localStorage.setItem('sajilomarts_session', data.token);
    }
    setUser(data.user);
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

    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Signup failed.');
    if (data.token) {
      localStorage.setItem('sajilomarts_session', data.token);
    }
    setUser(data.user);
    return {
      ...data,
      role: data.user?.role || data.role
    };
  };

  const loginWithFirebase = async ({ idToken, provider = 'google', fullName, email, phone }) => {
    const res = await fetch(`${API_URL}/api/auth/firebase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ idToken, provider, fullName, email, phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || `${provider} authentication failed.`);
    if (data.token) {
      localStorage.setItem('sajilomarts_session', data.token);
    }
    setUser(data.user);
    return {
      ...data,
      role: data.user?.role || data.role
    };
  };

  const logout = async () => {
    const token = localStorage.getItem('sajilomarts_session');
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });
    } catch (e) {
      console.error(e);
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
