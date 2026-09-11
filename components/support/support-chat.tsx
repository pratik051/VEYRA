"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatNpr } from "@/lib/utils";

type ProductCardData = {
  _id?: string;
  title: string;
  slug: string;
  images?: string[];
  image?: string;
  source: string;
  priceINR: number;
  originalPriceINR?: number;
  discountPercentage?: number;
  rating?: number;
  availability?: string;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isDeal?: boolean;
};

type OrderCardData = {
  orderId: string;
  date: string;
  productName: string;
  marketplace?: string;
  quantity: number;
  totalNPR: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  isIndiaOrder?: boolean;
  trackingUrl: string;
  invoiceUrl?: string;
};

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  products?: ProductCardData[];
  orders?: OrderCardData[];
  suggestions?: string[];
};

const welcomeMessage =
  "👋 Namaste! I’m your **LINKOVA Shopping & Sourcing Concierge**.\n\nI can help you explore verified products from Amazon India, Flipkart, Myntra, track your live orders, calculate landed prices in Nepal, and check availability.";

const quickActions = [
  { label: "🔥 Trending Now", query: "Show me trending products" },
  { label: "⭐ Best Sellers", query: "What are the best-selling items?" },
  { label: "🏷 Today's Deals", query: "Show me today's best deals" },
  { label: "📦 My Orders", query: "Where is my order?" },
  { label: "👟 Popular Shoes", query: "Find popular shoes" },
  { label: "🎧 Headphones < ₹2K", query: "Find headphones under ₹2,000" },
  { label: "💳 Payment Options", query: "What payment options are available?" },
  { label: "❓ How to Order", query: "How do I request a product from India?" }
];

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: welcomeMessage,
      suggestions: ["Show trending products", "Today's best deals", "Where is my order?"]
    }
  ]);
  const nextId = useRef(2);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, loading]);

  const getPageContext = () => {
    if (typeof window === "undefined") return undefined;
    const pathname = window.location.pathname;
    const match = pathname.match(/\/product\/([a-zA-Z0-9_-]+)/);
    const slug = match ? match[1] : undefined;
    return { pathname, slug };
  };

  const sendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    setMessage("");
    setMessages((current) => [...current, { id: nextId.current++, role: "user", text }]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.text }));
      const pageContext = getPageContext();

      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, pageContext })
      });

      const data = await response.json();

      if (!response.ok || !data.answer) {
        throw new Error(data.error ?? "Support assistant is momentarily busy.");
      }

      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "assistant",
          text: data.answer,
          products: data.products,
          orders: data.orders,
          suggestions: data.suggestions
        }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "I'm having trouble connecting to our catalog right now. Please try again in a moment."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: nextId.current++,
        role: "assistant",
        text: welcomeMessage,
        suggestions: ["Show trending products", "Today's best deals", "Where is my order?"]
      }
    ]);
    setMessage("");
  };

  const formatMarketplaceBadge = (source: string) => {
    switch (source) {
      case "amazon-india":
        return { label: "Amazon India", color: "bg-amber-100 text-amber-900 border-amber-300" };
      case "flipkart":
        return { label: "Flipkart", color: "bg-blue-100 text-blue-900 border-blue-300" };
      case "myntra":
        return { label: "Myntra", color: "bg-pink-100 text-pink-900 border-pink-300" };
      case "meesho":
        return { label: "Meesho", color: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300" };
      case "nykaa":
        return { label: "Nykaa", color: "bg-rose-100 text-rose-900 border-rose-300" };
      case "ajio":
        return { label: "AJIO", color: "bg-indigo-100 text-indigo-900 border-indigo-300" };
      case "tatacliq":
        return { label: "Tata CLiQ", color: "bg-purple-100 text-purple-900 border-purple-300" };
      case "croma":
        return { label: "Croma", color: "bg-teal-100 text-teal-900 border-teal-300" };
      case "boat":
        return { label: "boAt", color: "bg-red-100 text-red-900 border-red-300" };
      case "noise":
        return { label: "Noise", color: "bg-neutral-200 text-neutral-900 border-neutral-300" };
      default:
        return { label: "Indian Marketplace", color: "bg-neutral-100 text-neutral-800 border-neutral-300" };
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50">
      {open && (
        <section
          aria-label="LINKOVA Customer Shopping & Order Assistant"
          className="mb-2 flex h-[min(36rem,calc(100dvh-9.5rem))] w-[min(26rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-neutral-950 px-4 sm:px-5 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-red-600 text-sm font-black shadow-inner">
                ✨
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-neutral-950 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-black tracking-wide">LINKOVA AI Concierge</p>
                <p className="text-[10px] text-neutral-300 font-medium">Live Database &amp; Order Support</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetChat}
                className="rounded-lg px-2 py-1 text-[11px] font-semibold text-neutral-300 hover:bg-white/10 hover:text-white transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-full p-1 text-lg leading-none text-neutral-300 hover:bg-white/10 hover:text-white transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="border-b border-neutral-100 bg-neutral-50 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                disabled={loading}
                onClick={() => void sendMessage(action.query)}
                className="shrink-0 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-bold text-neutral-700 hover:border-black hover:text-black transition shadow-2xs"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-[#F8FAFC] p-4 text-xs leading-relaxed" aria-live="polite">
            {messages.map((item) => (
              <div key={item.id} className={`flex flex-col ${item.role === "user" ? "items-end" : "items-start"}`}>
                {/* Text Bubble */}
                <div
                  className={`max-w-[90%] whitespace-pre-line rounded-2xl px-4 py-3 shadow-xs ${
                    item.role === "user"
                      ? "rounded-br-xs bg-neutral-950 text-white font-medium"
                      : "rounded-bl-xs border border-neutral-200 bg-white text-neutral-800"
                  }`}
                >
                  {item.text}
                </div>

                {/* In-Chat Product Cards Grid */}
                {item.products && item.products.length > 0 && (
                  <div className="mt-2.5 w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {item.products.map((prod) => {
                      const img = prod.images?.[0] || prod.image || "";
                      const badge = formatMarketplaceBadge(prod.source);
                      return (
                        <div
                          key={prod.slug || prod._id || prod.title}
                          className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-3 shadow-xs hover:border-neutral-400 transition"
                        >
                          <div className="space-y-2">
                            {/* Product Image */}
                            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-neutral-50">
                              {img ? (
                                <Image
                                  src={img}
                                  alt={prod.title}
                                  fill
                                  sizes="180px"
                                  className="object-contain p-2"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                                  No Image
                                </div>
                              )}
                              <span
                                className={`absolute top-2 left-2 rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold ${badge.color}`}
                              >
                                {badge.label}
                              </span>
                            </div>

                            {/* Title & Info */}
                            <div>
                              <p className="font-extrabold text-neutral-900 line-clamp-2 text-[11px] leading-tight">
                                {prod.title}
                              </p>
                              <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="font-black text-xs text-neutral-900">
                                  ₹{prod.priceINR.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-emerald-600 font-bold">
                                  ✓ In Stock
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <Link
                            href={`/product/${prod.slug}`}
                            onClick={() => setOpen(false)}
                            className="mt-2.5 block w-full rounded-xl bg-neutral-950 py-1.5 text-center text-[11px] font-bold text-white hover:bg-neutral-800 transition"
                          >
                            View Product ↗
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* In-Chat Order Cards */}
                {item.orders && item.orders.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2">
                    {item.orders.map((ord) => (
                      <div
                        key={ord.orderId}
                        className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                          <span className="font-mono font-black text-xs text-neutral-900">{ord.orderId}</span>
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900">
                            {ord.orderStatus}
                          </span>
                        </div>
                        <div className="space-y-1 text-[11px] text-neutral-600">
                          <p className="font-bold text-neutral-800 line-clamp-1">{ord.productName}</p>
                          <div className="flex justify-between">
                            <span>Amount: <strong>{formatNpr(ord.totalNPR)}</strong></span>
                            <span>{ord.date}</span>
                          </div>
                        </div>
                        <div className="pt-1.5 flex items-center gap-2">
                          <Link
                            href={ord.trackingUrl}
                            onClick={() => setOpen(false)}
                            className="flex-1 rounded-xl bg-neutral-950 py-1.5 text-center text-[10px] font-bold text-white hover:bg-neutral-800"
                          >
                            Track Live Order →
                          </Link>
                          {ord.invoiceUrl && (
                            <a
                              href={ord.invoiceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-neutral-300 px-2.5 py-1.5 text-center text-[10px] font-bold text-neutral-700 hover:bg-neutral-50"
                            >
                              Invoice 🖨️
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Follow-up Suggestions */}
                {item.suggestions && item.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.suggestions.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        disabled={loading}
                        onClick={() => void sendMessage(sug)}
                        className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-neutral-600 hover:border-neutral-950 hover:text-neutral-950 disabled:opacity-50 transition"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs border border-neutral-200 bg-white px-4 py-2.5 text-xs text-neutral-500 w-fit">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <span>Checking LINKOVA live database…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="border-t border-neutral-200 bg-white p-3">
            <form
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                void sendMessage(message);
              }}
              className="flex gap-2"
            >
              <label htmlFor="support-message" className="sr-only">
                Ask LINKOVA AI Concierge
              </label>
              <input
                id="support-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={500}
                placeholder="Ask about products, orders, pricing..."
                className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium outline-none focus:border-neutral-950 transition"
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="rounded-xl bg-neutral-950 px-4 text-xs font-bold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 transition"
              >
                Send
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Floating Trigger Bubble */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close customer support chat" : "Open customer support chat"}
        className="ml-auto flex items-center gap-2.5 rounded-full bg-neutral-950 px-4 py-3 text-xs font-extrabold text-white shadow-2xl transition hover:-translate-y-0.5 hover:bg-neutral-800 group"
      >
        <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-red-500 text-xs">
          ✨
        </div>
        <span>{open ? "Close Concierge" : "AI Shopping Help"}</span>
      </button>
    </div>
  );
}
