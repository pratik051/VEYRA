import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TopBanner } from "@/components/layout/top-banner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/providers/cart-provider";
import { WishlistProvider } from "@/components/providers/wishlist-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { StorefrontShell } from "@/components/layout/storefront-shell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://linkova.com.np"),
  title: {
    default: "LINKOVA — Your Style. Your Essentials. | Nepal",
    template: "%s | LINKOVA"
  },
  description: "Nepal's modern lifestyle shopping & India-to-Nepal product ordering platform. Discover fashion, tech accessories, wearables & essentials.",
  keywords: [
    "LINKOVA",
    "Nepal online shopping",
    "Buy from Amazon India in Nepal",
    "Order Flipkart products in Nepal",
    "Nepal fashion store",
    "Tech accessories Nepal",
    "Kathmandu shopping",
    "India to Nepal delivery"
  ],
  openGraph: {
    title: "LINKOVA — Your Style. Your Essentials.",
    description: "Discover fashion, tech accessories & essentials in Nepal or request direct products from Indian marketplaces.",
    type: "website",
    locale: "en_NP",
    siteName: "LINKOVA"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased selection:bg-red-500 selection:text-white">
        <WishlistProvider>
          <ToastProvider>
            <CartProvider>
              <StorefrontShell>{children}</StorefrontShell>
            </CartProvider>
          </ToastProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
