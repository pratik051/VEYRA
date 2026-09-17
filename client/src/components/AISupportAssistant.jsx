import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, Loader2, RotateCcw, HelpCircle, Package, Truck, RefreshCw, CreditCard, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const SUPPORT_QUICK_ACTIONS = [
  { icon: Package, label: 'Track Order', prompt: 'How can I track my active order status?' },
  { icon: Truck, label: 'Delivery Time', prompt: 'What is the delivery timeline from India to Nepal?' },
  { icon: RefreshCw, label: 'Returns & Refunds', prompt: 'What is the return and refund policy if an item arrives damaged?' },
  { icon: CreditCard, label: 'Payment Options', prompt: 'What payment methods and QR wallets are accepted?' },
  { icon: Sparkles, label: 'Sourcing Quote', prompt: 'How do I get an instant price quote for an Amazon or Flipkart link?' },
  { icon: ShieldCheck, label: 'Customs & Duties', prompt: 'Are customs duty and cross-border taxes included in the price?' }
];

export function AISupportAssistant({ className = '' }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-support',
      role: 'assistant',
      text: 'Namaste! 🙏 I am your SajiloMarts AI Support Assistant. How can I help you today? Ask me about order tracking, India delivery timelines, returns, refunds, payments, or account issues!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendPrompt = async (textToSend) => {
    const userText = (textToSend || input).trim();
    if (!userText || loading) return;

    setInput('');
    const userMsg = { id: `user-${Date.now()}`, role: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/api/ai/chat', {
        message: userText,
        history: messages.slice(-6).map((m) => ({ role: m.role, content: m.text }))
      });

      const reply = res.data?.reply || res.data?.response;
      if (reply) {
        setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, role: 'assistant', text: reply }]);
        return;
      }
      throw new Error('Fallback required');
    } catch {
      // High quality tailored customer support answers
      const lower = userText.toLowerCase();
      let response = "Our dedicated customer care team is available everyday from 9:00 AM to 8:00 PM. You can also reach us directly via helpline or email!";

      if (lower.includes('track') || lower.includes('order') || lower.includes('status')) {
        response = "To track your package, visit our 'Track Order' page in the top menu and enter your Order ID. You will get live transit updates from our Indian sourcing warehouse to your doorstep in Nepal.";
      } else if (lower.includes('deliver') || lower.includes('time') || lower.includes('how long') || lower.includes('days')) {
        response = "Standard India-to-Nepal delivery takes 3 to 5 business days. Once your item is dispatched from our Birgunj/Raxaul hub, Kathmandu Valley deliveries usually arrive within 24 hours.";
      } else if (lower.includes('return') || lower.includes('refund') || lower.includes('damage') || lower.includes('cancel')) {
        response = "SajiloMarts offers a 7-day hassle-free return window for damaged, defective, or incorrect items. Refunds are processed back to your original payment wallet (eSewa, Khalti, or bank) within 24 to 48 hours after verification.";
      } else if (lower.includes('pay') || lower.includes('esewa') || lower.includes('khalti') || lower.includes('qr') || lower.includes('cod')) {
        response = "We support eSewa QR, Khalti QR, MyPay, Fonepay, and all major Nepali bank QR apps. For Cash on Delivery (COD), a 50% advance confirmation is required via QR scan to cover cross-border transit logistics.";
      } else if (lower.includes('quote') || lower.includes('amazon') || lower.includes('flipkart') || lower.includes('myntra') || lower.includes('link') || lower.includes('price')) {
        response = "You can order ANY item from Amazon India, Flipkart, Myntra, Ajio, Meesho, or boAt! Simply go to our 'Request Product' page, paste the Indian product URL, and get an instant transparent NPR landed quote with customs and shipping included.";
      } else if (lower.includes('custom') || lower.includes('duty') || lower.includes('tax')) {
        response = "Yes! All prices quoted on SajiloMarts are 100% all-inclusive. They cover Indian sales tax, currency exchange, cross-border Nepal customs clearance, and courier delivery to your address with no hidden charges.";
      } else if (lower.includes('account') || lower.includes('password') || lower.includes('login') || lower.includes('email')) {
        response = "You can manage your profile, saved addresses, and active orders in the 'My Account' dashboard. If you need to reset your password, visit the Login page and click 'Forgot Password' to receive a quick reset verification.";
      }

      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, role: 'assistant', text: response }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        text: 'Chat history cleared. How else can our AI Support Assistant help with your orders, returns, or quotes?'
      }
    ]);
  };

  return (
    <div className={`rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] shadow-xl overflow-hidden flex flex-col transition-all ${className}`}>
      {/* Support Assistant Header */}
      <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 dark:from-[#0b1437] dark:via-[#111c44] dark:to-[#0b1437] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10 dark:border-[#1b2559]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-neutral-950 shadow-md">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white">AI Support Assistant</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live 24/7 Support
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-[#a3aed0] mt-0.5">
              Dedicated order, returns, delivery &amp; sourcing assistance
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition"
          title="Reset conversation"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Suggested Quick Action Chips */}
      <div className="px-4 py-3 bg-neutral-50/80 dark:bg-[#0b1437]/50 border-b border-neutral-100 dark:border-[#1b2559] flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 shrink-0">
          Quick Topics:
        </span>
        {SUPPORT_QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => handleSendPrompt(action.prompt)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1b254b] text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-[#1b2559] text-[11px] font-bold hover:bg-amber-400 hover:text-neutral-950 dark:hover:bg-amber-400 dark:hover:text-neutral-950 transition whitespace-nowrap shadow-2xs"
            >
              <Icon className="h-3 w-3 text-amber-500" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="p-4 sm:p-5 space-y-3.5 overflow-y-auto min-h-[260px] max-h-[380px] bg-neutral-50/40 dark:bg-[#0b1437]/20"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-neutral-950 mt-0.5 shadow-2xs">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 font-medium rounded-br-xs shadow-xs'
                  : 'bg-white dark:bg-[#1b254b] text-neutral-900 dark:text-neutral-100 border border-neutral-200/90 dark:border-[#1b2559] rounded-bl-xs shadow-2xs'
              }`}
            >
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-xs p-2">
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            <span>AI Support Assistant is generating an answer...</span>
          </div>
        )}
      </div>

      {/* Input Message Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt();
        }}
        className="p-3 sm:p-4 bg-white dark:bg-[#111c44] border-t border-neutral-100 dark:border-[#1b2559] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask support about your order, delivery timeline, returns..."
          className="flex-1 rounded-2xl bg-neutral-100 dark:bg-[#0b1437] px-4 py-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-[#a3aed0] border border-neutral-200 dark:border-[#1b2559] focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 sm:w-auto sm:px-5 items-center justify-center gap-2 rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 hover:bg-red-600 dark:hover:bg-amber-300 disabled:opacity-40 transition font-bold text-xs shrink-0 shadow-sm"
          aria-label="Send support query"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Ask Support</span>
        </button>
      </form>
    </div>
  );
}

export default AISupportAssistant;
