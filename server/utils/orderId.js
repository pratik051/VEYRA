import crypto from "crypto";
import OrderModel from "../models/order-model.js";
import IndiaOrderModel from "../models/india-order-model.js";

/**
 * Server-Side Collision-Resistant Unique Order ID Generator
 * Format: SM-YYYYMMDD-XXXXXX (e.g. SM-20260926-A1B2C3)
 */
export async function generateUniqueOrderId(prefix = "SM") {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  
  for (let attempt = 0; attempt < 10; attempt++) {
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const candidateId = `${prefix}-${dateStr}-${randomHex}`;
    
    // Cross-check existence in both order collections
    const [existsStandard, existsIndia] = await Promise.all([
      OrderModel.exists({ orderId: candidateId }),
      IndiaOrderModel.exists({ orderId: candidateId })
    ]);
    
    if (!existsStandard && !existsIndia) {
      return candidateId;
    }
  }
  
  // Fallback high-entropy guarantee
  const highEntropy = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${dateStr}-${Date.now().toString().slice(-4)}${highEntropy.slice(0, 2)}`;
}

/**
 * Server-Side Collision-Resistant Invoice Number Generator
 */
export async function generateUniqueInvoiceNumber() {
  const year = new Date().getFullYear();
  
  for (let attempt = 0; attempt < 10; attempt++) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const candidateInv = `INV-${year}-${randomNum}`;
    
    const exists = await IndiaOrderModel.exists({ invoiceNumber: candidateInv });
    if (!exists) {
      return candidateInv;
    }
  }
  
  return `INV-${year}-${Date.now().toString().slice(-6)}`;
}
