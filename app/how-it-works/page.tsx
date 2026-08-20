import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">How VEYRA Works</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}
