"use client";

import { useState } from "react";
import Link from "next/link";

const faqGroups = [
  {
    category: "India Sourcing & Marketplace Requests",
    items: [
      {
        q: "Can I order products from Amazon India?",
        a: "Yes. Customers in Nepal can send any Amazon India (amazon.in) product URL. VEYRA will verify availability, calculate cross-border freight and customs charges, and provide an all-inclusive NPR quotation."
      },
      {
        q: "Can I order products from Flipkart?",
        a: "Yes, you can request items from Flipkart (flipkart.com). We will review the seller rating, shipping logistics, and provide you with a transparent quote."
      },
      {
        q: "Can I order from Myntra?",
        a: "Yes. Myntra fashion apparel, footwear, and accessories can be requested through our Request From India form."
      },
      {
        q: "Can I order from Meesho?",
        a: "Yes. You can paste any Meesho product link for review and price estimation."
      },
      {
        q: "Can I request products that are not listed on VEYRA?",
        a: "Absolutely. The primary purpose of our 'Request From India' feature is to help you buy any legal wearable, gadget, or lifestyle product that is not currently listed in our store."
      },
      {
        q: "How is the final price calculated for India marketplace products?",
        a: "The final doorstep price in NPR consists of: the Indian marketplace product price converted at standard exchange rate + international logistics/freight + applicable Nepal customs/taxes + handling fee + Nepal domestic delivery fee. We provide an itemized breakdown before you pay."
      }
    ]
  },
  {
    category: "Delivery, Payments & Cancellations",
    items: [
      {
        q: "How long does delivery take in Nepal?",
        a: "For in-stock VEYRA catalog products: Kathmandu Valley takes 1-2 business days; other Nepal cities take 2-4 days. For custom India-sourced orders: typical delivery is 5-10 business days depending on cross-border logistics and customs clearance."
      },
      {
        q: "What payment methods are supported?",
        a: "We support eSewa, Khalti, Direct Bank Transfer / Fonepay QR, and Cash on Delivery (COD) for eligible locations."
      },
      {
        q: "Can I cancel my order?",
        a: "You can cancel standard in-stock orders anytime before dispatch. For custom India-sourced items, cancellations are accepted before the product is purchased from the external supplier."
      },
      {
        q: "Do products have a warranty?",
        a: "In-stock electronics and tech accessories carry a 6-month VEYRA verified supplier warranty against manufacturing defects. For third-party marketplace requests, warranty terms follow the original manufacturer/brand policy."
      }
    ]
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<string>("0-0");

  const toggle = (id: string) => {
    setOpenIndex((prev) => (prev === id ? "" : id));
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a
        }
      }))
    )
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-veyra-gold font-bold">Help Center</span>
        <h1 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">Frequently Asked Questions</h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Everything you need to know about shopping with VEYRA and ordering items from India.
        </p>
      </div>

      {/* FAQ Groups */}
      <div className="space-y-10">
        {faqGroups.map((group, gIdx) => (
          <div key={group.category} className="space-y-4">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-200 pb-2">
              {group.category}
            </h2>

            <div className="space-y-3">
              {group.items.map((item, iIdx) => {
                const id = `${gIdx}-${iIdx}`;
                const isOpen = openIndex === id;
                return (
                  <div
                    key={item.q}
                    className="rounded-2xl border border-neutral-200 bg-white transition shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggle(id)}
                      className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-neutral-900 hover:text-veyra-gold transition"
                    >
                      <span>{item.q}</span>
                      <span className="ml-4 text-base font-normal text-neutral-400">{isOpen ? "−" : "+"}</span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-neutral-100 bg-neutral-50/50 p-5 text-xs leading-relaxed text-neutral-600 animate-fade-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions banner */}
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50/80 p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-neutral-900">Still have a question not answered here?</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Our Kathmandu customer support team is available on WhatsApp and email to assist you.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/contact"
            className="rounded-xl bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-neutral-800"
          >
            Contact Customer Support
          </Link>
          <a
            href="https://wa.me/9779800000000"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-emerald-500 bg-emerald-50 px-6 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
