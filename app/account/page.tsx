"use client";

import { FormEvent, useEffect, useState } from "react";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/ui/product-card";

const tabs = ["Login/Register", "Profile", "Orders", "Wishlist", "Product Requests"] as const;

export default function AccountPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Login/Register");
  const [user, setUser] = useState<{ id: string; fullName: string; email: string; role: string } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const { ids } = useWishlist();
  const wished = products.filter((p) => ids.includes(p.id));

  useEffect(() => {
    const loadMe = async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) return;
      const data = await response.json();
      setUser(data.user || null);
    };
    void loadMe();
  }, []);

  const register = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      password: String(form.get("password") || "")
    };
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to register.");
      return;
    }
    setUser(data.user);
    setMessage("Account created and logged in.");
    e.currentTarget.reset();
  };

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || "")
    };
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to login.");
      return;
    }
    setUser(data.user);
    setMessage("Login successful.");
    e.currentTarget.reset();
  };

  const logout = async () => {
    setError("");
    setMessage("");
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      setError("Logout failed.");
      return;
    }
    setUser(null);
    setMessage("Logged out.");
  };

  const requestReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const response = await fetch("/api/auth/reset-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(form.get("resetEmail") || "") })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to request reset.");
      return;
    }
    setResetToken(data.resetToken || "");
    setMessage(data.message);
  };

  const resetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: String(form.get("token") || ""),
        newPassword: String(form.get("newPassword") || "")
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to reset password.");
      return;
    }
    setMessage(data.message);
    e.currentTarget.reset();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Account</h1>
      <div className="mt-2 flex items-center gap-3 text-sm">
        <p>{user ? `Logged in as ${user.fullName} (${user.role})` : "Not logged in"}</p>
        {user ? (
          <button onClick={logout} className="rounded-lg border border-neutral-300 px-3 py-1">
            Logout
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-sm ${tab === t ? "bg-black text-white" : "border border-neutral-300"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 p-5">
        {message ? <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {tab === "Login/Register" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <form className="grid gap-3" onSubmit={login}>
              <h2 className="font-semibold">Login</h2>
              <input name="email" placeholder="Email" className="rounded-lg border border-neutral-300 px-3 py-2" />
              <input name="password" placeholder="Password" type="password" className="rounded-lg border border-neutral-300 px-3 py-2" />
              <button className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">Login</button>
            </form>
            <form className="grid gap-3" onSubmit={register}>
              <h2 className="font-semibold">Register</h2>
              <input name="fullName" placeholder="Full Name" className="rounded-lg border border-neutral-300 px-3 py-2" />
              <input name="email" placeholder="Email" className="rounded-lg border border-neutral-300 px-3 py-2" />
              <input name="phone" placeholder="Phone" className="rounded-lg border border-neutral-300 px-3 py-2" />
              <input name="password" placeholder="Password" type="password" className="rounded-lg border border-neutral-300 px-3 py-2" />
              <button className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">Create Account</button>
            </form>
            <form className="grid gap-3 sm:col-span-2" onSubmit={requestReset}>
              <h2 className="font-semibold">Reset Password</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="resetEmail" placeholder="Account Email" className="rounded-lg border border-neutral-300 px-3 py-2" />
                <button className="rounded-xl border border-black px-4 py-2 text-sm font-semibold">Request Reset Token</button>
              </div>
            </form>
            <form className="grid gap-3 sm:col-span-2" onSubmit={resetPassword}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="token" defaultValue={resetToken} placeholder="Reset Token" className="rounded-lg border border-neutral-300 px-3 py-2" />
                <input name="newPassword" placeholder="New Password" type="password" className="rounded-lg border border-neutral-300 px-3 py-2" />
              </div>
              <button className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">Reset Password</button>
            </form>
          </div>
        ) : null}
        {tab === "Profile" ? (
          user ? <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Full Name" className="rounded-lg border border-neutral-300 px-3 py-2" />
            <input placeholder="Phone" className="rounded-lg border border-neutral-300 px-3 py-2" />
            <input disabled value={user.email} placeholder="Email" className="rounded-lg border border-neutral-300 px-3 py-2" />
            <input placeholder="City/Municipality" className="rounded-lg border border-neutral-300 px-3 py-2" />
            <textarea placeholder="Address" className="min-h-24 rounded-lg border border-neutral-300 px-3 py-2 sm:col-span-2" />
            <button className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white sm:col-span-2">Save Profile</button>
          </div> : <p className="text-sm text-neutral-600">Please login to manage your profile and addresses.</p>
        ) : null}
        {tab === "Orders" ? <p className="text-sm text-neutral-600">No previous orders yet. Place an order to see tracking and history here.</p> : null}
        {tab === "Wishlist" ? (
          wished.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{wished.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <p className="text-sm text-neutral-600">Your wishlist is empty.</p>
        ) : null}
        {tab === "Product Requests" ? (
          <p className="text-sm text-neutral-600">Submitted requests and quote statuses (Pending, Reviewing, Quote Sent, Customer Confirmed, Ordered, In Transit, Completed, Cancelled) will appear here.</p>
        ) : null}
      </div>
    </div>
  );
}
