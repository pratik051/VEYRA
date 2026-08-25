import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/providers/cart-provider";
import { WishlistProvider } from "@/components/providers/wishlist-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { MobileNav } from "@/components/layout/mobile-nav";

export const metadata: Metadata = {
  metadataBase: new URL("https://veyra.com.np"),
  title: {
    default: "VEYRA — Your Style. Your Essentials. | Nepal",
    template: "%s | VEYRA"
  },
  description: "Nepal's modern lifestyle shopping & India-to-Nepal product ordering platform. Discover fashion, tech accessories, wearables & essentials.",
  keywords: [
    "VEYRA",
    "Nepal online shopping",
    "Buy from Amazon India in Nepal",
    "Order Flipkart products in Nepal",
    "Nepal fashion store",
    "Tech accessories Nepal",
    "Kathmandu shopping",
    "India to Nepal delivery"
  ],
  openGraph: {
    title: "VEYRA — Your Style. Your Essentials.",
    description: "Discover fashion, tech accessories & essentials in Nepal or request direct products from Indian marketplaces.",
    type: "website",
    locale: "en_NP",
    siteName: "VEYRA"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased selection:bg-black selection:text-white">
        <WishlistProvider>
          <ToastProvider>
            <CartProvider>
              <Header />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer />
              <MobileNav />
            </CartProvider>
          </ToastProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
