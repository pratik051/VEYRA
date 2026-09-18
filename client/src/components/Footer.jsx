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
            Direct marketplace product sourcing from Indian online stores with transparent NPR landed rates and reliable Nepal delivery.
          </p>
        </div>

        {/* ORDER FROM INDIA Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Order by Link
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/request-product" className="hover:text-neutral-900 transition-colors">
                Paste Link & Get Quote
              </Link>
            </li>
            <li>
              <a href="/#calculator" className="hover:text-neutral-900 transition-colors">
                Rate Calculator
              </a>
            </li>
            <li>
              <a href="/#stores" className="hover:text-neutral-900 transition-colors">
                Supported Indian Stores
              </a>
            </li>
            <li>
              <Link to="/request-product?source=Amazon" className="hover:text-neutral-900 transition-colors">
                Amazon India Sourcing
              </Link>
            </li>
            <li>
              <Link to="/request-product?source=Flipkart" className="hover:text-neutral-900 transition-colors">
                Flipkart Sourcing
              </Link>
            </li>
          </ul>
        </div>

        {/* HELP & TRACKING Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Help & Tracking
          </h4>
          <ul className="space-y-2">
            <li>
              <a href="/#how-it-works" className="hover:text-neutral-900 transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <Link to="/track-order" className="hover:text-neutral-900 transition-colors">
                Track Sourcing Order
              </Link>
            </li>
            <li>
              <a href="/#faq" className="hover:text-neutral-900 transition-colors">
                FAQs & Pricing
              </a>
            </li>
            <li>
              <Link to="/contact" className="hover:text-neutral-900 transition-colors">
                Contact & Support
              </Link>
            </li>
          </ul>
        </div>

        {/* LEGAL Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Legal & Policies
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/privacy-policy" className="hover:text-neutral-900 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-and-conditions" className="hover:text-neutral-900 transition-colors">
                Terms of Sourcing
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" className="hover:text-neutral-900 transition-colors">
                Refunds & Cancellations
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
          <span>Supported Payments: eSewa • Khalti • Bank Transfer</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
