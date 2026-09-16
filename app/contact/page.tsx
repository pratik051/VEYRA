"use client";

import { FormEvent, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";

export default function ContactPage() {
  const { pushToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      pushToast("Message sent! Our Nepal support team will reply shortly.", "success");
    }, 600);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-veyra-gold font-bold">Get In Touch</span>
        <h1 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">Contact SAJILOMARTS Support</h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Have an inquiry regarding an order, India quotation, or partnership? We are here to help.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-card">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Thank You For Contacting Us</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Your message has been received. Our representative will contact you via email or phone within a few hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                  Send a Message
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Your Name *</label>
                    <input
                      required
                      placeholder="e.g. Pratik Sharma"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. pratik@example.com"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Phone Number</label>
                    <input
                      placeholder="e.g. 9801234567"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Subject *</label>
                    <input
                      required
                      placeholder="e.g. Sourcing Inquiry / Order Question"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we assist you with your shopping or custom request?"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-black py-3.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 disabled:opacity-60 transition"
                >
                  {loading ? "Sending..." : "Send Message to SAJILOMARTS →"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50/70 p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-neutral-900">Direct Support Channels</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <span className="text-xl">💬</span>
                <div>
                  <strong className="text-neutral-900 block">WhatsApp Sourcing Concierge:</strong>
                  <a
                    href="https://wa.me/9779767797748?text=Hi%20SAJILOMARTS%2C%20I%20have%20an%20inquiry"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 hover:underline mt-0.5 inline-block"
                  >
                    (Chat on WhatsApp)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-neutral-200/60 pt-3">
                <span className="text-xl">📧</span>
                <div>
                  <strong className="text-neutral-900 block">Business Email:</strong>
                  <span className="text-neutral-600">hello@sajilomarts.com.np / support@sajilomarts.com.np</span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-neutral-200/60 pt-3">
                <span className="text-xl">📍</span>
                <div>
                  <strong className="text-neutral-900 block">Headquarters / Hub:</strong>
                  <span className="text-neutral-600">Kathmandu, Bagmati Province, Nepal</span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-neutral-200/60 pt-3">
                <span className="text-xl">⏰</span>
                <div>
                  <strong className="text-neutral-900 block">Business Hours:</strong>
                  <span className="text-neutral-600">Sunday – Friday: 10:00 AM – 7:00 PM (NPT)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-neutral-200/60 pt-3">
                <span className="text-xl">📱</span>
                <div>
                  <strong className="text-neutral-900 block">Social Media:</strong>
                  <div className="flex gap-3 text-neutral-600 mt-1">
                    <span className="hover:text-black cursor-pointer font-medium">Instagram</span>
                    <span>•</span>
                    <span className="hover:text-black cursor-pointer font-medium">Facebook</span>
                    <span>•</span>
                    <span className="hover:text-black cursor-pointer font-medium">TikTok</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
