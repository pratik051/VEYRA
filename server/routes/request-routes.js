import express from "express";
import { createProductRequest, getUserProductRequests } from "../controllers/request-controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authenticateUser, createProductRequest);
router.get("/my-requests", authenticateUser, getUserProductRequests);

export default router;
