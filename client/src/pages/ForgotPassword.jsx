import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Send OTP -> 2: Verify OTP & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/forgot-password/send-otp', { email: email.trim() });
      setMessage(res.data?.message || 'Verification OTP sent to your email.');
      setStep(2);
    } catch (err) {
      // Fallback
      setMessage('Verification OTP sent to your email.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/auth/forgot-password/verify-otp', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-950">
          Reset Password
        </h1>
        <p className="text-xs text-neutral-500">
          {step === 1 ? 'Enter your registered email to receive a secure recovery code.' : 'Enter the OTP code received on your email.'}
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xs space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-neutral-950 text-white text-xs font-black hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Sending Code...' : 'Send Recovery OTP ➔'}</span>
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">Enter 6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs text-center font-mono font-bold tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-red-600 text-white text-xs font-black hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Resetting...' : 'Set New Password ➔'}</span>
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-neutral-900">Password Reset Complete!</h3>
            <p className="text-xs text-neutral-500">You can now sign in with your new password.</p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 rounded-2xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800"
            >
              Return to Login ➔
            </Link>
          </div>
        )}

        <div className="pt-2 text-center text-xs">
          <Link to="/login" className="font-bold text-neutral-600 hover:text-neutral-950 inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
