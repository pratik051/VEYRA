import express from "express";
import { verifyProductLink } from "../controllers/ai-controller.js";

const router = express.Router();

router.post("/verify-product-link", verifyProductLink);
router.post("/fetch-product", verifyProductLink);
router.post("/", verifyProductLink);

export default router;
