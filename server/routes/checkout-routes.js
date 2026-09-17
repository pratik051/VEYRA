import express from "express";
import { createCheckoutOrder, getOrderDetails } from "../controllers/order-controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Order creation endpoint called by storefront checkout
router.post("/", authenticateUser, createCheckoutOrder);
router.get("/:orderId", authenticateUser, getOrderDetails);

export default router;
