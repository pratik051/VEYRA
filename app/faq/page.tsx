const faqs = [
  ["Can I order products from Amazon India?", "Yes. Customers can send the product link and VEYRA can check availability and estimated pricing."],
  ["Can I order from Flipkart?", "Yes, if the product can be sourced and delivered through VEYRA's process."],
  ["Can I order from Myntra?", "Customers can submit the product link for review."],
  ["Can I order from Meesho?", "Customers can submit the product link for review."],
  ["Can I request products that are not listed on VEYRA?", "Yes. Use the Request From India feature."],
  ["How long does delivery take?", "Delivery range is estimated by admin settings, sourcing status and destination."],
  ["Can I cancel my order?", "Cancellation policy depends on order stage and published admin policy settings."],
  ["Do products have warranty?", "Warranty depends on the individual product and supplier terms."]
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">FAQ</h1>
      <div className="mt-6 space-y-3">
        {faqs.map(([q, a]) => (
          <article key={q} className="rounded-2xl border border-neutral-200 p-5">
            <h2 className="font-semibold">{q}</h2>
            <p className="mt-2 text-sm text-neutral-600">{a}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
