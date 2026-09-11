"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

const welcomeMessage =
  "Hi! I’m LINKOVA Support. Ask me about delivery, payments, returns, or ordering from India.";

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: "assistant", text: welcomeMessage }]);
  const nextId = useRef(2);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    setMessage("");
    setMessages((current) => [...current, { id: nextId.current++, role: "user", text }]);
    setLoading(true);

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = (await response.json()) as { answer?: string; suggestions?: string[]; error?: string };

      if (!response.ok || !data.answer) {
        throw new Error(data.error ?? "Support is temporarily unavailable.");
      }

      const suggestionText = data.suggestions?.length ? `\n\nTry asking: ${data.suggestions.join(" • ")}` : "";
      setMessages((current) => [
        ...current,
        { id: nextId.current++, role: "assistant", text: `${data.answer}${suggestionText}` }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "assistant",
          text: error instanceof Error ? error.message : "Support is temporarily unavailable. Please contact our team."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([{ id: nextId.current++, role: "assistant", text: welcomeMessage }]);
    setMessage("");
  };

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label="LINKOVA customer support chat"
          className="mb-3 flex h-[min(32rem,calc(100vh-7rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between bg-neutral-950 px-5 py-4 text-white">
            <div>
              <p className="text-sm font-bold">LINKOVA Support</p>
              <p className="mt-0.5 text-[11px] text-neutral-300">Usually replies instantly</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetChat}
                className="rounded-lg px-2 py-1 text-[11px] text-neutral-300 hover:bg-white/10 hover:text-white"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close support chat"
                className="rounded-full px-2 text-lg leading-none text-neutral-300 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4" aria-live="polite">
            {messages.map((item) => (
              <div key={item.id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    item.role === "user"
                      ? "rounded-br-md bg-neutral-950 text-white"
                      : "rounded-bl-md border border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  {item.text}
                </p>
              </div>
            ))}
            {loading && (
              <p className="w-fit rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-3.5 py-2.5 text-xs text-neutral-400">
                Typing…
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-neutral-200 bg-white p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {["Delivery times", "Payment methods", "Order from India"].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={loading}
                  onClick={() => void sendMessage(suggestion)}
                  className="shrink-0 rounded-full border border-neutral-200 px-2.5 py-1 text-[10px] font-semibold text-neutral-600 hover:border-neutral-950 hover:text-neutral-950 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                void sendMessage(message);
              }}
              className="flex gap-2"
            >
              <label htmlFor="support-message" className="sr-only">
                Message LINKOVA Support
              </label>
              <input
                id="support-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={500}
                placeholder="Ask a question..."
                className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-3 py-2.5 text-xs outline-none focus:border-neutral-950"
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="rounded-xl bg-neutral-950 px-3.5 text-xs font-bold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close customer support chat" : "Open customer support chat"}
        className="ml-auto flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-xs font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-neutral-800"
      >
        <span className="text-base" aria-hidden="true">
          💬
        </span>
        <span>{open ? "Close chat" : "Need help?"}</span>
      </button>
    </div>
  );
}
