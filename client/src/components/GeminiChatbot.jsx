import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import api from '../services/api';

export function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      role: 'assistant',
      text: 'Namaste! 🙏 I am your SajiloMarts AI Assistant. I can help you find products, calculate India-to-Nepal pricing, track your orders, or answer any shopping questions!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const newMsg = { id: `user-${Date.now()}`, role: 'user', text: userText };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await api.post('/api/ai/chat', {
        message: userText,
        history: messages.slice(-6).map((m) => ({ role: m.role, content: m.text }))
      });

      const reply = res.data?.reply || res.data?.response || "I am here to help with your SajiloMarts orders!";
      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, role: 'assistant', text: reply }
      ]);
    } catch (err) {
      // Fallback helpful response if offline/endpoint cold
      let fallbackText = "I can help you paste any Amazon or Flipkart link at /request-product to get an instant NPR quote! You can also track existing packages at /track-order.";
      if (userText.toLowerCase().includes("price") || userText.toLowerCase().includes("rate") || userText.toLowerCase().includes("inr")) {
        fallbackText = "Our India-to-Nepal pricing includes transparent exchange rates and doorstep delivery across Nepal. Visit our Request Product page for an instant quote!";
      } else if (userText.toLowerCase().includes("track") || userText.toLowerCase().includes("order")) {
        fallbackText = "You can track your order status anytime by clicking 'Track Order' in the top header and entering your Order ID!";
      }

      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, role: 'assistant', text: fallbackText }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 rounded-full bg-neutral-950 text-white px-4 py-3.5 shadow-2xl hover:bg-neutral-900 hover:scale-105 active:scale-95 transition-all border border-white/20 group"
          aria-label="Open AI Concierge Chat"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-neutral-950">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-black tracking-wide hidden sm:inline">
            AI Assistant
          </span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="flex flex-col w-[350px] sm:w-[400px] h-[520px] rounded-3xl bg-white shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-neutral-950 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-400 text-neutral-950 shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black">SajiloMarts AI Concierge</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Ready to assist</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close Chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-neutral-950 mt-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-800" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-neutral-950 text-white rounded-br-xs'
                      : 'bg-white text-neutral-800 border border-neutral-200 shadow-2xs rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-neutral-700 mt-1">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-neutral-400 text-xs p-2">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                <span>AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about shopping, links, or orders..."
              className="flex-1 bg-neutral-100 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white hover:bg-red-600 disabled:opacity-40 transition-colors shrink-0"
              aria-label="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
