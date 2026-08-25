import Image from "next/image";
import Link from "next/link";
import { categories, products, supportedPlatforms } from "@/lib/data";
import { ProductCard } from "@/components/ui/product-card";
import { LinkVerifier } from "@/components/ui/link-verifier";

const featureCards = [
  {
    icon: "🛍️",
    title: "Wide Selection",
    body: "Curated fashion, accessories, wearables, tech gadgets and compact everyday essentials in one modern catalog."
  },
  {
    icon: "🇮🇳 ✈️ 🇳🇵",
    title: "India-to-Nepal Ordering",
    body: "Request any item from Amazon India, Flipkart, Myntra, Meesho, Ajio or Tata CLiQ with seamless doorstep Nepal delivery."
  },
  {
    icon: "🔍",
    title: "Product Verification",
    body: "Every item and source URL is carefully reviewed for seller authenticity, specifications and clear cost estimation."
  },
  {
    icon: "🚚",
    title: "Nepal Delivery",
    body: "Reliable delivery across all 7 provinces in Nepal with live milestone tracking and dedicated local support."
  }
];

export default function HomePage() {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const arrivals = products.filter((p) => p.newArrival).slice(0, 4);
  const trending = products.filter((p) => p.trending).slice(0, 4);

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VEYRA",
    slogan: "Your Style. Your Essentials.",
    url: "https://veyra.com.np",
    description: "Nepal-based online retail and Indian marketplace product concierge platform.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+977-9800000000",
      contactType: "customer service",
      areaServed: "NP",
      availableLanguage: ["English", "Nepali"]
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-white py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Copy */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-veyra-gold animate-pulse"></span>
                <span>Nepal&apos;s Modern Shopping &amp; India Import Concierge</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl lg:leading-[1.1]">
                Everything You Want. <br />
                <span className="gold-text-gradient">One Place.</span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                Fashion, accessories, tech and everyday essentials — discover products from India and get them delivered anywhere in Nepal.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/shop"
                  className="rounded-xl bg-black px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-neutral-800 transition"
                >
                  Shop Now
                </Link>
                <Link
                  href="/request-product"
                  className="flex items-center gap-2 rounded-xl border-2 border-black bg-white px-6 py-3.5 text-sm font-bold text-black hover:bg-black hover:text-white transition"
                >
                  <span>Request From India</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Trust Micro-Pills */}
              <div className="grid grid-cols-3 gap-3 border-t border-neutral-200/80 pt-6">
                <div>
                  <p className="text-lg font-extrabold text-neutral-900">1,000+</p>
                  <p className="text-xs text-neutral-500 font-medium">Curated &amp; Sourced Items</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-neutral-900">7 Provinces</p>
                  <p className="text-xs text-neutral-500 font-medium">Nationwide Nepal Delivery</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-neutral-900">100% Verified</p>
                  <p className="text-xs text-neutral-500 font-medium">Clear Cost Estimations</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Collage */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-950 p-2 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
                  alt="VEYRA Curated Products Lifestyle"
                  width={900}
                  height={1000}
                  className="h-[420px] w-full rounded-2xl object-cover"
                  priority
                />

                {/* Floating Glass Badges */}
                <div className="absolute top-6 left-6 rounded-2xl border border-white/20 bg-black/75 p-3.5 text-white backdrop-blur-md shadow-lg">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-veyra-gold">Direct Indian Marketplaces</p>
                  <p className="text-xs font-semibold">Amazon • Flipkart • Myntra</p>
                </div>

                <div className="absolute bottom-6 right-6 rounded-2xl border border-white/20 bg-white/90 p-3.5 text-neutral-900 backdrop-blur-md shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500"></span>
                    <p className="text-xs font-bold">Fast Nepal Sourcing</p>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-0.5">Express Doorstep Shipping</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Trust Feature Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="group rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-card-hover"
            >
              <div className="text-2xl mb-3">{card.icon}</div>
              <h3 className="text-base font-bold text-neutral-900 group-hover:text-veyra-gold transition">
                {card.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Categories Grid (All 9 Categories) */}
      <section id="categories" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Explore Collection</span>
            <h2 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl mt-1">Shop by Category</h2>
            <p className="mt-1 text-sm text-neutral-500">Discover handpicked essentials across every lifestyle category.</p>
          </div>
          <Link
            href="/shop"
            className="mt-3 sm:mt-0 text-sm font-bold text-neutral-900 hover:text-veyra-gold transition inline-flex items-center gap-1"
          >
            <span>View All Products</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                <Image
                  src={`${cat.image}?auto=format&fit=crop&w=800&q=80`}
                  alt={cat.name}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold text-white drop-shadow-sm">{cat.name}</h3>
                  <p className="text-xs text-neutral-200 line-clamp-1">{cat.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-white">
                <span className="text-xs font-semibold text-neutral-500">{cat.itemCount || 20}+ items</span>
                <span className="text-xs font-bold text-neutral-900 group-hover:text-veyra-gold transition inline-flex items-center gap-1">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Handpicked</span>
            <h2 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl mt-1">Featured Products</h2>
            <p className="mt-1 text-sm text-neutral-500">Popular picks selected for quality, durability &amp; value.</p>
          </div>
          <Link href="/shop" className="text-sm font-bold text-neutral-900 hover:text-veyra-gold transition">
            See More →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Dedicated India Product Request Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-950 p-8 sm:p-12 text-white shadow-2xl">
          {/* Subtle gold decorative background gradient */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-veyra-gold/10 blur-3xl" />
          <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-veyra-gold/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-block rounded-full border border-veyra-gold/40 bg-veyra-gold/15 px-3 py-1 text-xs font-bold tracking-wider uppercase text-veyra-gold">
              🌟 Direct Marketplace Sourcing
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Found It In India? <br />
              <span className="gold-text-gradient">We&apos;ll Help You Get It.</span>
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-neutral-300">
              Found something you love on Amazon India, Flipkart, Myntra, Meesho, Ajio or another Indian marketplace? Send us the product link and we&apos;ll check availability and provide you with an estimated quotation.
            </p>

            {/* Platform chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {supportedPlatforms.map((p) => (
                <span
                  key={p.name}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs font-semibold text-neutral-200"
                >
                  {p.name}
                </span>
              ))}
              <span className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs font-semibold text-neutral-400">
                + Any Other Store
              </span>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                href="/request-product"
                className="rounded-xl bg-veyra-gold px-7 py-3.5 text-sm font-bold text-black shadow-gold hover:bg-veyra-gold-light transition"
              >
                Request a Product
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 transition"
              >
                How It Works
              </Link>
            </div>

            <p className="text-[11px] text-neutral-500 pt-2">
              * VEYRA operates as an independent concierge and sourcing facilitator to make cross-border discovery simple and safe for customers in Nepal.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-veyra-gold font-bold">Trending Now</span>
            <h2 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl mt-1">Most Popular This Week</h2>
            <p className="mt-1 text-sm text-neutral-500">Items experiencing high demand and verified 5-star customer reviews.</p>
          </div>
          <Link href="/shop" className="text-sm font-bold text-neutral-900 hover:text-veyra-gold transition">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {trending.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Fresh Drops</span>
            <h2 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl mt-1">New Arrivals</h2>
            <p className="mt-1 text-sm text-neutral-500">Fresh finds. New styles. New essentials.</p>
          </div>
          <Link href="/shop" className="text-sm font-bold text-neutral-900 hover:text-veyra-gold transition">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {arrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4-Step How It Works Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50/50 p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Simple Process</span>
            <h2 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl mt-1">How VEYRA Works</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Get anything from India or our local catalog delivered to your Nepal address in four straightforward steps.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Find Your Product",
                desc: "Browse VEYRA catalog or discover something on Amazon India, Flipkart, Myntra, or any marketplace."
              },
              {
                step: "02",
                title: "Send Us the Link",
                desc: "Paste the product link into the Request From India form along with your preferred size and color."
              },
              {
                step: "03",
                title: "Get Your Quote",
                desc: "VEYRA checks availability, international freight, customs and provides you with a clear NPR quotation."
              },
              {
                step: "04",
                title: "Confirm & Receive",
                desc: "Confirm your order, pay with eSewa, Khalti, or bank transfer, and receive your delivery anywhere in Nepal."
              }
            ].map((item) => (
              <article
                key={item.step}
                className="relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <span className="text-xs font-black tracking-widest text-veyra-gold">STEP {item.step}</span>
                <h3 className="mt-3 text-base font-bold text-neutral-900">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600">{item.desc}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/request-product"
              className="inline-block rounded-xl bg-black px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition"
            >
              Start Your Request →
            </Link>
          </div>
        </div>
      </section>

      {/* Found It. We'll Check It. — Link Verification Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-950 p-8 sm:p-14 shadow-modal">
          {/* Decorative gold glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-veyra-gold opacity-10 blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-center text-center gap-6">
            <div className="space-y-2">
              <span className="inline-block rounded-full border border-veyra-gold/40 bg-veyra-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-veyra-gold">
                India Product Checker
              </span>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                Found It.{" "}
                <span className="gold-text-gradient">We&apos;ll Check It.</span>
              </h2>
              <p className="mx-auto max-w-xl text-sm text-neutral-400 leading-relaxed">
                See something you want on Amazon India, Flipkart, Myntra, AJIO,
                Meesho, Nykaa or BigBasket? Just paste the link — we&apos;ll check
                whether VEYRA can source it and provide you with the estimated price.
              </p>
            </div>

            {/* Verification Widget */}
            <div className="w-full max-w-2xl">
              <LinkVerifier />
            </div>

            {/* Supported platform chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {supportedPlatforms.map((p) => (
                <span
                  key={p.id}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-neutral-400"
                >
                  {p.name}
                </span>
              ))}
            </div>

            <p className="text-[11px] text-neutral-600 max-w-md leading-relaxed">
              Product availability and final pricing are subject to verification.
              VEYRA is not officially affiliated with any of the above platforms.
            </p>
          </div>
        </div>
      </section>

      {/* Strong Final CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-12 text-center shadow-card">
          <h2 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-neutral-600">
            Send us the product link. We&apos;ll check it for you and provide an estimated quotation within hours.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/request-product"
              className="rounded-xl bg-black px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition"
            >
              REQUEST A PRODUCT
            </Link>
            <Link
              href="/shop"
              className="rounded-xl border-2 border-black bg-white px-7 py-3.5 text-sm font-bold text-black hover:bg-black hover:text-white transition"
            >
              SHOP VEYRA
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
