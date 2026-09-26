<div align="center">

<img src="https://img.shields.io/badge/StockSense-Inventory%20Management-E85D5D?style=for-the-badge&logo=databricks&logoColor=white" alt="StockSense" />

<br/>
<br/>

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![SQLite](https://img.shields.io/badge/SQLite-Local-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

<br/>

**A full-stack warehouse and inventory management system.**  
Track stock movements, receipts, deliveries, transfers, adjustments, and reordering rules — all in one place.

<br/>

[🚀 Quick Start](#-quick-start) · [✨ Features](#-features) · [🏗️ Architecture](#️-architecture) · [📡 API Reference](#-api-reference) · [🔐 Security](#-security)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

**📦 Inventory Operations**
- Goods receipt (GRN) with validation workflow
- Delivery management with status tracking
- Stock transfers between warehouses/locations
- Inventory adjustments with audit trail

</td>
<td width="50%">

**📊 Visibility & Reporting**
- Real-time dashboard with KPIs
- Full stock ledger (every move recorded)
- Move history with filters & search
- Low stock and out-of-stock alerts

</td>
</tr>
<tr>
<td width="50%">

**🏭 Master Data**
- Multi-warehouse support
- Location management per warehouse
- Product catalogue with categories
- Unit of measure tracking

</td>
<td width="50%">

**🔐 Auth & Security**
- JWT stored in httpOnly cookies
- CSRF protection on all mutations
- Role-based access (Admin / Inventory Manager)
- Bcrypt password hashing + OTP reset flow

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
StockSense/                         ← npm workspace root
├── backend/                        ← Express 5 + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma           ← Database schema (SQLite)
│   │   └── seed.js                 ← Demo data seeder
│   └── src/
│       ├── modules/                ← Feature modules
│       │   ├── dashboard/          ← KPI aggregations
│       │   ├── receipt/            ← Goods receipt (GRN)
│       │   ├── delivery/           ← Outbound deliveries
│       │   ├── inventory/          ← Transfers & adjustments
│       │   ├── stock/              ← Stock balance queries
│       │   ├── move-history/       ← Stock ledger
│       │   ├── products/           ← Product catalogue
│       │   ├── category/           ← Product categories
│       │   ├── warehouse/          ← Warehouse management
│       │   ├── location/           ← Location management
│       │   ├── reordering/         ← Reorder rules
│       │   └── user/               ← User management
│       ├── middleware/             ← Auth, CSRF, error handling
│       ├── utils/                  ← JWT, stock engine, ref generator
│       └── app.js                  ← Express app + route registration
│
└── frontend/                       ← React 19 + Vite SPA
    └── src/
        ├── pages/
        │   ├── auth/               ← Login, Signup, Forgot Password
        │   ├── dashboard/          ← Main dashboard
        │   ├── operations/         ← Receipts, Deliveries, Transfers, Adjustments
        │   ├── products/           ← Product catalogue
        │   ├── reordering/         ← Reorder rules
        │   ├── profile/            ← User profile
        │   └── settings/           ← App settings
        ├── services/               ← Axios API service layer
        ├── context/                ← Auth context (JWT + user state)
        └── routes/                 ← Protected & public route guards
```

---

## 🚀 Running Locally

### Prerequisites

| Requirement | Version | Download |
|---|---|---|
| Node.js | v18 or higher | [nodejs.org](https://nodejs.org) |
| npm | v9 or higher | Included with Node.js |
| Git | any | [git-scm.com](https://git-scm.com) |

> ✅ No database server needed — SQLite is used and the database file is created automatically.

---

### Step 1 — Clone the repository

```bash
git clone <repository-url>
cd StockSense
```

---

### Step 2 — Install all dependencies

```bash
npm install
```

> Installs dependencies for both `backend` and `frontend` in one command via npm workspaces.

---

### Step 3 — Set up environment variables

**macOS / Linux:**
```bash
cp backend/.env.example backend/.env
```

**Windows (Command Prompt):**
```cmd
copy backend\.env.example backend\.env
```

**Windows (PowerShell):**
```powershell
Copy-Item backend\.env.example backend\.env
```

Then open `backend/.env` and set your values:

```env
JWT_SECRET="any-long-random-string-here"
ADMIN_PASSWORD="your-admin-password"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Production only | Any long random string. A dev fallback is used if omitted. |
| `ADMIN_PASSWORD` | Yes (for seeding) | Sets the password for the default `admin001` account |
| `PORT` | No | Backend port — defaults to `5000` |
| `CLIENT_URL` | No | Frontend origin for CORS — defaults to `http://localhost:5173` |

---

### Step 4 — Push the database schema

This creates the local SQLite database file at `backend/prisma/stocksense.db`:

```bash
npm run prisma:migrate --workspace=stocksense-backend
```

> This step runs automatically when you start the dev server, so you can skip it if going straight to Step 6.

---

### Step 5 — Seed demo data *(optional but recommended)*

Populates the database with sample products, warehouses, and inventory operations:

```bash
npm run prisma:seed --workspace=stocksense-backend
```

Creates a default admin account you can log in with immediately:

| Field | Value |
|---|---|
| Login ID | `admin001` |
| Email | `admin@stocksense.local` |
| Password | *(your `ADMIN_PASSWORD` from `.env`)* |
| Role | `ADMIN` |

---

### Step 6 — Start the development server

```bash
npm run dev
```

This starts both backend and frontend concurrently:

| Service | URL | Description |
|---|---|---|
| 🌐 Frontend | http://localhost:5173 | React + Vite UI |
| ⚙️ Backend API | http://localhost:5000 | Express REST API |
| ❤️ Health check | http://localhost:5000/api/health | Verify API is running |

---

### Troubleshooting

<details>
<summary><strong>❌ <code>prisma db push</code> fails on startup</strong></summary>

Check that `backend/.env` exists and has no syntax errors. The file must exist even if all values are defaults.

```bash
# Verify the file exists
ls backend/.env        # macOS/Linux
dir backend\.env       # Windows
```

</details>

<details>
<summary><strong>❌ Port already in use</strong></summary>

Change the port in `backend/.env`:

```env
PORT=5001
```

Then update the frontend API base URL in `frontend/src/services/api.js` or set `VITE_API_URL` in a `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5001/api/v1
```

</details>

<details>
<summary><strong>❌ CORS errors in the browser</strong></summary>

Make sure `CLIENT_URL` in `backend/.env` matches the exact origin the frontend is running on (including port):

```env
CLIENT_URL="http://localhost:5173"
```

</details>

<details>
<summary><strong>❌ Merge conflict markers in source files</strong></summary>

If you see `SyntaxError: Unexpected token '<<'`, there are unresolved Git merge conflicts in the codebase. Search for files containing `<<<<<<<` and resolve them before running.

</details>

---

## 📜 Scripts

### Root (run from project root)

| Script | Description |
|---|---|
| `npm run dev` | Start backend + frontend together |
| `npm run dev:backend` | Start backend only (with nodemon) |
| `npm run dev:frontend` | Start frontend only (Vite) |
| `npm run build` | Build frontend for production |
| `npm run start` | Start backend in production mode |

### Backend workspace

```bash
# Push schema to database (runs automatically on dev/start)
npm run prisma:migrate --workspace=stocksense-backend

# Open Prisma Studio — visual database browser
npm run prisma:studio --workspace=stocksense-backend

# Re-seed the database
npm run prisma:seed --workspace=stocksense-backend

# Run security tests
npm test --workspace=stocksense-backend
```

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api/v1`

<details>
<summary><strong>🔑 Auth</strong></summary>

```
POST   /auth/signup              Register a new user
POST   /auth/login               Login and receive JWT cookie
POST   /auth/logout              Clear session cookie
POST   /auth/forgot-password     Request OTP for password reset
POST   /auth/reset-password      Reset password using OTP
GET    /auth/me                  Get current authenticated user
```

</details>

<details>
<summary><strong>📦 Products & Categories</strong></summary>

```
GET    /products                 List all products
POST   /products                 Create a product
GET    /products/:id             Get product by ID
PATCH  /products/:id             Update product
DELETE /products/:id             Delete product

GET    /categories               List all categories
POST   /categories               Create a category
GET    /categories/:id           Get category by ID
PATCH  /categories/:id           Update category
DELETE /categories/:id           Delete category
```

</details>

<details>
<summary><strong>🏭 Warehouses & Locations</strong></summary>

```
GET    /warehouses               List all warehouses
POST   /warehouses               Create a warehouse
GET    /warehouses/:id           Get warehouse by ID
PATCH  /warehouses/:id           Update warehouse
DELETE /warehouses/:id           Delete warehouse

GET    /locations                List all locations
POST   /locations                Create a location
GET    /locations/:id            Get location by ID
PATCH  /locations/:id            Update location
DELETE /locations/:id            Delete location
```

</details>

<details>
<summary><strong>🚚 Receipts & Deliveries</strong></summary>

```
GET    /receipts                 List receipts (filterable)
POST   /receipts                 Create a receipt (GRN)
GET    /receipts/:id             Get receipt by ID
PATCH  /receipts/:id/validate    Move to READY status
PATCH  /receipts/:id/complete    Complete and update stock

GET    /deliveries               List deliveries (filterable)
POST   /deliveries               Create a delivery
GET    /deliveries/:id           Get delivery by ID
PATCH  /deliveries/:id/validate  Move to READY status
PATCH  /deliveries/:id/complete  Complete and deduct stock
```

</details>

<details>
<summary><strong>🔄 Transfers, Adjustments & Stock</strong></summary>

```
GET    /operations               List all inventory operations
POST   /operations               Create transfer or adjustment
GET    /stock                    Current stock balances by location
GET    /move-history             Full stock ledger with filters
```

</details>

<details>
<summary><strong>🔔 Reordering Rules</strong></summary>

```
GET    /reordering-rules         List all reordering rules
POST   /reordering-rules         Create a reordering rule
GET    /reordering-rules/:id     Get rule by ID
PATCH  /reordering-rules/:id     Update rule
DELETE /reordering-rules/:id     Delete rule
```

</details>

<details>
<summary><strong>📊 Dashboard & Health</strong></summary>

```
GET    /dashboard                KPI summary (pending ops, stock stats)
GET    /csrf-token               Fetch CSRF token (required before mutations)
GET    /api/health               Service health check
GET    /api/v1/health            API version health check
```

</details>

---

## 🔐 Security

<details>
<summary><strong>How authentication works</strong></summary>

1. `POST /auth/login` — validates credentials, returns a JWT stored in an **httpOnly cookie** (never accessible via JavaScript)
2. All protected routes verify the JWT from the cookie via the auth middleware
3. On `401`, the frontend automatically redirects to `/login` and clears local storage
4. `POST /auth/logout` clears the session cookie server-side

</details>

<details>
<summary><strong>How CSRF protection works</strong></summary>

1. Before any mutation (POST / PATCH / DELETE), the frontend calls `GET /csrf-token`
2. The server sets a `csrfToken` **httpOnly cookie** and returns the same token in the response body
3. The frontend sends the token as the `X-CSRF-Token` header on every mutation
4. The server compares the header value against the cookie using **timing-safe comparison** (`crypto.timingSafeEqual`)
5. Auth routes (`/api/v1/auth/*`) and read-only methods (GET, HEAD, OPTIONS) are exempt

</details>

<details>
<summary><strong>Other security measures</strong></summary>

- Passwords hashed with **bcrypt** (cost factor 10)
- Input validated with **Zod** on both frontend and backend
- CORS restricted to `localhost:5173` and `localhost:5174` only
- `.env` files excluded from version control via `.gitignore`
- `JWT_SECRET` falls back to a dev-only default — **always set a real secret in production**

</details>

---

## 🗄️ Database

The SQLite database is created automatically at `backend/prisma/stocksense.db` on first run. No setup required.

<details>
<summary><strong>Data model overview</strong></summary>

| Model | Description |
|---|---|
| `User` | Accounts with roles (ADMIN / INVENTORY_MANAGER) |
| `PasswordResetOTP` | OTP records for password reset flow |
| `Product` | Product catalogue with SKU, category, unit price |
| `Category` | Product categories |
| `Warehouse` | Physical warehouse locations |
| `Location` | Sub-locations within a warehouse |
| `StockBalance` | Current quantity per product per location |
| `StockMove` | Immutable ledger — every stock change is recorded here |
| `InventoryOperation` | Receipts, deliveries, transfers, adjustments |
| `ReorderingRule` | Min/max/reorder quantity rules per product/location |

</details>

<details>
<summary><strong>Reset the database</strong></summary>

```bash
# 1. Delete the database file
del backend\prisma\stocksense.db

# 2. Re-create the schema
npm run prisma:migrate --workspace=stocksense-backend

# 3. Re-seed with demo data
npm run prisma:seed --workspace=stocksense-backend
```

</details>

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 19 |
| Build tool | Vite | 8 |
| Styling | Tailwind CSS | 4 |
| Routing | React Router | 7 |
| Forms | React Hook Form + Zod | latest |
| HTTP client | Axios | latest |
| Icons | Lucide React | latest |
| Backend framework | Express | 5 |
| ORM | Prisma | 5 |
| Database | SQLite | — |
| Auth | JWT + httpOnly cookies | — |
| Validation | Zod | 4 |
| Password hashing | bcrypt | 6 |
| Dev server | nodemon | 3 |
| Monorepo | npm workspaces | — |

---

<div align="center">

Made with ❤️ · StockSense v1.0.0

</div>
