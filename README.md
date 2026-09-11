# LINKOVA — Luxury E-Commerce & India-to-Nepal Sourcing Concierge

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

**LINKOVA** is a high-performance, full-stack Next.js web application engineered for the modern retail ecosystem in Nepal. It offers an exclusive catalog storefront alongside an automated **India-to-Nepal Marketplace Sourcing Concierge** that allows customers in Nepal to effortlessly order items from Indian e-commerce platforms (Amazon India, Flipkart, Myntra, AJIO, Meesho, Nykaa, and more) with real-time NPR quotation, customs handling, and local doorstep delivery.

---

## 📑 Table of Contents

- [Core Value Proposition](#-core-value-proposition)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture & Authentication](#-architecture--authentication)
- [Google OAuth & Google Cloud Console Setup](#-google-oauth--google-cloud-console-setup)
- [Firebase Authentication Setup](#-firebase-authentication-setup)
- [Environment Variables](#-environment-variables)
- [Local Development Setup](#-local-development-setup)
- [Production Build & Deployment](#-production-build--deployment)
- [Project Directory Structure](#-project-directory-structure)
- [Payment Gateways (eSewa & Khalti)](#-payment-gateways-esewa--khalti)
- [Admin Management Portal](#-admin-management-portal)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 💎 Core Value Proposition

1. **Curated Direct Catalog:** Premium fashion, watches, footwear, tech accessories, and lifestyle essentials delivered across Nepal with 2-4 business day fulfillment.
2. **Cross-Border Marketplace Concierge:** Overcomes payment restrictions and international delivery barriers between India and Nepal. Users paste any Indian online product link to obtain transparent, all-inclusive quotations in Nepali Rupees (NPR) including currency exchange, international transit, customs duties, and local delivery.

---

## 🚀 Key Features

### 🛍️ 1. Storefront & Catalog Experience
- **Dynamic Category Browsing:** Filter by Men's/Women's Fashion, Footwear, Watches, Gadgets & Tech, Mobile Accessories, and Bags.
- **Search & Multi-Filter System:** Real-time search across titles, brands, and descriptions with price sliders, rating filters, and badge criteria (Trending, Best Seller, New, Sale).
- **Interactive Quick View:** Inspect product image galleries, select sizes and colors, and adjust quantities on the fly.
- **Shopping Cart & Persistent Wishlist:** Real-time quantity recalculation, coupon application (e.g. `LINKOVA500`), and local storage persistence.

### 🇮🇳 2. India-to-Nepal Sourcing Concierge
- **Instant Product Link Verifier:** Validates incoming URLs against supported Indian marketplace domains (`amazon.in`, `flipkart.com`, `myntra.com`, `ajio.com`, `meesho.com`, `nykaa.com`, `tatacliq.com`, `croma.com`, `boat-lifestyle.com`, `noise.com`).
- **Interactive Price Estimator:**
  $$\text{Land Price (NPR)} = (\text{INR Price} \times 1.60) + \text{Customs/Freight} + \text{Handling Fee}$$
- **Automated Request Submission:** Customers submit product variants (size/color), target INR price, notes, and urgent delivery requests.
- **Admin Quotation Workflow:** Admins can calculate official customs fees, shipping rates, and exchange rates, sending an itemized quote directly to the customer's account portal for review and one-click acceptance.

### 💳 3. Multi-Channel Nepal Payments
- **eSewa EPAY Integration:** Form-based digital wallet checkout with SHA256 signature verification.
- **Khalti e-Banking Integration:** Direct API initiation and callback validation.
- **QR Payment Verification:** Upload transaction codes and screenshot receipts for admin review and approval.
- **Cash on Delivery (COD):** Available for Kathmandu Valley orders.

### 🛡️ 4. Robust Authentication & User Profiles
- **Dual Google Sign-In:** Direct Google OAuth2 with secure state nonces and Firebase Client Auth Popup fallback.
- **Email & Password Authentication:** PBKDF2 cryptographic hashing with salt, account registration, secure cookie sessions, and reset workflows.
- **User Dashboard:** View past orders, status of custom India product requests, wishlist items, and manage primary delivery addresses across all 7 provinces of Nepal.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Actions & Route Handlers) |
| **Language** | TypeScript 5 (Strict Type Safety) |
| **Styling** | Tailwind CSS 3.4 with custom LINKOVA luxury tokens & dark mode |
| **Database** | MongoDB with Mongoose ODM (Lazy dynamic connection caching) |
| **Authentication** | Google OAuth2 + Firebase Client/Admin SDK + Custom Session Cookies |
| **Typography** | Space Grotesk & Inter via `next/font/google` |
| **Validation** | Zod / Native Schema Validation |

---

## 🔐 Architecture & Authentication

LINKOVA provides a hybrid authentication architecture designed for zero downtime and broad platform compatibility:

```
[User Interface]
       │
       ├──> "Continue with Google" (Firebase Popup)
       │            │
       │            └──> POST /api/auth/firebase (Verifies ID Token via Firebase Admin or Google TokenInfo)
       │                        │
       │                        └──> MongoDB UserModel -> AuthSessionModel -> HTTP-Only Cookie (linkova_session)
       │
       ├──> "Direct Google OAuth" (Redirect)
       │            │
       │            ├──> GET /api/auth/google -> accounts.google.com/o/oauth2/v2/auth
       │            └──> GET /api/auth/google/callback -> Token Exchange -> linkova_session Cookie
       │
       └──> Email / Password Login & Register
                    │
                    └──> POST /api/auth/login -> PBKDF2 Password Verification -> linkova_session Cookie
```

### Session Security Highlights:
- **HTTP-Only & SameSite Cookies:** Prevents XSS token extraction.
- **State Nonce Verification:** Mitigates CSRF login attacks during Google OAuth redirection.
- **Multi-Method Fallback:** If Firebase client popup is blocked by the browser, it seamlessly switches to the direct Google OAuth redirect flow.

---

## 🌐 Google OAuth & Google Cloud Console Setup

To enable Google Login on your deployment:

### 1. Create a Project in Google Cloud Console
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**, name it `linkova-store` and click **Create**.

### 2. Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** and click **Create**.
3. Fill in:
   - **App name:** `LINKOVA`
   - **User support email:** Your email or `support@linkova.com`
   - **Developer contact information:** Your email
4. Click **Save and Continue**. Under **Scopes**, add `openid`, `email`, and `profile`.

### 3. Create OAuth 2.0 Client Credentials
1. Go to **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth client ID**.
2. Select **Application type:** `Web application`.
3. Set **Name:** `LINKOVA Web Client`.
4. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local development)
   - `https://your-production-domain.com` (for production)
5. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://your-production-domain.com/api/auth/google/callback`
6. Click **Create** and copy your **Client ID** and **Client Secret**.
7. Paste these values into your `.env.local` file:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   ```

---

## 🔥 Firebase Authentication Setup (Optional)

If you wish to use the client popup login flow:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Add a new project or link your existing Google Cloud project.
3. Under **Authentication** > **Sign-in method**, enable **Google**.
4. In **Project Settings** > **General**, scroll to **Your apps** and register a Web App.
5. Copy the `firebaseConfig` keys into your `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/linkova?retryWrites=true&w=majority
MONGO_URI=${MONGODB_URI}

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@linkova.com
ADMIN_PASSWORD=Admin@12345

# Nepal Payment Gateways
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q(
ESEWA_BASE_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
KHALTI_SECRET_KEY=your_khalti_secret_key
NEXT_PUBLIC_KHALTI_PUBLIC_KEY=your_khalti_public_key
KHALTI_CHECKOUT_URL=https://pay.khalti.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

# Firebase Client Configuration (Optional)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm** or **pnpm** or **yarn**
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/linkova.git
cd linkova

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Deployment

To generate an optimized production bundle:

```bash
# Run unit checks
npm run test:node

# Run production build
npm run build

# Start production server
npm start
```

---

## 📁 Project Directory Structure

```
linkova/
├── app/                              # Next.js App Router Pages & API
│   ├── (storefront)/                 # Home, Shop, Product, About, Contact, FAQ
│   ├── account/                      # Customer Portal (Orders, Sourcing Requests, Auth)
│   ├── admin/                        # Secure Admin Management Dashboard
│   ├── api/                          # REST Route Handlers
│   │   ├── admin/                    # Orders, Sourcing Quotes, Catalog APIs
│   │   ├── auth/                     # Google OAuth, Firebase, Local Login & Register
│   │   ├── cart/                     # Dynamic Cart Syncer
│   │   ├── checkout/                 # Order Placement
│   │   ├── payments/                 # eSewa, Khalti, QR Verification
│   │   ├── request-product/          # India Sourcing Submission API
│   │   └── verify-product-link/      # Marketplace Link Parser
│   ├── layout.tsx                    # Root Layout with Font Optimization & Toast Provider
│   └── globals.css                   # Custom CSS & Glassmorphic Utilities
├── components/                       # Reusable React UI Components
│   ├── admin/                        # Admin Metric Panels & Tables
│   ├── layout/                       # Header, Mobile Navigation, Footer
│   ├── providers/                    # Cart, Wishlist, Toast Context Providers
│   └── ui/                           # ProductCard, QuickViewModal, SearchModal
├── lib/                              # Core Utility & Database Layer
│   ├── auth/                         # Sessions, Password Cryptography, OAuth Stores
│   ├── db/                           # Cached MongoDB / Mongoose Connector
│   ├── firebase/                     # Firebase Client & Admin SDK initializers
│   ├── models/                       # Mongoose Schemas (User, Order, ProductRequest, etc.)
│   ├── data.ts                       # Curated Seed Catalog & Province Data
│   ├── sourcing-platforms.ts         # Indian Marketplace Regex Engine
│   └── utils.ts                      # NPR Currency Formatter & ID Generators
├── public/                           # Static Assets & Payment Badges
├── tailwind.config.ts                # LINKOVA Luxury Design System
└── README.md                         # Project Documentation
```

---

## 🛡️ Admin Management Portal

LINKOVA includes a built-in admin dashboard accessible at `/admin`:
- **Default Admin Account:** `admin@linkova.com`
- **Default Password:** `Admin@12345` (Configurable via `ADMIN_PASSWORD` in `.env`)
- **Features:**
  - View all live orders and update fulfillment statuses (`Pending`, `Processing`, `Shipped`, `Delivered`).
  - Review submitted payment receipts & screenshots.
  - Review incoming India sourcing requests, review supplier availability, and issue official NPR quotes.
  - Manage product catalog items.

---

## ❓ Troubleshooting & FAQs

#### Q: Google Login says "Google sign-in is not configured yet."
> **A:** Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present in your `.env.local` file and that you have added `http://localhost:3000/api/auth/google/callback` to the Authorized Redirect URIs in the Google Cloud Console.

#### Q: Next.js build complains about MongoDB connection during static export.
> **A:** All database-connected route handlers have `export const dynamic = "force-dynamic";` configured and fallback safely to default seed data when the database is unreachable during build.

#### Q: Where are cart and wishlist saved?
> **A:** Items are stored in `localStorage` under `linkova_cart` and `linkova_wishlist`, with automatic backward compatibility for legacy keys.

---

## 📄 License & Ownership
Copyright © 2026 **LINKOVA Retail Nepal**. All rights reserved.
