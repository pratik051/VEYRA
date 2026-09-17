import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Sparkles, CreditCard, Lock } from 'lucide-react';
import { MARKETPLACE_METAS } from '../constants/marketplaces';

export function Footer() {
  return (
    <footer className="bg-neutral-950 dark:bg-[#070c27] border-t border-neutral-800 dark:border-[#1b2559] text-neutral-400 pt-16 pb-24 md:pb-12 px-4 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-neutral-800 dark:border-[#1b2559]">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5 group inline-flex">
            <img
              src="/sajilomarts-logo.png"
              alt="SajiloMarts Logo"
              className="h-9 w-auto object-contain rounded-lg shadow-sm"
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

          <p className="text-xs leading-relaxed text-neutral-400 max-w-sm">
            Nepal's premier cross-border e-commerce bridge. Order products directly from Amazon India, Flipkart, Myntra, Ajio, Meesho, Nykaa, boAt, Noise & 10+ marketplaces with doorstep delivery across all 7 provinces of Nepal.
          </p>

          <div className="flex items-center gap-3 pt-2 text-[11px] text-neutral-300">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>100% Genuine</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Truck className="h-4 w-4 text-red-500" />
              <span>Doorstep Nepal Delivery</span>
            </div>
          </div>
        </div>

        {/* Column 2: Indian Marketplaces */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
            Indian Marketplaces
          </h4>
          <ul className="space-y-2 text-xs">
            {MARKETPLACE_METAS.slice(0, 6).map((m) => (
              <li key={m.id}>
                <Link to={`/shop/${m.slug}`} className="hover:text-white transition-colors">
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Quick Links & Sourcing */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/shop" className="hover:text-white transition-colors">
                Catalog Products
              </Link>
            </li>
            <li>
              <Link to="/request-product" className="hover:text-white transition-colors">
                Paste Indian URL & Quote
              </Link>
            </li>
            <li>
              <Link to="/track-order" className="hover:text-white transition-colors">
                Track Sourcing Package
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-amber-400 font-bold text-neutral-300 transition-colors flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>AI Support &amp; Help Desk</span>
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-white transition-colors">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-white transition-colors">
                Help & FAQs
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact Customer Care
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Policies & Institutional */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
            Legal & Support
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                About SajiloMarts
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-and-conditions" className="hover:text-white transition-colors">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/shipping-policy" className="hover:text-white transition-colors">
                Shipping & Customs
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" className="hover:text-white transition-colors">
                Refunds & Returns
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <p>
          &copy; {new Date().getFullYear()} SajiloMarts Nepal. All rights reserved. Sourcing & Logistics Engine.
        </p>

        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
          <span className="font-semibold text-neutral-300">Accepted:</span>
          <span>eSewa QR</span>
          <span>•</span>
          <span>Khalti QR</span>
          <span>•</span>
          <span>MyPay / Fonepay</span>
          <span>•</span>
          <span>50% COD Advance</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
