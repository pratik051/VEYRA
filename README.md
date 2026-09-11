# LINKOVA — India-to-Nepal Direct Marketplace Sourcing & Ordering Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

**LINKOVA** (`linkova.com.np`) is an enterprise full-stack Next.js web application built for cross-border shopping from India to Nepal. LINKOVA eliminates international payment barriers, shipping restrictions, and complex customs clearance by allowing customers in Nepal to browse, order, and track products directly from top Indian e-commerce marketplaces with transparent, all-inclusive pricing in Nepali Rupees (NPR) and reliable doorstep delivery across all 7 provinces of Nepal.

---

## 📑 Table of Contents

- [Core Platform Overview](#-core-platform-overview)
- [Architecture & Role Separation](#-architecture--role-separation)
- [Product Availability & Verification Engine](#-product-availability--verification-engine)
- [Request Product & Alternative Sourcing Flow](#-request-product--alternative-sourcing-flow)
- [Customer Account & Support Tickets](#-customer-account--support-tickets)
- [Admin Management Portal](#-admin-management-portal)
- [Supported Indian Marketplaces](#-supported-indian-marketplaces)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Environment Variables](#-environment-variables)
- [Local Development Setup](#-local-development-setup)
- [Production Build & Verification](#-production-build--verification)
- [Project Directory Structure](#-project-directory-structure)
- [License & Ownership](#-license--ownership)

---

## 🌐 Core Platform Overview

1. **Cross-Border Marketplace Concierge:** Enables customers in Nepal to purchase authentic products from India's largest e-commerce platforms with automated landed NPR calculation.
2. **Transparent Landed NPR Pricing Formula:**
   $$\text{Total NPR} = (\text{INR Price} \times 1.65) + \text{Service Fee (20\%)} + \text{Local Nepal Delivery (NPR 200)}$$
3. **Dedicated Customer Account Area (`/account`):** Real-time order tracking, printable PDF invoices, order history, default saved addresses, Sourcing Quotes, and interactive Support Tickets.
4. **Official Vector Brand Identity:** Modern 3D royal-to-electric cyan 'L' monogram with airplane orbital flight trajectory and India-to-Nepal route badge (`🇮🇳 ➔ 🇳🇵`).

---

## 🔒 Architecture & Role Separation

LINKOVA enforces strict architectural and server-side separation between **Admin** and **User**:

1. **Strict Admin Dashboard (`/admin`):**
   - Only authenticated users with `role: "admin"` can access `/admin` or any `/api/admin/*` endpoint.
   - Server-side authorization in both layout and route handlers rejects non-admin users (`403 Forbidden`).
   - Normal users never see admin controls, stats, or navigation.

2. **Customer Area (`/account`):**
   - Normal users manage their profile, orders, addresses, sourcing requests, and support tickets in `/account`.
   - `/dashboard` permanently redirects to `/account`.
   - Never exposes administrative controls or internal configurations to customers.

---

## 🔍 Product Availability & Verification Engine

LINKOVA features an enterprise multi-stage verification engine designed to eliminate false-negative rejections while ensuring strict orderability guarantees:

1. **Intelligent URL Normalization & Product ID Extraction:**
   - **Tracking Stripping:** Automatically removes tracking/UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `shared`, etc.) without altering the customer's `originalSourceUrl`.
   - **Marketplace Path Normalization:** Resolves marketplace-specific suffixes (e.g., Myntra `/buy` paths) into clean canonical product addresses.
   - **Strong Product Identity Extraction:** Extracts authoritative marketplace identifiers (`sourceProductId`) such as Myntra numeric IDs (`12187850`), Amazon ASINs (`B0...`), and Flipkart PIDs.

2. **Accurate Availability Distinction (Never Guess Availability):**
   - **Explicit Confirmation Only:** A product is ONLY marked `❌ Out of Stock` when the marketplace explicitly confirms that the exact variant is out of stock.
   - **Parser/API/Network Failures:** Timeouts, scraper limits, missing metadata, or blocked requests are categorized as `UNKNOWN` (`⚠️ Availability Could Not Be Confirmed`), **NEVER** `OUT_OF_STOCK`.
   - **Delivery Status States:** Distinguishes between `DELIVERY_AVAILABLE`, `DELIVERY_UNAVAILABLE`, and `UNKNOWN`.

3. **Authoritative UI Presentation (No Contradictory Badges):**
   - **Verified & Orderable:** `✓ Product Verified` • `✓ In Stock` • `✓ Delivery Available` ➔ Instant Order Creation.
   - **Confirmed Out of Stock:** `✓ Product Verified` • `❌ Out of Stock` ➔ Request Product Option.
   - **Product Found (Unconfirmed Availability):** `✓ Product Found` • `⚠️ Availability Could Not Be Confirmed` ➔ Request Product Option.
   - **Invalid Product / URL:** `✕ Product Could Not Be Verified` ➔ Check Another Link.

4. **Strict Backend Orderability Criteria:**
   - Orders can proceed ONLY when `productFound === true`, `productIdentityVerified === true`, `stockStatus === "IN_STOCK"`, `deliveryStatus === "DELIVERY_AVAILABLE"`, and `priceStatus === "VERIFIED"`.
   - A fresh backend re-verification is executed at the exact moment of final order submission.

5. **Private Transit Security & Structured Audit Logging:**
   - The internal transit destination is configured securely on the server and is never exposed in customer responses, public APIs, or UI components.
   - Structured server logs (`[VERIFICATION_AUDIT]`) record verification stages, failure reasons, and timestamps for diagnostics without logging any confidential credentials.
   - Admins can use the **Live Link Verification & Diagnostics Debug Panel** in the Admin Dashboard to test and inspect raw marketplace links.

---

## 🔄 Request Product & Alternative Sourcing Flow

When an item is unavailable for direct automated ordering, LINKOVA enables a collaborative sourcing flow:

1. **Customer Product Request (`/request-product`):**
   - Customers can submit a product request with custom quantities, sizes, and colors.
   - The backend records the original URL, identifiers, and verification failure snapshot.
2. **Admin Review & Verified Alternative Link:**
   - Admins inspect the request in the Admin Dashboard (`/admin`).
   - Admins can locate an alternative product link (e.g. from an authorized seller or alternative marketplace).
   - **Independent Verification:** The backend independently verifies the alternative product's stock, delivery, and pricing before allowing it to be offered.
3. **Customer Review & Conversion:**
   - The customer receives the verified alternative card in `/account` under *Sourcing Quotes* with landed NPR pricing.
   - Customers can **Accept Alternative** (which re-verifies on the backend and converts to a live order) or **Decline**.
   - Full traceability preserves both the original requested URL and the final verified source URL on the order snapshot.

---

## 🎫 Customer Account & Support Tickets

Users can report issues and get help with a ticket workflow:

- **Raise a Ticket:** Select from problem categories (*Order Problem, Payment Problem, Product Problem, Delivery Problem, Account Problem, Website/Technical Problem, Refund/Return Problem, Other*), specify subject, detailed description, and optionally link to an existing Order ID.
- **Security Isolation:** The customer's User ID is automatically inferred from the authenticated session. Users can only view and reply to their own tickets.
- **Conversation Thread:** Full message history between the customer and support agents with real-time status updates (*Open, In Progress, Waiting for User, Resolved, Closed*).
- **Privacy Protection:** Internal staff notes written by administrators are stripped server-side and never returned to customers.

---

## 🛡️ Admin Management Portal

The LINKOVA Admin Console (`/admin`) provides control over sourcing operations:

- **Real-Time DB Metrics:** Live counts for Total Sourcing Volume, India Orders, Product Requests, Store Orders, Pending Payment Reviews, and User Problems.
- **Product Requests & Alternative Link Sourcing:**
   - Filter by status (*Pending, Reviewing, Alternative Found, Waiting for User, Converted, Closed*).
   - Submit and independently verify alternative marketplace links.
- **User Problems / Support Center:**
   - Status filters (*All, Open, In Progress, Waiting for User, Resolved, Closed*) and category filters.
   - Search by Ticket ID, Customer Name, Email, Order ID, or Subject.
   - Comprehensive ticket detail slide-over with customer profile, problem description, live linked Order snapshot, and complete message thread.
   - **Dual Reply System:** Toggle between *Reply to Customer* (visible in user account) and *Internal Note* (visible only to admins).
   - Live status and priority updates.
- **Order Management & Invoices:** Real-time milestone updates and PDF invoice generation.
- **Marketplace Verification & Sync:** Automated validation of Indian marketplace product feeds and catalog imports.

---

## 🛍️ Supported Indian Marketplaces

| Marketplace | Focus Categories |
| :--- | :--- |
| **Amazon India** | Electronics, Smart Home, Kindle, Everyday Tech |
| **Flipkart** | Smartphones, Smart TVs, Wearables, Laptops |
| **Myntra** | Premium Fashion, Footwear, Designer Wear |
| **Meesho** | Value Apparel, Home Decor, Kitchenware |
| **Nykaa** | Beauty, Skincare, Cosmetics, Fragrances |
| **AJIO** | International Brands, Streetwear, Ethnic Fashion |
| **Tata CLiQ** | Luxury Watches, Premium Electronics, Audio |
| **Croma** | Home Appliances, Audio Gear, Computing |
| **boAt Lifestyle** | TWS Earbuds, Smartwatches, Soundbars |
| **Noise** | Smartwatches, Wireless Audio, Accessories |

---

## 🚀 Key Features

### 🇮🇳 1. India-to-Nepal Direct Marketplace Sourcing
- Paste any supported Indian e-commerce URL (`amazon.in`, `flipkart.com`, `myntra.com`, etc.) at `/request-product` to generate instant landed quotes in Nepali Rupees.
- Automated verification for stock and delivery availability.

### 📦 2. 1-Click Saved Delivery Address
- Default address is automatically loaded during checkout.
- Customers can easily switch, add, or set default delivery addresses.

### 💳 3. Multi-Channel Nepal Payments
- **eSewa EPAY:** Form-based digital wallet checkout.
- **Khalti e-Banking:** Direct payment initiation and callback validation.
- **Bank Transfer / QR Verification:** Upload transaction reference codes and receipt screenshots.
- **Cash on Delivery (COD):** Available across Nepal.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14.2 (App Router, Server Actions, Route Handlers) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS 3.4 + Custom Tokens |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | Google OAuth2 + Apple OAuth2 (`apple.com`) + Firebase Phone SMS OTP Auth + HTTP-Only Session Cookies |
| **Icons & Brand** | SVG Vector Brand Engine & Marketplace Logos |
| **Typography** | Inter & Space Grotesk via `next/font/google` |

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGO_URI=${MONGODB_URI}

# App Configuration & Admin Credentials
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YOUR_SECURE_ADMIN_PASSWORD

# Nepal Payment Gateways
ESEWA_MERCHANT_CODE=YOUR_ESEWA_MERCHANT_CODE
ESEWA_SECRET_KEY=YOUR_ESEWA_SECRET_KEY
ESEWA_BASE_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
KHALTI_SECRET_KEY=YOUR_KHALTI_SECRET_KEY
NEXT_PUBLIC_KHALTI_PUBLIC_KEY=YOUR_KHALTI_PUBLIC_KEY
KHALTI_CHECKOUT_URL=https://pay.khalti.com

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

# Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/pratik051/VEYRA.git
cd VEYRA

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Verification

```bash
# TypeScript compilation check
npx tsc --noEmit

# Run support ticket, availability, and alternative product test suite
node tests/run-availability-and-alternatives-test.js

# Production build
npm run build

# Start production server
npm start
```

---

## 📁 Project Directory Structure

```
veyra/
├── app/
│   ├── (storefront)/                 # Home, Shop, Marketplace Channels, Product Pages
│   ├── account/                      # Customer Portal, Orders, Sourcing Quotes & Support Tickets
│   ├── admin/                        # Secure Admin Console (Server-Side Authorized)
│   │   ├── layout.tsx                # Admin Role Authorization Guard
│   │   └── page.tsx                  # Orders, Product Requests, Marketplace & User Problems
│   ├── dashboard/                    # Permanent Redirect to /account
│   ├── login/                        # Customer Login
│   ├── signup/                       # Customer Registration
│   ├── request-product/              # Sourcing URL Quote Calculator & Request Flow
│   ├── track-order/                  # Public Live Shipment Tracker
│   ├── api/                          # REST Route Handlers
│   │   ├── admin/                    # Admin Orders, Product Requests, Payments & Tickets
│   │   │   ├── product-requests/     # Admin Product Requests & Alternative Link Verification
│   │   │   ├── tickets/              # Admin Ticket List, Detail, Reply & Status
│   │   │   ├── india-orders/         # India Sourcing Orders
│   │   │   └── marketplace/          # Provider Sync & Product Verification
│   │   ├── user/                     # User Profile, Orders, Addresses, Requests & Support Tickets
│   │   │   ├── product-requests/     # User Product Request Submission & Accept/Decline
│   │   │   └── tickets/              # User Ticket Creation, Detail & Reply
│   │   ├── auth/                     # Google OAuth, Firebase, Session Tokens
│   │   ├── products/                 # Product Availability & Delivery Engine
│   │   └── india-order/              # India Sourcing Order Placement & PDF Invoices
│   ├── layout.tsx                    # Root Layout with Font Optimization
│   └── globals.css                   # Tailwind Design System & Animations
├── components/
│   ├── admin/                        # Admin Dashboard, Product Requests & User Problems Panel
│   ├── layout/                       # Header, StorefrontShell, MobileNav, Footer
│   ├── providers/                    # Cart, Wishlist, Toast Context Providers
│   └── ui/                           # LinkVerifier, BrandLogo, MarketplaceLogo, ProductCard
├── lib/
│   ├── auth/                         # Sessions, RBAC Authorization & Security
│   ├── config/                       # Server-side Sourcing Destination Configuration
│   ├── db/                           # MongoDB Connection Manager
│   ├── marketplace/                  # Availability, Delivery, and Alternative Verification Engine
│   ├── models/                       # ProductRequest, SupportTicket, IndiaOrder, User Schemas
│   └── utils.ts                      # Formatters, Currency Calculations & Helpers
├── tests/                            # Automated Unit & Security Test Suites
└── README.md                         # Public Project Documentation
```

---

## 📄 License & Ownership

Copyright © 2026 **LINKOVA Nepal** (`linkova.com.np`). All rights reserved.
