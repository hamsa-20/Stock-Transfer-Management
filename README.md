# Stock Transfer Management

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

<!-- ## Sample usage / test flow

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
12. Try completing a transfer whose source stock is insufficient. The transaction rejects it without partially updating either warehouse. -->

## Sample Usage / Test Flow

The following test flow demonstrates the main functionality, business rules, validation, and inventory updates supported by the application.

### Seed Data

The application is seeded with the following warehouses:

| Warehouse | Location | Initial Stock |
|---|---|---:|
| Bangalore Central | Bangalore | 500 |
| Mysore Warehouse | Mysore | 250 |
| Hyderabad Warehouse | Hyderabad | 350 |

### 1. Create a Warehouse

1. Open the **Warehouses** page.
2. Click **Add Warehouse**.
3. Enter:

\`\`\`
Name: Chennai Warehouse
Location: Chennai
Stock: 100
\`\`\`

4. Click **Create Warehouse**.
5. Verify that the warehouse appears in the warehouse list.

Expected Result: The warehouse is created successfully and its stock is displayed correctly.

### 2. Create a Stock Transfer

1. Open the **Transfers** page.
2. Click **New Transfer**.
3. Enter:

\`\`\`
Source: Bangalore Central
Destination: Mysore Warehouse
Quantity: 50
Notes: Inventory replenishment
\`\`\`

4. Click **Create Transfer**.

Expected Result:

\`\`\`
Transfer Status: PENDING
\`\`\`

The transfer appears in the transfer history.

### 3. Approve the Transfer

1. Find the newly created transfer.
2. Click **Approve**.

Expected Result:

\`\`\`
PENDING → APPROVED
\`\`\`

Warehouse stock remains unchanged during approval.

### 4. Complete the Transfer

1. Open the approved transfer.
2. Click **Complete**.

Before completion:

\`\`\`
Bangalore Central = 500
Mysore Warehouse  = 250
\`\`\`

After completing a transfer of 50 units:

\`\`\`
Bangalore Central = 450
Mysore Warehouse  = 300
\`\`\`

Expected Result:

\`\`\`
Transfer Status: COMPLETED
Source stock decreases by 50
Destination stock increases by 50
\`\`\`

The source and destination stock updates are performed atomically using a database transaction.

### 5. Cancel a Transfer

1. Create another transfer:

\`\`\`
Source: Bangalore Central
Destination: Hyderabad Warehouse
Quantity: 20
\`\`\`

2. Keep the transfer in `PENDING` state.
3. Click **Cancel**.

Expected Result:

\`\`\`
PENDING → CANCELLED
\`\`\`

Warehouse stock remains unchanged after cancellation.

### 6. Validate Same Source and Destination

Attempt to create a transfer using:

\`\`\`
Source: Bangalore Central
Destination: Bangalore Central
Quantity: 50
\`\`\`

Expected Result: The request is rejected with:

\`\`\`
Source and destination warehouses must be different.
\`\`\`

No transfer is created.

### 7. Validate Insufficient Stock

Attempt to create a transfer with a quantity greater than the available source stock:

\`\`\`
Source: Bangalore Central
Destination: Mysore Warehouse
Quantity: 999999
\`\`\`

Attempt to approve the transfer.

Expected Result: The request is rejected with an insufficient stock error. The transfer remains `PENDING` and warehouse stock remains unchanged.

### 8. Validate Invalid Status Transitions

After completing a transfer, attempt to complete the same transfer again.

Expected Result: The API rejects the request because a `COMPLETED` transfer cannot be completed again. Cancelled transfers cannot be completed, and invalid status transitions are rejected by the backend.

### 9. Verify Transfer History

Open the **Transfers** page and verify that each transfer displays:

- Source warehouse
- Destination warehouse
- Quantity
- Status
- Notes
- Created date
- Completion date when applicable

The transfer history should contain transfers with statuses such as:

\'\'\'
PENDING
APPROVED
COMPLETED
CANCELLED
\`\`\`

### 10. Verify Dashboard

Open the **Dashboard** and verify:

- Total warehouse count
- Total stock across warehouses
- Pending transfers
- Approved transfers
- Completed transfers
- Cancelled transfers
- Recent transfer activity

Dashboard statistics should remain consistent with the warehouse and transfer data.

<!-- ### End-to-End Successful Transfer Flow


Create Warehouse
       ↓
Create Transfer
       ↓
    PENDING
       ↓
    APPROVE
       ↓
   APPROVED
       ↓
   COMPLETE
       ↓
  COMPLETED
       ↓
Update Source Stock
       ↓
Update Destination Stock
\`\`\`

### Cancellation Flow

\`\`\`text
Create Transfer
       ↓
    PENDING
       ↓
     CANCEL
       ↓
   CANCELLED
       ↓
No Stock Change
\`\`\`

### Validation Flow

\`\`\`text
Invalid Request
       ↓
Server-side Validation
       ↓
Request Rejected
       ↓
No Invalid Database Update
\`\`\` -->

### End-to-End Successful Transfer Flow

```mermaid
flowchart TD
    A[Create Warehouse] --> B[Create Transfer]
    B --> C[PENDING]
    C --> D[Approve]
    D --> E[APPROVED]
    E --> F[Complete]
    F --> G[COMPLETED]
    G --> H[Update Source Stock]
    H --> I[Update Destination Stock]
```

### Cancellation Flow

```mermaid
flowchart TD
    A[Create Transfer] --> B[PENDING]
    B --> C[Cancel]
    C --> D[CANCELLED]
    D --> E[No Stock Change]
```

### Validation Flow

```mermaid
flowchart TD
    A[Invalid Request] --> B[Server-side Validation]
    B --> C[Request Rejected]
    C --> D[No Invalid Database Update]
```


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


