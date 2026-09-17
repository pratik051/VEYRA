import React from 'react';
import { useLocation } from 'react-router-dom';
import { PolicyTemplate } from '../components/PolicyTemplate';

export function PolicyPage() {
  const location = useLocation();
  const path = location.pathname;

  if (path.includes('privacy')) {
    return (
      <PolicyTemplate title="Privacy Policy">
        <section className="space-y-3">
          <h3 className="text-base font-bold text-neutral-900">1. Information We Collect</h3>
          <p>
            When you visit SajiloMarts or place an order, we collect information necessary to process your transactions, including your name, delivery address, phone number, and email. We do not store financial payment credentials or banking PINs.
          </p>
        </section>
        <section className="space-y-3">
          <h3 className="text-base font-bold text-neutral-900">2. How We Use Your Data</h3>
          <p>
            Your information is used strictly to fulfill your cross-border sourcing requests, update you regarding delivery progress, process customer support tickets, and enhance site security.
          </p>
        </section>
      </PolicyTemplate>
    );
  }

  if (path.includes('terms')) {
    return (
      <PolicyTemplate title="Terms & Conditions">
        <section className="space-y-3">
          <h3 className="text-base font-bold text-neutral-900">1. Sourcing Agency Agreement</h3>
          <p>
            SajiloMarts acts as a procurement and logistics facilitator between customers in Nepal and verified retail merchants in India. By submitting a product link, you authorize SajiloMarts to purchase the item on your behalf.
          </p>
        </section>
        <section className="space-y-3">
          <h3 className="text-base font-bold text-neutral-900">2. Pricing & Currency Exchange</h3>
          <p>
            All prices presented on the platform in Nepalese Rupees (NPR) are inclusive of source purchase price, exchange conversion, handling fees, and standard delivery unless otherwise specified.
          </p>
        </section>
      </PolicyTemplate>
    );
  }

  if (path.includes('shipping')) {
    return (
      <PolicyTemplate title="Shipping & Customs Policy">
        <section className="space-y-3">
          <h3 className="text-base font-bold text-neutral-900">1. Delivery Timeline</h3>
          <p>
            Standard orders from India are typically dispatched and delivered within 3 to 5 business days across Nepal. Express air transit is available for eligible electronics and lightweight parcels.
          </p>
        </section>
        <section className="space-y-3">
          <h3 className="text-base font-bold text-neutral-900">2. Customs & Duties</h3>
          <p>
            SajiloMarts handles customs clearance and documentation at Nepal border inspection points. Customers are not required to pay extra customs fees upon arrival.
          </p>
        </section>
      </PolicyTemplate>
    );
  }

  if (path.includes('refund') || path.includes('return') || path.includes('cancellation')) {
    return (
      <PolicyTemplate title="Refund & Cancellation Policy">
        <section className="space-y-3">
          <h3 className="text-base font-bold text-neutral-900">1. Order Cancellations</h3>
          <p>
            Orders may be cancelled within 4 hours of submission before physical procurement has been executed in India. Once an item is purchased and in transit, cancellations are subject to return verification.
          </p>
        </section>
        <section className="space-y-3">
          <h3 className="text-base font-bold text-neutral-900">2. Damaged or Incorrect Items</h3>
          <p>
            If your item arrives damaged or differs from the requested URL, notify our support team within 48 hours for a full refund or free replacement.
          </p>
        </section>
      </PolicyTemplate>
    );
  }

  return (
    <PolicyTemplate title="Product Sourcing Policy">
      <section className="space-y-3">
        <h3 className="text-base font-bold text-neutral-900">1. Prohibited Items</h3>
        <p>
          We do not source hazardous materials, perishable foodstuffs, regulated pharmaceuticals, or prohibited contraband.
        </p>
      </section>
    </PolicyTemplate>
  );
}

export default PolicyPage;
