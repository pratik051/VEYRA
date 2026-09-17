import express from "express";
import {
  login,
  signup,
  firebaseAuthHandler,
  googleOAuthRedirectHandler,
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
  getCurrentUserCtrl,
  logout,
  updateProfile
} from "../controllers/auth-controller.js";
import { authenticateUser, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/register", signup);
router.post("/firebase", firebaseAuthHandler);
router.get("/google", googleOAuthRedirectHandler);
router.post("/forgot-password/send-otp", forgotPasswordSendOtp);
router.post("/forgot-password/verify-otp", forgotPasswordVerifyOtp);
router.get("/me", authenticateUser, getCurrentUserCtrl);
router.get("/session", authenticateUser, getCurrentUserCtrl);
router.post("/logout", authenticateUser, logout);
router.put("/profile", authenticateUser, requireAuth, updateProfile);

export default router;
