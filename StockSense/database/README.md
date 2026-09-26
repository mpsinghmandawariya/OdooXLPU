# Database

StockSense uses **SQLite** as its local database — no installation or configuration required. The database file is created automatically on first run.

## Quick Setup (one command)

```bash
cd backend
npm install
npm run setup
```

This single command will:
1. Create the local SQLite database file (`prisma/stocksense.db`)
2. Run all schema migrations
3. Seed the database with sample data and an admin user

## Then start the server

```bash
npm run dev
```

## Default admin credentials

| Field    | Value                    |
|----------|--------------------------|
| Login ID | `admin001`               |
| Password | `ChangeMeToAReallyStrongPassword!2026` |

## What gets seeded

- 2 categories: Accessories, Monitors
- 3 products: Wireless Mouse, Mechanical Keyboard, 27" Monitor
- 2 warehouses: Main Warehouse, Secondary Warehouse
- Sample inventory operations (receipts, deliveries, transfers, adjustments)
- 1 admin user

## Environment variables

All values are pre-configured in `backend/.env` — no changes needed to run locally.

| Variable         | Value                        | Notes                        |
|------------------|------------------------------|------------------------------|
| `DATABASE_URL`   | `file:./stocksense.db`       | SQLite file, auto-created    |
| `JWT_SECRET`     | (set in .env)                | Pre-configured               |
| `ADMIN_PASSWORD` | (set in .env)                | Used during seed             |
| `PORT`           | `5000`                       | Backend API port             |
| `CLIENT_URL`     | `http://localhost:5173`      | Frontend dev server          |

## Schema overview

| Table                  | Purpose                                      |
|------------------------|----------------------------------------------|
| `users`                | Auth — login, roles (ADMIN / INVENTORY_MANAGER / WAREHOUSE_STAFF) |
| `password_reset_otps`  | OTP records for forgot-password flow         |
| `categories`           | Product categories                           |
| `products`             | Product catalogue with SKU and pricing       |
| `warehouses`           | Warehouse master data                        |
| `locations`            | Storage locations within warehouses          |
| `stock_balances`       | Current on-hand and reserved qty per product/location |
| `stock_moves`          | Immutable ledger — every stock change recorded here |
| `inventory_operations` | Receipts, deliveries, transfers, adjustments |
| `reordering_rules`     | Min/max/reorder qty rules per product/location |
