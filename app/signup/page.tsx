"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithPopup } from "firebase/auth";
import {
  firebaseAuth,
  googleProvider,
  appleProvider,
  isFirebaseEnabled
} from "@/lib/firebase/client";
import { useToast } from "@/components/providers/toast-provider";
import { LinkovaBrandLogo } from "@/components/ui/linkova-brand-logo";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { pushToast } = useToast();

  const redirectUrl = searchParams.get("redirect") || "/account";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const urlError = searchParams.get("error");
  useEffect(() => {
    if (urlError) {
      setError(decodeURIComponent(urlError));
      pushToast(decodeURIComponent(urlError), "error");
    }
  }, [urlError, pushToast]);

  // 1. Google OAuth Flow
  const handleGoogleSignup = async () => {
    if (isFirebaseEnabled && firebaseAuth && googleProvider) {
      setIsSubmitting(true);
      setError("");
      try {
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        const idToken = await result.user.getIdToken(true);
        const response = await fetch("/api/auth/firebase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ idToken, provider: "google" })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Google sign-up failed (${response.status}).`);
        }

        pushToast("Welcome to LINKOVA! Account created with Google.", "success");
        router.push(redirectUrl);
        return;
      } catch (err: unknown) {
        console.error(err);
        const errMessage = err instanceof Error ? err.message : "Google sign-up failed.";
        const lower = errMessage.toLowerCase();
        const isPopupCancelled =
          lower.includes("popup-closed-by-user") ||
          lower.includes("popup-blocked") ||
          lower.includes("auth/popup");

        if (isPopupCancelled) {
          pushToast("Opening Google Sign-In...", "info");
          window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
          return;
        }

        setError(errMessage);
        pushToast("Google sign-up failed. Redirecting...", "error");
        window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    // Direct OAuth endpoint fallback
    window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // 2. Apple OAuth Flow
  const handleAppleSignup = async () => {
    if (!appleProvider || !firebaseAuth) {
      setError("Apple Sign-Up is currently initializing. Please try again or use Google / Email.");
      pushToast("Apple Sign-Up is unavailable.", "error");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const result = await signInWithPopup(firebaseAuth, appleProvider);
      const idToken = await result.user.getIdToken(true);
      const response = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ idToken, provider: "apple" })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Apple sign-up failed (${response.status}).`);
      }

      pushToast("Welcome to LINKOVA! Account created with Apple.", "success");
      router.push(redirectUrl);
    } catch (err: unknown) {
      console.error("Apple signup error:", err);
      const errMessage = err instanceof Error ? err.message : "Apple sign-up failed.";
      if (!errMessage.toLowerCase().includes("popup-closed-by-user")) {
        setError(errMessage);
        pushToast(errMessage, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Email & Password Signup
  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create account.");
      }

      pushToast("Account created successfully! Welcome to LINKOVA.", "success");
      router.push(redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg);
      pushToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      {/* Background Ambience Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 -z-10 h-72 w-72 rounded-full bg-blue-600/10 blur-[100px]" />

      <div className="mx-auto max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <LinkovaBrandLogo size="md" showTagline={true} />
          </Link>
          <h1 className="mt-6 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Create an account
          </h1>
          <p className="mt-2 text-xs text-slate-400">
            Sign up to buy from Amazon, Flipkart, Myntra &amp; more with doorstep delivery in Nepal.
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-red-800/80 bg-red-950/40 p-4 text-xs font-semibold text-red-200 animate-fadeIn">
              <span className="shrink-0 text-base">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Social Auth Buttons (Google & Apple) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-xs font-bold text-slate-100 shadow-xs transition hover:border-slate-600 hover:bg-slate-700 disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>

            <button
              type="button"
              onClick={handleAppleSignup}
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-black/90 px-4 py-3 text-xs font-bold text-white shadow-xs transition hover:border-slate-500 hover:bg-black disabled:opacity-50"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.6-7.85-11.75-14.44-6.3-9.98-11.2-21.2-14.7-33.68-3.5-12.48-5.25-24.16-5.25-35.03 0-14.44 3.73-26.4 11.2-35.87 7.47-9.48 16.73-14.33 27.78-14.56 5.17 0 10.74 1.34 16.71 4.02 5.97 2.68 9.77 4.09 11.4 4.23 2.12-.34 6.13-1.84 12.03-4.5 5.9-2.65 11.19-3.79 15.86-3.41 11.83.67 21.4 5.2 28.71 13.6-10.42 6.3-15.53 14.93-15.34 25.88.2 8.65 3.44 15.88 9.72 21.69 6.28 5.8 13.78 9.07 22.5 9.79-2.24 6.7-4.8 13.2-7.66 19.51zm-32.9-106.6c0-6.17 2.17-12.05 6.51-17.65 4.34-5.6 9.87-9.4 16.59-11.4.67 2.47 1.01 4.83 1.01 7.08 0 6.06-2.28 12.03-6.84 17.91-4.56 5.88-10.32 9.4-17.27 10.56z" />
              </svg>
              <span>Sign up with Apple</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-3 font-bold tracking-wider text-slate-500">
                Or sign up with email
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Pratik Sharma"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account →</span>
              )}
            </button>
          </form>

          {/* Footer Sign In Link */}
          <div className="mt-8 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
              className="font-bold text-cyan-400 hover:text-cyan-300 transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
