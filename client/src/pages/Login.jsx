import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white">Sign In</h1>
        <p className="text-xs text-neutral-400">Access your SajiloMarts account & orders</p>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-300 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs hover:bg-amber-400 transition"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="text-center text-xs text-neutral-400 pt-2">
          Don't have an account? <Link to="/signup" className="text-amber-400 font-bold">Register here</Link>
        </div>
      </form>
    </div>
  );
}
