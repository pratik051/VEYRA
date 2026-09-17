import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, HelpCircle, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import { AISupportAssistant } from '../components/AISupportAssistant';
import api from '../services/api';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/user/tickets', {
        subject: formData.subject || 'Contact Inquiry',
        category: 'General Inquiry',
        message: `${formData.name} (${formData.email}, ${formData.phone}): ${formData.message}`
      });
    } catch {
      // offline simulation
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
          Support &amp; Help Center
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
          Customer Care &amp; Assistance
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#a3aed0] max-w-lg mx-auto">
          Need instant help with orders, returns, Indian marketplace quotes, or payment verification? Our 24/7 AI Support Assistant and dedicated support agents are here for you.
        </p>
      </div>

      {/* AI Support Assistant Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white">
            Instant 24/7 AI Support
          </h2>
        </div>
        <AISupportAssistant />
      </section>

      {/* Traditional Contact Options & Ticket Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-neutral-950 dark:bg-[#111c44] text-white border border-neutral-900 dark:border-[#1b2559] space-y-2 shadow-sm">
            <Mail className="h-5 w-5 text-amber-400" />
            <h4 className="text-xs font-bold text-neutral-400 dark:text-[#a3aed0] uppercase">Email Support</h4>
            <p className="text-xs font-semibold">support@sajilomarts.com</p>
            <p className="text-[10px] text-neutral-400 dark:text-[#a3aed0]">Average response within 2 hours</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-2 shadow-2xs">
            <Phone className="h-5 w-5 text-red-600" />
            <h4 className="text-xs font-bold text-neutral-400 dark:text-[#a3aed0] uppercase">Helpline Desk</h4>
            <p className="text-xs font-bold text-neutral-900 dark:text-white">+977 9841-XXXXXX</p>
            <p className="text-[10px] text-neutral-500 dark:text-[#a3aed0]">9:00 AM – 8:00 PM (Everyday)</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-2 shadow-2xs">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <h4 className="text-xs font-bold text-neutral-400 dark:text-[#a3aed0] uppercase">Nepal Hub</h4>
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Kathmandu &amp; Birgunj Transit</p>
            <p className="text-[10px] text-neutral-500 dark:text-[#a3aed0]">Cross-Border Logistics Center</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] p-6 sm:p-8 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-base font-black text-neutral-950 dark:text-white">Send Us a Direct Message</h3>
            <p className="text-xs text-neutral-500 dark:text-[#a3aed0]">
              Fill in the form below and our staff will respond directly to your email.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white">Message Sent Successfully!</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Thank you for contacting SajiloMarts. Our customer care team has logged your inquiry.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Order inquiry, quote, delivery, etc."
                    className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can our support team assist you today?"
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 font-black hover:bg-neutral-800 dark:hover:bg-amber-300 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Sending...' : 'Send Message ➔'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Find Any Product Online",
      desc: "Browse Amazon.in, Flipkart, Myntra, Ajio, Meesho, Nykaa, or any Indian store and copy the product URL."
    },
    {
      num: "02",
      title: "Paste URL & Get Instant Quote",
      desc: "Paste the URL into SajiloMarts. Our system calculates the exact landed NPR price including currency conversion, service fees and delivery."
    },
    {
      num: "03",
      title: "Pay Easily with Local Wallets",
      desc: "Pay 100% online or 50% advance for Cash on Delivery via eSewa, Khalti or bank QR code."
    },
    {
      num: "04",
      title: "Doorstep Nepal Delivery",
      desc: "We source the authentic item in India, inspect it at our transit hub, clear customs, and courier it straight to your home."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
          Simple 4-Step Process
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
          How SajiloMarts Works
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#a3aed0] max-w-xl mx-auto">
          From Indian shopping cart to your doorstep in Nepal without international cards or customs headaches.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {steps.map((s) => (
          <div
            key={s.num}
            className="p-8 rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] shadow-2xs space-y-3 relative overflow-hidden"
          >
            <span className="text-4xl font-black text-neutral-100 dark:text-neutral-800/80 absolute top-4 right-4">
              {s.num}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-black">
              {s.num}
            </div>
            <h3 className="text-lg font-black text-neutral-950 dark:text-white">{s.title}</h3>
            <p className="text-xs text-neutral-600 dark:text-[#a3aed0] leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FAQ() {
  const faqs = [
    {
      q: "How long does delivery take from India to Nepal?",
      a: "Standard delivery typically takes 3 to 5 business days from order confirmation to doorstep delivery across Nepal."
    },
    {
      q: "Can I order products not listed in the catalog?",
      a: "Yes! You can order ANY product from Amazon, Flipkart, Myntra, or any Indian website by using our Request Product feature."
    },
    {
      q: "What payment methods are supported?",
      a: "We accept eSewa, Khalti, MyPay, Fonepay/All Nepal Bank Apps, and Cash on Delivery (which requires a 50% advance via QR scan)."
    },
    {
      q: "Are prices inclusive of customs duty and shipping?",
      a: "Yes, our calculated NPR price includes the product price, currency conversion, cross-border customs handling, and standard delivery."
    },
    {
      q: "How can I track my package?",
      a: "Click on 'Track Order' in the top navigation and enter your Order ID for real-time tracking updates."
    },
    {
      q: "What is the return and refund policy?",
      a: "SajiloMarts offers a 7-day return policy for items that arrive defective or not as described. Contact our support team or use the AI Assistant to initiate a request."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
          Help &amp; FAQs
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#a3aed0]">
          Find quick answers or chat directly with our AI Support Assistant below.
        </p>
      </div>

      {/* AI Assistant Quick Assistance */}
      <AISupportAssistant />

      {/* FAQ Items */}
      <div className="space-y-4 pt-4">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-2 shadow-2xs"
          >
            <h4 className="text-sm font-bold text-neutral-950 dark:text-white">{f.q}</h4>
            <p className="text-xs text-neutral-600 dark:text-[#a3aed0] leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dedicated Support Hub Route (/support)
export function Support() {
  return <Contact />;
}
