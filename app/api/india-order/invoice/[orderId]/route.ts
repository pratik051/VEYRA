import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { IndiaOrderModel } from "@/lib/models/india-order-model";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const orderId = params.orderId;

  let order: any = null;

  try {
    await connectToDatabase();
    order = await IndiaOrderModel.findOne({ orderId }).lean();
  } catch {
    // Memory fallback
  }

  if (!order && global.__linkova_mem_india_orders) {
    order = global.__linkova_mem_india_orders.get(orderId);
  }

  if (!order) {
    return new NextResponse("Order invoice not found.", { status: 404 });
  }

  const isPaid = order.paymentStatus === "PAID";
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.invoiceNumber} | LINKOVA Nepal</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #f8fafc;
      color: #0f172a;
      padding: 30px 15px;
      line-height: 1.5;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 25px;
      margin-bottom: 30px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      background: linear-gradient(135deg, #dc2626, #f59e0b);
      color: white;
      font-weight: 900;
      font-size: 20px;
      height: 44px;
      width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
    }
    .brand-name {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #0f172a;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .company-info {
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
      margin-top: 6px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .invoice-meta-item {
      font-size: 12px;
      color: #475569;
      margin-top: 4px;
    }
    .invoice-meta-item strong {
      color: #0f172a;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    .section-heading {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .customer-card, .payment-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      font-size: 13px;
    }
    .customer-name {
      font-weight: 800;
      font-size: 15px;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .badge-paid {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .badge-pending {
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      font-size: 13px;
    }
    .items-table th {
      background: #0f172a;
      color: #ffffff;
      padding: 12px 14px;
      text-align: left;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table th.text-right, .items-table td.text-right {
      text-align: right;
    }
    .items-table td {
      padding: 14px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .product-link {
      font-size: 11px;
      color: #2563eb;
      text-decoration: none;
      word-break: break-all;
      display: block;
      margin-top: 4px;
    }
    .total-box {
      margin-left: auto;
      max-width: 320px;
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 18px;
      background: #ffffff;
      margin-bottom: 35px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 700;
      color: #475569;
    }
    .final-total-row {
      display: flex;
      justify-content: space-between;
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      border-top: 2px dashed #cbd5e1;
      padding-top: 10px;
      margin-top: 10px;
    }
    .footer-note {
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      font-size: 11px;
      color: #64748b;
      text-align: center;
      line-height: 1.6;
    }
    .no-print {
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      max-width: 800px;
      margin: 0 auto 15px auto;
    }
    .btn-action {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }
    .btn-action:hover {
      background: #1e293b;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .invoice-container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>

  <!-- Screen Actions (Hidden on Print) -->
  <div class="no-print">
    <button onclick="window.print()" class="btn-action">
      🖨️ Print Invoice
    </button>
    <a href="/admin" class="btn-action" style="background:#475569;">
      ← Return to Admin
    </a>
  </div>

  <div class="invoice-container">
    <!-- Invoice Header -->
    <div class="invoice-header">
      <div>
        <div class="brand">
          <div class="brand-logo">L</div>
          <div>
            <div class="brand-name">LINKOVA</div>
            <div class="brand-sub">Nepal • India Sourcing Facilitator</div>
          </div>
        </div>
        <div class="company-info">
          LINKOVA E-Commerce & Concierge Services<br>
          Kathmandu, Bagmati Province, Nepal<br>
          Contact: +977-9800000000 | Email: support@linkova.com.np<br>
          Web: https://linkova.com.np
        </div>
      </div>

      <div class="invoice-meta">
        <div class="invoice-title">Official Bill</div>
        <div class="invoice-meta-item"><strong>Invoice No:</strong> ${order.invoiceNumber}</div>
        <div class="invoice-meta-item"><strong>Order ID:</strong> ${order.orderId}</div>
        <div class="invoice-meta-item"><strong>Date:</strong> ${orderDate}</div>
        <div class="invoice-meta-item">
          <span class="status-badge ${isPaid ? 'badge-paid' : 'badge-pending'}">
            ${isPaid ? 'PAYMENT STATUS: PAID' : 'PAYMENT: PENDING (COD)'}
          </span>
        </div>
      </div>
    </div>

    <!-- Customer & Payment Details -->
    <div class="details-grid">
      <div>
        <div class="section-heading">Customer & Delivery Details</div>
        <div class="customer-card">
          <div class="customer-name">${order.customerName}</div>
          <div><strong>Phone:</strong> ${order.phone}</div>
          ${order.email ? `<div><strong>Email:</strong> ${order.email}</div>` : ''}
          <div style="margin-top:6px;"><strong>Delivery Address:</strong><br>${order.deliveryAddress}</div>
          ${order.city || order.district ? `<div>${order.city ? order.city + ', ' : ''}${order.district || ''} ${order.province ? '(' + order.province + ')' : ''}</div>` : ''}
          ${order.deliveryInstructions ? `<div style="margin-top:4px; font-style:italic; color:#64748b;">Note: ${order.deliveryInstructions}</div>` : ''}
        </div>
      </div>

      <div>
        <div class="section-heading">Payment Information</div>
        <div class="payment-card">
          <div><strong>Payment Method:</strong> ${order.paymentMethod === 'FULL_PAYMENT' ? 'Full Online Payment' : 'Cash on Delivery (COD)'}</div>
          <div><strong>Payment Status:</strong> ${order.paymentStatus}</div>
          ${order.paymentTransactionId ? `<div><strong>Transaction ID:</strong> ${order.paymentTransactionId}</div>` : ''}
          <div><strong>Order Status:</strong> ${order.orderStatus}</div>
          <div style="margin-top:8px; font-size:11px; color:#64748b;">
            ${isPaid ? 'Payment has been received and verified. Your item is being processed for dispatch.' : 'Amount is payable in cash upon parcel delivery in Nepal.'}
          </div>
        </div>
      </div>
    </div>

    <!-- Product Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Item &amp; Description</th>
          <th>Marketplace</th>
          <th>Variant / Size</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Indian Price</th>
          <th class="text-right">Total (NPR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${order.productName}</strong>
            <a href="${order.productUrl}" target="_blank" class="product-link">Original URL: ${order.productUrl}</a>
          </td>
          <td>
            <span style="font-weight:800; color:#0f172a;">${order.marketplace ? order.marketplace.replace("amazon-india","Amazon India").replace("tatacliq","Tata CLiQ").replace("boat","boAt").replace(/-/g," ").replace(/\b\w/g,(c: string)=>c.toUpperCase()) : "Indian Marketplace"}</span>
            ${order.sourceProductId ? `<br><span style="font-size:10px;color:#64748b;">ID: ${order.sourceProductId}</span>` : ""}
          </td>
          <td>
            ${order.size ? "Size: " + order.size + "<br>" : ""}
            ${order.color ? "Color: " + order.color + "<br>" : ""}
            ${order.productVariant ? "Variant: " + order.productVariant : ""}
            ${!order.size && !order.color && !order.productVariant ? "Standard" : ""}
          </td>
          <td class="text-right">${order.quantity}</td>
          <td class="text-right">₹${Number(order.indianPriceINR).toLocaleString()} INR</td>
          <td class="text-right"><strong>Rs. ${Number(order.finalAmountNPR).toLocaleString()}</strong></td>
        </tr>
      </tbody>
    </table>

    <!-- Total Payable Calculation -->
    <div class="total-box">
      <div class="total-row">
        <span>Subtotal & Freight:</span>
        <span>Rs. ${Number(order.finalAmountNPR).toLocaleString()}</span>
      </div>
      <div class="final-total-row">
        <span>Total Payable:</span>
        <span style="color:#dc2626;">Rs. ${Number(order.finalAmountNPR).toLocaleString()}</span>
      </div>
    </div>

    <!-- Footer Note -->
    <div class="footer-note">
      Thank you for shopping with LINKOVA Nepal!<br>
      This is a computer-generated commercial invoice. For tracking and delivery queries, please contact our support team at +977-9800000000 or email support@linkova.com.np.
    </div>
  </div>

</body>
</html>`;

  return new NextResponse(invoiceHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
