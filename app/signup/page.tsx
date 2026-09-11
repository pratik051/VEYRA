"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithPopup } from "firebase/auth";
import { firebaseAuth, googleProvider, isFirebaseEnabled } from "@/lib/firebase/client";
import { useToast } from "@/components/providers/toast-provider";
import { LinkovaBrandLogo } from "@/components/ui/linkova-brand-logo";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { pushToast } = useToast();

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const urlError = searchParams.get("error");
  useEffect(() => {
    if (urlError) {
      setError(decodeURIComponent(urlError));
      pushToast(decodeURIComponent(urlError), "error");
    }
  }, [urlError, pushToast]);

  // Google OAuth Flow
  const handleGoogleLogin = async () => {
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
          body: JSON.stringify({ idToken })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Google sign-in failed (${response.status}).`);
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
        pushToast("Google sign-in failed. Redirecting...", "error");
        window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
    }
  };

  // Create Account Form Submission
  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const password = String(formData.get("password") || "").trim();

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ fullName, email, phone, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create account.");
      }

      pushToast("Account created successfully! Welcome to LINKOVA.", "success");
      router.push(redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(msg);
      pushToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* ─── AMBIENT ELECTRIC BLUE GLOWS ─── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0057FF]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00D2FF]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* ─── SPLIT SCREEN CONTAINER ─── */}
      <div className="w-full max-w-5xl bg-[#0B0F19]/90 backdrop-blur-2xl rounded-3xl border border-slate-800/80 shadow-2xl shadow-blue-950/40 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px] relative z-10">
        
        {/* ─── LEFT COLUMN: OFFICIAL BRAND ARTWORK & VALUE PROPS ─── */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-[#0A192F] p-8 lg:p-12 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Hero */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-3">
            <Link href="/" className="hover:scale-105 transition-transform duration-300">
              <LinkovaBrandLogo size="lg" theme="dark" showTagline={true} showFlags={true} />
            </Link>
          </div>

          {/* Highlights */}
          <div className="relative z-10 my-8 space-y-3">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-base flex-shrink-0">
                ✨
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Instant Account Activation</h4>
                <p className="text-[11px] text-slate-400">Save delivery addresses and start ordering right away.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-base flex-shrink-0">
                🛡️
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Buyer Protection Guarantee</h4>
                <p className="text-[11px] text-slate-400">100% verified genuine Indian products delivered.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-base flex-shrink-0">
                🚚
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Doorstep Delivery Across Nepal</h4>
                <p className="text-[11px] text-slate-400">Serving Kathmandu valley &amp; all 7 provinces.</p>
              </div>
            </div>
          </div>

          {/* Bottom Trust */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <span>★ 4.9</span>
              <span className="text-slate-400 font-normal ml-1">10,000+ Nepal Shoppers</span>
            </span>
            <span className="text-slate-400 font-mono text-[10px]">100% Genuine</span>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: FIGMA REGISTRATION FORM ─── */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-[#0D121F]/95 relative">
          
          <div className="max-w-md mx-auto w-full space-y-5">
            
            {/* Form Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-cyan-400 mb-2">
                <span>🇮🇳 Create Free Account</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Join LINKOVA
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your details to set up your Nepal customer profile.
              </p>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <span>✓</span>
                <span>{message}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition hover:border-slate-600 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign Up with Google</span>
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span className="bg-[#0D121F] px-3">or register with email</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 text-sm">
                    👤
                  </span>
                  <input
                    name="fullName"
                    required
                    placeholder="e.g. Pratik Sharma"
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/60 pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 text-sm">
                    ✉️
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/60 pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phone Number (Nepal)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 text-sm">
                    📱
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/60 pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password (Min. 8 characters)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 text-sm">
                    🔒
                  </span>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/60 pl-10 pr-10 py-3 text-xs font-semibold text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                By creating an account, you agree to LINKOVA&apos;s{" "}
                <Link href="/terms-and-conditions" className="text-cyan-400 font-bold underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="text-cyan-400 font-bold underline">
                  Privacy Policy
                </Link>
                .
              </div>

              {/* Primary Gradient Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0057FF] via-[#0085FF] to-[#00A3FF] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Free Account ➔</span>
                )}
              </button>

              <div className="pt-3 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Already have an account?{" "}
                  <Link
                    href={`/login${redirectUrl !== "/account" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                    className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline ml-1"
                  >
                    Sign In here
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#07090E]">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#00A3FF] border-t-transparent" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
