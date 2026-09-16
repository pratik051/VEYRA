import express from "express";
import { calculatePrice, createIndiaOrder, getUserOrders, getOrderById } from "../controllers/india-order-controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/calculate-price", calculatePrice);
router.post("/create", authenticateUser, createIndiaOrder);
router.get("/my-orders", authenticateUser, getUserOrders);
router.get("/:orderId", authenticateUser, getOrderById);

export default router;
