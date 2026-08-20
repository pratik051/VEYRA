import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/providers/cart-provider";
import { WishlistProvider } from "@/components/providers/wishlist-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://veyra.example"),
  title: {
    default: "VEYRA | Your Style. Your Essentials.",
    template: "%s | VEYRA"
  },
  description: "Fashion, accessories, tech and everyday essentials in Nepal. Shop VEYRA or request products from India marketplaces.",
  openGraph: {
    title: "VEYRA",
    description: "Your Style. Your Essentials.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WishlistProvider>
          <ToastProvider>
            <CartProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-neutral-200 bg-white py-2 text-center text-xs md:hidden">
                <Link href="/">Home</Link>
                <Link href="/shop">Shop</Link>
                <Link href="/request-product">Request</Link>
                <Link href="/cart">Cart</Link>
                <Link href="/account">Account</Link>
              </nav>
            </CartProvider>
          </ToastProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
