import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 text-neutral-600 pt-12 pb-16 md:pb-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-200">
        {/* Brand Column */}
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src="/sajilomarts-logo.png"
              alt="SajiloMarts Logo"
              className="h-6 w-auto object-contain"
            />
            <span className="text-sm sm:text-base font-bold text-neutral-900">
              SajiloMarts
            </span>
          </Link>
          <p className="text-neutral-500 text-xs">
            Shop Easy • Live Better
          </p>
          <p className="text-neutral-500 text-xs leading-relaxed max-w-xs">
            Direct marketplace sourcing from Indian online stores with transparent NPR pricing and reliable Nepal delivery.
          </p>
        </div>

        {/* SOURCING Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Order Products
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/order" className="hover:text-neutral-900 transition-colors">
                Order by Product Link
              </Link>
            </li>
            <li>
              <Link to="/order" className="hover:text-neutral-900 transition-colors">
                Price Calculator
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-neutral-900 transition-colors">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/track-order" className="hover:text-neutral-900 transition-colors">
                Track Order
              </Link>
            </li>
          </ul>
        </div>

        {/* HELP Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Help &amp; Support
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/support" className="hover:text-neutral-900 transition-colors">
                Customer Support Hub
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-neutral-900 transition-colors">
                Customer Care Desk
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-neutral-900 transition-colors">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-neutral-900 transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* LEGAL Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Policies
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/privacy-policy" className="hover:text-neutral-900 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-and-conditions" className="hover:text-neutral-900 transition-colors">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/shipping-policy" className="hover:text-neutral-900 transition-colors">
                Shipping &amp; Customs
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" className="hover:text-neutral-900 transition-colors">
                Refunds &amp; Returns
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & accepted payment badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-500">
        <p>
          &copy; {new Date().getFullYear()} SajiloMarts. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
          <span>Supported Payments: eSewa • Khalti • Bank Transfer • COD</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
