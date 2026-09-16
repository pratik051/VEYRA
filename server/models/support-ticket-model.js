import mongoose from "mongoose";

export const TICKET_CATEGORIES = [
  "Order Problem",
  "Payment Problem",
  "Product Problem",
  "Delivery Problem",
  "Account Problem",
  "Website/Technical Problem",
  "Refund/Return Problem",
  "Other"
];

export const TICKET_STATUSES = [
  "Open",
  "In Progress",
  "Waiting for User",
  "Resolved",
  "Closed"
];

export const TICKET_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent"
];

const TicketMessageSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ["user", "admin"], required: true },
    message: { type: String, required: true, trim: true },
    messageType: { type: String, enum: ["reply", "internal_note"], default: "reply" },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const SupportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, trim: true, lowercase: true },
    userPhone: { type: String, default: "", trim: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: TICKET_CATEGORIES,
      required: true,
      index: true
    },
    description: { type: String, required: true, trim: true },
    orderId: { type: String, default: "", index: true },
    productId: { type: String, default: "" },
    marketplace: { type: String, default: "" },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: "Open",
      index: true
    },
    priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      default: "medium",
      index: true
    },
    messages: { type: [TicketMessageSchema], default: [] }
  },
  { timestamps: true }
);

export const SupportTicketModel =
  mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);
export default SupportTicketModel;
