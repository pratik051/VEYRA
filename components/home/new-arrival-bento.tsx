"use client";

import Link from "next/link";
import Image from "next/image";

export function NewArrivalBento() {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-black tracking-wider uppercase">
          ✨ Fresh Drops
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
          New Arrivals &amp; Showcases
        </h2>
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 min-h-[560px]">
        {/* Box 1: PlayStation / Flagship Gaming */}
        <div className="lg:col-span-2 lg:row-span-2 relative overflow-hidden rounded-3xl bg-neutral-950 text-white p-6 sm:p-10 flex flex-col justify-end group shadow-md min-h-[340px] lg:min-h-[540px] border border-neutral-800">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80"
              alt="PlayStation 5 and Next-Gen Gaming"
              fill
              className="object-cover object-center opacity-70 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 space-y-3 max-w-sm">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
              Console &amp; Gaming
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white">PlayStation 5 &amp; Tech</h3>
            <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2">
              Black and White edition consoles and ultra-fast next-gen gaming accessories sourced directly to Nepal.
            </p>
            <Link
              href="/shop?category=Tech+%26+Gadgets"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 transition duration-200"
            >
              <span>Shop Console</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Box 2: Women's Collections / Streetwear */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 flex flex-col justify-end group shadow-md min-h-[250px] border border-neutral-800">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80"
              alt="Women's Curated Collections"
              fill
              className="object-cover object-center opacity-65 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>

          <div className="relative z-10 space-y-2 max-w-sm">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/30 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-rose-300">
              Apparel &amp; Style
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-black text-white">Women&apos;s Collections</h3>
            <p className="text-xs text-neutral-300 line-clamp-2">
              Featured daily wear, luxury accessories and modern streetwear drops.
            </p>
            <Link
              href="/shop?category=Fashion"
              className="inline-flex items-center gap-1 text-xs font-bold text-white underline underline-offset-4 hover:text-amber-300 transition"
            >
              <span>Browse Outfits</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Box 3: Speakers & Acoustic Audio */}
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 flex flex-col justify-end group shadow-md min-h-[240px] border border-neutral-800">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80"
              alt="Amazon & Wireless Speakers"
              fill
              className="object-cover object-center opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>

          <div className="relative z-10 space-y-1">
            <h3 className="font-display text-lg font-black text-white">Smart Audio</h3>
            <p className="text-[11px] text-neutral-300 line-clamp-2">Amazon wireless speakers &amp; 360 subs.</p>
            <Link
              href="/shop?category=Tech+%26+Gadgets"
              className="inline-block pt-1 text-xs font-bold text-white underline underline-offset-4 hover:text-amber-300 transition"
            >
              Shop Audio →
            </Link>
          </div>
        </div>

        {/* Box 4: Fragrance & Grooming */}
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 flex flex-col justify-end group shadow-md min-h-[240px] border border-neutral-800">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80"
              alt="Luxury Perfume & Grooming"
              fill
              className="object-cover object-center opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>

          <div className="relative z-10 space-y-1">
            <h3 className="font-display text-lg font-black text-white">Perfume &amp; Beauty</h3>
            <p className="text-[11px] text-neutral-300 line-clamp-2">GUCCI INTENSE OUD EDP &amp; wellness gear.</p>
            <Link
              href="/shop?category=Beauty+%26+Lifestyle"
              className="inline-block pt-1 text-xs font-bold text-white underline underline-offset-4 hover:text-amber-300 transition"
            >
              Shop Scents →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
