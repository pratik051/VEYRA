import mongoose from "mongoose";
import dotenv from "dotenv";
import IndiaOrderModel from "../models/india-order-model.js";
import OrderModel from "../models/order-model.js";
import { generateUniqueOrderId, generateUniqueInvoiceNumber } from "../utils/orderId.js";

dotenv.config();

async function runTest() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/sajilomarts";
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✓ Connected to MongoDB");

  console.log("\n=== TEST 1: CREATE INDIA ORDER WITH VARIANT, COLOR, SIZE ===");
  const orderId1 = await generateUniqueOrderId("SM");
  const invoice1 = await generateUniqueInvoiceNumber();

  const orderWithVariants = await IndiaOrderModel.create({
    orderId: orderId1,
    invoiceNumber: invoice1,
    customerName: "Test Customer 1",
    phone: "9800000001",
    email: "testcustomer1@gmail.com",
    deliveryAddress: "Kathmandu Ward 4, Bagmati",
    city: "Kathmandu",
    province: "Bagmati",
    productUrl: "https://www.amazon.in/dp/B08N5XSG8Z",
    productName: "Nike Running Shoes",
    brand: "Nike",
    variant: "Air Max 90",
    productVariant: "Air Max 90",
    color: "Black",
    size: "42",
    quantity: 1,
    indianPriceINR: 4999,
    conversionAmountNPR: 8248.35,
    serviceChargeNPR: 1649.67,
    deliveryChargeNPR: 200,
    finalAmountNPR: 10098,
    paymentMethod: "COD",
    paymentStatus: "Pending Verification",
    orderStatus: "Requested"
  });

  console.log("✓ Order with Variants Created:");
  console.log(`  Order ID: ${orderWithVariants.orderId}`);
  console.log(`  Product: ${orderWithVariants.productName}`);
  console.log(`  Brand: ${orderWithVariants.brand}`);
  console.log(`  Price: NPR ${orderWithVariants.finalAmountNPR}`);
  console.log(`  Variant: ${orderWithVariants.variant || "Not specified"}`);
  console.log(`  Color: ${orderWithVariants.color || "Not specified"}`);
  console.log(`  Size: ${orderWithVariants.size || "Not specified"}`);

  if (orderWithVariants.variant !== "Air Max 90" || orderWithVariants.color !== "Black" || orderWithVariants.size !== "42") {
    throw new Error("Variant fields failed to save properly on Order 1");
  }

  console.log("\n=== TEST 2: CREATE INDIA ORDER WITHOUT VARIANT, COLOR, SIZE ===");
  const orderId2 = await generateUniqueOrderId("SM");
  const invoice2 = await generateUniqueInvoiceNumber();

  const orderWithoutVariants = await IndiaOrderModel.create({
    orderId: orderId2,
    invoiceNumber: invoice2,
    customerName: "Test Customer 2",
    phone: "9800000002",
    email: "testcustomer2@gmail.com",
    deliveryAddress: "Pokhara Ward 8, Gandaki",
    city: "Pokhara",
    province: "Gandaki",
    productUrl: "https://www.amazon.in/dp/B09V7W319X",
    productName: "Simple Book / Generic Item",
    brand: "",
    variant: "",
    productVariant: "",
    color: "",
    size: "",
    quantity: 1,
    indianPriceINR: 500,
    conversionAmountNPR: 825,
    serviceChargeNPR: 165,
    deliveryChargeNPR: 200,
    finalAmountNPR: 1190,
    paymentMethod: "COD",
    paymentStatus: "Pending Verification",
    orderStatus: "Requested"
  });

  console.log("✓ Order without Variants Created (Empty/Null check):");
  console.log(`  Order ID: ${orderWithoutVariants.orderId}`);
  console.log(`  Product: ${orderWithoutVariants.productName}`);
  console.log(`  Brand: ${orderWithoutVariants.brand || "Not specified"}`);
  console.log(`  Price: NPR ${orderWithoutVariants.finalAmountNPR}`);
  console.log(`  Variant: ${orderWithoutVariants.variant || "Not specified"}`);
  console.log(`  Color: ${orderWithoutVariants.color || "Not specified"}`);
  console.log(`  Size: ${orderWithoutVariants.size || "Not specified"}`);

  console.log("\n=== TEST 3: STANDARD CHECKOUT ORDER WITH OPTIONAL FIELDS ===");
  const orderId3 = await generateUniqueOrderId("SM");
  const standardOrder = await OrderModel.create({
    orderId: orderId3,
    fullName: "Test Customer 3",
    customerName: "Test Customer 3",
    phone: "9800000003",
    email: "testcustomer3@gmail.com",
    fullAddress: "Lalitpur Ward 2",
    paymentMethod: "eSewa",
    paymentStatus: "Pending Verification",
    orderStatus: "Processing",
    items: [
      {
        productId: "nike-shoe-1",
        name: "Nike Shoes",
        brand: "Nike",
        variant: "Air Max 90",
        color: "Black",
        size: "42",
        price: 9999,
        unitPrice: 9999,
        quantity: 1
      },
      {
        productId: "socks-1",
        name: "Cotton Socks",
        brand: "",
        variant: "",
        color: "",
        size: "",
        price: 250,
        unitPrice: 250,
        quantity: 2
      }
    ],
    totalAmount: 10499
  });

  console.log("✓ Standard Order Created with 2 items (one with variants, one without):");
  standardOrder.items.forEach((item, idx) => {
    console.log(`  Item ${idx + 1}: ${item.name}`);
    console.log(`    Brand: ${item.brand || "Not specified"}`);
    console.log(`    Variant: ${item.variant || "Not specified"}`);
    console.log(`    Color: ${item.color || "Not specified"}`);
    console.log(`    Size: ${item.size || "Not specified"}`);
  });

  // Clean up test records
  await IndiaOrderModel.deleteMany({ orderId: { $in: [orderId1, orderId2] } });
  await OrderModel.deleteMany({ orderId: orderId3 });
  console.log("\n✓ Cleaned up test records from database");

  await mongoose.disconnect();
  console.log("✓ All 3 tests passed successfully!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
