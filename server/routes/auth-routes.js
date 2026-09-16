import express from "express";
import { login, signup, getCurrentUserCtrl, logout, updateProfile } from "../controllers/auth-controller.js";
import { authenticateUser, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/register", signup);
router.get("/me", authenticateUser, getCurrentUserCtrl);
router.get("/session", authenticateUser, getCurrentUserCtrl);
router.post("/logout", authenticateUser, logout);
router.put("/profile", authenticateUser, requireAuth, updateProfile);

export default router;
