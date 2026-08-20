"use client";

import { FormEvent, useState } from "react";
import { orderTimeline } from "@/lib/data";

export default function TrackOrderPage() {
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    const response = await fetch("/api/track-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: String(form.get("orderId") || ""),
        contact: String(form.get("contact") || "")
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to track order.");
      setLoading(false);
      return;
    }
    const index = orderTimeline.findIndex((item) => item === data.currentStep);
    setStep(index > 0 ? index : 1);
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Track Order</h1>
      <form onSubmit={onSubmit} className="mt-5 grid gap-3 rounded-2xl border border-neutral-200 p-5 sm:grid-cols-3">
        <input name="orderId" required placeholder="Order ID" className="rounded-lg border border-neutral-300 px-3 py-2" />
        <input name="contact" required placeholder="Phone number or email" className="rounded-lg border border-neutral-300 px-3 py-2 sm:col-span-2" />
        {error ? <p className="text-sm text-red-600 sm:col-span-3">{error}</p> : null}
        <button disabled={loading} className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-3">{loading ? "Tracking..." : "Track"}</button>
      </form>
      {submitted ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 p-5">
          <h2 className="text-lg font-semibold">Order Timeline</h2>
          <ul className="mt-4 space-y-3">
            {orderTimeline.map((item, i) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <span className={`h-3 w-3 rounded-full ${i <= step ? "bg-veyra-gold" : "bg-neutral-300"}`} />
                <span className={i <= step ? "font-medium" : "text-neutral-500"}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
