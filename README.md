# VEYRA E-Commerce Foundation

Premium mobile-first e-commerce foundation for VEYRA built with Next.js, TypeScript, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Apply user-model normalization/index migration (when needed):

```bash
npm run migrate:user-model
```

## Included foundation

- Homepage with premium VEYRA sections and CTAs
- Shop page with search, filters, sorting and responsive grid
- Product details pages with gallery, specs, selector controls
- Request From India flow with request ID generation
- Cart, checkout, confirmation, order tracking timeline
- Account area with login/register/profile/wishlist placeholders
- Functional auth API foundations: register/login/logout/refresh/reset/me with secure httpOnly session cookies
- MongoDB connection + core models (`products`, `orders`, `productRequests`, `payments`)
- Admin CRUD APIs for products/orders/product-requests
- Payment integration architecture (eSewa/Khalti + webhook endpoints)
- Admin dashboard wired to API actions for operational workflows
- FAQ, contact, about and all required legal pages
- SEO basics: metadata, sitemap, robots

## Security and configuration notes

Keep all secrets in environment variables (server-side only):

- `MONGODB_URI`
- `ESEWA_SECRET_KEY`
- `KHALTI_SECRET_KEY`
- `PAYMENT_WEBHOOK_SECRET`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `ESEWA_MERCHANT_CODE`
- `ESEWA_BASE_URL`
- `NEXT_PUBLIC_KHALTI_PUBLIC_KEY`
- `KHALTI_CHECKOUT_URL`
- `NEXT_PUBLIC_APP_URL`

Do not expose secret keys in frontend code.

## API specification

- VEYRA API draft: [docs/veyra-api-spec.md](docs/veyra-api-spec.md)

## Next build targets

This repository currently provides a launch-ready frontend foundation with scalable information architecture and route structure.
You can extend it with:

- Full customer profile/address persistence and account settings UI
- RBAC-protected admin backend
- Full gateway verification, signature validation, and asynchronous reconciliation

## Auth notes

- Session cookie: `veyra_session` token (httpOnly, sameSite=lax, secure in production) backed by MongoDB session records
- Admin route `/admin` is server-side protected and requires an authenticated admin session
- Seed admin credentials come from `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- Users, auth sessions, and password reset tokens are persisted in MongoDB
# VEYRA
