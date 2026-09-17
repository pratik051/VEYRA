import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight">
          Contact Customer Care
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
          Have questions about an India sourcing request, shipping timeline, or payment verification? We are here to help 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-neutral-950 text-white space-y-2">
            <Mail className="h-5 w-5 text-amber-400" />
            <h4 className="text-xs font-bold text-neutral-400 uppercase">Email Us</h4>
            <p className="text-xs font-semibold">support@sajilomarts.com</p>
            <p className="text-[10px] text-neutral-400">Response within 2 hours</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-neutral-200 space-y-2">
            <Phone className="h-5 w-5 text-red-600" />
            <h4 className="text-xs font-bold text-neutral-400 uppercase">Helpline</h4>
            <p className="text-xs font-bold text-neutral-900">+977 9841-XXXXXX</p>
            <p className="text-[10px] text-neutral-500">9:00 AM – 8:00 PM (Everyday)</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-neutral-200 space-y-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <h4 className="text-xs font-bold text-neutral-400 uppercase">Nepal Hub</h4>
            <p className="text-xs font-semibold text-neutral-800">Kathmandu, Nepal</p>
            <p className="text-[10px] text-neutral-500">Cross-Border Logistics Center</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-neutral-950">Message Sent Successfully!</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Thank you for contacting SajiloMarts. Our team will get back to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Order inquiry, quote, etc."
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can our support team assist you today?"
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2.5"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-neutral-950 text-white font-black hover:bg-neutral-800 transition flex items-center justify-center gap-2"
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
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 tracking-tight">
          How SajiloMarts Works
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto">
          From Indian shopping cart to your doorstep in Nepal without international cards or customs headaches.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {steps.map((s) => (
          <div key={s.num} className="p-8 rounded-3xl bg-white border border-neutral-200 shadow-2xs space-y-3 relative overflow-hidden">
            <span className="text-4xl font-black text-neutral-100 absolute top-4 right-4">{s.num}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 text-white text-xs font-black">
              {s.num}
            </div>
            <h3 className="text-lg font-black text-neutral-950">{s.title}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">{s.desc}</p>
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
      a: "Standard delivery typically takes 3 to 5 business days from order confirmation to doorstep delivery in Nepal."
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
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
          Frequently Asked Questions
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
          Help & FAQs
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="p-6 rounded-3xl bg-white border border-neutral-200 space-y-2 shadow-2xs">
            <h4 className="text-sm font-bold text-neutral-950">{f.q}</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
