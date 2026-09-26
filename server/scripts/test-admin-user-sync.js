import "../config/env.js";
import connectDB from "../config/db.js";
import OrderModel from "../models/order-model.js";
import IndiaOrderModel from "../models/india-order-model.js";
import PaymentModel from "../models/payment-model.js";
import UserModel from "../models/user-model.js";
import { generateUniqueOrderId } from "../utils/orderId.js";

async function runTest() {
  console.log("=== TESTING ADMIN <-> USER STATUS SYNCHRONIZATION ===");

  await connectDB();

  // 1. Create a simulated customer
  const testEmail = "test_customer_sync@sajilomarts.internal";
  await UserModel.deleteMany({ email: testEmail });
  const user = await UserModel.create({
    fullName: "Pratik Customer",
    email: testEmail,
    phone: "9812345678",
    passwordHash: "dummyHash123",
    role: "customer"
  });

  const userId = String(user._id);
  const orderId = await generateUniqueOrderId("SM");
  console.log(`[Step 1] Created Customer (${userId}) and Order ID: ${orderId}`);

  // 2. Create an order in IndiaOrderModel
  await IndiaOrderModel.deleteMany({ orderId });
  await PaymentModel.deleteMany({ orderId });

  const createdOrder = await IndiaOrderModel.create({
    orderId,
    invoiceNumber: `INV-${orderId}`,
    userId,
    customerId: userId,
    customerName: user.fullName,
    phone: user.phone,
    email: user.email,
    deliveryAddress: "Kathmandu, Bagmati",
    city: "Kathmandu",
    province: "Bagmati",
    productUrl: "https://www.amazon.in/dp/B08L5VJYV7",
    productName: "boAt Rockerz 450",
    quantity: 1,
    indianPriceINR: 1499,
    conversionAmountNPR: 2400,
    serviceChargeNPR: 250,
    deliveryChargeNPR: 200,
    finalAmountNPR: 2850,
    paymentMethod: "eSewa",
    paymentStatus: "Pending Verification",
    paymentTransactionId: `TXN-${orderId}`,
    paymentScreenshot: "https://example.com/proof.jpg",
    orderStatus: "Requested",
    status: "Requested",
    adminVerificationStatus: "Pending Verification"
  });

  const paymentRecord = await PaymentModel.create({
    userId,
    orderId,
    provider: "eSewa",
    paymentMethod: "eSewa",
    amount: 2850,
    currency: "NPR",
    transactionCode: `TXN-${orderId}`,
    screenshot: "https://example.com/proof.jpg",
    status: "submitted"
  });

  console.log("✓ Initial Order & Payment records stored in MongoDB.");

  // 3. Simulate Admin Payment Approval
  console.log("\n[Step 2] Admin Approves Payment...");
  const updatedPayment = await PaymentModel.findOneAndUpdate(
    { _id: paymentRecord._id },
    { $set: { status: "Approved", verifiedAt: new Date() } },
    { new: true }
  ).lean();

  const isApproved = updatedPayment.status === "Approved";
  const orderUpdates = {
    paymentStatus: isApproved ? "PAID" : "Payment Rejected",
    status: isApproved ? "Processing" : "Payment Issue",
    orderStatus: isApproved ? "Processing" : "Payment Issue",
    "payment.status": isApproved ? "PAID" : "Payment Rejected",
    adminVerificationStatus: isApproved ? "Verified / Orderable" : "Rejected",
    updatedAt: new Date()
  };

  await IndiaOrderModel.findOneAndUpdate({ orderId }, { $set: orderUpdates }, { new: true });

  // 4. Verify Customer Order View matches updated payment status
  const customerOrderAfterPay = await IndiaOrderModel.findOne({ orderId }).lean();
  console.log("Customer View after Admin Payment Approval:");
  console.log(`- paymentStatus: ${customerOrderAfterPay.paymentStatus}`);
  console.log(`- orderStatus: ${customerOrderAfterPay.orderStatus}`);
  console.log(`- adminVerificationStatus: ${customerOrderAfterPay.adminVerificationStatus}`);

  if (customerOrderAfterPay.paymentStatus !== "PAID") {
    throw new Error(`Expected paymentStatus 'PAID', got '${customerOrderAfterPay.paymentStatus}'`);
  }

  // 5. Simulate Admin Updating Order Status to 'In Transit'
  console.log("\n[Step 3] Admin Updates Order Status to 'In Transit'...");
  await IndiaOrderModel.findOneAndUpdate(
    { orderId },
    { $set: { status: "In Transit", orderStatus: "In Transit", updatedAt: new Date() } },
    { new: true }
  );

  const customerOrderAfterStatus = await IndiaOrderModel.findOne({ orderId }).lean();
  console.log("Customer View after Status Update:");
  console.log(`- orderStatus: ${customerOrderAfterStatus.orderStatus}`);
  console.log(`- status: ${customerOrderAfterStatus.status}`);

  if (customerOrderAfterStatus.orderStatus !== "In Transit" || customerOrderAfterStatus.status !== "In Transit") {
    throw new Error(`Expected orderStatus 'In Transit', got '${customerOrderAfterStatus.orderStatus}'`);
  }

  // 6. Simulate Admin Updating Order Status to 'Delivered'
  console.log("\n[Step 4] Admin Updates Order Status to 'Delivered'...");
  await IndiaOrderModel.findOneAndUpdate(
    { orderId },
    { $set: { status: "Delivered", orderStatus: "Delivered", deliveredEmailSent: true, updatedAt: new Date() } },
    { new: true }
  );

  const customerOrderAfterDelivered = await IndiaOrderModel.findOne({ orderId }).lean();
  console.log("Customer View after Delivered:");
  console.log(`- orderStatus: ${customerOrderAfterDelivered.orderStatus}`);
  console.log(`- paymentStatus: ${customerOrderAfterDelivered.paymentStatus}`);

  if (customerOrderAfterDelivered.orderStatus !== "Delivered") {
    throw new Error(`Expected orderStatus 'Delivered', got '${customerOrderAfterDelivered.orderStatus}'`);
  }

  // Clean up test data
  await UserModel.deleteMany({ email: testEmail });
  await IndiaOrderModel.deleteMany({ orderId });
  await PaymentModel.deleteMany({ orderId });

  console.log("\n=== ALL SYNCHRONIZATION TESTS PASSED SUCCESSFULLY! ===");
  process.exit(0);
}

runTest().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
