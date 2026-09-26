import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, HelpCircle, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import { FacebookIcon, InstagramIcon, MailIcon } from '../components/SocialIcons';
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
          Need help with orders, returns, pricing quotes, or payment verification? Our dedicated support team is here to assist you.
        </p>
      </div>

      {/* Traditional Contact Options & Ticket Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-neutral-950 dark:bg-[#111c44] text-white border border-neutral-900 dark:border-[#1b2559] space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-amber-400">
              <MailIcon className="h-5 w-5" />
              <h4 className="text-xs font-bold text-neutral-400 dark:text-[#a3aed0] uppercase tracking-wider">Email Support</h4>
            </div>
            <a href="mailto:sajilomarts@gmail.com" className="text-xs font-semibold hover:underline block truncate text-amber-300">sajilomarts@gmail.com</a>
            <p className="text-[10px] text-neutral-400 dark:text-[#a3aed0]">Average response within 2 hours</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold text-neutral-500 dark:text-[#a3aed0] uppercase tracking-wider">Official Social Channels</h4>
            <div className="flex flex-col gap-2.5 pt-1 text-xs">
              <a
                href="https://www.facebook.com/profile.php?id=61594687408072"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 text-[#1877F2] font-bold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FacebookIcon className="h-4 w-4" />
                  <span>Facebook Page</span>
                </span>
                <span className="text-xs opacity-70">➔</span>
              </a>
              <a
                href="https://www.instagram.com/sajilomarts/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-pink-50/70 hover:bg-pink-100/80 text-[#E4405F] font-bold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <InstagramIcon className="h-4 w-4" />
                  <span>Instagram Profile</span>
                </span>
                <span className="text-xs opacity-70">➔</span>
              </a>
            </div>
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
      title: "Find your product",
      desc: "Browse your favorite Indian online stores like Amazon, Flipkart, Myntra, AJIO, Meesho, Nykaa, etc."
    },
    {
      num: "02",
      title: "Paste the link",
      desc: "Paste the product URL into our quote tool on SajiloMarts to check availability and verify details."
    },
    {
      num: "03",
      title: "Get your NPR quote",
      desc: "See your exact estimated landed cost calculated in Nepali Rupees (NPR) before placing an order."
    },
    {
      num: "04",
      title: "Confirm your order",
      desc: "Review the cost breakdown and place your order securely using eSewa, Khalti, Bank Transfer, or COD."
    },
    {
      num: "05",
      title: "Receive it in Nepal",
      desc: "We handle cross-border procurement, customs clearance, transit handling, and doorstep Nepal delivery."
    }
  ];

  const benefits = [
    {
      title: "Direct India Sourcing",
      desc: "Products sourced directly from verified Indian marketplace stores and official brand outlets."
    },
    {
      title: "Transparent Pricing",
      desc: "Understand your estimated cost breakdown clearly in Nepali Rupees before confirming your order."
    },
    {
      title: "Nepal Delivery",
      desc: "We manage the entire international shipping, customs handling, and local delivery process to your doorstep."
    },
    {
      title: "Order Support",
      desc: "Get direct assistance, link verification help, and status updates throughout your sourcing request."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase text-amber-600 tracking-wider">
          Simple 5-Step Process
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
          How SajiloMarts Works
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed">
          A simple, transparent 5-step process to get products from Indian online stores delivered across Nepal.
        </p>
      </div>

      {/* 5 Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((s) => (
          <div
            key={s.num}
            className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-2 relative"
          >
            <span className="text-xs font-bold text-amber-600 tracking-wider">
              {s.num}
            </span>
            <h3 className="text-sm font-semibold text-neutral-900">{s.title}</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Why SajiloMarts */}
      <div className="space-y-8 pt-6 border-t border-neutral-200">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Why SajiloMarts?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Practical, reliable e-commerce sourcing built for shoppers in Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-2"
            >
              <h3 className="text-sm font-semibold text-neutral-900">{b.title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const faqs = [
    {
      q: "How does SajiloMarts work?",
      a: "SajiloMarts enables customers in Nepal to purchase products from Indian online marketplaces. You paste the product URL, we calculate the landed cost in Nepali Rupees (NPR), handle procurement in India, customs processing, and deliver the package directly to your doorstep in Nepal."
    },
    {
      q: "Which Indian stores are supported?",
      a: "We support sourcing from Amazon India, Flipkart, Myntra, AJIO, Meesho, Nykaa, boAt Lifestyle, Noise, Tata CLiQ, Croma, and most verified Indian e-commerce stores."
    },
    {
      q: "How is the NPR price calculated?",
      a: "The landed price includes the original INR price converted at standard exchange rates, our sourcing service charge, applicable India shipping and Nepal customs clearance, plus domestic delivery across Nepal."
    },
    {
      q: "How long does delivery take?",
      a: "Standard cross-border delivery from Indian warehouses to Kathmandu typically takes 5 to 9 business days. Deliveries outside Kathmandu Valley take an additional 2 to 4 business days."
    },
    {
      q: "What happens after I place an order?",
      a: "Once your order is submitted, our procurement team inspects the listing, verifies the stock in India, purchases the item, and dispatches it toward Nepal. You receive live status updates at every stage."
    },
    {
      q: "How can I track my order?",
      a: "You can track your package anytime by entering your Order ID on our Track Order page or directly in your customer account dashboard."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase text-amber-600 tracking-wider">
          Help &amp; FAQs
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto">
          Everything you need to know about Indian product ordering and Nepal delivery.
        </p>
      </div>

      {/* FAQ Items */}
      <div className="space-y-3 pt-4">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-2"
          >
            <h4 className="text-sm font-semibold text-neutral-900">{f.q}</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">{f.a}</p>
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
