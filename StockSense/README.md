# StockSense

StockSense is a warehouse and inventory management application for stock movement, receipt handling, delivery tracking, inventory adjustments, and ledger visibility.

## Monorepo structure

- `frontend/` — React + Vite + Tailwind frontend
- `backend/` — Express + Prisma + PostgreSQL API
- `database/` — database planning, schema notes, and seed assets

## Local development

1. Run `npm install` from the project root.
2. Run `npm run dev` to start the backend and frontend. The backend creates and initializes a local SQLite database automatically.

No PostgreSQL server or database URL is required for local development. Set `JWT_SECRET` in the environment for production deployments.

## Core auth flow

- Signup
- Login
- Forgot password
- Reset password
- JWT-based authenticated session

## Security notes

- Keep `.env` files out of version control.
- Validate user input at both frontend and backend layers.
- Use password hashing and JWTs on the backend.
