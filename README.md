# LINKOVA — India-to-Nepal Direct Marketplace Sourcing & Ordering Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

**LINKOVA** (`linkova.com.np`) is an enterprise full-stack Next.js web application built for seamless cross-border shopping from India to Nepal. LINKOVA eliminates payment barriers, international shipping restrictions, and complex customs clearance by allowing customers in Nepal to browse, order, and track products directly from top Indian e-commerce marketplaces with transparent, all-inclusive pricing in Nepali Rupees (NPR) and reliable doorstep delivery across all 7 provinces of Nepal.

---

## 📑 Table of Contents

- [Core Platform Overview](#-core-platform-overview)
- [Supported Indian Marketplaces](#-supported-indian-marketplaces)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture & Route Isolation](#-architecture--route-isolation)
- [Customer Dashboard & Order Tracking](#-customer-dashboard--order-tracking)
- [Authentication System (Figma Redesign)](#-authentication-system-figma-redesign)
- [Nepal Payment Gateways](#-nepal-payment-gateways)
- [Environment Variables](#-environment-variables)
- [Local Development Setup](#-local-development-setup)
- [Production Build & Verification](#-production-build--verification)
- [Project Directory Structure](#-project-directory-structure)
- [Admin Management Portal](#-admin-management-portal)
- [License & Ownership](#-license--ownership)

---

## 🌐 Core Platform Overview

1. **Cross-Border Marketplace Concierge:** Enables customers in Nepal to purchase authentic products from India's largest e-commerce platforms with automated landed NPR calculation.
2. **Transparent Landed NPR Pricing Formula:**
   $$\text{Total NPR} = (\text{INR Price} \times 1.60) + \text{Customs Clearance} + \text{Cross-Border Freight} + \text{Local Delivery (NPR)}$$
3. **Dedicated Customer Portal:** Real-time shipment tracking, printable PDF invoices, order history, and saved address profiles.
4. **Official Vector Brand Identity:** Modern 3D royal-to-electric cyan 'L' monogram with airplane orbital flight trajectory, package box, and India-to-Nepal route badge (`🇮🇳 ➔ 🇳🇵`).

---

## 🛍️ Supported Indian Marketplaces

LINKOVA features dedicated platform catalog channels with official brand assets:

| Marketplace | Channel Route | Official Focus Categories |
| :--- | :--- | :--- |
| **Amazon India** | `/shop/amazon` | Electronics, Smart Home, Kindle, Everyday Tech |
| **Flipkart** | `/shop/flipkart` | Smartphones, Smart TVs, Wearables, Laptops |
| **Myntra** | `/shop/myntra` | Premium Fashion, Footwear, Designer Wear |
| **Meesho** | `/shop/meesho` | Value Apparel, Home Decor, Kitchenware |
| **Nykaa** | `/shop/nykaa` | Beauty, Skincare, Luxury Cosmetics, Fragrances |
| **AJIO** | `/shop/ajio` | International Brands, Streetwear, Ethnic Fashion |
| **Tata CLiQ** | `/shop/tatacliq` | Luxury Watches, Premium Electronics, Audio |
| **Croma** | `/shop/croma` | Home Appliances, Audio Gear, Computing |
| **boAt Lifestyle** | `/shop/boat` | TWS Earbuds, Smartwatches, Soundbars |
| **Noise** | `/shop/noise` | Smartwatches, Wireless Audio, Accessories |

---

## 🚀 Key Features

### 🇮🇳 1. India-to-Nepal Direct Marketplace Storefront
- **Platform Separation:** Navigating to `/shop/amazon`, `/shop/flipkart`, or `/shop/myntra` isolates products strictly to that provider.
- **Dynamic Badges & Signals:** Automatic indicators for `FLASH SALE`, `BEST SELLER`, `% OFF`, `TRENDING`, and `NEW`.
- **Live Deal Filters:** Filter by discount thresholds (20%+, 50%+), category, price range in NPR, and customer ratings.

### 📦 2. Custom Product Link Ordering
- **URL Parser & Estimator:** Paste any supported Indian e-commerce URL (`amazon.in`, `flipkart.com`, `myntra.com`, etc.) at `/request-product` to generate instant landed quotes in Nepali Rupees.
- **Custom Sourcing Pipeline:** Customers specify sizes, color variants, target INR price, and urgency notes.

### 📊 3. User-Friendly Customer Dashboard (`/dashboard`)
- **Route Isolation:** The dashboard operates as its own dedicated full-page layout without storefront header/footer overlap.
- **Order-First Overview:**
  - 4 KPI Counters: Total Orders (`📦`), In Transit (`🚚`), Delivered (`✅`), and Wishlist (`🤍`).
  - **Live Orders Stream:** Displays thumbnail image, product title, marketplace badge, quantity, landed NPR price, and status chips.
  - **1-Click Actions:** Instant access to **"Order Details"**, **"🖨️ PDF Invoice"**, and **"🚚 Track Shipment"**.
  - **Quick Sourcing Bar:** Direct link order submission tool embedded into the overview.
  - **"← Back to Home" Navigation:** Quick client-side return to the storefront.

### 🔐 4. Figma Split-Screen Authentication
- **Dual Google Sign-In:** One-click Google OAuth via Firebase popup with automated redirect fallback.
- **Email & Password Authentication:** PBKDF2 cryptographic hashing with salt, session tokens, and password reset flows.
- **Split-Screen Design:** Left hero section displaying value propositions and social proof; right card handling credentials.

### 💳 5. Multi-Channel Nepal Payments
- **eSewa EPAY:** Form-based digital wallet checkout with SHA256 signature verification.
- **Khalti e-Banking:** Direct payment initiation and callback validation.
- **Bank Transfer / QR Verification:** Upload transaction reference codes and receipt screenshots.
- **Cash on Delivery (COD):** Available for Kathmandu Valley deliveries.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14.2 (App Router, Server Actions, Route Handlers) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS 3.4 + Custom Electric Blue / Dark Brand Tokens |
| **Database** | MongoDB with Mongoose ODM (Dynamic Connection Pooling) |
| **Authentication** | Google OAuth2 + Firebase Client SDK + HTTP-Only Session Cookies |
| **Icons & Brand** | Official SVG Vector Brand Engine & Marketplace Logos |
| **Typography** | Inter & Space Grotesk via `next/font/google` |

---

## 📐 Architecture & Route Isolation

LINKOVA utilizes a dedicated route isolation architecture via `StorefrontShell`:

```
RootLayout (app/layout.tsx)
  │
  └── StorefrontShell
        │
        ├── [Storefront Pages] (/, /shop, /product/*, /request-product)
        │     ├── <TopBanner />
        │     ├── <Header /> (Brand Logo, Search, Navigation Pill, Cart/Wishlist)
        │     ├── <main>{children}</main>
        │     ├── <Footer />
        │     └── <MobileNav />
        │
        └── [Isolated Dedicated Pages] (/dashboard, /admin/*, /login, /signup)
              └── <main className="min-h-screen">{children}</main>
                  (No storefront header/footer bleed; full custom page layout)
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/linkova?retryWrites=true&w=majority
MONGO_URI=${MONGODB_URI}

# App URL & Admin Credentials
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

# Firebase Authentication (Optional Client Popup)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm** or **pnpm**
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster

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
│   ├── dashboard/                    # Dedicated Customer Account Dashboard Route
│   ├── account/                      # Customer Portal Controller & Order Manager
│   ├── admin/                        # Secure Admin Sourcing Operations Console
│   │   ├── login/                    # Staff Authentication Portal
│   │   └── page.tsx                  # Live Order Management & Sourcing Volume
│   ├── login/                        # Figma Split-Screen Customer Login
│   ├── signup/                       # Figma Split-Screen Customer Registration
│   ├── request-product/              # Cross-Border URL Quote Calculator
│   ├── track-order/                  # Public Live Shipment Tracker
│   ├── api/                          # REST Route Handlers
│   │   ├── auth/                     # Google OAuth, Firebase, Local Login & Register
│   │   ├── checkout/                 # Order Placement API
│   │   ├── india-order/              # India Sourcing Order APIs & PDF Invoices
│   │   └── payments/                 # eSewa, Khalti, QR Verification
│   ├── layout.tsx                    # Root Layout with Font Optimization
│   └── globals.css                   # Tailwind Design System & Animations
├── components/
│   ├── layout/                       # Header, StorefrontShell, MobileNav, Footer
│   ├── providers/                    # Cart, Wishlist, Toast Context Providers
│   └── ui/                           # LinkovaBrandLogo, MarketplaceLogo, ProductCard
├── lib/
│   ├── auth/                         # Sessions, Cryptography, OAuth Token Verifiers
│   ├── db/                           # Cached MongoDB Connection Manager
│   ├── marketplace/                  # Marketplace Providers, Sync Engine & Types
│   ├── models/                       # Mongoose Schemas (User, Order, Product)
│   ├── pricing/                      # INR to Landed NPR Pricing Engine
│   └── utils.ts                      # Formatters, Currency Calculations & Helpers
└── README.md                         # Project Documentation
```

---

## 🛡️ Admin Management Portal

The LINKOVA Operations Console is accessible at `/admin`:
- **Default Staff Login:** `admin@linkova.com`
- **Default Staff Password:** `Admin@12345` (Configurable via `ADMIN_PASSWORD` in `.env`)
- **Capabilities:**
  - Dynamic Real-Time Sourcing Volume and Orders breakdown.
  - Update shipment milestones (`Processing`, `Sourced in India`, `In Transit / Border Customs`, `Out for Delivery`, `Delivered`).
  - Review submitted payment receipts & QR transaction references.
  - Manage product catalog items and provider synchronization.

---

## 📄 License & Ownership

Copyright © 2026 **LINKOVA Nepal** (`linkova.com.np`). All rights reserved.
