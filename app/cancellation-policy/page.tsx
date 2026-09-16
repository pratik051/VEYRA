import { PolicyTemplate } from "@/components/ui/policy-template";

export default function CancellationPolicyPage() {
  return (
    <PolicyTemplate
      title="Cancellation Policy"
      summary="Understand how order cancellations, quotation declines, and pre-dispatch modifications work at SAJILOMARTS."
      sections={[
        {
          heading: "In-Stock Catalog Orders",
          content: "You may cancel an in-stock order anytime before it has been marked as 'Out for Delivery'. Once dispatched with local couriers, standard return procedures apply."
        },
        {
          heading: "Custom Sourced / India Marketplace Requests",
          content: "• Submitting a product request and receiving a quotation is 100% free and carries zero obligation to purchase.\n• If you approve a quotation and make a payment, cancellation is permitted until our team purchases the item from the Indian seller.\n• Once the seller dispatches the item across international transit, cancellations cannot be accepted unless the product arrives damaged or incorrect."
        },
        {
          heading: "How to Cancel",
          content: "You can request cancellation directly from your Account Dashboard under 'Orders' or by sending a quick message to our WhatsApp support (+977-9767797748)."
        }
      ]}
    />
  );
}
