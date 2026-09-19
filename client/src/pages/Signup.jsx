import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  firebaseAuth,
  googleProvider,
  appleProvider,
  isFirebaseEnabled,
  signInWithPopup
} from '../services/firebase';

export function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup, loginWithFirebase } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/account';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const urlError = searchParams.get('error');
  const noticeMsg = searchParams.get('msg');
  useEffect(() => {
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [urlError]);

  // Google OAuth Flow
  const handleGoogleSignup = async () => {
    if (isFirebaseEnabled && firebaseAuth && googleProvider) {
      setIsSubmitting(true);
      setError('');
      try {
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        const idToken = await result.user.getIdToken(true);
        await loginWithFirebase({
          idToken,
          provider: 'google',
          fullName: result.user.displayName,
          email: result.user.email,
          phone: result.user.phoneNumber
        });
        navigate(redirectUrl);
      } catch (err) {
        console.error('Google signup error:', err);
        const errMessage = err?.message || 'Google sign-up failed.';
        const lower = errMessage.toLowerCase();

        if (lower.includes('popup-closed-by-user') || lower.includes('popup-blocked')) {
          setError('Google Sign-In popup was closed or blocked. Please try again.');
          return;
        }

        setError(errMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError('Google Sign-In is temporarily initializing. Please sign up using email below.');
    }
  };

  // Apple OAuth Flow
  const handleAppleSignup = async () => {
    if (!appleProvider || !firebaseAuth) {
      setError('Apple Sign-Up is initializing. Please try again or use Google / Email.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const result = await signInWithPopup(firebaseAuth, appleProvider);
      const idToken = await result.user.getIdToken(true);
      await loginWithFirebase({
        idToken,
        provider: 'apple',
        fullName: result.user.displayName,
        email: result.user.email
      });
      navigate(redirectUrl);
    } catch (err) {
      console.error('Apple signup error:', err);
      const errMessage = err?.message || 'Apple sign-up failed.';
      if (!errMessage.toLowerCase().includes('popup-closed-by-user')) {
        setError(errMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Account Form Submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password.trim();

    if (!fullName || !email || !phone || !password) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }

    try {
      await signup(fullName, email, phone, password);
      navigate(redirectUrl);
    } catch (err) {
      const msg = err?.message || 'Failed to create account. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1437] text-slate-900 dark:text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-4xl bg-white dark:bg-[#111c44] rounded-3xl border border-slate-200 dark:border-[#1b2559] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Side: Brand & Benefits */}
        <div className="lg:col-span-5 bg-slate-900 dark:bg-[#0b1437] p-8 lg:p-12 text-white flex flex-col justify-between border-r border-transparent dark:border-[#1b2559]">
          <div className="space-y-4 text-center sm:text-left">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/sajilomarts-logo.png"
                alt="SajiloMarts Logo"
                className="h-10 w-auto object-contain rounded-lg shadow-sm"
              />
              <div className="flex flex-col justify-center">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                  SajiloMarts
                </span>
                <span className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase -mt-1">
                  Shop Easy • Live Better
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              Join Nepal&apos;s leading India-to-Nepal cross-border platform. Order products directly with doorstep delivery.
            </p>
          </div>

          <div className="my-8 space-y-3 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-base">✈️</span>
              <div>
                <h4 className="font-bold text-white">Direct Sourcing</h4>
                <p className="text-[11px] text-slate-400">Amazon India, Flipkart, Myntra &amp; boAt.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-base">🚚</span>
              <div>
                <h4 className="font-bold text-white">All 7 Provinces</h4>
                <p className="text-[11px] text-slate-400">Doorstep tracking across all Nepal cities.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>🔒 Secure 256-Bit SSL</span>
            <span>Nepal Sourcing</span>
          </div>
        </div>

        {/* Right Side: Clean White Signup Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-[#111c44]">
          <div className="max-w-md mx-auto w-full space-y-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Create an account
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                Sign up to start ordering from Indian stores with doorstep delivery in Nepal.
              </p>
            </div>

            {noticeMsg && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
                <span>🔒</span>
                <span>{decodeURIComponent(noticeMsg)}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white dark:bg-[#0b1437] border border-slate-300 dark:border-[#1b2559] hover:bg-slate-50 dark:hover:bg-[#1b254b] text-slate-800 dark:text-neutral-200 font-bold text-xs transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign Up with Google</span>
              </button>

              <button
                type="button"
                onClick={handleAppleSignup}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-black dark:bg-[#1b254b] hover:bg-slate-800 dark:hover:bg-[#253266] text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.6-7.85-11.75-14.44-6.3-9.98-11.2-21.2-14.7-33.68-3.5-12.48-5.25-24.16-5.25-35.03 0-14.44 3.73-26.4 11.2-35.87 7.47-9.48 16.73-14.33 27.78-14.56 5.17 0 10.74 1.34 16.71 4.02 5.97 2.68 9.77 4.09 11.4 4.23 2.12-.34 6.13-1.84 12.03-4.5 5.9-2.65 11.19-3.79 15.86-3.41 11.83.67 21.4 5.2 28.71 13.6-10.42 6.3-15.53 14.93-15.34 25.88.2 8.65 3.44 15.88 9.72 21.69 6.28 5.8 13.78 9.07 22.5 9.79-2.24 6.7-4.8 13.2-7.66 19.51zm-32.9-106.6c0-6.17 2.17-12.05 6.51-17.65 4.34-5.6 9.87-9.4 16.59-11.4.67 2.47 1.01 4.83 1.01 7.08 0 6.06-2.28 12.03-6.84 17.91-4.56 5.88-10.32 9.4-17.27 10.56z" />
                </svg>
                <span>Sign Up with Apple</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 dark:border-[#1b2559] w-full" />
              <span className="bg-white dark:bg-[#111c44] px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 absolute">
                Or email
              </span>
            </div>

            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-200 mb-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Pratik Sharma"
                  className="w-full rounded-xl border border-slate-300 dark:border-[#1b2559] p-3 text-xs font-medium text-slate-900 dark:text-white focus:border-black dark:focus:border-amber-400 focus:outline-none bg-slate-50/50 dark:bg-[#0b1437]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-200 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-300 dark:border-[#1b2559] p-3 text-xs font-medium text-slate-900 dark:text-white focus:border-black dark:focus:border-amber-400 focus:outline-none bg-slate-50/50 dark:bg-[#0b1437]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-200 mb-1">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 dark:border-[#1b2559] p-3 text-xs font-medium text-slate-900 dark:text-white focus:border-black dark:focus:border-amber-400 focus:outline-none bg-slate-50/50 dark:bg-[#0b1437]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 dark:border-[#1b2559] p-3 text-xs font-medium text-slate-900 dark:text-white focus:border-black dark:focus:border-amber-400 focus:outline-none bg-slate-50/50 dark:bg-[#0b1437] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 dark:text-neutral-400 hover:text-black dark:hover:text-white text-xs font-bold cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 dark:bg-amber-400 hover:bg-slate-800 dark:hover:bg-amber-300 text-white dark:text-neutral-950 font-black text-xs transition cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account ➔'}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Already have an account?{' '}
                  <Link
                    to={`/login${redirectUrl !== '/account' || noticeMsg ? `?redirect=${encodeURIComponent(redirectUrl)}${noticeMsg ? `&msg=${encodeURIComponent(noticeMsg)}` : ''}` : ''}`}
                    className="font-bold text-slate-900 dark:text-amber-400 hover:underline ml-1"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
