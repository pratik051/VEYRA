import Link from "next/link";

interface PolicySection {
  heading: string;
  content: string;
}

interface PolicyTemplateProps {
  title: string;
  lastUpdated?: string;
  summary: string;
  sections: PolicySection[];
}

export function PolicyTemplate({ title, lastUpdated = "August 2026", summary, sections }: PolicyTemplateProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Legal &amp; Policy</span>
        <h1 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">{title}</h1>
        <p className="text-xs text-neutral-500">Last updated: {lastUpdated} • LINKOVA Retail Nepal</p>
      </div>

      {/* Summary Box */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5 text-xs sm:text-sm leading-relaxed text-neutral-700 font-medium">
        {summary}
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={sec.heading} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900">
              {idx + 1}. {sec.heading}
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 whitespace-pre-line">
              {sec.content}
            </p>
          </div>
        ))}
      </div>

      {/* Help links */}
      <div className="border-t border-neutral-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <span>Have questions about our terms?</span>
        <div className="flex gap-4 font-semibold text-neutral-900">
          <Link href="/contact" className="hover:text-linkova-gold transition">
            Contact Support →
          </Link>
          <Link href="/faq" className="hover:text-linkova-gold transition">
            View FAQ →
          </Link>
        </div>
      </div>
    </div>
  );
}
