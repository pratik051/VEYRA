import Link from "next/link";
import Image from "next/image";
import { SajiloMartsHeaderBrand } from "@/components/ui/sajilomarts-brand-logo";
import { MARKETPLACE_METAS } from "@/lib/marketplace-constants";
import { MarketplaceLogo } from "@/components/ui/marketplace-logos";

export const metadata = {
  title: "About Us | SAJILOMARTS — Nepal's Premier Indian Marketplace & Lifestyle Store",
  description:
    "SAJILOMARTS connects Nepal to top Indian marketplaces including Amazon India, Flipkart, Myntra, Meesho, Nykaa, and boAt with transparent pricing and doorstep delivery."
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* ─── HERO BANNER ─── */}
      <div className="rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl border border-neutral-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-amber-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>About SAJILOMARTS Nepal</span>
          </div>

          <div className="space-y-3">
            <div className="inline-block bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 shadow-md border border-neutral-200">
              <SajiloMartsHeaderBrand theme="light" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight pt-2">
              Your Link to India&apos;s Best Marketplaces. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-red-500">
                Delivered Right to Your Doorstep.
              </span>
            </h1>
          </div>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-medium">
            SAJILOMARTS was founded with a singular purpose: to make genuine Indian marketplace goods, electronics, fashion, beauty, and lifestyle essentials completely accessible, affordable, and frictionless for every household across all 7 provinces of Nepal.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/shop"
              className="rounded-full bg-white text-neutral-950 hover:bg-neutral-100 font-black text-xs px-6 py-3 transition shadow-md"
            >
              Browse All Products ➔
            </Link>
            <Link
              href="/request-product"
              className="rounded-full bg-gradient-to-r from-amber-500 to-red-600 text-white hover:opacity-95 font-black text-xs px-6 py-3 transition shadow-md"
            >
              🇮🇳 Request Any Indian Link
            </Link>
          </div>
        </div>
      </div>

      {/* ─── STORY & VISION ─── */}
      <div className="grid gap-10 md:grid-cols-2 items-center">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-card aspect-4/3">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
            alt="SAJILOMARTS Sourcing & Logistics"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
            <p className="text-white text-xs font-bold">
              Kathmandu Hub &bull; Nationwide Cross-Border Sourcing
            </p>
          </div>
        </div>

        <div className="space-y-5 text-neutral-700 leading-relaxed text-sm">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-black uppercase tracking-wider text-amber-900">
            Our Mission
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
            Why We Built SAJILOMARTS
          </h2>
          <p>
            For shoppers across Kathmandu, Pokhara, Biratnagar, Butwal, and remote districts of Nepal, purchasing authentic products from Indian platforms like Amazon India, Flipkart, Myntra, Nykaa, or Meesho used to mean relying on informal couriers, paying unpredictable customs fees, or dealing with fake replicas.
          </p>
          <p>
            <strong>SAJILOMARTS fixes that.</strong> We combine a live catalog of in-stock verified essentials with an automated <strong>Direct India Sourcing Engine</strong>. Paste any URL from 10+ Indian platforms, see the exact landed NPR price with all customs and freight included, and receive your delivery right at your door.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-bold text-neutral-900">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-black">✓</span> 100% Genuine Direct Procurements
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-black">✓</span> No Surprise Duties
            </div>
          </div>
        </div>
      </div>

      {/* ─── 10 SUPPORTED INDIAN MARKETPLACES ─── */}
      <div className="space-y-6 border-t border-neutral-200/80 pt-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
            Integrated Marketplace Channels
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
            Official Indian Sourcing Channels
          </h2>
          <p className="text-xs text-neutral-500">
            Directly browse or request products from India&apos;s leading e-commerce platforms with automated daily price updates:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {MARKETPLACE_METAS.map((m) => (
            <Link
              key={m.id}
              href={m.shopUrl}
              className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 hover:shadow-md transition-all group"
            >
              <div className="h-8 w-auto flex items-center justify-center mb-3">
                <MarketplaceLogo marketplace={m.id} className="h-6 w-auto max-w-[90px]" />
              </div>
              <span className="text-xs font-bold text-neutral-900 group-hover:text-red-600 transition">
                {m.name}
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5">{m.domain}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── 4 CORE PILLARS ─── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 border-t border-neutral-200/80 pt-12">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
          <span className="text-3xl">🛡️</span>
          <h3 className="text-sm font-black text-neutral-900">100% Genuine Guarantee</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Every product is procured exclusively from verified brand sellers and authorized distributors in India.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
          <span className="text-3xl">🏷️</span>
          <h3 className="text-sm font-black text-neutral-900">Transparent Landed Price</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Zero hidden charges. Your NPR quote includes product cost, currency exchange, air/road freight, and Nepal customs.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
          <span className="text-3xl">🚚</span>
          <h3 className="text-sm font-black text-neutral-900">Nationwide Nepal Delivery</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            From Kathmandu Valley to Pokhara, Biratnagar, and rural municipalities across all 7 provinces.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
          <span className="text-3xl">💬</span>
          <h3 className="text-sm font-black text-neutral-900">Direct WhatsApp Desk</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Dedicated bilingual customer support concierge available via WhatsApp (+977 9767797748).
          </p>
        </div>
      </div>

      {/* ─── CONTACT & WHATSAPP BANNER ─── */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            <span>💬</span> WhatsApp Direct Concierge
          </div>
          <h3 className="text-xl font-black text-neutral-950">
            Need Help or Custom Sourcing Assistance?
          </h3>
          <p className="text-xs text-neutral-600 max-w-lg">
            Chat directly with our sourcing team on WhatsApp at <strong>+977 9767797748</strong> for instant product checks, orders, and delivery updates.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 flex-shrink-0">
          <a
            href="https://wa.me/9779767797748?text=Hi%20SAJILOMARTS%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3.5 transition shadow-md flex items-center gap-2"
          >
            <span>Chat on WhatsApp</span>
            <span>➔</span>
          </a>
          <Link
            href="/contact"
            className="rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 font-bold text-xs px-6 py-3.5 transition shadow-xs"
          >
            Contact Support Page
          </Link>
        </div>
      </div>
    </div>
  );
}
