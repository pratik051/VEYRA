import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  firebaseAuth,
  googleProvider,
  isFirebaseEnabled,
  signInWithPopup
} from '../services/firebase';

export function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loginWithFirebase, user, loading } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/account';

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
      }
    }
  }, [user, loading, navigate, redirectUrl]);

  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const urlError = searchParams.get('error');
  const noticeMsg = searchParams.get('msg');
  useEffect(() => {
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [urlError]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Google OAuth Flow
  const handleGoogleLogin = async () => {
    if (isFirebaseEnabled && firebaseAuth && googleProvider) {
      setIsSubmitting(true);
      setError('');
      try {
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        const idToken = await result.user.getIdToken();
        const res = await loginWithFirebase({
          idToken,
          provider: 'google',
          fullName: result.user.displayName,
          email: result.user.email,
          phone: result.user.phoneNumber
        });

        if (res?.user?.role === 'admin' || res?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(redirectUrl);
        }
      } catch (err) {
        console.error('Google login error:', err);
        const errCode = err?.code || '';
        const errMessage = err?.message || 'Google sign-in failed.';
        const lower = errMessage.toLowerCase();

        if (errCode === 'auth/popup-closed-by-user' || lower.includes('popup-closed-by-user') || errCode === 'auth/cancelled-popup-request') {
          setError('Google Sign-In popup was closed before completing. Please try again.');
        } else if (errCode === 'auth/popup-blocked' || lower.includes('popup-blocked')) {
          setError('Google Sign-In popup was blocked by browser. Please allow popups for this site and retry.');
        } else if (errCode === 'auth/unauthorized-domain' || lower.includes('unauthorized-domain') || lower.includes('authorized domain')) {
          const domain = typeof window !== 'undefined' ? window.location.hostname : 'your-domain';
          setError(`Domain "${domain}" is not authorized in Firebase. Please add "${domain}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
        } else if (errCode === 'auth/network-request-failed' || lower.includes('network-request-failed') || lower.includes('err_connection_closed')) {
          setError('Unable to connect to Google authentication. Please check your internet connection and try again.');
        } else {
          setError(errMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError('Google Sign-In is temporarily initializing. Please use your email and password below.');
    }
  };

  // Email & Password Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await login(email.trim(), password);
      if (res?.user?.role === 'admin' || res?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send OTP Email for Forgot Password
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!forgotEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/api/auth/forgot-password/send-otp', {
        email: forgotEmail.trim()
      });
      const data = res.data;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send verification code.');
      }

      setMessage(data?.message || 'A 6-digit verification code has been sent to your email.');
      setForgotStep('otp');
      setResendCooldown(60);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to send OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP and Reset Password
  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/api/auth/forgot-password/verify-otp', {
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword
      });
      const data = res.data;

      if (!data?.success) {
        throw new Error(data?.error || 'Password reset failed.');
      }

      setMessage(data?.message || 'Password updated successfully! You can now sign in.');
      setIsForgot(false);
      setForgotStep('email');
      setEmail(forgotEmail);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#fffbeb]/40 text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased relative">
      {/* Background ambient glowing light orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-white/90 via-amber-200/30 to-white/60 rounded-full blur-3xl opacity-80" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-tr from-white/90 via-indigo-100/30 to-amber-100/30 rounded-full blur-3xl opacity-80" />
        <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-white/80 rounded-full blur-3xl opacity-90" />
      </div>

      {/* Main Glassmorphic Shady White Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white/90 backdrop-blur-2xl rounded-[32px] border border-white shadow-[0_20px_70px_rgba(0,0,0,0.06),0_0_50px_rgba(255,255,255,0.95),0_0_0_1px_rgba(226,232,240,0.85)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side (Desktop) / Bottom (Mobile): Shady White / Frosted Pearl Showcase */}
        <div className="order-2 lg:order-1 lg:col-span-5 bg-gradient-to-br from-slate-50/95 via-amber-50/25 to-slate-100/90 p-8 lg:p-12 text-slate-900 flex flex-col justify-between relative overflow-hidden border-t lg:border-t-0 lg:border-r border-slate-200/80">
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/sajilomarts-logo.png"
                alt="SajiloMarts Logo"
                className="h-11 w-auto object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col justify-center">
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-amber-700 to-amber-600 bg-clip-text text-transparent">
                  SajiloMarts
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase -mt-1">
                  Cross-Border Logistics
                </span>
              </div>
            </Link>

            <div className="pt-3 space-y-2">
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Buy Any Indian Product.<br />
                <span className="text-amber-600">Delivered Across Nepal.</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Connect your account to paste links from Amazon India, Flipkart, Myntra, and boAt with automated NPR conversion.
              </p>
            </div>
          </div>

          {/* Value props showcase cards */}
          <div className="relative z-10 my-8 space-y-3">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-amber-200/70 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-amber-100/90 text-amber-700 flex items-center justify-center text-lg font-bold shadow-xs">
                ⚡
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">Instant Link Price Calculator</h4>
                <p className="text-[11px] text-slate-500 font-medium">Exact landed price in NPR in seconds.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-200/70 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center text-lg font-bold shadow-xs">
                📦
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">Customs &amp; Duty Included</h4>
                <p className="text-[11px] text-slate-500 font-medium">Zero surprise fees at your doorstep.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-indigo-200/70 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-indigo-100/90 text-indigo-700 flex items-center justify-center text-lg font-bold shadow-xs">
                📍
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">Real-Time Transit Tracking</h4>
                <p className="text-[11px] text-slate-500 font-medium">From Indian warehouse to Nepal hub.</p>
              </div>
            </div>
          </div>

          {/* Footer security tag */}
          <div className="relative z-10 pt-4 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              256-Bit SSL Secured
            </span>
            <span>Nepal Sourcing Hub</span>
          </div>
        </div>

        {/* Right Side (Desktop) / Top (Mobile): Glowing Shady White Auth Form */}
        <div className="order-1 lg:order-2 lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white/95 backdrop-blur-xl">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isForgot ? 'Reset your password' : 'Sign in to account'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
                {isForgot
                  ? 'Enter your registered email to receive your OTP verification code.'
                  : 'Welcome back! Please enter your credentials to continue.'}
              </p>
            </div>

            {noticeMsg && (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
                <span>🔒</span>
                <span>{decodeURIComponent(noticeMsg)}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200/90 text-red-700 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
                <span>✓</span>
                <span>{message}</span>
              </div>
            )}

            {!isForgot ? (
              <>
                {/* One-Click Google OAuth */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3.5 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50/90 border border-slate-200/90 text-slate-800 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-xs hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-slate-300"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-1">
                  <div className="border-t border-slate-200/90 w-full" />
                  <span className="bg-white px-3.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 absolute">
                    or with email
                  </span>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 focus:outline-none transition-all placeholder:text-slate-400 shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgot(true);
                          setForgotEmail(email);
                          setError('');
                          setMessage('');
                        }}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 transition cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 focus:outline-none transition-all pr-12 placeholder:text-slate-400 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-800 text-xs font-bold cursor-pointer"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 font-semibold">Remember me</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-[0_4px_16px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_22px_rgba(245,158,11,0.45)] active:scale-[0.99]"
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In ➔'}
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    Don&apos;t have an account?{' '}
                    <Link
                      to={`/signup${redirectUrl !== '/account' || noticeMsg ? `?redirect=${encodeURIComponent(redirectUrl)}${noticeMsg ? `&msg=${encodeURIComponent(noticeMsg)}` : ''}` : ''}`}
                      className="font-bold text-amber-600 hover:text-amber-700 hover:underline ml-1"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              /* Forgot Password Flow */
              <div className="space-y-4">
                {forgotStep === 'email' ? (
                  <form onSubmit={handleForgotSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Registered Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      {isSubmitting ? 'Sending Code...' : 'Send Verification Code ➔'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-center tracking-widest font-mono text-lg font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      {isSubmitting ? 'Verifying...' : 'Set New Password ➔'}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isSubmitting}
                        onClick={handleForgotSendOtp}
                        className="text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgot(false);
                      setError('');
                      setMessage('');
                    }}
                    className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
