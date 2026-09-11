import { PolicyTemplate } from "@/components/ui/policy-template";

export default function ReturnPolicyPage() {
  return (
    <PolicyTemplate
      title="Return & Replacement Policy"
      summary="We want you to be completely satisfied with your LINKOVA purchase. Read our straightforward return and replacement guidelines."
      sections={[
        {
          heading: "7-Day Replacement Guarantee",
          content: "If you receive a defective, damaged, or incorrect product, you may request a free replacement within 7 calendar days of delivery."
        },
        {
          heading: "Eligibility Conditions",
          content: "Items must be unused, in original condition with all tags intact, and in original packaging including all accessories, manuals, and free gifts."
        },
        {
          heading: "Sourced Product Return Terms",
          content: "For custom products sourced from Indian marketplaces on customer request, returns are accepted if the delivered product does not match the confirmed specifications, size, or is damaged during transit."
        },
        {
          heading: "How to Initiate a Return",
          content: "Contact our customer care on WhatsApp (+977-9767797748) or email support@linkova.com.np with your Order ID and photos of the defective item. Our team will arrange pickup or return instructions."
        }
      ]}
    />
  );
}
