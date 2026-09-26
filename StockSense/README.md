# StockSense — Inventory Management System

A full-stack inventory management system built with React, Express, Prisma and SQLite.

---

## Quick Start (No configuration needed)

### Backend

```bash
cd backend
npm install
npm run dev
```

That's it. `npm install` automatically:
- Generates the Prisma client
- Creates the SQLite database (`prisma/stocksense.db`)
- Seeds it with sample data, warehouses, products and an admin account

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Login Credentials

| Field    | Value                  |
|----------|------------------------|
| Login ID | `admin001`             |
| Password | `Admin@StockSense2026` |

---

## What's included

- **Authentication** — Login, Signup, Forgot Password with OTP
- **Dashboard** — Live KPIs from the database
- **Products** — Full CRUD with categories
- **Warehouses & Locations** — Multi-warehouse support
- **Receipts** — Incoming stock with Save Draft / Validate flow
- **Deliveries** — Outgoing stock with stock availability check
- **Move History** — Central stock ledger
- **Stock** — Real-time stock balances per location

---

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend  | Node.js, Express 5          |
| ORM      | Prisma                      |
| Database | SQLite (zero setup)         |
| Auth     | JWT + bcrypt                |
| Validation | Zod                       |

---

## No external services required

- No PostgreSQL installation needed
- No cloud database
- No API keys
- No environment variables to configure
- Works completely offline
