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
import { SajiloMartsBrandLogo } from "@/components/ui/sajilomarts-brand-logo";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { pushToast } = useToast();

  const redirectUrl = searchParams.get("redirect") || "/account";

  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // 1. Google OAuth Flow
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
          body: JSON.stringify({ idToken, provider: "google" })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Google sign-in failed (${response.status}).`);
        }

        pushToast("Welcome back! Signed in with Google.", "success");
        router.push(redirectUrl);
        return;
      } catch (err: unknown) {
        console.error(err);
        const errMessage = err instanceof Error ? err.message : "Google sign-in failed.";
        const lower = errMessage.toLowerCase();
        const isUnauthorizedDomain = lower.includes("unauthorized-domain");
        if (isUnauthorizedDomain) {
          pushToast("Opening Google Sign-In...", "info");
          window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
          return;
        }

        const isPopupCancelled =
          lower.includes("popup-closed-by-user") ||
          lower.includes("popup-blocked") ||
          lower.includes("auth/popup");

        if (isPopupCancelled) {
          pushToast("Google Sign-In popup was closed or blocked. Please enable popups or sign in with your email.", "info");
          return;
        }

        setError(errMessage);
        pushToast(errMessage, "error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      pushToast("Opening Google Sign-In...", "info");
      window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
    }
  };

  // 2. Apple OAuth Flow
  const handleAppleLogin = async () => {
    if (!appleProvider || !firebaseAuth) {
      setError("Apple Sign-In is initializing. Please try again or use Google / Password.");
      pushToast("Apple Sign-In unavailable.", "error");
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
        throw new Error(data.error || `Apple sign-in failed (${response.status}).`);
      }

      pushToast("Welcome back! Signed in with Apple.", "success");
      router.push(redirectUrl);
    } catch (err: unknown) {
      console.error("Apple login error:", err);
      const errMessage = err instanceof Error ? err.message : "Apple sign-in failed.";
      if (!errMessage.toLowerCase().includes("popup-closed-by-user")) {
        setError(errMessage);
        pushToast(errMessage, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Email & Password Sign In
  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      pushToast(`Welcome back, ${data.user?.fullName || "Customer"}!`, "success");
      router.push(redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please check your email and password.";
      setError(msg);
      pushToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Send OTP Email for Forgot Password
  const handleForgotSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send verification code.");
      }

      setMessage("A 6-digit verification code has been sent to your email.");
      pushToast("Verification code sent to your email!", "success");
      setForgotStep("otp");
      setResendCooldown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send code.";
      setError(msg);
      pushToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Verify OTP & Set New Password
  const handleForgotVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (forgotOtp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    if (forgotNewPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Password reset failed.");
      }

      setMessage("Password updated successfully! You can now sign in.");
      pushToast("Password reset successfully! Please sign in.", "success");
      setIsForgot(false);
      setForgotStep("email");
      setEmail(forgotEmail);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reset failed.";
      setError(msg);
      pushToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Side: Brand & Benefits */}
        <div className="lg:col-span-5 bg-slate-900 p-8 lg:p-12 text-white flex flex-col justify-between">
          <div className="space-y-4 text-center sm:text-left">
            <Link href="/" className="inline-block">
              <SajiloMartsBrandLogo size="lg" theme="dark" showTagline={true} showFlags={true} />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              Nepal&apos;s primary India-to-Nepal cross-border sourcing platform. Track orders &amp; get direct landed pricing.
            </p>
          </div>

          <div className="my-8 space-y-3 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-base">✈️</span>
              <div>
                <h4 className="font-bold text-white">Direct Marketplace Access</h4>
                <p className="text-[11px] text-slate-400">Amazon India, Flipkart, Myntra &amp; boAt.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-base">🧾</span>
              <div>
                <h4 className="font-bold text-white">Transparent NPR Pricing</h4>
                <p className="text-[11px] text-slate-400">Custom clearance &amp; flat delivery included.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>🔒 Secure 256-Bit SSL</span>
            <span>Nepal Fulfillment</span>
          </div>
        </div>

        {/* Right Side: Clean White Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {isForgot ? "Reset Password" : "Welcome back"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isForgot
                  ? "Enter your email to receive a 6-digit verification code."
                  : "Sign in to access your orders, track shipments & manage account."}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <span>✓</span>
                <span>{message}</span>
              </div>
            )}

            {!isForgot ? (
              <>
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAppleLogin}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-black hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.6-7.85-11.75-14.44-6.3-9.98-11.2-21.2-14.7-33.68-3.5-12.48-5.25-24.16-5.25-35.03 0-14.44 3.73-26.4 11.2-35.87 7.47-9.48 16.73-14.33 27.78-14.56 5.17 0 10.74 1.34 16.71 4.02 5.97 2.68 9.77 4.09 11.4 4.23 2.12-.34 6.13-1.84 12.03-4.5 5.9-2.65 11.19-3.79 15.86-3.41 11.83.67 21.4 5.2 28.71 13.6-10.42 6.3-15.53 14.93-15.34 25.88.2 8.65 3.44 15.88 9.72 21.69 6.28 5.8 13.78 9.07 22.5 9.79-2.24 6.7-4.8 13.2-7.66 19.51zm-32.9-106.6c0-6.17 2.17-12.05 6.51-17.65 4.34-5.6 9.87-9.4 16.59-11.4.67 2.47 1.01 4.83 1.01 7.08 0 6.06-2.28 12.03-6.84 17.91-4.56 5.88-10.32 9.4-17.27 10.56z" />
                    </svg>
                    <span>Continue with Apple</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center py-1">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 absolute">
                    Or email
                  </span>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 focus:border-black focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgot(true);
                          setForgotStep("email");
                          setForgotEmail(email);
                          setError("");
                          setMessage("");
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 focus:border-black focus:outline-none bg-slate-50/50 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-black text-xs font-bold cursor-pointer"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Signing In..." : "Sign In ➔"}
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-500">
                      Don&apos;t have an account?{" "}
                      <Link
                        href={`/signup${redirectUrl !== "/account" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                        className="font-bold text-slate-900 hover:underline ml-1"
                      >
                        Create account
                      </Link>
                    </p>
                  </div>
                </form>
              </>
            ) : (
              <div className="space-y-4">
                {forgotStep === "email" ? (
                  <form onSubmit={handleForgotSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Registered Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 focus:border-black focus:outline-none bg-slate-50/50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !forgotEmail.trim()}
                      className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Sending Code..." : "Send Verification Code ➔"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          6-Digit Code
                        </label>
                        <button
                          type="button"
                          onClick={() => setForgotStep("email")}
                          className="text-[11px] text-blue-600 hover:underline"
                        >
                          Change email
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 504123"
                        className="w-full rounded-xl border border-slate-300 p-3 text-center font-mono text-base font-bold text-slate-900 focus:border-black focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-900 focus:border-black focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || forgotOtp.trim().length !== 6 || !forgotNewPassword}
                      className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Updating..." : "Update Password & Sign In"}
                    </button>
                  </form>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgot(false);
                      setForgotStep("email");
                      setError("");
                      setMessage("");
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-black hover:underline cursor-pointer"
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#04060A]">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
