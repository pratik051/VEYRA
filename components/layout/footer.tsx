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
    pushToast("Thank you for subscribing to VEYRA updates!", "success");
    setEmail("");
  };

  return (
    <footer className="mt-20 border-t border-neutral-200 bg-neutral-950 text-white">
      {/* Top Banner / Newsletter */}
      <div className="border-b border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Stay ahead with VEYRA drops &amp; India sourcing alerts.
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Get notified when new trending products arrive or special import rates are available.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="mt-6 sm:flex sm:max-w-md lg:mt-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full min-w-0 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-veyra-gold focus:outline-none"
            />
            <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-xl bg-veyra-gold px-5 py-3 text-sm font-semibold text-black hover:bg-veyra-gold-light transition"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-extrabold tracking-[0.2em] text-white">VEYRA</span>
              <span className="h-2 w-2 rounded-full bg-veyra-gold"></span>
            </Link>
            <p className="text-sm font-medium text-veyra-gold">Your Style. Your Essentials.</p>
            <p className="text-xs leading-relaxed text-neutral-400 max-w-sm">
              VEYRA is Nepal&apos;s modern shopping and custom ordering platform. Discover curated fashion, wearables, accessories, tech gadgets and everyday essentials, or request direct items from Indian online marketplaces delivered to your doorstep.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/9779800000000?text=Hi%20VEYRA%2C%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-3.5 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-600/30 transition"
              >
                <span>💬</span>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Shop Categories</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-neutral-400">
              <li><Link href="/shop?category=Fashion" className="hover:text-white transition">Fashion &amp; Apparel</Link></li>
              <li><Link href="/shop?category=Footwear" className="hover:text-white transition">Footwear &amp; Sneakers</Link></li>
              <li><Link href="/shop?category=Watches" className="hover:text-white transition">Watches &amp; Smart Wear</Link></li>
              <li><Link href="/shop?category=Tech+%26+Gadgets" className="hover:text-white transition">Tech &amp; Gadgets</Link></li>
              <li><Link href="/shop?category=Mobile+Accessories" className="hover:text-white transition">Mobile Accessories</Link></li>
              <li><Link href="/shop?category=Bags" className="hover:text-white transition">Bags &amp; Travel Carry</Link></li>
              <li><Link href="/shop?category=Everyday+Essentials" className="hover:text-white transition">Everyday Essentials</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Help &amp; Services</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-neutral-400">
              <li><Link href="/request-product" className="text-veyra-gold font-medium hover:underline">Request From India</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition">Track Order Status</Link></li>
              <li><Link href="/faq" className="hover:text-white transition">Frequently Asked Questions</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Customer Care</Link></li>
              <li><Link href="/account" className="hover:text-white transition">Customer Account</Link></li>
              <li><Link href="/admin" className="hover:text-white transition text-neutral-500">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Policies &amp; Terms</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-neutral-400">
              <li><Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-white transition">Terms &amp; Conditions</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-white transition">Shipping &amp; Delivery Policy</Link></li>
              <li><Link href="/return-policy" className="hover:text-white transition">Return Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition">Refund Policy</Link></li>
              <li><Link href="/cancellation-policy" className="hover:text-white transition">Cancellation Policy</Link></li>
              <li><Link href="/product-request-policy" className="hover:text-white transition">India Sourcing Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Social & Bottom Info */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-neutral-800 pt-8 sm:flex-row text-xs text-neutral-500">
          <p>© 2026 VEYRA (Nepal). All rights reserved. Registered Online Retail &amp; Import Concierge.</p>
          <div className="mt-4 flex items-center gap-6 sm:mt-0">
            <span className="hover:text-white transition cursor-pointer">Instagram</span>
            <span className="hover:text-white transition cursor-pointer">Facebook</span>
            <span className="hover:text-white transition cursor-pointer">TikTok</span>
            <span className="hover:text-white transition cursor-pointer">YouTube</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
