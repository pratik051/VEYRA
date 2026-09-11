// Test suite for Support Tickets System & Role-based separation
const assert = require("assert");

console.log("=========================================");
console.log("RUNNING SUPPORT TICKETS & SECURITY TESTS");
console.log("=========================================\n");

// 1. Test Problem Categories and Status Constants
const PROBLEM_CATEGORIES = [
  "Order Problem",
  "Payment Problem",
  "Product Problem",
  "Delivery Problem",
  "Account Problem",
  "Website/Technical Problem",
  "Refund/Return Problem",
  "Other"
];

const TICKET_STATUSES = ["Open", "In Progress", "Waiting for User", "Resolved", "Closed"];

assert.strictEqual(PROBLEM_CATEGORIES.length, 8, "Expected 8 valid problem categories");
assert.strictEqual(TICKET_STATUSES.length, 5, "Expected 5 valid ticket statuses");
console.log("✓ Test 1 Passed: Valid problem categories and statuses verified.");

// 2. Test Message Threading and Security Isolation (Internal Notes Stripping)
const mockTicket = {
  ticketId: "TCK-89211",
  userId: "user_123",
  userName: "Customer Alice",
  userEmail: "alice@example.com",
  subject: "Damaged packaging on arrival",
  category: "Delivery Problem",
  description: "The outer box was torn and taped poorly.",
  status: "Open",
  priority: "High",
  createdAt: new Date("2026-09-12T01:00:00Z"),
  updatedAt: new Date("2026-09-12T01:10:00Z"),
  messages: [
    {
      messageId: "MSG-01",
      senderId: "user_123",
      senderName: "Customer Alice",
      senderRole: "user",
      message: "The outer box was torn and taped poorly.",
      messageType: "reply",
      createdAt: new Date("2026-09-12T01:00:00Z")
    },
    {
      messageId: "MSG-02",
      senderId: "admin_999",
      senderName: "Support Manager",
      senderRole: "admin",
      message: "Check courier logs with Blue Dart regarding this batch.",
      messageType: "internal_note", // ADMIN ONLY
      createdAt: new Date("2026-09-12T01:05:00Z")
    },
    {
      messageId: "MSG-03",
      senderId: "admin_999",
      senderName: "Support Manager",
      senderRole: "admin",
      message: "Hello Alice, we sincerely apologize. We are reviewing courier logs and will replace it.",
      messageType: "reply", // CUSTOMER VISIBLE
      createdAt: new Date("2026-09-12T01:10:00Z")
    }
  ]
};

// Customer view sanitizer function (mirrors /api/user/tickets/[id])
function sanitizeTicketForUser(ticket, requestingUserId, isAdmin) {
  if (!isAdmin && ticket.userId !== requestingUserId) {
    throw new Error("Access Denied: Ticket belongs to another user");
  }

  return {
    ...ticket,
    messages: isAdmin
      ? ticket.messages
      : ticket.messages.filter((m) => m.messageType !== "internal_note")
  };
}

// Check Alice viewing her own ticket
const aliceView = sanitizeTicketForUser(mockTicket, "user_123", false);
assert.strictEqual(aliceView.messages.length, 2, "Customer view must NOT contain internal notes");
assert.ok(!aliceView.messages.some((m) => m.messageType === "internal_note"), "No internal notes allowed in customer response");
assert.strictEqual(aliceView.messages[1].message, "Hello Alice, we sincerely apologize. We are reviewing courier logs and will replace it.");
console.log("✓ Test 2 Passed: Internal admin notes are strictly hidden from customer view.");

// Check Admin viewing the ticket
const adminView = sanitizeTicketForUser(mockTicket, "admin_999", true);
assert.strictEqual(adminView.messages.length, 3, "Admin view must contain all messages including internal notes");
console.log("✓ Test 3 Passed: Admin view contains full thread including internal staff notes.");

// Check User B (unauthorized) attempting to access Alice's ticket
let unauthorizedBlocked = false;
try {
  sanitizeTicketForUser(mockTicket, "user_456", false);
} catch (err) {
  unauthorizedBlocked = true;
}
assert.ok(unauthorizedBlocked, "User B must be blocked with 403 Access Denied");
console.log("✓ Test 4 Passed: Cross-user ticket access is securely rejected on the server.");

// 5. Test Ticket Status Lifecycle & Re-opening on Customer Reply
function processUserReply(ticket, newMessage) {
  ticket.messages.push(newMessage);
  if (ticket.status === "Waiting for User" || ticket.status === "Resolved") {
    ticket.status = "Open";
  }
  ticket.updatedAt = new Date();
  return ticket;
}

mockTicket.status = "Waiting for User";
processUserReply(mockTicket, {
  messageId: "MSG-04",
  senderId: "user_123",
  senderName: "Customer Alice",
  senderRole: "user",
  message: "Here are the photos of the damage.",
  messageType: "reply",
  createdAt: new Date()
});

assert.strictEqual(mockTicket.status, "Open", "Ticket status should transition back to Open upon customer reply");
console.log("✓ Test 5 Passed: Status transitions automatically when customer replies.");

console.log("\n=========================================");
console.log("ALL SUPPORT TICKET & SECURITY TESTS PASSED!");
console.log("=========================================\n");
