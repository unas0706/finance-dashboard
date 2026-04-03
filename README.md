# Finance Dashboard Backend API

A production-ready REST API for a finance dashboard system built with **Node.js**, **Express**, and **MongoDB**. Features role-based access control (RBAC), JWT authentication, financial record management, aggregated dashboard analytics, soft deletes, pagination, filtering, and a full integration test suite.

---

## Tech Stack

| Layer       | Technology                    |
| ----------- | ----------------------------- |
| Runtime     | Node.js                       |
| Framework   | Express.js                    |
| Database    | MongoDB                       |
| Auth        | JWT (jsonwebtoken + bcryptjs) |
| Validation  | express-validator             |
| Security    | helmet, cors                  |
| Dev tooling | nodemon, dotenv               |

---

## Project Structure

```
finance-dashboard/
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── roles.js            # Role definitions and permission matrix
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── record.controller.js
│   │   └── dashboard.controller.js
│   ├── middleware/
│   │   ├── authenticate.js     # JWT verification
│   │   ├── authorize.js        # Permission-based RBAC guard
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   └── FinancialRecord.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── record.routes.js
│   │   └── dashboard.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── record.service.js   # CRUD + filtering
│   │   └── dashboard.service.js # MongoDB aggregation pipelines
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── response.js         # Consistent API response helpers
│   │   └── seed.js             # DB seeder script
│   ├── app.js                  # Express app setup
│   └── server.js               # Entry point
├── .*env
├── .gitignore
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 16
- MongoDB running locally (or a MongoDB Atlas connection string)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/unas0706/finance-dashboard
cd finance-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET


# 4. Start the development server
npm run dev
```

The server will start at `http://localhost:5000`.

---

## Environment Variables

| Variable         | Description                  | Default                                       |
| ---------------- | ---------------------------- | --------------------------------------------- |
| `PORT`           | Port the server listens on   | `5000`                                        |
| `MONGO_URI`      | MongoDB connection string    | `mongodb://localhost:27017/finance_dashboard` |
| `JWT_SECRET`     | Secret key used to sign JWTs | _(required)_                                  |
| `JWT_EXPIRES_IN` | Token expiry duration        | `7d`                                          |

---

## Role & Permission Matrix

| Permission       | Admin | Analyst | Viewer |
| ---------------- | :---: | :-----: | :----: |
| `user:create`    |  ✅   |   ❌    |   ❌   |
| `user:read`      |  ✅   |   ❌    |   ❌   |
| `user:update`    |  ✅   |   ❌    |   ❌   |
| `user:delete`    |  ✅   |   ❌    |   ❌   |
| `record:create`  |  ✅   |   ❌    |   ❌   |
| `record:read`    |  ✅   |   ✅    |   ❌   |
| `record:update`  |  ✅   |   ❌    |   ❌   |
| `record:delete`  |  ✅   |   ❌    |   ❌   |
| `dashboard:read` |  ✅   |   ✅    |   ✅   |

---

## API Reference

All endpoints (except register and login) require a Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

### Auth

| Method | Endpoint             | Access | Description                                                                        |
| ------ | -------------------- | ------ | ---------------------------------------------------------------------------------- |
| POST   | `/api/auth/register` | Public | Register a new user (role = viewer by default; only admins can assign other roles) |
| POST   | `/api/auth/login`    | Public | Login and receive a JWT                                                            |
| GET    | `/api/auth/me`       | Any    | Get the currently authenticated user                                               |

#### Register

```json
POST /api/auth/register
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "analyst"   // only applied if requester is an admin
}
```

#### Login

```json
POST /api/auth/login
{
  "email": "admin@finance.com",
  "password": "admin123"
}
```

---

### Users

| Method | Endpoint         | Access | Description               |
| ------ | ---------------- | ------ | ------------------------- |
| GET    | `/api/users`     | Admin  | List all users            |
| GET    | `/api/users/:id` | Admin  | Get a user by ID          |
| PATCH  | `/api/users/:id` | Admin  | Update name/role/status   |
| DELETE | `/api/users/:id` | Admin  | Permanently delete a user |

#### Update User

```json
PATCH /api/users/:id
{
  "name": "Updated Name",
  "role": "analyst",
  "isActive": false
}
```

#### Query Parameters (GET /api/users)

| Param   | Type    | Description                    |
| ------- | ------- | ------------------------------ |
| `page`  | integer | Page number (default: 1)       |
| `limit` | integer | Results per page (default: 20) |

---

### Financial Records

| Method | Endpoint           | Access         | Description               |
| ------ | ------------------ | -------------- | ------------------------- |
| POST   | `/api/records`     | Admin          | Create a record           |
| GET    | `/api/records`     | Admin, Analyst | List records (filterable) |
| GET    | `/api/records/:id` | Admin, Analyst | Get a record by ID        |
| PATCH  | `/api/records/:id` | Admin          | Update a record           |
| DELETE | `/api/records/:id` | Admin          | Soft-delete a record      |

#### Create / Update Record Body

```json
{
  "amount": 2500.0,
  "type": "income",
  "category": "salary",
  "date": "2024-06-15",
  "notes": "June salary payment"
}
```

#### Record Types

`income` | `expense`

#### Record Categories

**Income:** `salary`, `freelance`, `investment`, `gift`, `other_income`
**Expense:** `food`, `transport`, `utilities`, `rent`, `healthcare`, `entertainment`, `shopping`, `education`, `other_expense`

#### Query Parameters (GET /api/records)

| Param       | Type     | Description                              |
| ----------- | -------- | ---------------------------------------- |
| `type`      | string   | Filter by `income` or `expense`          |
| `category`  | string   | Filter by category                       |
| `startDate` | ISO date | Filter records from this date            |
| `endDate`   | ISO date | Filter records up to this date           |
| `page`      | integer  | Page number (default: 1)                 |
| `limit`     | integer  | Results per page (default: 20, max: 100) |
| `sortBy`    | string   | `date` \| `amount` \| `createdAt`        |
| `sortOrder` | string   | `asc` \| `desc` (default: `desc`)        |

---

### Dashboard

All dashboard routes are accessible by **all authenticated roles** (admin, analyst, viewer).

| Method | Endpoint                        | Description                                 |
| ------ | ------------------------------- | ------------------------------------------- |
| GET    | `/api/dashboard/summary`        | Total income, expenses, net balance, counts |
| GET    | `/api/dashboard/categories`     | Per-category totals for income and expense  |
| GET    | `/api/dashboard/trends/monthly` | Monthly income/expense/net for a given year |
| GET    | `/api/dashboard/trends/weekly`  | Weekly trends for the last N weeks          |
| GET    | `/api/dashboard/recent`         | Most recent financial records               |

#### Query Parameters

| Endpoint          | Param   | Description                               |
| ----------------- | ------- | ----------------------------------------- |
| `/trends/monthly` | `year`  | Target year (default: current year)       |
| `/trends/weekly`  | `weeks` | Number of past weeks (default: 8)         |
| `/recent`         | `limit` | Number of records to return (default: 10) |

#### Sample Summary Response

```json
{
  "success": true,
  "message": "Dashboard summary fetched.",
  "data": {
    "totalIncome": 15000,
    "totalExpenses": 4200,
    "netBalance": 10800,
    "incomeCount": 6,
    "expenseCount": 12
  }
}
```

---

## Consistent Response Format

All API responses follow this structure:

**Success:**

```json
{
  "success": true,
  "message": "Description of what happened.",
  "data": { ... },
  "meta": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Human-readable error message.",
  "errors": [{ "field": "email", "message": "Enter a valid email." }]
}
```

---

## Design Decisions & Assumptions

### Soft Deletes

Financial records are soft-deleted (`isDeleted: true`) rather than permanently removed. This preserves audit history. The Mongoose `pre(/^find/)` hook automatically excludes deleted records from all queries.

### Role Assignment on Registration

Public registration always creates a `viewer` account. Role elevation (to `analyst` or `admin`) can only be done by an authenticated admin — either via `PATCH /api/users/:id` or during registration if the request is made with an admin token.

### Separation of Concerns

The codebase follows a layered architecture: **Routes → Controllers → Services → Models**. Controllers only handle HTTP concerns; all business logic lives in services. This makes the logic easy to test and reuse.

### Permission System

Rather than checking roles directly, the `authorize` middleware checks named permissions (`record:create`, `dashboard:read`, etc.) against the role-permission matrix in `config/roles.js`. Adding a new role only requires updating that one file.

### Dashboard Aggregations

All dashboard analytics are computed via MongoDB aggregation pipelines in `dashboard.service.js` — no in-memory processing. This keeps the logic close to the data and scales well.

### Error Handling

A global error handler in `middleware/errorHandler.js` normalises all errors (Mongoose validation, duplicate keys, cast errors, JWT errors, and unhandled exceptions) into the consistent response format.

---

## HTTP Status Codes Used

| Code | Meaning                           |
| ---- | --------------------------------- |
| 200  | OK                                |
| 201  | Created                           |
| 400  | Bad Request                       |
| 401  | Unauthorized (no/invalid token)   |
| 403  | Forbidden (insufficient role)     |
| 404  | Not Found                         |
| 409  | Conflict (duplicate)              |
| 422  | Unprocessable Entity (validation) |
| 500  | Internal Server Error             |
