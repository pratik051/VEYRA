"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

type ChatItem = {
  id: string;
  role: "user" | "model";
  text: string;
  time: string;
};

const INITIAL_GREETING: ChatItem = {
  id: "greeting",
  role: "model",
  text: "Namaste! 🙏 I am **SAJILOMARTS AI**, your personal sourcing assistant. I can help you calculate Nepal landed prices, explain how to order products from Indian marketplaces (Amazon India, Flipkart, Myntra, etc.), check delivery timelines across Nepal, and answer any questions! How can I assist you today?",
  time: "Just now"
};

const SUGGESTED_PROMPTS = [
  "💰 How is the NPR Landed Price calculated?",
  "📦 How do I order a product with a link?",
  "🚚 What are delivery times across Nepal?",
  "💳 Which payment methods are accepted?",
  "🇮🇳 Can I order from Amazon India & Flipkart?"
];

export function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([INITIAL_GREETING]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatItem = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== "greeting")
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const aiMsg: ChatItem = {
          id: `ai-${Date.now()}`,
          role: "model",
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (!isOpen) {
          setUnreadCount((c) => c + 1);
        }
      } else {
        const errorMsg: ChatItem = {
          id: `ai-err-${Date.now()}`,
          role: "model",
          text: "I encountered a momentary delay connecting to the AI service. Please try asking again or visit our [Request Product](/request-product) page!",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: ChatItem = {
        id: `ai-err-${Date.now()}`,
        role: "model",
        text: "Network connection error. Please check your internet connection and try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const clearChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  // Simple parser for basic markdown rendering (bold, links, bullet points)
  const renderFormattedText = (raw: string) => {
    const lines = raw.split("\n");
    return lines.map((line, idx) => {
      // Process bold **text**
      const parts = line.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
        }
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const [, linkText, linkUrl] = linkMatch;
          return (
            <Link
              key={pIdx}
              href={linkUrl}
              className="text-blue-600 hover:text-blue-800 underline font-bold"
            >
              {linkText}
            </Link>
          );
        }
        return part;
      });

      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-2 my-0.5">
            <span className="text-blue-600 font-bold">•</span>
            <span>{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={line.trim() === "" ? "h-2" : "my-0.5 leading-relaxed"}>
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* ─── FLOATING TOGGLE BUTTON ─── */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-slate-900/90 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-md border border-slate-800 cursor-pointer hover:bg-slate-900 transition-all hover:scale-105"
          >
            <span className="text-sm">✨</span>
            <span>Ask SAJILOMARTS AI</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group border-2 border-white/20"
          aria-label="Toggle AI Support Chat"
        >
          {isOpen ? (
            <span className="text-xl font-bold">✕</span>
          ) : (
            <div className="relative flex items-center justify-center">
              <span className="text-2xl animate-pulse">🤖</span>
              {/* Pulsing ring */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
              </span>
            </div>
          )}

          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-md">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── CHAT DRAWER / POPOVER ─── */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-22 sm:inset-auto sm:bottom-22 sm:right-5 z-50 w-auto sm:w-[420px] max-h-[82vh] h-[600px] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-white font-black text-lg shadow-inner">
                ✨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">SAJILOMARTS AI</h3>
                  <span className="bg-blue-500/30 text-cyan-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-cyan-400/30">
                    Gemini 3.6
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Sourcing Assistant</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition text-xs"
              >
                🔄
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                      isUser
                        ? "bg-blue-600 text-white rounded-br-xs font-medium"
                        : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
                    }`}
                  >
                    {isUser ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="text-slate-800 space-y-1">
                        {renderFormattedText(msg.text)}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 bg-white text-slate-500 border border-slate-200/80 rounded-2xl px-4 py-3 w-fit shadow-xs">
                <span className="text-xs font-bold text-slate-600">SAJILOMARTS AI is thinking</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="bg-slate-100/80 px-3 py-2 border-t border-slate-200/70 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-blue-700 transition shrink-0 cursor-pointer shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about India sourcing, pricing, delivery..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-40 transition shadow-sm cursor-pointer shrink-0"
              aria-label="Send message"
            >
              ➔
            </button>
          </form>
        </div>
      )}
    </>
  );
}
