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
    <div className="space-y-20 sm:space-y-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Ambient glow orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-veyra-gold/[0.07] blur-[120px] animate-orb-float" />
        <div className="pointer-events-none absolute top-20 right-1/4 h-[350px] w-[350px] rounded-full bg-veyra-gold/[0.05] blur-[100px] animate-orb-float" style={{ animationDelay: "3s" }} />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:py-28 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            {/* Left Copy */}
            <div className="space-y-7 lg:col-span-7 animate-rise">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-veyra-gold/25 bg-veyra-gold/10 px-4 py-2 text-xs font-bold text-veyra-gold tracking-wide">
                <span className="flex h-2 w-2 rounded-full bg-veyra-gold shadow-[0_0_0_4px_rgba(201,168,76,0.2)] animate-pulse" />
                Nepal&apos;s Modern Shopping &amp; India Import Concierge
              </div>

              <h1 className="font-display text-5xl font-black tracking-tight text-veyra-text-dark sm:text-7xl lg:leading-[1.05]">
                Everything
                <br />
                You Want.{" "}
                <br />
                <span className="gold-text-gradient">One Place.</span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-veyra-muted/80 sm:text-lg">
                Fashion, accessories, tech and everyday essentials — discover products from India and get them delivered anywhere in Nepal.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  href="/shop"
                  className="shimmer-gold rounded-xl bg-veyra-gold px-8 py-4 text-sm font-black tracking-wide text-black shadow-gold-glow transition-all duration-300 hover:bg-veyra-gold-light hover:shadow-gold-glow-lg hover:-translate-y-0.5"
                >
                  Shop Now
                </Link>
                <Link
                  href="/request-product"
                  className="flex items-center gap-2 rounded-xl border border-black/10 bg-black/[0.03] px-7 py-4 text-sm font-bold text-veyra-text-dark transition-all duration-300 hover:border-veyra-gold/40 hover:bg-black/[0.05] hover:-translate-y-0.5"
                >
                  <span>Request From India</span>
                  <span className="text-veyra-gold">→</span>
                </Link>
              </div>

              {/* Trust Stats */}
              <div className="grid grid-cols-3 gap-4 border-t border-black/[0.06] pt-7">
                {[
                  { value: "1,000+", label: "Curated & Sourced Items" },
                  { value: "7 Provinces", label: "Nationwide Nepal Delivery" },
                  { value: "100% Verified", label: "Clear Cost Estimations" }
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-lg font-black text-veyra-text-dark">{stat.value}</p>
                    <p className="text-[11px] text-veyra-muted font-medium mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Visual */}
            <div className="relative lg:col-span-5 animate-fade-in">
              <div className="relative mx-auto max-w-md">
                {/* Gold glow ring */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-veyra-gold/20 to-transparent blur-xl" />

                <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-white p-1.5 shadow-modal">
                  <Image
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
                    alt="VEYRA Curated Products Lifestyle"
                    width={900}
                    height={1000}
                    className="h-[440px] w-full rounded-2xl object-cover"
                    priority
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-1.5 rounded-2xl bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Floating badges */}
                  <div className="absolute top-5 left-5 rounded-2xl border border-white/10 bg-black/50 p-3.5 text-white backdrop-blur-md shadow-modal">
                    <p className="text-[10px] font-black tracking-widest uppercase text-veyra-gold mb-1">Direct Indian Marketplaces</p>
                    <p className="text-xs font-semibold text-white/80">Amazon • Flipkart • Myntra</p>
                  </div>

                  <div className="absolute bottom-5 right-5 rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.2)]" />
                      <p className="text-xs font-bold text-white">Fast Nepal Sourcing</p>
                    </div>
                    <p className="text-[11px] text-white/80 mt-0.5">Express Doorstep Shipping</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE CARDS ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((card, i) => (
            <article
              key={card.title}
              className={`group glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-veyra-gold/20 hover:shadow-card-hover stagger-${i + 1}`}
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-veyra-gold/10 text-xl border border-veyra-gold/20 transition-all duration-300 group-hover:bg-veyra-gold/20 group-hover:shadow-gold">
                {card.icon}
              </div>
              <h3 className="font-display text-sm font-bold text-veyra-text-dark group-hover:text-veyra-gold-dark transition-colors duration-200">
                {card.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-veyra-muted">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section id="categories" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-veyra-gold">
              <span className="h-px w-6 bg-veyra-gold" />
              Explore Collection
            </span>
            <h2 className="font-display text-3xl font-black text-veyra-text-dark sm:text-4xl mt-2">Shop by Category</h2>
            <p className="mt-1.5 text-sm text-veyra-muted">Discover handpicked essentials across every lifestyle category.</p>
          </div>
          <Link
            href="/shop"
            className="mt-3 sm:mt-0 text-sm font-bold text-veyra-gold hover:text-veyra-gold-light transition inline-flex items-center gap-1.5"
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
              className="group relative overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover hover:border-veyra-gold/20"
            >
              <div className="relative h-52 w-full overflow-hidden bg-veyra-surface">
                <Image
                  src={`${cat.image}?auto=format&fit=crop&w=800&q=80`}
                  alt={cat.name}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-display text-lg font-bold text-white drop-shadow-sm">{cat.name}</h3>
                  <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{cat.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-white">
                <span className="text-xs font-semibold text-veyra-muted">{cat.itemCount || 20}+ items</span>
                <span className="text-xs font-bold text-veyra-gold group-hover:text-veyra-gold-dark transition inline-flex items-center gap-1">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-veyra-gold">
              <span className="h-px w-6 bg-veyra-gold" />
              Handpicked
            </span>
            <h2 className="font-display text-3xl font-black text-veyra-text-dark sm:text-4xl mt-2">Featured Products</h2>
            <p className="mt-1.5 text-sm text-veyra-muted">Popular picks selected for quality, durability &amp; value.</p>
          </div>
          <Link href="/shop" className="text-sm font-bold text-veyra-gold hover:text-veyra-gold-light transition inline-flex items-center gap-1">
            See More →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── INDIA BANNER ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-black/[0.04] bg-white p-8 sm:p-14 shadow-modal">
          {/* Gold orb accents */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-veyra-gold/10 blur-[80px]" />
          <div className="pointer-events-none absolute -left-32 -bottom-32 h-80 w-80 rounded-full bg-veyra-gold/[0.07] blur-[80px]" />

          {/* Gold top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, #C9A84C 40%, #E8C97A 60%, transparent 100%)" }} />

          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-block rounded-full border border-veyra-gold/30 bg-veyra-gold/10 px-4 py-1.5 text-xs font-black tracking-widest uppercase text-veyra-gold">
              🌟 Direct Marketplace Sourcing
            </span>

            <h2 className="font-display text-4xl font-black tracking-tight text-veyra-text-dark sm:text-5xl lg:text-6xl">
              Found It In India?{" "}
              <br />
              <span className="gold-text-gradient">We&apos;ll Get It.</span>
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-veyra-muted">
              Found something you love on Amazon India, Flipkart, Myntra, Meesho, Ajio or another Indian marketplace? Send us the product link and we&apos;ll check availability and provide you with an estimated quotation.
            </p>

            {/* Platform chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {supportedPlatforms.map((p) => (
                <span
                  key={p.name}
                  className="rounded-full border border-black/10 bg-black/[0.03] px-3.5 py-1.5 text-xs font-semibold text-veyra-muted hover:border-veyra-gold/30 hover:text-veyra-gold-dark transition-all duration-200"
                >
                  {p.name}
                </span>
              ))}
              <span className="rounded-full border border-black/10 bg-black/[0.03] px-3.5 py-1.5 text-xs font-semibold text-veyra-muted">
                + Any Other Store
              </span>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/request-product"
                className="shimmer-gold rounded-xl bg-veyra-gold px-8 py-4 text-sm font-black text-black shadow-gold-glow hover:bg-veyra-gold-light hover:shadow-gold-glow-lg transition-all duration-200"
              >
                Request a Product
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-xl border border-black/15 bg-black/[0.03] px-7 py-4 text-sm font-semibold text-veyra-text hover:border-veyra-gold/30 hover:bg-black/[0.05] transition-all duration-200"
              >
                How It Works
              </Link>
            </div>

            <p className="text-[11px] text-veyra-muted/60 pt-1">
              * VEYRA operates as an independent concierge and sourcing facilitator to make cross-border discovery simple and safe for customers in Nepal.
            </p>
          </div>
        </div>
      </section>

      {/* ─── TRENDING NOW ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-veyra-gold">
              <span className="h-px w-6 bg-veyra-gold" />
              Trending Now
            </span>
            <h2 className="font-display text-3xl font-black text-veyra-text-dark sm:text-4xl mt-2">Most Popular This Week</h2>
            <p className="mt-1.5 text-sm text-veyra-muted">Items experiencing high demand and verified 5-star customer reviews.</p>
          </div>
          <Link href="/shop" className="text-sm font-bold text-veyra-gold hover:text-veyra-gold-light transition inline-flex items-center gap-1">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {trending.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── NEW ARRIVALS ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-veyra-gold">
              <span className="h-px w-6 bg-veyra-gold" />
              Fresh Drops
            </span>
            <h2 className="font-display text-3xl font-black text-veyra-text-dark sm:text-4xl mt-2">New Arrivals</h2>
            <p className="mt-1.5 text-sm text-veyra-muted">Fresh finds. New styles. New essentials.</p>
          </div>
          <Link href="/shop" className="text-sm font-bold text-veyra-gold hover:text-veyra-gold-light transition inline-flex items-center gap-1">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {arrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-black/[0.04] bg-white p-8 sm:p-14">
          {/* Background accent */}
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-veyra-gold/[0.06] blur-[80px]" />

          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-veyra-gold">
              <span className="h-px w-6 bg-veyra-gold" />
              Simple Process
              <span className="h-px w-6 bg-veyra-gold" />
            </span>
            <h2 className="font-display text-3xl font-black text-veyra-text-dark sm:text-4xl mt-3">How VEYRA Works</h2>
            <p className="mt-2.5 text-sm text-veyra-muted leading-relaxed">
              Get anything from India or our local catalog delivered to your Nepal address in four straightforward steps.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            ].map((item, i) => (
              <article
                key={item.step}
                className={`group relative rounded-2xl border border-black/[0.04] bg-veyra-surface p-6 transition-all duration-300 hover:border-veyra-gold/20 hover:-translate-y-1 stagger-${i + 1}`}
              >
                <span className="font-display text-4xl font-black text-veyra-gold/30 group-hover:text-veyra-gold transition-colors duration-300">
                  {item.step}
                </span>
                <h3 className="mt-3 font-display text-sm font-bold text-veyra-text-dark">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-veyra-muted">{item.desc}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/request-product"
              className="shimmer-gold inline-block rounded-xl bg-veyra-gold px-8 py-4 text-sm font-black text-black shadow-gold-glow hover:bg-veyra-gold-light hover:shadow-gold-glow-lg transition-all duration-200"
            >
              Start Your Request →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LINK VERIFIER ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-black/[0.04] bg-white p-8 sm:p-14 shadow-modal">
          {/* Gold glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-52 w-[600px] rounded-full bg-veyra-gold opacity-[0.08] blur-[80px]"
          />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, #C9A84C 30%, #E8C97A 50%, transparent 100%)" }} />

          <div className="relative z-10 flex flex-col items-center text-center gap-7">
            <div className="space-y-3">
              <span className="inline-block rounded-full border border-veyra-gold/30 bg-veyra-gold/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-veyra-gold">
                India Product Checker
              </span>
              <h2 className="font-display text-4xl font-black text-veyra-text-dark sm:text-5xl lg:text-6xl">
                Found It.{" "}
                <span className="gold-text-gradient">We&apos;ll Check It.</span>
              </h2>
              <p className="mx-auto max-w-xl text-sm text-veyra-muted leading-relaxed">
                See something you want on Amazon India, Flipkart, Myntra, AJIO,
                Meesho, Nykaa or BigBasket? Just paste the link — we&apos;ll check
                whether VEYRA can source it and provide you with the estimated price.
              </p>
            </div>

            {/* Verification Widget */}
            <div className="w-full max-w-2xl">
              <LinkVerifier />
            </div>

            {/* Platform chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {supportedPlatforms.map((p) => (
                <span
                  key={p.id}
                  className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[11px] font-semibold text-veyra-muted hover:border-veyra-gold/30 hover:text-veyra-gold-dark transition-all duration-200"
                >
                  {p.name}
                </span>
              ))}
            </div>

            <p className="text-[11px] text-veyra-muted/80 max-w-md leading-relaxed">
              Product availability and final pricing are subject to verification.
              VEYRA is not officially affiliated with any of the above platforms.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-veyra-gold/20 bg-white p-10 sm:p-16 text-center shadow-gold-glow">
          {/* Large gold orb */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[400px] w-[400px] rounded-full bg-veyra-gold/[0.06] blur-[100px]" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, #C9A84C 50%, transparent 100%)" }} />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-veyra-gold mb-4">
              <span className="h-px w-5 bg-veyra-gold" />
              Still Looking?
              <span className="h-px w-5 bg-veyra-gold" />
            </span>
            <h2 className="font-display text-4xl font-black text-veyra-text-dark sm:text-5xl">
              Can&apos;t Find What You&apos;re Looking For?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-veyra-muted leading-relaxed">
              Send us the product link. We&apos;ll check it for you and provide an estimated quotation within hours.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/request-product"
                className="shimmer-gold rounded-xl bg-veyra-gold px-8 py-4 text-sm font-black text-black shadow-gold-glow hover:bg-veyra-gold-light hover:shadow-gold-glow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                REQUEST A PRODUCT
              </Link>
              <Link
                href="/shop"
                className="rounded-xl border border-black/15 bg-black/[0.03] px-8 py-4 text-sm font-bold text-veyra-text-dark hover:border-veyra-gold/30 hover:bg-black/[0.06] transition-all duration-300 hover:-translate-y-0.5"
              >
                SHOP VEYRA
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
