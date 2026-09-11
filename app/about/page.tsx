import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-veyra-gold font-bold">About LINKOVA</span>
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          More Than Shopping. <br />
          <span className="gold-text-gradient">It&apos;s Your Choice.</span>
        </h1>
        <p className="text-sm sm:text-base leading-relaxed text-neutral-600">
          LINKOVA is built to make it easier for customers in Nepal to discover fashion, accessories, technology and useful everyday products from India and other available global sources.
        </p>
      </div>

      {/* Main Story Image & Narrative */}
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-card">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80"
            alt="LINKOVA Story & Vision"
            width={800}
            height={600}
            className="h-80 w-full object-cover"
          />
        </div>

        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-neutral-700">
          <h2 className="text-2xl font-bold text-neutral-900">Why LINKOVA Exists</h2>
          <p>
            For shoppers across Kathmandu, Pokhara, Biratnagar, and all 7 provinces of Nepal, finding authentic lifestyle accessories, modern streetwear, compact gadgets, and specific marketplace items from India used to involve complex logistics, uncertainty, and hidden fees.
          </p>
          <p>
            LINKOVA bridges that gap. We offer a curated in-stock catalog of verified essentials and wearables, coupled with a dedicated <strong>Request From India</strong> concierge where you can paste any product URL from Amazon India, Flipkart, Myntra, or Meesho to receive an all-inclusive doorstep quote.
          </p>
          <div className="pt-2">
            <Link
              href="/request-product"
              className="inline-block rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition"
            >
              Learn About India Sourcing →
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
          <span className="text-2xl">✨</span>
          <h3 className="text-base font-bold text-neutral-900">Curated Quality</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            We don&apos;t overwhelm you with clutter. Every item in our catalog is vetted for build quality, durability, and practical everyday use.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
          <span className="text-2xl">🔍</span>
          <h3 className="text-base font-bold text-neutral-900">Transparent Pricing</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            No surprise customs charges at your door. Sourced item quotes explicitly detail freight, taxes, and handling before you confirm.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
          <span className="text-2xl">🚚</span>
          <h3 className="text-base font-bold text-neutral-900">Nationwide Reach</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Delivering across all 7 provinces of Nepal with real-time milestone tracking and local Nepali customer support.
          </p>
        </div>
      </div>
    </div>
  );
}
