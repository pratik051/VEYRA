import { PolicyTemplate } from "@/components/ui/policy-template";

export default function ProductRequestPolicyPage() {
  return (
    <PolicyTemplate
      title="India Sourcing & Product Request Policy"
      summary="Guidelines regarding requesting products from Indian online marketplaces (Amazon India, Flipkart, Myntra, Meesho, Ajio, Tata CLiQ) and our Nepal import concierge workflow."
      sections={[
        {
          heading: "Independent Facilitator Disclaimer",
          content: "LINKOVA operates as an independent shopping facilitator and freight concierge in Nepal. We do not claim official partnership with Amazon India, Flipkart, Myntra, Meesho, Ajio, or Tata CLiQ unless explicitly stated. All third-party logos and trademarks belong to their respective owners."
        },
        {
          heading: "Prohibited & Restricted Items",
          content: "We strictly adhere to Nepal Customs and Import Regulations. We do not source or import: weapons, combustible materials, illegal substances, counterfeit or pirate goods, or products prohibited under Nepal import laws."
        },
        {
          heading: "Quotation Components",
          content: "Every custom quote provided by LINKOVA includes: Indian marketplace price converted at current exchange rate, international transit freight, estimated Nepal customs duty, handling/packaging fee, and domestic Nepal delivery."
        },
        {
          heading: "Quality Check & Inspection",
          content: "Before forwarding sourced products to your address in Nepal, our team checks external packaging and verifies model numbers against your approved request details."
        }
      ]}
    />
  );
}
