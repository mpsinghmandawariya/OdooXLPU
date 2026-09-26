# StockSense

StockSense is a full-stack warehouse and inventory management application designed to manage products, warehouses, storage locations, stock movements, inventory operations, and reorder rules from a single dashboard.

## Project Overview

StockSense provides an inventory workflow similar to a modern warehouse management system:

- Product and category management
- Warehouse and storage-location management
- Receipt management for incoming stock
- Delivery management for outgoing stock
- Internal stock transfers
- Inventory adjustments
- Central stock ledger and move history
- Stock balance visibility by product and location
- Reordering rules and low-stock detection
- Dashboard with inventory summaries and alerts
- User authentication and profile management
- Password reset flow
- Application settings

## Technology Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- Zod
- Axios
- Lucide React

### Backend

- Node.js
- Express 5
- Prisma ORM
- SQLite
- JWT authentication
- bcrypt password hashing
- Zod validation
- CORS and cookie support

## Project Structure

```text
StockSense/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── category/
│   │   │   ├── dashboard/
│   │   │   ├── delivery/
│   │   │   ├── inventory/
│   │   │   ├── location/
│   │   │   ├── move-history/
│   │   │   ├── products/
│   │   │   ├── receipt/
│   │   │   ├── reordering/
│   │   │   ├── stock/
│   │   │   ├── user/
│   │   │   └── warehouse/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── validators/
│   └── tests/
├── database/
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── operations/
│       │   ├── products/
│       │   ├── profile/
│       │   ├── reordering/
│       │   └── settings/
│       ├── routes/
│       └── services/
└── README.md
```

## Requirements

Install the following before running the project:

- Node.js 18+ recommended
- npm

SQLite is used by the current Prisma schema, so a separate PostgreSQL server is not required for the provided local setup.

## Installation

### 1. Clone or extract the project

```bash
git clone <repository-url>
cd StockSense
```

If the project was supplied as a ZIP, extract it and open a terminal in the `StockSense` directory.

### 2. Configure the backend environment

Create `backend/.env` using `backend/.env.example` as the template.

Example:

```env
DATABASE_URL="file:./stocksense.db"
JWT_SECRET="replace-with-a-long-random-secret"
ADMIN_PASSWORD="replace-with-a-strong-admin-password"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

`ADMIN_PASSWORD` is required when running the seed script.

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Prepare the database

For the supplied local SQLite setup:

```bash
npm run setup
```

The setup command runs the Prisma migration and then seeds sample data.

Alternatively, for an existing database:

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start the backend

```bash
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

Health checks:

```text
http://localhost:5000/api/health
http://localhost:5000/api/v1/health
```

### 6. Install and start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

The frontend uses the following API URL by default:

```text
http://localhost:5000/api/v1
```

To override it, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Database and Seed Data

The current Prisma datasource uses SQLite:

```text
backend/prisma/stocksense.db
```

The seed script creates or updates:

- Accessories category
- Monitors category
- Wireless Mouse
- Mechanical Keyboard
- 27-inch Monitor
- Main Warehouse
- Secondary Warehouse
- Sample inventory operations
- An admin account

### Admin account

The seed script uses the value of `ADMIN_PASSWORD` from `backend/.env`.

The seeded login ID is:

```text
admin001
```

The password is **not hard-coded in the application**; it is taken from `ADMIN_PASSWORD`.

## Main Application Modules

### Dashboard

Provides a high-level view of inventory activity and stock alerts. The notification indicator can lead to the reordering/stock-alert workflow.

### Products

Manage the product catalogue including:

- SKU
- Product name
- Description
- Category
- Unit of measure
- Unit price
- Active/inactive status

### Warehouses and Locations

Warehouses contain storage locations. Users can create, edit, and deactivate warehouse and location records from Settings.

### Receipts

Receipts represent incoming stock. Validating a receipt updates inventory and creates a stock-ledger entry.

### Deliveries

Deliveries represent outgoing stock. Validating a delivery decreases inventory and records the stock movement.

### Transfers

Internal transfers move inventory between locations and record the source and destination in the stock ledger.

### Adjustments

Inventory adjustments reconcile the recorded quantity with the required quantity and create corresponding stock movements.

### Stock

Displays current stock balances by product and location, including on-hand and reserved quantities.

### Move History

Provides historical visibility into stock movements recorded in the central `StockMove` ledger.

### Reordering Rules

Reordering rules define:

- Minimum quantity
- Maximum quantity
- Reorder quantity
- Product
- Optional warehouse scope
- Optional location scope
- Active/inactive state

The system calculates available stock and identifies rules that require replenishment.

### Profile and Settings

Users can manage their profile and password. Settings provide warehouse/location administration and inventory preferences.

## API Overview

The backend API is mounted under:

```text
/api/v1
```

Main route groups include:

| Route | Purpose |
|---|---|
| `/auth` | Login, signup, password reset |
| `/dashboard` | Dashboard information |
| `/products` | Product management |
| `/categories` | Category management |
| `/stock` | Stock balances and stock operations |
| `/warehouses` | Warehouse management |
| `/locations` | Location management |
| `/receipts` | Incoming stock operations |
| `/deliveries` | Outgoing stock operations |
| `/operations` | Transfers and adjustments |
| `/move-history` | Stock movement history |
| `/reordering-rules` | Reorder-rule management |
| `/users` | User/profile operations |
| `/health` | API health information |

## Stock Flow

The main inventory flow is:

```text
Receipt
   │
   ▼
Stock Balance increases
   │
   ▼
StockMove ledger entry

Delivery
   │
   ▼
Stock Balance decreases
   │
   ▼
StockMove ledger entry

Transfer
   │
   ├── Source location decreases
   ├── Destination location increases
   └── StockMove ledger entry

Adjustment
   │
   ▼
Stock reconciled
   │
   ▼
StockMove ledger entry
```

## Authentication and Security

The application uses:

- JWT-based authentication
- bcrypt password hashing
- HTTP-only CSRF cookie support
- CSRF validation for state-changing requests
- CORS restrictions for configured frontend origins
- Backend request validation using Zod

Do not commit `.env` files or production secrets to version control.

## Useful Backend Commands

From `backend/`:

```bash
npm run dev
```

Start the backend with Nodemon.

```bash
npm start
```

Start the backend normally.

```bash
npm run prisma:migrate
```

Push the current Prisma schema to the local database.

```bash
npm run prisma:studio
```

Open Prisma Studio.

```bash
npm run prisma:seed
```

Seed the database.

```bash
npm test
```

Run the included security test script.

## Useful Frontend Commands

From `frontend/`:

```bash
npm run dev
```

Start the Vite development server.

```bash
npm run build
```

Create a production frontend build.

```bash
npm run preview
```

Preview the production build locally.

```bash
npm run lint
```

Run Oxlint.

## Development Workflow

For local development, use two terminals.

### Terminal 1 — Backend

```bash
cd backend
npm install
npm run setup
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Troubleshooting

### Prisma client error

Run:

```bash
cd backend
npx prisma generate
```

### Database/schema is out of sync

For the local SQLite development database:

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

### Frontend cannot connect to backend

Confirm that the backend is running on port `5000` and that the frontend API URL is:

```text
http://localhost:5000/api/v1
```

If necessary, create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Login fails after reseeding

Check that `ADMIN_PASSWORD` is defined in `backend/.env` and use that value with login ID `admin001`.

## Production Notes

Before deployment:

1. Replace development secrets with strong production secrets.
2. Do not commit `.env` files.
3. Configure the correct frontend origin in backend CORS settings.
4. Use HTTPS.
5. Review database backup and migration procedures.
6. Build the frontend using `npm run build`.
7. Run backend and security tests.
8. Review authorization rules for each role before exposing the application publicly.

## Current Scope

The current project is a functional inventory-management application containing authentication, product/catalogue management, warehouse and location management, stock operations, stock ledger/history, dashboard reporting, profile/settings, and reordering rules.

The project is organized as a frontend/backend monorepo and uses SQLite for the provided local development configuration.

## License

This project does not currently declare a separate open-source license.
