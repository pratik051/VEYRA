import ProductRequestModel from "../models/product-request-model.js";

export async function createProductRequest(req, res) {
  try {
    const body = req.body || {};
    const userName = String(body.userName || body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const originalProductUrl = String(body.originalProductUrl || body.productUrl || "").trim();

    if (!userName || !phone || !originalProductUrl) {
      return res.status(400).json({ error: "Name, phone number, and product link are required." });
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const requestId = `REQ-${randomSuffix}`;

    const requestDoc = await ProductRequestModel.create({
      requestId,
      userId: req.user ? String(req.user._id) : "",
      userName,
      phone,
      email: body.email || (req.user ? req.user.email : ""),
      deliveryLocation: body.deliveryLocation || "",
      originalMarketplace: body.originalMarketplace || "Indian Marketplace",
      originalProductUrl,
      productName: body.productName || "Requested Indian Product",
      productImage: body.productImage || "",
      requestedQuantity: Number(body.requestedQuantity) || 1,
      additionalNotes: body.additionalNotes || "",
      status: "Pending"
    });

    return res.json({ success: true, message: "Product request submitted successfully!", request: requestDoc });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to submit product request." });
  }
}

export async function getUserProductRequests(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const requests = await ProductRequestModel.find({
      $or: [{ userId: String(req.user._id) }, { phone: req.user.phone }]
    }).sort({ createdAt: -1 }).lean();

    return res.json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch product requests." });
  }
}
