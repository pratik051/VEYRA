"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/providers/toast-provider";

export function Footer() {
  const [email, setEmail] = useState("");
  const { pushToast } = useToast();

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      pushToast("Please enter a valid email address.", "error");
      return;
    }
    pushToast("Thank you for subscribing to LINKOVA updates!", "success");
    setEmail("");
  };

  return (
    <footer className="mt-20 bg-linkova-surface-2 text-linkova-text border-t border-black/[0.04] dark:bg-[#071018] dark:text-slate-100 dark:border-white/[0.04]">
      {/* Gold top border line */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, #C9A84C 30%, #E8C97A 50%, #C9A84C 70%, transparent 100%)" }} />

      {/* Newsletter Banner */}
      <div className="border-b border-black/[0.04] bg-linkova-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-linkova-gold/30 bg-linkova-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-linkova-gold mb-3">
              Stay Updated
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight text-linkova-text-dark sm:text-2xl">
              Stay ahead with LINKOVA drops &amp; India sourcing alerts.
            </h3>
            <p className="mt-2 text-sm text-linkova-muted">
              Get notified when new trending products arrive or special import rates are available.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="mt-6 sm:flex sm:max-w-md lg:mt-0 lg:ml-8">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full min-w-0 rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-sm text-linkova-text placeholder-linkova-muted focus:border-linkova-gold focus:outline-none focus:ring-1 focus:ring-linkova-gold/40 transition"
            />
            <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
              <button
                type="submit"
                className="shimmer-gold flex w-full items-center justify-center rounded-xl bg-linkova-gold px-6 py-3 text-sm font-bold text-black hover:bg-linkova-gold-light hover:shadow-gold transition-all duration-200"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-black tracking-[0.22em] text-linkova-text-dark">LINKOVA</span>
            </Link>
            <p className="text-sm font-semibold text-linkova-gold">Your Style. Your Essentials.</p>
            <p className="text-xs leading-relaxed text-linkova-muted max-w-sm">
              LINKOVA is Nepal&apos;s modern shopping and custom ordering platform. Discover curated fashion, wearables, accessories, tech gadgets and everyday essentials, or request direct items from Indian online marketplaces delivered to your doorstep.
            </p>
            <div className="pt-1">
              <a
                href="https://wa.me/9779800000000?text=Hi%20LINKOVA%2C%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200"
              >
                <span>💬</span>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-linkova-text-dark mb-5">Shop Categories</h4>
            <ul className="space-y-3 text-xs text-linkova-muted">
              <li><Link href="/shop?category=Fashion" className="hover:text-linkova-gold transition-colors duration-200">Fashion &amp; Apparel</Link></li>
              <li><Link href="/shop?category=Footwear" className="hover:text-linkova-gold transition-colors duration-200">Footwear &amp; Sneakers</Link></li>
              <li><Link href="/shop?category=Watches" className="hover:text-linkova-gold transition-colors duration-200">Watches &amp; Smart Wear</Link></li>
              <li><Link href="/shop?category=Tech+%26+Gadgets" className="hover:text-linkova-gold transition-colors duration-200">Tech &amp; Gadgets</Link></li>
              <li><Link href="/shop?category=Mobile+Accessories" className="hover:text-linkova-gold transition-colors duration-200">Mobile Accessories</Link></li>
              <li><Link href="/shop?category=Bags" className="hover:text-linkova-gold transition-colors duration-200">Bags &amp; Travel Carry</Link></li>
              <li><Link href="/shop?category=Everyday+Essentials" className="hover:text-linkova-gold transition-colors duration-200">Everyday Essentials</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-veyra-text-dark mb-5">Help &amp; Services</h4>
            <ul className="space-y-3 text-xs text-veyra-muted">
              <li><Link href="/request-product" className="text-veyra-gold font-semibold hover:text-veyra-gold-light transition-colors duration-200">Request From India</Link></li>
              <li><Link href="/how-it-works" className="hover:text-veyra-gold transition-colors duration-200">How It Works</Link></li>
              <li><Link href="/track-order" className="hover:text-veyra-gold transition-colors duration-200">Track Order Status</Link></li>
              <li><Link href="/faq" className="hover:text-veyra-gold transition-colors duration-200">Frequently Asked Questions</Link></li>
              <li><Link href="/contact" className="hover:text-veyra-gold transition-colors duration-200">Contact Customer Care</Link></li>
              <li><Link href="/dashboard" className="hover:text-veyra-gold transition-colors duration-200">Customer Dashboard</Link></li>
              <li><Link href="/admin" className="text-veyra-text/20 hover:text-veyra-text/50 transition-colors duration-200">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-veyra-text-dark mb-5">Policies &amp; Terms</h4>
            <ul className="space-y-3 text-xs text-veyra-muted">
              <li><Link href="/privacy-policy" className="hover:text-veyra-gold transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-veyra-gold transition-colors duration-200">Terms &amp; Conditions</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-veyra-gold transition-colors duration-200">Shipping &amp; Delivery Policy</Link></li>
              <li><Link href="/return-policy" className="hover:text-veyra-gold transition-colors duration-200">Return Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-veyra-gold transition-colors duration-200">Refund Policy</Link></li>
              <li><Link href="/cancellation-policy" className="hover:text-veyra-gold transition-colors duration-200">Cancellation Policy</Link></li>
              <li><Link href="/product-request-policy" className="hover:text-veyra-gold transition-colors duration-200">India Sourcing Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between border-t border-black/[0.04] pt-8 sm:flex-row text-xs text-veyra-muted/60">
          <p>© 2026 LINKOVA (Nepal). All rights reserved. Registered Online Retail &amp; Import Concierge.</p>
          <div className="mt-4 flex items-center gap-6 sm:mt-0">
            {["Instagram", "Facebook", "TikTok", "YouTube"].map((platform) => (
              <span
                key={platform}
                className="cursor-pointer text-veyra-muted/60 hover:text-veyra-gold transition-colors duration-200"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
