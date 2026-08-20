import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div>
          <h3 className="text-lg font-bold tracking-[0.15em]">VEYRA</h3>
          <p className="mt-2 text-sm text-neutral-600">Your Style. Your Essentials.</p>
        </div>
        <div>
          <h4 className="font-medium">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li><Link href="/shop">Fashion</Link></li>
            <li><Link href="/shop">Accessories</Link></li>
            <li><Link href="/shop">Tech & Gadgets</Link></li>
            <li><Link href="/shop">Everyday Essentials</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium">Help</h4>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li><Link href="/how-it-works">How It Works</Link></li>
            <li><Link href="/track-order">Track Order</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium">Policies</h4>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions">Terms</Link></li>
            <li><Link href="/shipping-policy">Shipping</Link></li>
            <li><Link href="/return-policy">Returns</Link></li>
            <li><Link href="/refund-policy">Refunds</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium">Social</h4>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>Instagram</li>
            <li>Facebook</li>
            <li>TikTok</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-600">© 2026 VEYRA. All rights reserved.</p>
    </footer>
  );
}
