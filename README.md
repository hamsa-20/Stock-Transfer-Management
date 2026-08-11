# Stock Transfer Management

A production-oriented full-stack application for managing warehouse stock transfers.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Validation: Zod
- Deployment: Vercel (frontend) + Render (API) + Supabase/Neon (PostgreSQL)

## Features

1. Create warehouses and maintain stock levels.
2. Create stock transfer requests.
3. Manage transfer status:
   - PENDING → APPROVED → COMPLETED
   - PENDING → CANCELLED
   - APPROVED → CANCELLED
4. Atomically update source/destination stock when a transfer is completed.
5. View searchable transfer history.
6. Dashboard with warehouse and transfer KPIs.
7. Server-side validation and consistent API errors.
8. Database transaction with row locking during completion to prevent inconsistent stock updates.
9. Responsive UI.
10. Health-check endpoint for deployment monitoring.

## Project structure

```text
stock-transfer-management/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Local setup

### 1. Clone

```bash
git clone <your-github-repository-url>
cd stock-transfer-management
```

### 2. Configure the API

```bash
cd server
cp .env.example .env
npm install
```

Set `DATABASE_URL` in `.env`.

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/stock_transfer"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

### 3. Create the database

```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Start the API

```bash
npm run dev
```

API: http://localhost:5000

Health check: http://localhost:5000/health

### 5. Start the frontend

Open another terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173

Set:

```env
VITE_API_URL="http://localhost:5000/api"
```

## Sample usage / test flow

The seed creates three warehouses:

- Bangalore Central
- Mysore Warehouse
- Hyderabad Warehouse

Sample stock:

- Bangalore Central: 500
- Mysore Warehouse: 250
- Hyderabad Warehouse: 350

### Flow

1. Open the dashboard.
2. Create a new warehouse.
3. Select **Transfers**.
4. Create a transfer from Bangalore Central to Mysore Warehouse.
5. Enter a quantity lower than the source stock.
6. The transfer is created as `PENDING`.
7. Approve it.
8. Complete it.
9. Verify:
   - source stock decreased
   - destination stock increased
   - transfer becomes `COMPLETED`
10. Try completing the same transfer again. The API rejects it because completed transfers cannot be completed twice.
11. Try creating a transfer where source and destination are the same. Validation rejects it.
12. Try completing a transfer whose source stock is insufficient. The transaction rejects it without partially updating either warehouse.

## API

### Warehouses

```http
GET /api/warehouses
POST /api/warehouses
GET /api/warehouses/:id
PATCH /api/warehouses/:id
```

Create warehouse:

```json
{
  "name": "Chennai Warehouse",
  "location": "Chennai",
  "stock": 100
}
```

### Transfers

```http
GET /api/transfers
POST /api/transfers
PATCH /api/transfers/:id/status
```

Create transfer:

```json
{
  "sourceWarehouseId": "<uuid>",
  "destinationWarehouseId": "<uuid>",
  "quantity": 50,
  "notes": "Restocking"
}
```

Update status:

```json
{
  "status": "APPROVED"
}
```

Complete:

```json
{
  "status": "COMPLETED"
}
```

## Production deployment

### Database

Create a PostgreSQL database using Supabase, Neon, Railway, or another managed PostgreSQL provider.

Copy its connection string into the backend's `DATABASE_URL`.

### Backend on Render

Create a Web Service:

- Root directory: `server`
- Build command:

```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

- Start command:

```bash
npm start
```

Environment variables:

```env
DATABASE_URL=<managed-postgresql-url>
CLIENT_URL=<your-vercel-frontend-url>
NODE_ENV=production
PORT=10000
```

Render automatically supplies the port; the application also supports `PORT`.

### Frontend on Vercel

Create a Vercel project:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Environment variable:

```env
VITE_API_URL=https://<your-render-service>.onrender.com/api
```

After deployment, update the backend `CLIENT_URL` to the Vercel URL.

## Production notes

- `helmet` adds secure HTTP headers.
- `express-rate-limit` protects API endpoints from excessive requests.
- Zod validates all write payloads.
- CORS is restricted to the configured frontend URL.
- Prisma transactions keep completion atomic.
- PostgreSQL row locks protect source/destination stock during completion.
- Database constraints prevent negative stock and duplicate warehouse names.
- API errors are returned in a predictable `{ message }` format.
- The health endpoint can be used by deployment monitoring.

## GitHub submission checklist

- [ ] Push source code to GitHub.
- [ ] Add live frontend URL.
- [ ] Add deployed API health URL.
- [ ] Confirm database migrations run successfully.
- [ ] Test the complete transfer flow on production.
- [ ] Add screenshots to the GitHub README if desired.
