import express from "express";
import { getProducts, getProductBySlug, getMarketplaceProducts } from "../controllers/product-controller.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/marketplace", getMarketplaceProducts);
router.get("/:slug", getProductBySlug);

export default router;
