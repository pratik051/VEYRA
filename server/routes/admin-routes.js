import express from "express";
import {
  getDashboardStats,
  getAllIndiaOrders,
  updateIndiaOrder,
  getAllProductRequests,
  updateProductRequest,
  getAllSupportTickets,
  updateSupportTicket,
  getAllUsers,
  updateUserRole,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/admin-controller.js";
import { authenticateUser, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply admin authentication to all routes in this router
router.use(authenticateUser, requireAdmin);

router.get("/stats", getDashboardStats);

router.get("/india-orders", getAllIndiaOrders);
router.get("/india-orders/:id", getAllIndiaOrders);
router.patch("/india-orders/:id", updateIndiaOrder);

router.get("/product-requests", getAllProductRequests);
router.patch("/product-requests/:id", updateProductRequest);

router.get("/tickets", getAllSupportTickets);
router.patch("/tickets/:id", updateSupportTicket);

router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);

router.get("/products", getAdminProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
