# StockSense

StockSense is a warehouse and inventory management application for stock movement, receipt handling, delivery tracking, inventory adjustments, and ledger visibility.

## Monorepo structure

- `frontend/` — React + Vite + Tailwind frontend
- `backend/` — Express + Prisma + PostgreSQL API
- `database/` — database planning, schema notes, and seed assets

## Local development

1. Set up PostgreSQL locally.
2. Configure backend environment values in `backend/.env`.
3. Run the backend API from `backend/`.
4. Run the frontend app from `frontend/`.

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
