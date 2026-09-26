<div align="center">

# StockSense

### A modern warehouse & inventory management system

*Stock movement · Receipts · Deliveries · Adjustments · Full ledger traceability*

<br/>

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](.)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Prisma](https://img.shields.io/badge/prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](./CONTRIBUTING.md)

<br/>

[Quick Start](#-quick-start) · [Features](#-features) · [Architecture](#️-architecture) · [API Overview](#-api-overview) · [Roadmap](#️-roadmap)

</div>

---

## Why StockSense?

Most inventory tools are either too simple (spreadsheets) or too heavy (full ERP suites). StockSense sits in the middle: a focused, developer-friendly system that gives warehouse and operations teams the workflows they actually need — goods receipts, outbound deliveries, stock transfers, adjustments, and a complete, immutable move ledger — without the overhead of a monolithic platform.

Inspired by Odoo's inventory module, built to be understood, extended, and self-hosted.

---

## 📋 Table of Contents

<details>
<summary>Expand</summary>

- [Why StockSense?](#why-stocksense)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Variables](#️-environment-variables)
- [📡 API Overview](#-api-overview)
- [🗄️ Data Model](#️-data-model)
- [🔒 Security](#-security)
- [🧪 Testing](#-testing)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

</details>

---

## ✨ Features

### Inventory & Stock
- SKU-based product catalogue with categories and unit of measure
- Multi-warehouse support with named sub-locations
- Real-time stock balances per product per location
- Reserved quantity tracking (on-hand vs. free-to-use)
- Reordering rules engine with min / max / reorder quantity thresholds

### Operations
- **Receipts (GRN)** — validate and complete inbound stock
- **Deliveries** — validate and complete outbound stock
- **Transfers** — move stock between locations or warehouses
- **Adjustments** — correct stock counts with full audit trail
- Operation lifecycle: `DRAFT → READY → COMPLETED`
- Auto-generated reference numbers per operation type

### Auth & Security
- Signup, login, logout with JWT sessions (httpOnly cookies)
- OTP-based forgot / reset password flow
- Role-based access: `ADMIN` and `INVENTORY_MANAGER`
- CSRF protection on all state-changing requests
- Zod validation on both frontend and backend

### Dashboard & Insights
- KPI summary: pending receipts, pending deliveries, low stock, out-of-stock
- On-hand and free-to-use totals across all locations
- Recent operations feed
- Full, filterable stock move history (the ledger)

---

## 🏗️ Architecture

### System diagram

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│          React 19 + Vite + Tailwind CSS v4              │
│   React Router · React Hook Form · Zod · Axios          │
└────────────────────────┬────────────────────────────────┘
                         │  HTTP + JWT cookie + CSRF token
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Express 5 API                        │
│         /api/v1/* — 13 route groups                     │
│   Auth middleware · CSRF middleware · Zod validation    │
│              Prisma ORM client                          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              SQLite (dev) · PostgreSQL (prod)           │
│         10 models · immutable StockMove ledger          │
└─────────────────────────────────────────────────────────┘
```

### Monorepo layout

```
StockSense/                        ← npm workspaces root
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          ← single source of truth for the DB
│   │   └── seed.js                ← demo data (products, warehouses, admin)
│   └── src/
│       ├── modules/               ← one folder per domain feature
│       │   ├── dashboard/
│       │   ├── receipt/
│       │   ├── delivery/
│       │   ├── inventory/         ← transfers & adjustments
│       │   ├── stock/
│       │   ├── move-history/
│       │   ├── products/
│       │   ├── category/
│       │   ├── warehouse/
│       │   ├── location/
│       │   ├── reordering/
│       │   └── user/
│       ├── middleware/            ← auth, CSRF, error handler
│       ├── utils/                 ← JWT helpers, stock engine, ref generator
│       ├── validators/            ← Zod schemas
│       └── app.js
├── frontend/
│   └── src/
│       ├── pages/                 ← auth, dashboard, operations, products…
│       ├── components/            ← Button, Input, ErrorMessage
│       ├── services/              ← Axios API layer per domain
│       ├── context/               ← AuthContext
│       └── routes/                ← ProtectedRoute / PublicRoute guards
└── database/                      ← schema notes and planning docs
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| UI framework | React 19 | Component-based SPA |
| Build tool | Vite 8 | Dev server and production bundler |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Routing | React Router v7 | Client-side routing with route guards |
| Forms & validation | React Hook Form + Zod | Type-safe form handling |
| HTTP client | Axios | API requests with interceptors |
| Icons | lucide-react | Consistent icon set |
| API framework | Express 5 | REST API server |
| ORM | Prisma 5 | Type-safe DB access, migrations |
| Database (dev) | SQLite | Zero-config local database |
| Database (prod) | PostgreSQL | Production-grade relational DB |
| Auth | JWT + httpOnly cookies | Stateless, XSS-resistant sessions |
| Password hashing | bcrypt | Secure credential storage |
| Validation | Zod | Runtime schema validation (both layers) |
| Dev runner | nodemon | Auto-restart on file changes |
| Monorepo | npm workspaces | Single `npm install` for all packages |

---

## 🚀 Quick Start

> **No external database, no Docker, no `.env` required for local development.**  
> The backend creates a local SQLite file automatically on first run.

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Clone

```bash
git clone https://github.com/<your-username>/stocksense.git
cd stocksense
```

### 2. Install all dependencies

```bash
npm install
```

This installs dependencies for both `backend` and `frontend` via npm workspaces.

### 3. Configure environment *(optional for local dev)*

```bash
# macOS / Linux
cp backend/.env.example backend/.env

# Windows (Command Prompt)
copy backend\.env.example backend\.env

# Windows (PowerShell)
Copy-Item backend\.env.example backend\.env
```

Edit `backend/.env` with your values (see [Environment Variables](#️-environment-variables)).  
For local development, the backend runs with safe defaults — no `.env` file is strictly required.

### 4. Seed demo data *(optional but recommended)*

```bash
npm run prisma:seed --workspace=stocksense-backend
```

Creates sample products, warehouses, and a default admin account:

| Field | Value |
|---|---|
| Login ID | `admin001` |
| Email | `admin@stocksense.local` |
| Password | value of `ADMIN_PASSWORD` in your `.env` |

### 5. Run

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health check | http://localhost:5000/api/health |

Both services start concurrently. The backend pushes the Prisma schema to SQLite before nodemon starts.

---

## ⚙️ Environment Variables

All variables live in `backend/.env`. Copy from `backend/.env.example` to get started.

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | **Production** | dev fallback string | Secret used to sign JWTs. Must be long and random in production. |
| `ADMIN_PASSWORD` | For seeding | — | Password assigned to the `admin001` seed account. |
| `PORT` | No | `5000` | Port the Express server listens on. |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin for the frontend. |

> In production, always set `JWT_SECRET` to a cryptographically random string (≥ 32 characters). The security test will fail if a known-weak default is detected.

---

## 📡 API Overview

**Base URL:** `http://localhost:5000/api/v1`

All protected routes require a valid JWT cookie. All mutation routes (`POST`, `PATCH`, `DELETE`) additionally require an `X-CSRF-Token` header obtained from `GET /csrf-token`.

| Route group | Prefix | Notes |
|---|---|---|
| Health | `GET /api/health` | No auth required |
| CSRF | `GET /csrf-token` | Call before any mutation |
| Auth | `/auth` | Signup, login, logout, forgot/reset password, me |
| Dashboard | `/dashboard` | KPI summary — protected |
| Products | `/products` | CRUD — protected |
| Categories | `/categories` | CRUD — protected |
| Warehouses | `/warehouses` | CRUD — protected |
| Locations | `/locations` | CRUD — protected |
| Stock | `/stock` | Current balances per product/location — protected |
| Receipts | `/receipts` | Create, validate, complete GRNs — protected |
| Deliveries | `/deliveries` | Create, validate, complete deliveries — protected |
| Operations | `/operations` | Transfers and adjustments — protected |
| Move history | `/move-history` | Filterable stock ledger — protected |
| Reordering rules | `/reordering-rules` | CRUD for min/max rules — protected |
| Users | `/users` | User management — protected |

<details>
<summary><strong>Auth routes</strong></summary>

```
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
```

</details>

<details>
<summary><strong>Inventory operation lifecycle</strong></summary>

```
POST   /receipts                    Create (status: DRAFT)
PATCH  /receipts/:id/validate       → READY
PATCH  /receipts/:id/complete       → COMPLETED  (updates StockBalance, writes StockMove)

POST   /deliveries                  Create (status: DRAFT)
PATCH  /deliveries/:id/validate     → READY
PATCH  /deliveries/:id/complete     → COMPLETED  (deducts StockBalance, writes StockMove)

POST   /operations                  Create transfer or adjustment
```

</details>

---

## 🗄️ Data Model

```prisma
// Simplified — see backend/prisma/schema.prisma for the full schema

User              → has role (ADMIN | INVENTORY_MANAGER)
Category          → groups Products
Product           → SKU-based, belongs to Category, has StockBalances
Warehouse         → has many Locations
Location          → belongs to Warehouse, has StockBalances
StockBalance      → current quantity + reservedQuantity per (Product, Location)
StockMove         → immutable ledger entry for every stock change
InventoryOperation→ receipt | delivery | transfer | adjustment (DRAFT→READY→COMPLETED)
ReorderingRule    → min/max/reorder thresholds per (Product, Warehouse?, Location?)
PasswordResetOTP  → hashed OTP with expiry and attempt tracking
```

### The ledger pattern

`StockMove` is the single source of truth for all stock changes. Every time an `InventoryOperation` is completed, one or more `StockMove` records are written — they are never updated or deleted. `StockBalance` is a derived, mutable snapshot that reflects the current state. This separation means you can always reconstruct balances from the move history and audit exactly what happened, when, and by whom.

---

## 🔒 Security

| Practice | Implementation |
|---|---|
| Password hashing | bcrypt with cost factor 10 |
| Session tokens | JWT signed with `JWT_SECRET`, stored in httpOnly cookies (not localStorage) |
| CSRF protection | Double-submit cookie pattern with `crypto.timingSafeEqual` comparison |
| Input validation | Zod schemas enforced on both frontend (forms) and backend (request bodies) |
| CORS | Restricted to explicit allowed origins (`localhost:5173`, `localhost:5174`) |
| OTP security | OTPs are hashed before storage; expiry and attempt limits enforced |
| Secrets hygiene | `.env` excluded from VCS; production requires explicit `JWT_SECRET` |
| Security test | CI-level assertion that `JWT_SECRET` is not a known-weak default |

---

## 🧪 Testing

A security smoke test ships with the backend. It asserts that `JWT_SECRET` is not set to any known-weak default value:

```bash
npm test --workspace=stocksense-backend
```

Expected output:

```
security checks passed
```

The test is intentionally lightweight — it validates the security posture of the environment configuration, not application logic. Additional unit and integration tests are a planned roadmap item.

---

## 🗺️ Roadmap

These are ideas under consideration, not committed features.

- [ ] **Barcode / QR scanning** — scan products during receipt and delivery operations via a mobile-friendly interface
- [ ] **Reporting & exports** — CSV / PDF exports for stock reports, move history, and operation summaries
- [ ] **Multi-currency pricing** — per-warehouse or per-operation currency support with exchange rate tracking
- [ ] **Notification system** — email or in-app alerts when stock falls below reorder thresholds
- [ ] **Audit log UI** — a dedicated admin view over the raw `StockMove` ledger with advanced filtering and export

---

## 🤝 Contributing

Contributions are welcome. Please follow this workflow:

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes.** Keep commits focused and descriptive.

3. **Test your changes** locally with `npm run dev` and run `npm test --workspace=stocksense-backend`.

4. **Open a Pull Request** against `main` with a clear description of what changed and why.

For significant changes, open an issue first to discuss the approach before writing code.

---

## 📄 License

[ISC](./LICENSE) © StockSense Contributors
