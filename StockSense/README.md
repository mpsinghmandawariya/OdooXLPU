# StockSense — Inventory Management System

A full-stack inventory management system built with React, Express, Prisma and SQLite.

---

## Quick Start

**Requirements:** Node.js 18+ and npm 9+

```bash
npm install
npm run dev
```

That's it. No `.env` file, no database setup, no extra commands.

The application automatically:
- generates the Prisma client
- creates the local SQLite database (`backend/prisma/stocksense.db`)
- applies the database schema
- seeds demo data (products, warehouses, stock, operations)
- starts the backend on **http://localhost:5000**
- starts the frontend on **http://localhost:5173**

---

## Demo Login

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
- **Transfers** — Move stock between locations
- **Adjustments** — Inventory adjustments
- **Move History** — Central stock ledger
- **Stock** — Real-time stock balances per location
- **Reordering Rules** — Automatic reorder triggers

---

## Tech Stack

| Layer      | Technology                   |
|------------|------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS |
| Backend    | Node.js, Express 5           |
| ORM        | Prisma                       |
| Database   | SQLite (zero setup)          |
| Auth       | JWT + bcrypt                 |
| Validation | Zod                          |

---

## No external services required

- No PostgreSQL, MySQL, or MongoDB needed
- No Docker required
- No cloud database
- No API keys
- No environment variables to configure
- Works completely offline

---

## Running multiple times

Running `npm run dev` multiple times is safe. The seed is idempotent — it will not create duplicate data.

---

## Individual workspace commands

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```
