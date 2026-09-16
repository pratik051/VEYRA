import { PolicyTemplate } from "@/components/ui/policy-template";

export default function TermsAndConditionsPage() {
  return (
    <PolicyTemplate
      title="Terms and Conditions"
      summary="These Terms and Conditions govern your access to and use of the SAJILOMARTS website, our product listings, and our cross-border sourcing concierge services within Nepal."
      sections={[
        {
          heading: "Acceptance of Terms",
          content: "By creating an account, browsing products, or submitting a product request on SAJILOMARTS, you agree to be bound by these Terms and Conditions and applicable laws of Nepal."
        },
        {
          heading: "Product Sourcing & Marketplace Concierge Role",
          content: "SAJILOMARTS operates as an independent retail and sourcing facilitator. Sourced items requested from Amazon India, Flipkart, Myntra, or other marketplaces are purchased on behalf of the customer after quote approval. SAJILOMARTS is not officially affiliated with or endorsed by external marketplace trademarks."
        },
        {
          heading: "Pricing & Quotation Validity",
          content: "Prices for in-stock catalog items are listed in Nepalese Rupees (NPR). Sourced product quotations are calculated based on seller prices, exchange rates, international freight, and Nepal customs duty, and remain valid for the stated duration (typically 7 days)."
        },
        {
          heading: "Order Fulfillment & Delivery",
          content: "Delivery timelines are estimates subject to courier operations and customs clearance. SAJILOMARTS will provide transparent tracking updates for all shipments."
        }
      ]}
    />
  );
}
