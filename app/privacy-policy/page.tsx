import { PolicyTemplate } from "@/components/ui/policy-template";

export default function PrivacyPolicyPage() {
  return (
    <PolicyTemplate
      title="Privacy Policy"
      summary="At SAJILOMARTS, we are committed to safeguarding your personal information. This Privacy Policy explains how we collect, use, and protect your data when you browse our website, place orders, or request products from Indian marketplaces."
      sections={[
        {
          heading: "Information We Collect",
          content: "We collect personal details such as your full name, mobile number, email address, and delivery destination in Nepal when you register an account, make a purchase, or submit a product request URL."
        },
        {
          heading: "How We Use Your Information",
          content: "Your information is used strictly to process orders, communicate shipment milestones, provide price quotations for sourced goods, process digital payments through certified gateways (eSewa, Khalti), and improve our shopping experience."
        },
        {
          heading: "Data Protection & Security",
          content: "We employ industry-standard encryption, secure HTTP protocols, and server-side secret management. We never store credit card or payment gateway credentials directly on our application servers."
        },
        {
          heading: "Third-Party Disclosure",
          content: "We only share necessary delivery details with trusted Nepal domestic couriers and cross-border logistics facilitators solely for package fulfillment."
        }
      ]}
    />
  );
}
