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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-veyra-bg text-veyra-text antialiased">
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
