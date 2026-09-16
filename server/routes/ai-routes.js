import express from "express";
import { verifyProductLink } from "../controllers/ai-controller.js";

const router = express.Router();

router.post("/verify-product-link", verifyProductLink);

export default router;
