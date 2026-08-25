import { PolicyTemplate } from "@/components/ui/policy-template";

export default function RefundPolicyPage() {
  return (
    <PolicyTemplate
      title="Refund Policy"
      summary="Information regarding refund processing timelines, payment method reversals, and return inspections."
      sections={[
        {
          heading: "Refund Eligibility",
          content: "Refunds are issued when a replacement is unavailable, an order is cancelled prior to supplier procurement, or a verified return inspection is approved."
        },
        {
          heading: "Refund Methods & Timelines",
          content: "• eSewa / Khalti: Processed within 24-48 business hours back to your wallet.\n• Bank Transfer / Mobile Banking: Credited to your bank account within 3-5 business days.\n• Cash on Delivery Orders: Refunded via direct bank deposit or eSewa wallet upon receipt of return."
        },
        {
          heading: "Out-of-Stock Sourced Products",
          content: "If an Indian marketplace item becomes out-of-stock after you have paid the quotation, a 100% immediate refund will be issued without any deduction."
        }
      ]}
    />
  );
}
