import express from "express";
import {
  getUserOrders,
  getUserOrderById,
  getUserAddresses,
  createUserAddress,
  getUserProductRequests,
  getUserTickets
} from "../controllers/user-controller.js";
import { authenticateUser, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateUser, requireAuth);

router.get("/orders", getUserOrders);
router.get("/orders/:orderId", getUserOrderById);
router.get("/addresses", getUserAddresses);
router.post("/addresses", createUserAddress);
router.get("/product-requests", getUserProductRequests);
router.get("/tickets", getUserTickets);

export default router;
