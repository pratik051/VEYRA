import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-bold text-white mb-3">SAJILOMARTS</h3>
          <p className="text-xs leading-relaxed text-neutral-400">
            Nepal's premier cross-border e-commerce platform. Order products directly from Amazon India, Flipkart, Myntra, AJIO & get doorstep delivery across Nepal.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider mb-3">Supported Marketplaces</h4>
          <ul className="space-y-1.5 text-xs">
            <li>Amazon India (amazon.in)</li>
            <li>Flipkart India</li>
            <li>Myntra Fashion</li>
            <li>AJIO Trends</li>
            <li>Meesho & Nykaa</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider mb-3">Customer Service</h4>
          <ul className="space-y-1.5 text-xs">
            <li><Link to="/request-product" className="hover:text-white">Instant Price Calculator</Link></li>
            <li><Link to="/track-order" className="hover:text-white">Track Sourcing Status</Link></li>
            <li><Link to="/account" className="hover:text-white">Customer Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider mb-3">Nepal Logistics</h4>
          <p className="text-xs leading-relaxed">
            Delivering to Kathmandu Valley, Pokhara, Chitwan, Biratnagar, Butwal, Dharan & 77 districts across Nepal.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-neutral-900 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} SajiloMarts. All rights reserved. MERN Stack Engine.
      </div>
    </footer>
  );
}
