import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email.trim(), password);
      // Check both res?.user?.role and res?.role
      const userRole = res?.user?.role || res?.role;
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        setError('Access denied. Administrator privileges required.');
      }
    } catch (err) {
      setError(err?.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-neutral-900 text-amber-400 mb-2 shadow-md">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white">Admin Control Panel</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Authorized staff and master administrator access portal.
        </p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] p-6 sm:p-8 shadow-2xs space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sajilomarts.com"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Master Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-black hover:bg-neutral-800 dark:hover:bg-amber-300 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Verifying...' : 'Access Admin Panel'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
