import express from "express";
import { createPaymentQR, submitPaymentProof } from "../controllers/payment-controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-qr", createPaymentQR);
router.post("/submit-proof", authenticateUser, submitPaymentProof);

export default router;
