# SAJILOMARTS API Specification (v1 Draft)

This document defines implementation-ready backend API contracts for SAJILOMARTS.

- Base URL: `/api`
- Content-Type: `application/json`
- Auth (current): session cookie `sajilomarts_session` (httpOnly)
- Auth (future optional): bearer token support can be added without changing payload schemas

## 1) Authentication and Accounts

### POST `/auth/register`
- Purpose: Create customer account and start session.
- Auth: Public
- Request:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "98XXXXXXXX",
  "password": "strong-password"
}
```
- Success `200`:
```json
{
  "message": "Account created successfully.",
  "user": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "role": "customer"
  }
}
```
- Errors: `400` invalid input, `409` email exists, `500` create failure.

### POST `/auth/login`
- Purpose: Authenticate and create session.
- Auth: Public
- Request:
```json
{
  "email": "jane@example.com",
  "password": "strong-password"
}
```
- Success `200` returns user object and sets `sajilomarts_session`.
- Errors: `400`, `401`.

### POST `/auth/logout`
- Purpose: Invalidate current session.
- Auth: Logged-in user
- Success `200`: `{ "message": "Logged out successfully." }`

### POST `/auth/refresh`
- Purpose: Rotate session token and extend session expiry for active user.
- Auth: Logged-in user (valid `sajilomarts_session`)
- Success `200`:
```json
{
  "message": "Session refreshed.",
  "user": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "role": "customer|admin"
  }
}
```
- Errors: `401` when session is missing, expired, or invalid.

### GET `/auth/me`
- Purpose: Resolve current user from cookie session.
- Auth: Logged-in user
- Success `200`:
```json
{
  "user": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "role": "customer|admin"
  }
}
```
- Errors: `401`.

### POST `/auth/reset-request`
- Purpose: Start password reset flow.
- Auth: Public
- Request: `{ "email": "jane@example.com" }`
- Success `200`: safe message; in non-production may include reset token.
- Errors: `400`.

### POST `/auth/reset-password`
- Purpose: Complete password reset using reset token.
- Auth: Public
- Request:
```json
{
  "token": "reset-token",
  "newPassword": "new-strong-password"
}
```
- Success `200`, errors `400`, `500`.

## 2) Products and Categories

### Customer-facing (existing)

### GET `/products`
- Query:
  - `q` search text
  - `category`
  - `minPrice`, `maxPrice`
  - `sort` (`newest|price_asc|price_desc|trending`)
  - `page`, `limit`
- Success `200`:
```json
{
  "items": [],
  "pagination": { "page": 1, "limit": 12, "total": 0, "totalPages": 0 }
}
```

### GET `/products/{slug}`
- Success `200`: `{ "product": { ... } }`
- Errors: `404`.

### GET `/categories`
- Success `200`: `{ "categories": ["Shoes", "Electronics"] }`

### Admin product APIs (existing)

### GET `/admin/products`
- Auth: Admin
- Success `200`: `{ "products": [...] }`

### POST `/admin/products`
- Auth: Admin
- Required: `name`, `category`, `price`, `originalPrice`, `image`
- Success `201`: `{ "product": { ... } }`

### PATCH `/admin/products/{id}`
- Auth: Admin
- Purpose: Partial update
- Success `200`: `{ "product": { ... } }`
- Errors: `401`, `404`.

### DELETE `/admin/products/{id}`
- Auth: Admin
- Success `200`: `{ "ok": true }`
- Errors: `401`, `404`.

## 3) Cart and Checkout

### Cart (existing)

### GET `/cart`
- Auth: Logged-in user
- Success `200`: `{ "items": [...], "subtotal": 0 }`

### POST `/cart/items`
- Auth: Logged-in user
- Request:
```json
{
  "productId": "string",
  "quantity": 1
}
```
- Success `201`.

### PATCH `/cart/items/{itemId}`
- Auth: Logged-in user
- Request: `{ "quantity": 2 }`

### DELETE `/cart/items/{itemId}`
- Auth: Logged-in user

### POST `/checkout` (existing)
- Auth: Public/Logged-in (current code allows both)
- Required: `fullName`, `phone`, `fullAddress`, non-empty `items`
- Request:
```json
{
  "fullName": "Jane Doe",
  "phone": "98XXXXXXXX",
  "email": "jane@example.com",
  "province": "Bagmati",
  "district": "Kathmandu",
  "city": "Kathmandu",
  "ward": "10",
  "fullAddress": "Street and details",
  "paymentMethod": "eSewa",
  "items": [
    { "productId": "string", "quantity": 1, "unitPrice": 1000 }
  ]
}
```
- Success `200`:
```json
{
  "message": "Order Confirmed!",
  "orderId": "SAJILOMARTS-ORD-12345",
  "paymentStatus": "Pending",
  "orderStatus": "Order Placed",
  "payment": {}
}
```
- Errors: `400`.

## 4) Product Link Submission

### POST `/request-product` (existing)
- Purpose: submit product sourcing request for India platform link.
- Required: `fullName`, `phone`, `productUrl`
- Optional: `email`, `deliveryLocation`, `productName`, `productCategory`, `preferredSize`, `preferredColor`, `quantity`, `additionalNotes`, `maximumBudget`, `preferredDeliveryTime`
- Success `200`:
```json
{
  "message": "Your request has been received...",
  "requestId": "SAJILOMARTS-REQ-12345",
  "status": "Pending"
}
```
- Errors: `400`.

## 5) Supported Platform Detection

### POST `/verify-product-link` (existing)
- Purpose: validate product URL, enforce SSRF allowlist, detect supported platform.
- Request: `{ "url": "https://www.amazon.in/dp/..." }`
- Success `200`:
```json
{
  "status": "manual_required",
  "platform": "amazon-india",
  "platformDisplayName": "Amazon India",
  "message": "We detected a ...",
  "canProceed": true,
  "canRequestManual": true
}
```
- Validation statuses:
  - `invalid_url`
  - `blocked`
  - `unsupported_platform`
  - `manual_required`
- Errors: `400`, `422`.

## 6) Product Availability Verification

- Current behavior: link validity + platform support check, then status `manual_required`.
- Planned behavior (next stage):
  - add internal verification job lifecycle:
    - `pending_review`
    - `verifying`
    - `available`
    - `unavailable`
    - `manual_required`
    - `quoted`
  - expose status endpoint:
    - `GET /product-requests/{requestId}/verification`

## 7) Manual Verification Requests

### Existing path via `/request-product` + `/verify-product-link`
- When URL is valid, request enters manual review.

### Admin queue API (existing)
- `GET /admin/product-requests`
- `PATCH /admin/product-requests/{id}`
  - supports:
    - `status`
    - `quote` object

## 8) Admin Quotations

### PATCH `/admin/product-requests/{id}` (existing)
- Auth: Admin
- Request:
```json
{
  "status": "Quoted",
  "quote": {
    "indianProductPrice": 1000,
    "exchangeRate": 1.6,
    "shippingIndiaToNepal": 200,
    "customsTaxes": 100,
    "handlingFee": 100,
    "nepalDeliveryFee": 150,
    "serviceFee": 100,
    "finalEstimatedPrice": 2250,
    "customerQuote": 2300,
    "quoteExpiry": "2026-09-15",
    "expectedDeliveryTime": "10-14 days",
    "adminNotes": "Price valid for 3 days."
  }
}
```
- Success `200`: `{ "request": { ... } }`
- Errors: `401`, `404`.

## 9) Orders and Order Tracking

### POST `/checkout` (existing)
- Creates order with generated `orderId`.

### POST `/track-order` (existing)
- Request:
```json
{
  "orderId": "SAJILOMARTS-ORD-12345",
  "contact": "98XXXXXXXX"
}
```
- Success `200`:
```json
{
  "orderId": "SAJILOMARTS-ORD-12345",
  "currentStep": "Order Placed",
  "timeline": []
}
```
- Errors: `400`, `404`.

### Admin order APIs (existing)
- `GET /admin/orders`
- `PATCH /admin/orders/{id}` (`orderStatus`, `paymentStatus`, `trackingNumber`, `internalNotes`)

## 10) Admin Dashboard

Current API foundations:
- `GET /admin/products`
- `GET /admin/product-requests`
- `GET /admin/orders`
- update endpoints for each domain (`PATCH`/`DELETE`)

Recommended additional dashboard endpoints:
- `GET /admin/summary`
  - returns KPIs (today orders, pending requests, pending payments, low stock count)
- `GET /admin/activity`
  - returns latest operational actions/events

## Payment APIs

### POST `/payments/initiate` (existing, admin-only)
- Required: `provider`, `orderId`, `amount`, `customerName`, `customerPhone`
- Success `200`: `{ "payment": { ... } }`

### POST `/payments/webhook/esewa` (existing)
### POST `/payments/webhook/khalti` (existing)
- Required: `orderId`, `status`
- Side effect: updates payment record and order payment/order status.

## Common Error Response Shape

```json
{
  "error": "Human-readable message"
}
```

## Data Model Contracts (Current Core)

- `User`: fullName, email (unique), phone, passwordHash, role
- `AuthSession`: token, userId, expiresAt
- `PasswordResetToken`: token, userId, expiresAt
- `Product`: slug, name, category, brand, pricing, stock, tags/specs/media
- `ProductRequest`: requestId, customer info, productUrl, detectedPlatform, status, quote
- `Order`: orderId, customer/address, payment/order status, items, totals, tracking
- `Payment`: orderId, provider, amount, status, providerReference, rawPayload

## Implementation Notes for Next Task Handoff

1. Keep all auth/session routes cookie-compatible with current `sajilomarts_session`.
2. Add customer-facing `/products`, `/products/{slug}`, `/categories` if missing.
3. Add server-side cart endpoints before advanced checkout orchestration.
4. For verification pipeline, use explicit request status transitions and audit timestamps.
5. Ensure admin endpoints remain role-guarded with `requireAdminSession()`.
