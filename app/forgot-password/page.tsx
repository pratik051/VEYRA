"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { pushToast } = useToast();

  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        pushToast("Verification code sent to your email!", "success");
        setStep("otp");
        setResendCooldown(60);
        setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
      } else {
        setErrorMessage(data.error || "Failed to send verification code.");
        pushToast(data.error || "Failed to send code.", "error");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      pushToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast("New verification code sent!", "success");
        setResendCooldown(60);
        setOtp(["", "", "", "", "", ""]);
        otpInputsRef.current[0]?.focus();
      } else {
        setErrorMessage(data.error || "Failed to resend code.");
        pushToast(data.error || "Failed to resend code.", "error");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    if (cleaned.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = cleaned;
      setOtp(newOtp);
      if (index < 5) {
        otpInputsRef.current[index + 1]?.focus();
      }
    } else if (cleaned.length > 1) {
      // Pasted full OTP code
      const digits = cleaned.slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const fullOtp = otp.join("").trim();
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: fullOtp,
          newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage("Password reset successful!");
        pushToast("Password reset successfully! Please log in.", "success");
        setStep("success");
      } else {
        setErrorMessage(data.error || "Failed to reset password.");
        pushToast(data.error || "Verification failed.", "error");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      pushToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              L
            </div>
            <span className="font-display font-black text-2xl tracking-wider text-white">
              SAJILOMARTS
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-white">
            {step === "email" && "Reset your password"}
            {step === "otp" && "Enter verification code"}
            {step === "success" && "Password reset complete"}
          </h1>
          <p className="mt-1.5 text-xs text-slate-400">
            {step === "email" && "Enter your registered email address to receive a 6-digit one-time passcode."}
            {step === "otp" && `We sent a 6-digit code to ${email}`}
            {step === "success" && "Your password has been updated. You can now sign in."}
          </p>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Error Alert */}
          {errorMessage && (
            <div className="rounded-xl bg-red-950/50 border border-red-800/60 p-3.5 text-xs text-red-200 flex items-start gap-2.5 animate-fadeIn">
              <span className="text-red-400 font-bold shrink-0">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="rounded-xl bg-emerald-950/50 border border-emerald-800/60 p-3.5 text-xs text-emerald-200 flex items-start gap-2.5 animate-fadeIn">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* ── STEP 1: Enter Email ── */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                  className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send Verification Code →</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* ── STEP 2: Enter OTP & New Password ── */}
          {step === "otp" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* 6-Digit OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setErrorMessage("");
                    }}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Change Email
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl rounded-xl bg-slate-950/80 border border-slate-700/80 text-cyan-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-2.5 text-xs text-slate-400">
                  <span>Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="font-bold text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 disabled:cursor-not-allowed transition"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  minLength={6}
                  className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6 || !newPassword || !confirmPassword}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 text-sm shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Set New Password &amp; Finish →</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
                >
                  ← Cancel &amp; Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* ── STEP 3: Success Screen ── */}
          {step === "success" && (
            <div className="text-center space-y-5 py-4">
              <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-500/30">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Password Reset Successfully!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You can now log in to your SAJILOMARTS account using your new credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                Proceed to Login →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
