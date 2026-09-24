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
        const idToken = await result.user.getIdToken(true);
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

        if (errCode === 'auth/popup-closed-by-user' || lower.includes('popup-closed-by-user')) {
          setError('Google Sign-In popup was closed before completing. Please try again.');
        } else if (errCode === 'auth/popup-blocked' || lower.includes('popup-blocked')) {
          setError('Google Sign-In popup was blocked by browser. Please allow popups for this site and retry.');
        } else if (errCode === 'auth/unauthorized-domain' || lower.includes('unauthorized-domain') || lower.includes('authorized domain')) {
          const domain = typeof window !== 'undefined' ? window.location.hostname : 'your-domain';
          setError(`Domain "${domain}" is not authorized in Firebase. Please add "${domain}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
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

      setMessage('A 6-digit verification code has been sent to your email.');
      setForgotStep('otp');
      setResendCooldown(60);
    } catch (err) {
      setError(err?.message || 'Failed to send code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP & Set New Password
  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    if (forgotOtp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setError('Password must be at least 6 characters.');
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

      setMessage('Password updated successfully! You can now sign in.');
      setIsForgot(false);
      setForgotStep('email');
      setEmail(forgotEmail);
    } catch (err) {
      setError(err?.message || 'Reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080d21] text-slate-900 dark:text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl bg-white dark:bg-[#0f172a] rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Rich Figma-style Brand & Visual Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/sajilomarts-logo.png"
                alt="SajiloMarts Logo"
                className="h-11 w-auto object-contain rounded-xl shadow-md group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col justify-center">
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                  SajiloMarts
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase -mt-1">
                  Cross-Border Logistics
                </span>
              </div>
            </Link>

            <div className="pt-4 space-y-2">
              <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight leading-tight">
                Buy Any Indian Product.<br />
                <span className="text-amber-400">Delivered Across Nepal.</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your account to paste links from Amazon India, Flipkart, Myntra, and boAt with automated NPR conversion.
              </p>
            </div>
          </div>

          {/* Value props showcase cards */}
          <div className="relative z-10 my-8 space-y-3">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center text-lg font-bold">
                ⚡
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Instant Link Price Calculator</h4>
                <p className="text-[11px] text-slate-400">Exact landed price in NPR in seconds.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
                📦
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Customs & Duty Included</h4>
                <p className="text-[11px] text-slate-400">Zero surprise fees at your doorstep.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-indigo-400/20 text-indigo-400 flex items-center justify-center text-lg font-bold">
                📍
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Real-Time Transit Tracking</h4>
                <p className="text-[11px] text-slate-400">From Indian warehouse to Nepal hub.</p>
              </div>
            </div>
          </div>

          {/* Footer security tag */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              256-Bit SSL Secured
            </span>
            <span>Nepal Sourcing Hub</span>
          </div>
        </div>

        {/* Right Side: High-End Figma Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white dark:bg-[#0f172a]">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isForgot ? 'Reset your password' : 'Sign in to account'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                {isForgot
                  ? 'Enter your registered email to receive your OTP verification code.'
                  : 'Welcome back! Please enter your credentials to continue.'}
              </p>
            </div>

            {noticeMsg && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2.5">
                <span>🔒</span>
                <span>{decodeURIComponent(noticeMsg)}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2.5">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
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
                    className="w-full flex items-center justify-center gap-3.5 py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm hover:shadow-md"
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
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                  <span className="bg-white dark:bg-[#0f172a] px-3.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 absolute">
                    or with email
                  </span>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
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
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none bg-slate-50/70 dark:bg-slate-900/70 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition cursor-pointer"
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
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none bg-slate-50/70 dark:bg-slate-900/70 transition-all pr-12 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold cursor-pointer"
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
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Remember me</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.99]"
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In ➔'}
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Don&apos;t have an account?{' '}
                    <Link
                      to={`/signup${redirectUrl !== '/account' || noticeMsg ? `?redirect=${encodeURIComponent(redirectUrl)}${noticeMsg ? `&msg=${encodeURIComponent(noticeMsg)}` : ''}` : ''}`}
                      className="font-bold text-amber-600 dark:text-amber-400 hover:underline ml-1"
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
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Registered Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-none bg-slate-50/70 dark:bg-slate-900/70"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      {isSubmitting ? 'Sending Code...' : 'Send Verification Code ➔'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-center tracking-widest font-mono text-lg font-bold text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none bg-slate-50/70 dark:bg-slate-900/70"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none bg-slate-50/70 dark:bg-slate-900/70"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      {isSubmitting ? 'Verifying...' : 'Set New Password ➔'}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isSubmitting}
                        onClick={handleForgotSendOtp}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white font-semibold cursor-pointer disabled:opacity-50"
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
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
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
