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
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/forgot-password/send-otp', { email: email.trim() });
      if (!res.data?.success) {
        throw new Error(res.data?.error || 'Failed to send verification code.');
      }
      setMessage(res.data?.message || 'Verification OTP code sent to your email.');
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to send OTP code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/forgot-password/verify-otp', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });
      if (!res.data?.success) {
        throw new Error(res.data?.error || 'Password reset failed.');
      }
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white">
          Reset Password
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {step === 1 ? 'Enter your registered email to receive a secure recovery code.' : 'Enter the OTP code received on your email.'}
        </p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] p-6 sm:p-8 shadow-2xs space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-black hover:bg-neutral-800 dark:hover:bg-amber-300 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Sending Code...' : 'Send Recovery OTP ➔'}</span>
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Enter 6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white text-xs text-center font-mono font-bold tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-amber-400 text-neutral-950 text-xs font-black hover:bg-amber-300 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Resetting...' : 'Set New Password ➔'}</span>
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                  setMessage('');
                }}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-semibold cursor-pointer"
              >
                ← Change email
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleSendOtp}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Password Reset Complete!</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">You can now sign in with your new password.</p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-amber-300"
            >
              Return to Login ➔
            </Link>
          </div>
        )}

        <div className="pt-2 text-center text-xs">
          <Link to="/login" className="font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white inline-flex items-center gap-1 transition">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
