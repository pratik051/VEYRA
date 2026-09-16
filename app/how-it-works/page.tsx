import Link from "next/link";
import { supportedPlatforms } from "@/lib/data";

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      title: "Find Your Product",
      desc: "Browse products listed on SAJILOMARTS or explore external Indian marketplaces like Amazon India, Flipkart, Myntra, Meesho, Ajio, or Tata CLiQ.",
      detail: "Simply copy the product link / URL from your browser or shopping app."
    },
    {
      number: "02",
      title: "Send Us the Link",
      desc: "Paste the URL into our Request From India form along with your preferred size, color, quantity and Nepal delivery location.",
      detail: "No upfront fee is required to submit a product request and receive a quotation."
    },
    {
      number: "03",
      title: "Get Your Quote",
      desc: "SAJILOMARTS logistics team verifies seller authenticity, checks weight and computes international shipping, customs, and domestic delivery into a transparent all-inclusive NPR quotation.",
      detail: "Review the quote directly in your account or via WhatsApp/Email."
    },
    {
      number: "04",
      title: "Confirm & Receive",
      desc: "Once you approve the quotation and pay via eSewa, Khalti, or Bank Transfer, SAJILOMARTS procures the item, handles customs clearance, and delivers it right to your doorstep anywhere in Nepal.",
      detail: "Track the shipment milestone by milestone until delivered."
    }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-veyra-gold font-bold">Process Walkthrough</span>
        <h1 className="text-3xl font-extrabold text-neutral-900 sm:text-5xl">How SAJILOMARTS Works</h1>
        <p className="text-xs sm:text-sm leading-relaxed text-neutral-600">
          We simplify cross-border shopping and lifestyle product discovery for customers throughout Nepal. Here is how your orders and custom requests are handled from start to finish.
        </p>
      </div>

      {/* 4 Main Steps Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {steps.map((s) => (
          <article
            key={s.number}
            className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-veyra-gold font-mono">STEP {s.number}</span>
              <span className="h-2 w-2 rounded-full bg-black"></span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900">{s.title}</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-600">{s.desc}</p>
            <div className="rounded-xl bg-neutral-50 p-3 text-[11px] font-medium text-neutral-500">
              💡 {s.detail}
            </div>
          </article>
        ))}
      </div>

      {/* Sourcing Cost Breakdown Explanation */}
      <div className="rounded-3xl border border-neutral-200 bg-neutral-950 p-8 sm:p-12 text-white shadow-2xl space-y-6">
        <span className="text-xs font-bold uppercase tracking-wider text-veyra-gold">Transparent Quotation Model</span>
        <h2 className="text-2xl sm:text-3xl font-bold">How Sourced Item Pricing Works</h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
          When you request an item from India, there are no hidden customs surprises. We calculate everything upfront in your quotation:
        </p>

        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
            <strong className="text-white block mb-1">1. Product Price (INR to NPR)</strong>
            <p className="text-neutral-400">Converted at standard official exchange rates.</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
            <strong className="text-white block mb-1">2. Cross-Border Freight &amp; Customs</strong>
            <p className="text-neutral-400">All India-to-Nepal shipping and statutory taxes included.</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
            <strong className="text-white block mb-1">3. Nepal Doorstep Delivery</strong>
            <p className="text-neutral-400">Handled by local delivery partners directly to your address.</p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/request-product"
            className="inline-block rounded-xl bg-veyra-gold px-7 py-3.5 text-xs font-bold text-black shadow-gold hover:bg-veyra-gold-light transition"
          >
            Start Your Product Request →
          </Link>
        </div>
      </div>

      {/* Supported Marketplaces */}
      <div className="space-y-6 text-center">
        <h2 className="text-xl font-bold text-neutral-900">Supported Online Sourcing Platforms</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {supportedPlatforms.map((p) => (
            <div key={p.name} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm text-left max-w-[200px]">
              <span className="rounded-full bg-black px-2 py-0.5 text-[9px] font-bold text-white uppercase">{p.badge}</span>
              <h4 className="mt-2 text-sm font-bold text-neutral-900">{p.name}</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
