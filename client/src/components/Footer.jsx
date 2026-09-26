import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, MailIcon } from './SocialIcons';

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
          <p className="text-neutral-500 text-xs font-medium">
            Shop Easy • Live Better
          </p>
          <p className="text-neutral-500 text-xs leading-relaxed max-w-xs">
            Direct marketplace sourcing from Indian online stores with transparent NPR pricing and reliable Nepal delivery.
          </p>
          <div className="pt-2 flex flex-col gap-2 text-xs">
            <a 
              href="mailto:sajilomarts@gmail.com" 
              className="inline-flex items-center gap-2 text-neutral-800 hover:text-neutral-950 font-bold transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
                <MailIcon className="h-4 w-4" />
              </div>
              <span className="truncate">sajilomarts@gmail.com</span>
            </a>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://www.facebook.com/profile.php?id=61594687408072"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1877F2] font-bold text-xs transition-colors shadow-2xs"
                title="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
                <span>Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/sajilomarts/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-[#E4405F] font-bold text-xs transition-colors shadow-2xs"
                title="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
                <span>Instagram</span>
              </a>
            </div>
          </div>
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
          <ul className="space-y-2.5">
            <li>
              <Link to="/support" className="hover:text-neutral-900 transition-colors">
                Customer Support Hub
              </Link>
            </li>
            <li>
              <a href="mailto:sajilomarts@gmail.com" className="inline-flex items-center gap-2 hover:text-neutral-900 transition-colors">
                <MailIcon className="h-3.5 w-3.5 text-red-500" />
                <span>Email Customer Care</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/profile.php?id=61594687408072"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-600 transition-colors"
              >
                <FacebookIcon className="h-3.5 w-3.5 text-[#1877F2]" />
                <span>Facebook Support</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/sajilomarts/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-neutral-600 hover:text-pink-600 transition-colors"
              >
                <InstagramIcon className="h-3.5 w-3.5 text-[#E4405F]" />
                <span>Instagram Direct</span>
              </a>
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
