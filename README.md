<!-- # Stock Transfer Management

A production-oriented full-stack application for managing warehouse inventory and stock transfers between warehouses.

The application supports warehouse management, stock transfer requests, transfer approval and completion workflows, inventory updates, validation, transfer history, and operational dashboard metrics.

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

 -->




# Stock Transfer Management

A production-oriented full-stack application for managing warehouse inventory and stock transfers between warehouses.

The application supports warehouse management, stock transfer requests, transfer approval and completion workflows, inventory updates, validation, transfer history, and operational dashboard metrics.

## Assignment Deliverables

| Deliverable | Status |
|---|---|
| Live Application URL | To be added after deployment |
| GitHub Repository | This repository |
| Setup Instructions | Included below |
| Sample Usage / Test Flow | Included below |
| Production-oriented implementation | Included |

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
3. Manage transfer status.
4. Update source/destination stock when a transfer is completed.
5. View searchable transfer history.
6. Dashboard with warehouse and transfer KPIs.
7. Server-side validation and consistent API errors.
8. Responsive UI.
9. Health-check endpoint for deployment monitoring.

### Transfer status lifecycle

- `PENDING → APPROVED`
- `PENDING → CANCELLED`
- `APPROVED → COMPLETED`

## Project structure

\`\`\`text
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
\`\`\`

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Local setup

### 1. Clone

\`\`\`bash
git clone <your-github-repository-url>
cd stock-transfer-management
\`\`\`

### 2. Configure the API

\`\`\`bash
cd server
cp .env.example .env
npm install
\`\`\`

Set `DATABASE_URL` in `.env`.

Example:

\`\`\`env
DATABASE_URL="postgresql://postgres:password@localhost:5432/stock_transfer"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
\`\`\`

### 3. Create the database

\`\`\`bash
npx prisma migrate dev
npm run db:seed
\`\`\`

### 4. Start the API

\`\`\`bash
npm run dev
\`\`\`

API: http://localhost:5000

Health check: http://localhost:5000/health

### 5. Start the frontend

Open another terminal:

\`\`\`bash
cd client
cp .env.example .env
npm install
npm run dev
\`\`\`

Frontend: http://localhost:5173

Set:

\`\`\`env
VITE_API_URL="http://localhost:5000/api"
\`\`\`

## Sample Usage / Test Flow

The following flow demonstrates the main application functionality and business rules.

### Seed Data

The seed creates the following warehouses:

| Warehouse | Location | Initial Stock |
|---|---|---:|
| Bangalore Central | Bangalore | 500 |
| Mysore Warehouse | Mysore | 250 |
| Hyderabad Warehouse | Hyderabad | 350 |

### 1. Create a Warehouse

1. Open **Warehouses**.
2. Click **Add Warehouse**.
3. Enter:
   - Name: `Chennai Warehouse`
   - Location: `Chennai`
   - Stock: `100`
4. Save the warehouse.
5. Verify that it appears in the warehouse list.

### 2. Create a Transfer

1. Open **Transfers**.
2. Click **New Transfer**.
3. Select:
   - Source: `Bangalore Central`
   - Destination: `Mysore Warehouse`
   - Quantity: `50`
   - Notes: `Inventory replenishment`
4. Create the transfer.

Expected result:

\`\`\`text
Status: PENDING
\`\`\`

### 3. Approve the Transfer

Click **Approve**.

Expected result:

- `PENDING → APPROVED`
- The warehouse stock should not change during approval.

### 4. Complete the Transfer

Click **Complete**.

Before:

\`\`\`text
Bangalore Central = 500
Mysore Warehouse  = 250
\`\`\`

After:

\`\`\`text
Bangalore Central = 450
Mysore Warehouse  = 300
\`\`\`

Expected result:

- Transfer status = `COMPLETED`

### 5. Cancel a Transfer

Create another pending transfer and cancel it.

Expected result:

- `PENDING → CANCELLED`
- Warehouse stock must remain unchanged.

### 6. Test Same-Warehouse Validation

Attempt to create:

\`\`\`text
Source: Bangalore Central
Destination: Bangalore Central
Quantity: 50
\`\`\`

Expected result:

- `Source and destination warehouses must be different.`
- The transfer must not be created.

### 7. Test Insufficient Stock

Attempt to create a transfer with a quantity greater than the source warehouse's available stock.

Example:

\`\`\`text
Source: Bangalore Central
Destination: Mysore Warehouse
Quantity: 999999
\`\`\`

Expected result:

- `Insufficient stock`
- The operation must be rejected and warehouse stock must remain unchanged.

### 8. Verify Transfer History

Open **Transfers** and verify that previous transfers display:

- Source warehouse
- Destination warehouse
- Quantity
- Status
- Notes
- Created date
- Completion date where applicable

### 9. Verify Dashboard

Open **Dashboard** and verify that:

- Warehouse count is correct
- Total stock is correct
- Transfer counts match the transfer history
- Recent transfers are displayed

## API

### Warehouses

\`\`\`http
GET /api/warehouses
POST /api/warehouses
\`\`\`

Create warehouse:

\`\`\`json
{
  "name": "Chennai Warehouse",
  "location": "Chennai",
  "stock": 100
}
\`\`\`

### Transfers

\`\`\`http
GET /api/transfers
POST /api/transfers
PATCH /api/transfers/:id/status
GET /api/transfers/summary/stats
\`\`\`

Create transfer:

\`\`\`json
{
  "sourceWarehouseId": "<uuid>",
  "destinationWarehouseId": "<uuid>",
  "quantity": 50,
  "notes": "Restocking"
}
\`\`\`

Update status:

\`\`\`json
{
  "status": "APPROVED"
}
\`\`\`

Complete:

\`\`\`json
{
  "status": "COMPLETED"
}
\`\`\`

## Production deployment

### Database

Create a PostgreSQL database using Supabase, Neon, Railway, or another managed PostgreSQL provider.

Copy its connection string into the backend's `DATABASE_URL`.

### Backend on Render

Create a Web Service:

- Root directory: `server`
- Build command:

\`\`\`bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
\`\`\`

- Start command:

\`\`\`bash
npm start
\`\`\`

Environment variables:

\`\`\`env
DATABASE_URL=<managed-postgresql-url>
CLIENT_URL=<your-vercel-frontend-url>
NODE_ENV=production
PORT=10000
\`\`\`

Render automatically supplies the port; the application also supports `PORT`.

### Frontend on Vercel

Create a Vercel project:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Environment variable:

\`\`\`env
VITE_API_URL=https://<your-render-service>.onrender.com/api
\`\`\`

After deployment, update the backend `CLIENT_URL` to the Vercel URL.

## Production notes

- `helmet` adds secure HTTP headers.
- `express-rate-limit` protects API endpoints from excessive requests.
- Zod validates all write payloads.
- CORS is restricted to the configured frontend URL.
- Prisma transactions keep completion atomic.
- Database constraints prevent negative stock and duplicate warehouse names.
- API errors are returned in a predictable `{ message }` format.
- The health endpoint can be used by deployment monitoring.