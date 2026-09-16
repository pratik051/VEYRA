import { PolicyTemplate } from "@/components/ui/policy-template";

export default function ShippingPolicyPage() {
  return (
    <PolicyTemplate
      title="Shipping & Delivery Policy"
      summary="SAJILOMARTS delivers across all 7 provinces of Nepal. Learn about our delivery timelines, shipping rates, and dispatch procedures."
      sections={[
        {
          heading: "Delivery Areas & Coverage",
          content: "We deliver nationwide across Nepal, including Kathmandu Valley, Pokhara, Biratnagar, Chitwan, Butwal, Dharan, Nepalgunj, Dhangadhi, and rural municipality hubs."
        },
        {
          heading: "Delivery Timelines",
          content: "• In-stock Kathmandu Valley: 1-2 business days.\n• In-stock Major Nepal Cities: 2-4 business days.\n• India Sourced / Custom Request Items: 5-10 business days depending on Indian supplier dispatch and customs clearance."
        },
        {
          heading: "Shipping Fees & Free Shipping",
          content: "• Orders above Rs. 3,000 qualify for FREE standard delivery across Nepal.\n• Orders below Rs. 3,000 incur a flat delivery fee of Rs. 200 within Nepal."
        },
        {
          heading: "Tracking Your Order",
          content: "Once your package is handed over to our logistics partner, a tracking number and real-time status updates are provided in your SAJILOMARTS account and via SMS/WhatsApp."
        }
      ]}
    />
  );
}
