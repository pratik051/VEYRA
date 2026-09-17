import express from "express";
import { createPaymentQR, submitPaymentProof } from "../controllers/payment-controller.js";
import { authenticateUser } from "../middleware/auth.js";
import { uploadPaymentScreenshot } from "../middleware/upload.js";

const router = express.Router();

router.post("/create-qr", createPaymentQR);
router.post(
  "/submit-proof",
  authenticateUser,
  uploadPaymentScreenshot.single("screenshot"),
  submitPaymentProof
);

export default router;
