# Heart of the Cards

**Premium Pokémon and One Piece TCG products, shipped across Australia.**

> heartofthecards.com.au

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + TypeScript |
| Frontend | React 18 + TypeScript + Vite |
| Database | PostgreSQL (via Docker) |
| ORM | Prisma |
| Auth | JWT + Refresh Tokens + Google OAuth |
| Payments | PayPal (sandbox/live) |
| Styling | TailwindCSS + Framer Motion |
| Package Manager | pnpm (monorepo) |

---

## Project Structure

```
/
├── apps/
│   ├── api/            # NestJS backend (port 3000)
│   └── web/            # React frontend (port 5173)
├── packages/
│   └── shared/         # Shared TypeScript types & enums
├── docker-compose.yml  # PostgreSQL
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker Desktop

### 1. Clone & Install

```bash
# Install pnpm globally if needed
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

### 2. Environment Variables

```bash
# Copy example env files
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` with your credentials (see configuration section below).

### 3. Start Database

```bash
docker-compose up -d
```

### 4. Run Migrations & Seed

```bash
# Generate Prisma client + run migrations
cd apps/api
npx prisma migrate dev --name init
npx prisma generate

# Seed the database with demo data
pnpm db:seed
```

Or from the root:
```bash
pnpm db:migrate:dev
pnpm db:seed
```

### 5. Start Development Servers

```bash
# Run both API and web in parallel
pnpm dev

# Or separately:
pnpm dev:api   # http://localhost:3000
pnpm dev:web   # http://localhost:5173
```

---

## Demo Credentials

After seeding:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@heartofthecards.com.au | Admin123! |
| Customer | demo@heartofthecards.com.au | Customer123! |

---

## Configuration

### apps/api/.env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/HeartoftheCards"

JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Google OAuth — see "Google OAuth Setup" below
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# PayPal — see "PayPal Setup" below
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_ENV=sandbox

FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

### apps/web/.env

```env
VITE_API_URL=http://localhost:3000/api
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
```

---

## PayPal Setup

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Create an app under **Sandbox** environment
3. Copy **Client ID** and **Secret** to `apps/api/.env`
4. Also copy the **Client ID** to `apps/web/.env` as `VITE_PAYPAL_CLIENT_ID`

### Payment Flow

```
Customer → Cart → Checkout → Enter Address
  → Backend: POST /api/orders          (creates order record)
  → Backend: POST /api/payments/paypal/create-order  (creates PayPal order, returns paypalOrderId)
  → Frontend: renders PayPal buttons with paypalOrderId
  → Customer: approves payment in PayPal UI
  → Frontend: POST /api/payments/paypal/capture-order
  → Backend: captures payment via PayPal API
  → Backend: marks order PAID, reduces stock, clears cart
  → Frontend: shows success screen
```

**Currency:** AUD (Australian Dollars)

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project or select existing
3. Enable the **Google+ API** / **Google Identity** service
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Add Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
7. Copy Client ID and Secret to `apps/api/.env`

### OAuth Flow

```
User clicks "Sign in with Google"
  → Frontend redirects to /api/auth/google
  → NestJS Passport Google strategy
  → Google OAuth consent screen
  → Redirect to /api/auth/google/callback
  → Backend finds or creates user by googleId/email
  → Redirect to frontend: /auth/callback?accessToken=...&refreshToken=...
  → Frontend stores tokens, merges guest cart
```

---

## API Documentation

Swagger UI available at: `http://localhost:3000/api/docs`

### Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | None | Register new account |
| POST | /api/auth/login | None | Login |
| POST | /api/auth/refresh | Refresh Token | Get new access token |
| GET | /api/auth/google | None | Google OAuth |
| GET | /api/products | None | List products (with filters) |
| GET | /api/products/featured | None | Featured products |
| GET | /api/products/:slug | None | Product detail |
| GET | /api/categories | None | All categories |
| GET | /api/cart | Optional | Get cart |
| POST | /api/cart/items | Optional | Add to cart |
| POST | /api/cart/merge | Auth | Merge guest cart after login |
| GET | /api/orders | Auth | My orders |
| POST | /api/orders | Auth | Create order |
| POST | /api/payments/paypal/create-order | Auth | Create PayPal order |
| POST | /api/payments/paypal/capture-order | Auth | Capture PayPal payment |
| GET | /api/addresses | Auth | My addresses |
| POST | /api/addresses | Auth | Add address |
| GET | /api/admin/dashboard | Admin | Dashboard stats |
| GET | /api/admin/orders | Admin | All orders |
| POST | /api/products | Admin | Create product |
| PATCH | /api/products/:id | Admin | Update product |
| GET | /api/health | None | Health check |

---

## Available Scripts

From the **root** directory:

```bash
pnpm dev              # Start both API and web
pnpm dev:api          # Start only API
pnpm dev:web          # Start only frontend
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm db:migrate:dev   # Run Prisma migrations (dev)
pnpm db:migrate       # Deploy migrations (production)
pnpm db:seed          # Seed demo data
pnpm db:studio        # Open Prisma Studio
pnpm db:reset         # Reset DB and re-seed
```

---

## Shipping Policy (Seeded Logic)

- Orders **under A$150**: A$9.95 flat shipping
- Orders **A$150 and over**: FREE shipping

---

## Admin Access

Accessible at `/admin` (requires ADMIN role):

- **Dashboard**: Revenue, order counts, low stock alerts, recent orders
- **Products**: Create/edit/deactivate products, manage stock
- **Orders**: View all orders, update status (Processing → Shipped → Delivered)

---

## Before Going to Production

- [ ] Replace all JWT secrets with strong random values
- [ ] Set `PAYPAL_ENV=live` and use live PayPal credentials
- [ ] Configure real Google OAuth credentials with production redirect URL
- [ ] Set up proper SSL/TLS (HTTPS)
- [ ] Configure `FRONTEND_URL` to your production domain
- [ ] Set `NODE_ENV=production`
- [ ] Run `pnpm db:migrate` (not `db:migrate:dev`) in production
- [ ] Configure proper logging and monitoring
- [ ] Set up database backups
- [ ] Configure rate limiting appropriately
- [ ] Review and tighten CORS origins
- [ ] Consider adding Redis for session management at scale
- [ ] Add Stripe as a second payment provider (abstraction is already in place via `PaymentProvider` enum)

---

## Stripe Integration (Future)

The codebase is designed to support Stripe alongside PayPal:

1. Add `STRIPE_SECRET_KEY` to `apps/api/.env`
2. Create `apps/api/src/modules/payments/stripe.service.ts`
3. Inject `StripeService` into `PaymentsService` alongside `PaypalService`
4. Add endpoints: `POST /payments/stripe/create-intent`, `POST /payments/stripe/confirm`
5. Add `@stripe/stripe-js` and `@stripe/react-stripe-js` to the web package
6. The `Transaction` model already has `provider: PaymentProvider` (PAYPAL | STRIPE)

---

## Assumptions Made

1. **Product slugs are unique** — used as URL-friendly identifiers
2. **Guest carts** use a UUID stored in localStorage as `sessionId`
3. **Shipping is flat rate** — A$9.95 or free over A$150 (easily configurable)
4. **Stock is reduced immediately** on payment capture (not on order creation)
5. **Google OAuth users** can also set a password later (not implemented in UI but backend supports it)
6. **Product images** use Unsplash URLs as placeholders — replace with real CDN URLs in production
7. **Individual cards** use condition grades in descriptions but don't have a separate condition field (can be added)
8. **Tax (GST)** is not calculated separately — prices are assumed to include GST
