import SupportTicketModel from "../models/support-ticket-model.js";

export async function createSupportTicket(req, res) {
  try {
    const { subject, category, description, orderId, productId, marketplace } = req.body || {};
    if (!subject || !category || !description) {
      return res.status(400).json({ error: "Subject, category, and description are required." });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Please log in to submit a support ticket." });
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketId = `TKT-${randomSuffix}`;

    const ticket = await SupportTicketModel.create({
      ticketId,
      userId: String(user._id),
      userName: user.fullName || "Valued Customer",
      userEmail: user.email || "",
      userPhone: user.phone || "",
      subject: subject.trim(),
      category,
      description: description.trim(),
      orderId: orderId || "",
      productId: productId || "",
      marketplace: marketplace || "",
      status: "Open",
      priority: "medium",
      messages: [
        {
          messageId: "msg-1",
          senderId: String(user._id),
          senderName: user.fullName || "Valued Customer",
          senderRole: "user",
          message: description.trim(),
          createdAt: new Date()
        }
      ]
    });

    return res.json({ success: true, message: "Support ticket created successfully.", ticket });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to create support ticket." });
  }
}

export async function getUserTickets(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const tickets = await SupportTicketModel.find({ userId: String(req.user._id) }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, tickets });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch tickets." });
  }
}

export async function replyToTicket(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Reply message cannot be empty." });
    }

    const ticket = await SupportTicketModel.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }, { ticketId: id }]
    });

    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    ticket.messages.push({
      messageId: "msg-" + Date.now(),
      senderId: String(req.user._id),
      senderName: req.user.fullName,
      senderRole: req.user.role === "admin" ? "admin" : "user",
      message: message.trim(),
      createdAt: new Date()
    });

    if (req.user.role !== "admin") {
      ticket.status = "Open";
    }

    await ticket.save();
    return res.json({ success: true, ticket });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to submit reply." });
  }
}
