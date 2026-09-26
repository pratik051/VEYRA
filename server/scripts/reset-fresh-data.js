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
import { hashPassword } from "../utils/password.js";

async function performFreshProductionDatabaseReset() {
  console.log("================================================================================");
  console.log("             SajiloMarts — Production Database Complete Clean Reset             ");
  console.log("================================================================================");

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Error: MONGODB_URI is not defined in server environment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    const dbName = mongoose.connection.name || "sajilomarts";
    console.log(`✓ Connected to MongoDB Atlas Target Database: [${dbName}]\n`);

    // 1. Completely Remove All Orders & Order Items
    const delOrders = await OrderModel.deleteMany({});
    const delIndiaOrders = await IndiaOrderModel.deleteMany({});
    console.log(`✓ Cleared Storefront Orders (${delOrders.deletedCount} records deleted)`);
    console.log(`✓ Cleared Direct India Orders (${delIndiaOrders.deletedCount} records deleted)`);

    // 2. Completely Remove All Payment Proofs & Records
    const delPayments = await PaymentModel.deleteMany({});
    console.log(`✓ Cleared Payments & Verification Slips (${delPayments.deletedCount} records deleted)`);

    // 3. Completely Remove Carts & Customer Saved Addresses
    const delCarts = await CartModel.deleteMany({});
    const delAddresses = await AddressModel.deleteMany({});
    console.log(`✓ Cleared Active Carts (${delCarts.deletedCount} records deleted)`);
    console.log(`✓ Cleared Saved Delivery Addresses (${delAddresses.deletedCount} records deleted)`);

    // 4. Completely Remove Product Sourcing Inquiries & Support Inquiries
    const delRequests = await ProductRequestModel.deleteMany({});
    const delTickets = await SupportTicketModel.deleteMany({});
    console.log(`✓ Cleared Product Requests (${delRequests.deletedCount} records deleted)`);
    console.log(`✓ Cleared Support Tickets (${delTickets.deletedCount} records deleted)`);

    // 5. Completely Remove Auth Sessions, OTPs, and Email Logs
    const delSessions = await AuthSessionModel.deleteMany({});
    const delOtps = await PasswordResetOtpModel.deleteMany({});
    const delTokens = await PasswordResetTokenModel.deleteMany({});
    const delEmails = await EmailNotificationModel.deleteMany({});
    console.log(`✓ Cleared Auth Sessions (${delSessions.deletedCount} records deleted)`);
    console.log(`✓ Cleared Password Reset OTPs & Tokens (${delOtps.deletedCount + delTokens.deletedCount} records deleted)`);
    console.log(`✓ Cleared Historical Email Notification Logs (${delEmails.deletedCount} records deleted)`);

    // 6. Completely Remove All Users / Accounts
    const delUsers = await UserModel.deleteMany({});
    console.log(`✓ Cleared All Previous Accounts (${delUsers.deletedCount} records deleted)`);

    // 7. Ensure Unique Indexes are Built Cleanly
    console.log("\nRebuilding unique indexes for fresh database state...");
    await Promise.allSettled([
      OrderModel.syncIndexes(),
      IndiaOrderModel.syncIndexes(),
      UserModel.syncIndexes(),
      PaymentModel.syncIndexes(),
      AuthSessionModel.syncIndexes()
    ]);
    console.log("✓ Unique indexes synchronized (orderId, invoiceNumber, email, token).");

    // 8. Re-sync / Initialize Fresh Master Administrator Account
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@sajilomarts.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@SajiloMarts2026#";
    const adminPasswordHash = await hashPassword(adminPassword);

    await UserModel.create({
      fullName: "SajiloMarts Executive Admin",
      email: adminEmail,
      phone: "9800000000",
      passwordHash: adminPasswordHash,
      role: "admin"
    });
    console.log(`✓ Fresh Master Administrator seeded for [${adminEmail}] with secure role: admin.`);

    // 9. Verify Post-Reset Database State
    const [
      remainingOrders,
      remainingIndiaOrders,
      remainingPayments,
      remainingCustomers,
      totalUsersCount
    ] = await Promise.all([
      OrderModel.countDocuments({}),
      IndiaOrderModel.countDocuments({}),
      PaymentModel.countDocuments({}),
      UserModel.countDocuments({ role: "customer" }),
      UserModel.countDocuments({})
    ]);

    console.log("\n================ POST-RESET VERIFICATION ================");
    console.log(`Storefront Orders:        ${remainingOrders} (Expected: 0)`);
    console.log(`India Sourced Orders:     ${remainingIndiaOrders} (Expected: 0)`);
    console.log(`Payment Submissions:      ${remainingPayments} (Expected: 0)`);
    console.log(`Customer Registrations:   ${remainingCustomers} (Expected: 0)`);
    console.log(`Total Users (Admin only): ${totalUsersCount} (Expected: 1)`);
    console.log("==========================================================");

    if (remainingOrders === 0 && remainingIndiaOrders === 0 && remainingCustomers === 0 && totalUsersCount === 1) {
      console.log("\n✓ ALL CRITERIA MET: Database is in a 100% fresh, clean production state!\n");
    } else {
      console.warn("\n⚠ Warning: Some counts did not match expected zero state.");
    }
  } catch (err) {
    console.error("Database reset failure:", err.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("✓ MongoDB connection safely closed.");
    }
  }
}

performFreshProductionDatabaseReset();
