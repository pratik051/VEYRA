import express from "express";
import { createSupportTicket, getUserTickets, replyToTicket } from "../controllers/support-controller.js";
import { authenticateUser, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateUser, requireAuth);

router.post("/tickets", createSupportTicket);
router.get("/tickets", getUserTickets);
router.post("/tickets/:id/reply", replyToTicket);

export default router;
