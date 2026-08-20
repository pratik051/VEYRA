import Image from "next/image";
import Link from "next/link";
import { categories, products, supportedPlatforms } from "@/lib/data";
import { Section } from "@/components/ui/section";
import { ProductCard } from "@/components/ui/product-card";

const featureCards = [
  { title: "Wide Selection", body: "Discover fashion, accessories, tech and everyday essentials." },
  { title: "India-to-Nepal Ordering", body: "Request products available on Indian online marketplaces." },
  { title: "Product Verification", body: "We check product details and availability before confirming your order." },
  { title: "Nepal Delivery", body: "Get your ordered products delivered within Nepal." }
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
    url: "https://veyra.example"
  };

  return (
    <div className="pb-16 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
        <div className="space-y-6">
          <p className="inline-block rounded-full border border-veyra-gold/40 bg-veyra-gold/10 px-3 py-1 text-xs font-medium text-veyra-black">Premium Nepal Shopping Platform</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Everything You Want. One Place.</h1>
          <p className="max-w-xl text-neutral-600">Fashion, accessories, tech and everyday essentials — discover products from India and get them delivered in Nepal.</p>
          <div className="flex gap-3">
            <Link href="/shop" className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Shop Now</Link>
            <Link href="/request-product" className="rounded-xl border border-black px-5 py-3 text-sm font-semibold">Request From India</Link>
          </div>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-3 shadow-card">
          <Image src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80" alt="VEYRA premium products" width={1200} height={900} className="h-full min-h-[260px] w-full rounded-2xl object-cover" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {featureCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
            <h3 className="font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{card.body}</p>
          </article>
        ))}
      </section>

      <Section title="Explore Categories" subtitle="From fashion to gadgets, discover curated essentials." action={<Link href="/shop" className="text-sm font-medium text-veyra-gold">View All</Link>}>
        <div id="categories" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <article key={cat.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card">
              <Image src={`${cat.image}?auto=format&fit=crop&w=1000&q=80`} alt={cat.name} width={800} height={600} className="h-40 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold">{cat.name}</h3>
                <p className="mt-1 text-sm text-neutral-600">{cat.description}</p>
                <Link href="/shop" className="mt-3 inline-block text-sm font-medium text-veyra-gold">Explore</Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Featured Products" subtitle="Popular picks selected for VEYRA customers.">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </Section>

      <Section title="New Arrivals" subtitle="Fresh finds. New styles. New essentials." action={<Link href="/shop" className="text-sm font-medium text-veyra-gold">View All</Link>}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{arrivals.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </Section>

      <Section title="Trending Now" subtitle="Products our customers are buying the most right now.">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{trending.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </Section>

      <Section title="Found It In India? We'll Help You Get It." subtitle="Found something you love on Amazon India, Flipkart, Myntra, Meesho or another Indian marketplace? Send us the product link and we'll check it for you.">
        <div className="rounded-2xl border border-neutral-200 bg-black p-6 text-white">
          <p className="text-sm text-neutral-300">{supportedPlatforms.join(" | ")} | More</p>
          <Link href="/request-product" className="mt-4 inline-block rounded-xl bg-veyra-gold px-5 py-3 text-sm font-semibold text-black">Request a Product</Link>
        </div>
      </Section>

      <Section title="How It Works">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Find Your Product", "Browse VEYRA or find something on an Indian marketplace."],
            ["Send Us the Link", "Paste the product link into the Request From India form."],
            ["Get Your Quote", "VEYRA checks the product and provides estimated pricing and availability."],
            ["Confirm & Receive", "Confirm your order and receive it in Nepal."]
          ].map(([title, body], i) => (
            <article key={title} className="rounded-2xl border border-neutral-200 p-5">
              <p className="text-xs font-semibold text-veyra-gold">STEP {i + 1}</p>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{body}</p>
            </article>
          ))}
        </div>
        <Link href="/request-product" className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Start Your Request</Link>
      </Section>

      <Section title="Can't Find What You're Looking For?" subtitle="Send us the product link. We'll check it for you.">
        <div className="flex flex-wrap gap-3">
          <Link href="/request-product" className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">REQUEST A PRODUCT</Link>
          <Link href="/shop" className="rounded-xl border border-black px-5 py-3 text-sm font-semibold">SHOP VEYRA</Link>
        </div>
      </Section>
    </div>
  );
}
