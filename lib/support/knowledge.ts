export type SupportReply = {
  answer: string;
  suggestions?: string[];
};

type SupportTopic = {
  keywords: string[];
  answer: string;
  suggestions?: string[];
};

const topics: SupportTopic[] = [
  {
    keywords: ["delivery", "deliver", "shipping", "arrive", "how long"],
    answer:
      "In-stock LINKOVA products usually arrive in 1–2 business days in Kathmandu Valley and 2–4 days elsewhere in Nepal. Custom India-sourced orders typically take 5–10 business days, depending on logistics and customs.",
    suggestions: ["What payment methods do you accept?", "Can I cancel my order?"]
  },
  {
    keywords: ["payment", "pay", "esewa", "khalti", "cod", "cash"],
    answer:
      "We accept eSewa, Khalti, bank transfer/Fonepay QR, and Cash on Delivery for eligible locations.",
    suggestions: ["How long does delivery take?", "Can I cancel my order?"]
  },
  {
    keywords: ["cancel", "cancellation"],
    answer:
      "Standard in-stock orders can be cancelled before dispatch. India-sourced orders can be cancelled before we purchase the item from the external supplier.",
    suggestions: ["How do I contact support?", "How long does delivery take?"]
  },
  {
    keywords: ["amazon", "flipkart", "myntra", "meesho", "india", "request", "source"],
    answer:
      "Yes. Send us an Amazon India, Flipkart, Myntra, or Meesho product link through our Request From India form. We will verify it and send an itemized NPR quote.",
    suggestions: ["Open the Request From India form", "How is the final price calculated?"]
  },
  {
    keywords: ["price", "quote", "cost", "customs", "tax", "calculate"],
    answer:
      "An India-sourced quote includes the product price converted to NPR, international freight, applicable Nepal customs/taxes, handling, and domestic delivery. We share the breakdown before payment.",
    suggestions: ["Open the Request From India form", "How long does delivery take?"]
  },
  {
    keywords: ["warranty", "return", "refund", "defect"],
    answer:
      "In-stock electronics and tech accessories include a 6-month LINKOVA supplier warranty for manufacturing defects. Marketplace-request warranty terms follow the original brand policy. For a specific return or refund, please contact support.",
    suggestions: ["Contact customer support", "What payment methods do you accept?"]
  },
  {
    keywords: ["contact", "support", "human", "whatsapp", "agent", "help"],
    answer:
      "Our Kathmandu support team is available Sunday–Friday, 10:00 AM–7:00 PM NPT. You can message us on WhatsApp at +977 9767797748 or use the contact form.",
    suggestions: ["Open WhatsApp", "Open the contact form"]
  }
];

export function getSupportReply(message: string): SupportReply {
  const normalized = message.trim().toLowerCase();

  if (!normalized) {
    return {
      answer: "Please tell me what you need help with, such as delivery, payments, returns, or ordering from India.",
      suggestions: ["How long does delivery take?", "What payment methods do you accept?"]
    };
  }

  const topic = topics.find(({ keywords }) => keywords.some((keyword) => normalized.includes(keyword)));

  return (
    topic ?? {
      answer:
        "I can help with delivery, payments, cancellations, returns, warranties, or ordering from Indian marketplaces. For anything more specific, our team can help directly.",
      suggestions: ["How long does delivery take?", "Contact customer support"]
    }
  );
}
