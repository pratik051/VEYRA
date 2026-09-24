import "../config/env.js";
import mongoose from "mongoose";
import {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendOrderDeliveredEmail
} from "../services/emailService.js";
import UserModel from "../models/user-model.js";
import OrderModel from "../models/order-model.js";
import IndiaOrderModel from "../models/india-order-model.js";
import EmailNotificationModel from "../models/email-notification-model.js";

async function runEmailTestSuite() {
  console.log("=== SajiloMarts Automated Customer Email Notification System Test Suite ===");
  const results = {
    welcomeEmail: "FAIL",
    welcomeIdempotency: "FAIL",
    orderConfirmationEmail: "FAIL",
    orderConfirmationIdempotency: "FAIL",
    orderStatusUpdateEmail: "FAIL",
    orderStatusSameSkip: "FAIL",
    deliveredEmail: "FAIL",
    deliveredIdempotency: "FAIL",
    nonBlockingFaultTolerance: "FAIL"
  };

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log("✓ Connected to MongoDB for test verification");
    } catch (dbErr) {
      console.warn("MongoDB connection warning in test script:", dbErr.message);
    }
  }

  const testUserId = new mongoose.Types.ObjectId();
  const testEmail = `test_customer_${Date.now()}@sajilomarts.test`;
  const testOrderId = `TEST-ORD-${Date.now()}`;

  // 1. Test Welcome Email
  try {
    console.log("\n[Test 1] Testing Welcome Email sending...");
    const res1 = await sendWelcomeEmail(testEmail, "Pratik Shah", testUserId);
    console.log("Welcome Email result 1:", res1);
    if (res1.success) {
      results.welcomeEmail = "PASS";
    }

    // 2. Test Welcome Email Idempotency (Retry)
    console.log("\n[Test 2] Testing Welcome Email Retry (Duplicate Prevention)...");
    const res2 = await sendWelcomeEmail(testEmail, "Pratik Shah", testUserId);
    console.log("Welcome Email result 2 (retry):", res2);
    if (res2.success && res2.skipped) {
      results.welcomeIdempotency = "PASS";
      console.log("✓ Correctly prevented duplicate welcome email!");
    }
  } catch (err) {
    console.error("Welcome email test error:", err.message);
  }

  // 3. Test Order Confirmation Email
  const mockOrder = {
    orderId: testOrderId,
    userId: testUserId,
    customerName: "Pratik Shah",
    fullName: "Pratik Shah",
    email: testEmail,
    items: [
      {
        name: "boAt Rockerz 450 Bluetooth Headphones",
        price: 3200,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
      }
    ],
    productName: "boAt Rockerz 450 Bluetooth Headphones",
    quantity: 1,
    subtotal: 3200,
    conversionAmountNPR: 3200,
    deliveryChargeNPR: 200,
    serviceChargeNPR: 150,
    customsChargeNPR: 0,
    totalAmount: 3550,
    finalAmountNPR: 3550,
    orderStatus: "Processing",
    paymentStatus: "PAID",
    paymentMethod: "eSewa",
    deliveryAddress: "New Baneshwor, Kathmandu, Nepal"
  };

  try {
    console.log("\n[Test 3] Testing Order Confirmation Email...");
    const ordRes1 = await sendOrderConfirmationEmail(testEmail, mockOrder);
    console.log("Order Confirmation result 1:", ordRes1);
    if (ordRes1.success) {
      results.orderConfirmationEmail = "PASS";
    }

    // 4. Test Order Confirmation Idempotency (Retry)
    console.log("\n[Test 4] Testing Order Confirmation Retry (Duplicate Prevention)...");
    const ordRes2 = await sendOrderConfirmationEmail(testEmail, mockOrder);
    console.log("Order Confirmation result 2 (retry):", ordRes2);
    if (ordRes2.success && ordRes2.skipped) {
      results.orderConfirmationIdempotency = "PASS";
      console.log("✓ Correctly prevented duplicate order confirmation email!");
    }
  } catch (err) {
    console.error("Order confirmation test error:", err.message);
  }

  // 5. Test Status Update: PROCESSING -> SHIPPED
  try {
    console.log("\n[Test 5] Testing Status Update: PROCESSING -> SHIPPED...");
    const statusRes1 = await sendOrderStatusEmail(testEmail, mockOrder, "SHIPPED", "PROCESSING");
    console.log("Status Update result 1 (SHIPPED):", statusRes1);
    if (statusRes1.success) {
      results.orderStatusUpdateEmail = "PASS";
    }

    // 6. Test Same Status: SHIPPED -> SHIPPED (Should skip)
    console.log("\n[Test 6] Testing Same Status: SHIPPED -> SHIPPED...");
    const statusRes2 = await sendOrderStatusEmail(testEmail, mockOrder, "SHIPPED", "SHIPPED");
    console.log("Status Update result 2 (Unchanged):", statusRes2);
    if (statusRes2.success && statusRes2.skipped && statusRes2.reason === "Status unchanged") {
      results.orderStatusSameSkip = "PASS";
      console.log("✓ Correctly skipped email for unchanged status!");
    }
  } catch (err) {
    console.error("Status update test error:", err.message);
  }

  // 7. Test Dedicated Delivered Email: SHIPPED -> DELIVERED
  try {
    console.log("\n[Test 7] Testing Dedicated Delivered Email: SHIPPED -> DELIVERED...");
    const delivRes1 = await sendOrderDeliveredEmail(testEmail, mockOrder);
    console.log("Delivered Email result 1:", delivRes1);
    if (delivRes1.success) {
      results.deliveredEmail = "PASS";
    }

    // 8. Test Delivered Email Idempotency (Retry)
    console.log("\n[Test 8] Testing Delivered Email Retry (Duplicate Prevention)...");
    const delivRes2 = await sendOrderDeliveredEmail(testEmail, mockOrder);
    console.log("Delivered Email result 2 (retry):", delivRes2);
    if (delivRes2.success && delivRes2.skipped) {
      results.deliveredIdempotency = "PASS";
      console.log("✓ Correctly prevented duplicate delivered email!");
    }
  } catch (err) {
    console.error("Delivered email test error:", err.message);
  }

  // 9. Non-blocking Fault Tolerance Check
  try {
    console.log("\n[Test 9] Testing Non-blocking Fault Tolerance on invalid email...");
    const badRes = await sendWelcomeEmail("invalid-email-no-at-sign", "Bad User");
    console.log("Fault Tolerance Result:", badRes);
    if (badRes.success === false) {
      results.nonBlockingFaultTolerance = "PASS";
      console.log("✓ Handled bad email safely without throwing uncaught exceptions!");
    }
  } catch (err) {
    console.error("Fault tolerance test error:", err.message);
  }

  // Clean up test records
  try {
    await EmailNotificationModel.deleteMany({
      $or: [{ recipient: testEmail }, { orderId: testOrderId }]
    });
    console.log("\n✓ Cleaned up temporary test notification records.");
  } catch (cleanupErr) {
    // ignore
  }

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  console.log("\n================ TEST RESULTS SUMMARY ================");
  console.log("1. Welcome email:", results.welcomeEmail);
  console.log("2. Welcome email idempotency:", results.welcomeIdempotency);
  console.log("3. Order confirmation email:", results.orderConfirmationEmail);
  console.log("4. Order confirmation idempotency:", results.orderConfirmationIdempotency);
  console.log("5. Order status update email (PROCESSING -> SHIPPED):", results.orderStatusUpdateEmail);
  console.log("6. Order status unchanged skip (SHIPPED -> SHIPPED):", results.orderStatusSameSkip);
  console.log("7. Dedicated delivered email (SHIPPED -> DELIVERED):", results.deliveredEmail);
  console.log("8. Dedicated delivered idempotency:", results.deliveredIdempotency);
  console.log("9. Non-blocking error handling & fault tolerance:", results.nonBlockingFaultTolerance);
  console.log("======================================================");
}

runEmailTestSuite();
