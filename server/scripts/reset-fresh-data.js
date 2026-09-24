import "../config/env.js";
import mongoose from "mongoose";
import UserModel from "../models/user-model.js";
import AuthSessionModel from "../models/auth-session-model.js";
import OrderModel from "../models/order-model.js";
import IndiaOrderModel from "../models/india-order-model.js";
import PaymentModel from "../models/payment-model.js";
import CartModel from "../models/cart-model.js";
import AddressModel from "../models/address-model.js";
import ProductRequestModel from "../models/product-request-model.js";
import SupportTicketModel from "../models/support-ticket-model.js";
import EmailNotificationModel from "../models/email-notification-model.js";
import PasswordResetOtpModel from "../models/password-reset-otp-model.js";
import PasswordResetTokenModel from "../models/password-reset-token-model.js";
import { seedAdmin } from "../services/auth-service.js";

async function clearAndResetFreshData() {
  console.log("=================================================");
  console.log("  SajiloMarts — Database Reset & Clean Slate     ");
  console.log("=================================================");

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Error: MONGODB_URI is not defined in environment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB Atlas\n");

    // 1. Clear Orders
    const delOrders = await OrderModel.deleteMany({});
    const delIndiaOrders = await IndiaOrderModel.deleteMany({});
    console.log(`✓ Cleared Storefront Orders: ${delOrders.deletedCount}`);
    console.log(`✓ Cleared India Sourcing Orders: ${delIndiaOrders.deletedCount}`);

    // 2. Clear Payments
    const delPayments = await PaymentModel.deleteMany({});
    console.log(`✓ Cleared Payments & Verification Queue: ${delPayments.deletedCount}`);

    // 3. Clear Carts & Saved Addresses
    const delCarts = await CartModel.deleteMany({});
    const delAddresses = await AddressModel.deleteMany({});
    console.log(`✓ Cleared Active Carts: ${delCarts.deletedCount}`);
    console.log(`✓ Cleared Saved Delivery Addresses: ${delAddresses.deletedCount}`);

    // 4. Clear Product Sourcing Requests & Support Tickets
    const delRequests = await ProductRequestModel.deleteMany({});
    const delTickets = await SupportTicketModel.deleteMany({});
    console.log(`✓ Cleared Product Sourcing Requests: ${delRequests.deletedCount}`);
    console.log(`✓ Cleared Support Tickets: ${delTickets.deletedCount}`);

    // 5. Clear Auth Sessions, OTPs, and Notification Logs
    const delSessions = await AuthSessionModel.deleteMany({});
    const delOtps = await PasswordResetOtpModel.deleteMany({});
    const delTokens = await PasswordResetTokenModel.deleteMany({});
    const delEmails = await EmailNotificationModel.deleteMany({});
    console.log(`✓ Cleared Active Auth Sessions: ${delSessions.deletedCount}`);
    console.log(`✓ Cleared Password Reset OTPs & Tokens: ${delOtps.deletedCount + delTokens.deletedCount}`);
    console.log(`✓ Cleared Email Notification Logs: ${delEmails.deletedCount}`);

    // 6. Clear Customer Accounts (Keep only master admin)
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const delUsers = await UserModel.deleteMany({
      $and: [
        { role: { $ne: "admin" } },
        ...(adminEmail ? [{ email: { $ne: adminEmail } }] : [])
      ]
    });
    console.log(`✓ Cleared Customer / Test User Accounts: ${delUsers.deletedCount}`);

    // 7. Re-sync Master Admin Account
    console.log("\nRe-syncing fresh Master Admin Account...");
    await seedAdmin();
    console.log("✓ Master Admin account is ready and synced.");

    console.log("\n=================================================");
    console.log("  SUCCESS: Database is now completely FRESH!     ");
    console.log("=================================================");
  } catch (err) {
    console.error("Database reset error:", err.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("✓ MongoDB connection closed.");
    }
  }
}

clearAndResetFreshData();
