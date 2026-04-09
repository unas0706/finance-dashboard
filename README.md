# Finance Dashboard API

A production-ready REST API for a finance dashboard system built with **Node.js**, **Express**, and **MongoDB**. Supports role-based access control (RBAC), JWT authentication, full financial record management, MongoDB aggregation-based dashboard analytics, soft deletes, pagination, filtering, and a complete integration test suite.

**Live API Base URL:** `https://finance-dashboard-fujt.onrender.com/api`

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Role & Permission Matrix](#role--permission-matrix)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Users](#users)
  - [Financial Records](#financial-records)
  - [Dashboard](#dashboard)
- [Response Format](#response-format)
- [HTTP Status Codes](#http-status-codes)

---

## Tech Stack

| Layer        | Technology                                       |
|--------------|--------------------------------------------------|
| Runtime      | Node.js                                          |
| Framework    | Express.js                                       |
| Database     | MongoDB                                          |
| Auth         | JWT (`jsonwebtoken` + `bcryptjs`)                |
| Validation   | `express-validator`                              |
| Security     | `helmet`, `cors`                                 |
| Logging      | `morgan`                                         |
| Dev tooling  | `nodemon`, `dotenv`                              |
| API Client   | Insomnia (collection file included as `api`)     |

---

## Project Structure

```
finance-dashboard/
├── src/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── roles.js               # Role definitions and permission matrix
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── record.controller.js
│   │   └── dashboard.controller.js
│   ├── middleware/
│   │   ├── authenticate.js        # JWT verification
│   │   ├── authorize.js           # Permission-based RBAC guard
│   │   └── errorHandler.js        # Global error handler
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
│   │   ├── record.service.js      # CRUD + filtering logic
│   │   └── dashboard.service.js   # MongoDB aggregation pipelines
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── response.js            # Consistent API response helpers
│   ├── app.js                     # Express app setup
│   └── server.js                  # Entry point
├── api.yaml                            # API collection (import directly into Postman/Insomnia)
├── .env.example
├── .gitignore
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 16
- MongoDB running locally, or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

### Installation

```bash
# 1. Clone the repository
git clone `https://github.com/unas0706/finance-dashboard`
cd finance-dashboard

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Open .env and set MONGO_URI and JWT_SECRET

# 4. Start the development server
npm run dev
```

Server starts at: `http://localhost:5000`

### Importing the Insomnia Collection

The repository includes an Insomnia collection file (`api`) with all 14 requests pre-configured and pointed at the live deployed URL.

1. Open Insomnia
2. Go to **File → Import**
3. Select the `api.yaml` file from the project root
4. All requests will be imported under the **FD** folder
5. The folder-level Bearer token is pre-set — replace it with a fresh token after logging in

---

## Environment Variables

| Variable         | Description                                   | Default                                          |
|------------------|-----------------------------------------------|--------------------------------------------------|
| `PORT`           | Port the server listens on                    | `5000`                                           |
| `MONGO_URI`      | MongoDB connection string                     | `mongodb://localhost:27017/finance_dashboard`    |
| `JWT_SECRET`     | Secret key used to sign JWTs                  | *(required — set a strong random string)*        |
| `JWT_EXPIRES_IN` | Token expiry duration                         | `7d`                                             |

---

## Seed Accounts

These are the available credentails of all types of users:

| Role    | Email                   | Password      |
|---------|-------------------------|---------------|
| Admin   | admin@finance.com       | `admin123`    |
| Analyst | analyst@finance.com     | `analyst123`  |
| Viewer  | viewer@finance.com      | `viewer123`   |


---

## Role & Permission Matrix

| Permission        | Admin | Analyst | Viewer |
|-------------------|:-----:|:-------:|:------:|
| `user:create`     | ✅    | ❌      | ❌     |
| `user:read`       | ✅    | ❌      | ❌     |
| `user:update`     | ✅    | ❌      | ❌     |
| `user:delete`     | ✅    | ❌      | ❌     |
| `record:create`   | ✅    | ❌      | ❌     |
| `record:read`     | ✅    | ✅      | ❌     |
| `record:update`   | ✅    | ❌      | ❌     |
| `record:delete`   | ✅    | ❌      | ❌     |
| `dashboard:read`  | ✅    | ✅      | ✅     |

Permission enforcement is handled by the `authorize` middleware using a named-permission model defined in `src/config/roles.js`. Adding a new role or permission only requires editing that one file.

---

## API Reference

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```


### Auth

#### `POST /api/auth/register`

Register a new user account. All public registrations receive the `viewer` role by default. An authenticated admin may pass a `role` field to assign a different role at registration time.

**Access:** Public

**Request Body:**
```json
{
  "name": "sai",
  "email": "sai@gmail.com",
  "password": "sai123",
  "role": "analyst"
}
```

> `role` is silently ignored unless the request is made by an authenticated admin.

**Validation Rules:**
- `name` — required, max 100 characters
- `email` — required, must be a valid email address
- `password` — required, minimum 6 characters
- `role` — optional, must be `admin`, `analyst`, or `viewer`

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "sai",
      "email": "sai@gmail.com",
      "role": "viewer",
      "isActive": true,
      "createdAt": "2024-06-15T10:00:00.000Z"
    },
    "token": "<jwt_token>"
  }
}
```

---

#### `POST /api/auth/login`

Authenticate with email and password and receive a signed JWT.

**Access:** Public

**Request Body:**
```json
{
  "email": "admin@finance.com",
  "password": "admin123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "admin",
      "isActive": true
    },
    "token": "<jwt_token>"
  }
}
```

---

#### `GET /api/auth/me`

Returns the profile of the currently authenticated user.

**Access:** Any authenticated user

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile fetched.",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "admin",
      "isActive": true
    }
  }
}
```

---

### Users

All user management endpoints require authentication and the `admin` role.

#### `GET /api/users`

Returns a paginated list of all registered users.

**Access:** Admin

**Query Parameters:**

| Param   | Type    | Default | Description       |
|---------|---------|---------|-------------------|
| `page`  | integer | `1`     | Page number       |
| `limit` | integer | `20`    | Results per page  |

**Response `200`:**
```json
{
  "success": true,
  "message": "Users fetched.",
  "data": [
    {
      "_id": "69cfcbbe686e7e0ef6865a27",
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-06-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

#### `GET /api/users/:id`

Fetch a single user by their MongoDB ObjectId.

**Access:** Admin

**Example:** `GET /api/users/69cfcbbe686e7e0ef6865a27`

**Response `200`:**
```json
{
  "success": true,
  "message": "User fetched.",
  "data": {
    "_id": "69cfcbbe686e7e0ef6865a27",
    "name": "Admin User",
    "email": "admin@finance.com",
    "role": "admin",
    "isActive": true
  }
}
```

---

#### `PATCH /api/users/:id`

Update a user's name, role, or active status. All fields are optional — only send what needs to change.

**Access:** Admin

**Example:** `PATCH /api/users/69cfcbbe686e7e0ef6865a27`

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "analyst",
  "isActive": false
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "User updated successfully.",
  "data": {
    "_id": "69cfcbbe686e7e0ef6865a27",
    "name": "Updated Name",
    "role": "analyst",
    "isActive": false
  }
}
```

---

#### `DELETE /api/users/:id`

Permanently removes a user. An admin cannot delete their own account.

**Access:** Admin

**Response `200`:**
```json
{
  "success": true,
  "message": "User deleted successfully."
}
```

---

### Financial Records

#### `POST /api/records`

Create a new financial record.

**Access:** Admin

**Request Body:**
```json
{
  "amount": 2000.00,
  "type": "income",
  "category": "salary",
  "date": "2024-06-15",
  "notes": "June salary payment"
}
```

**Field Reference:**

| Field      | Type     | Required | Notes                              |
|------------|----------|----------|------------------------------------|
| `amount`   | number   | ✅       | Must be greater than `0`           |
| `type`     | string   | ✅       | `income` or `expense`              |
| `category` | string   | ✅       | Must be a valid category (see below) |
| `date`     | ISO date | ❌       | Defaults to current date/time      |
| `notes`    | string   | ❌       | Max 500 characters                 |

**Valid Categories:**

| Type    | Categories                                                                                   |
|---------|----------------------------------------------------------------------------------------------|
| Income  | `salary`, `freelance`, `investment`, `gift`, `other_income`                                  |
| Expense | `food`, `transport`, `utilities`, `rent`, `healthcare`, `entertainment`, `shopping`, `education`, `other_expense` |

**Response `201`:**
```json
{
  "success": true,
  "message": "Record created successfully.",
  "data": {
    "_id": "69cfd009686e7e0ef6865a33",
    "amount": 2000,
    "type": "income",
    "category": "salary",
    "date": "2024-06-15T00:00:00.000Z",
    "notes": "June salary payment",
    "createdBy": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "admin"
    },
    "createdAt": "2024-06-15T10:00:00.000Z"
  }
}
```

---

#### `GET /api/records`

Returns a paginated, filterable list of financial records. Soft-deleted records are automatically excluded.

**Access:** Admin, Analyst

**Query Parameters:**

| Param       | Type     | Default     | Description                                             |
|-------------|----------|-------------|---------------------------------------------------------|
| `type`      | string   | —           | Filter by `income` or `expense`                         |
| `category`  | string   | —           | Filter by any valid category name                       |
| `startDate` | ISO date | —           | Return records on or after this date                    |
| `endDate`   | ISO date | —           | Return records on or before this date                   |
| `page`      | integer  | `1`         | Page number                                             |
| `limit`     | integer  | `20`        | Results per page (max: `100`)                           |
| `sortBy`    | string   | `date`      | Sort field: `date`, `amount`, or `createdAt`            |
| `sortOrder` | string   | `desc`      | Sort direction: `asc` or `desc`                         |

**Example Requests:**
```
GET /api/records
GET /api/records?type=income
GET /api/records?type=expense&category=food
GET /api/records?startDate=2024-01-01&endDate=2024-06-30
GET /api/records?page=2&limit=10&sortBy=amount&sortOrder=asc
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Records fetched.",
  "data": [ { ... }, { ... } ],
  "meta": {
    "total": 40,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

---

#### `GET /api/records/:id`

Fetch a single financial record by its MongoDB ObjectId.

**Access:** Admin, Analyst

**Example:** `GET /api/records/69ce31c88a1c375a5b6b276d`

**Response `200`:**
```json
{
  "success": true,
  "message": "Record fetched.",
  "data": {
    "_id": "69ce31c88a1c375a5b6b276d",
    "amount": 2000,
    "type": "income",
    "category": "salary",
    "date": "2024-06-15T00:00:00.000Z",
    "notes": "June salary payment",
    "createdBy": {
      "name": "Admin User",
      "email": "admin@finance.com"
    }
  }
}
```

---

#### `PATCH /api/records/:id`

Update one or more fields of an existing record. Only the fields sent in the request body are updated.

**Access:** Admin

**Example:** `PATCH /api/records/69cfd009686e7e0ef6865a33`

**Request Body** (all fields optional):
```json
{
  "amount": 3000.00,
  "type": "income",
  "category": "salary",
  "date": "2024-06-15",
  "notes": "Revised June salary"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Record updated successfully.",
  "data": {
    "_id": "69cfd009686e7e0ef6865a33",
    "amount": 3000,
    "type": "income",
    "category": "salary",
    "notes": "Revised June salary"
  }
}
```

---

#### `DELETE /api/records/:id`

Soft-deletes a record by setting `isDeleted: true`. The record disappears from all listing and dashboard queries immediately but is preserved in the database for audit purposes.

**Access:** Admin

**Response `200`:**
```json
{
  "success": true,
  "message": "Record deleted successfully."
}
```

---

### Dashboard

All dashboard endpoints are accessible to every authenticated user regardless of role. All data is computed server-side using MongoDB aggregation pipelines.

#### `GET /api/dashboard/summary`

Returns overall financial totals including income, expenses, net balance, and transaction counts.

**Access:** Admin, Analyst, Viewer

**Response `200`:**
```json
{
  "success": true,
  "message": "Dashboard summary fetched.",
  "data": {
    "totalIncome": 15000.00,
    "totalExpenses": 4200.00,
    "netBalance": 10800.00,
    "incomeCount": 6,
    "expenseCount": 12
  }
}
```

---

#### `GET /api/dashboard/categories`

Returns per-category totals broken out separately for income and expense, sorted by total descending.

**Access:** Admin, Analyst, Viewer

**Response `200`:**
```json
{
  "success": true,
  "message": "Category breakdown fetched.",
  "data": {
    "income": [
      { "category": "salary",    "total": 10000, "count": 4 },
      { "category": "freelance", "total": 3000,  "count": 2 }
    ],
    "expense": [
      { "category": "rent", "total": 2400, "count": 3 },
      { "category": "food", "total": 800,  "count": 9 }
    ]
  }
}
```

---

#### `GET /api/dashboard/trends/monthly`

Returns monthly income, expense, and net totals across a full 12-month year. All 12 months are always returned — months with no records show `0`.

**Access:** Admin, Analyst, Viewer

**Query Parameters:**

| Param  | Type    | Default      | Description   |
|--------|---------|--------------|---------------|
| `year` | integer | Current year | Target year   |

**Example:** `GET /api/dashboard/trends/monthly?year=2024`

**Response `200`:**
```json
{
  "success": true,
  "message": "Monthly trends fetched.",
  "data": {
    "year": 2024,
    "months": [
      { "month": 1, "monthName": "January",  "income": 5000, "expense": 1200, "net": 3800 },
      { "month": 2, "monthName": "February", "income": 4500, "expense": 900,  "net": 3600 },
      { "month": 3, "monthName": "March",    "income": 0,    "expense": 0,    "net": 0    },
      ...
    ]
  }
}
```

---

#### `GET /api/dashboard/trends/weekly`

Returns weekly income, expense, and net totals for the past N weeks using ISO week numbers.

**Access:** Admin, Analyst, Viewer

**Query Parameters:**

| Param   | Type    | Default | Description                    |
|---------|---------|---------|--------------------------------|
| `weeks` | integer | `8`     | Number of past weeks to return |

**Example:** `GET /api/dashboard/trends/weekly?weeks=8`

**Response `200`:**
```json
{
  "success": true,
  "message": "Weekly trends fetched.",
  "data": [
    { "week": "2024-W22", "income": 2500, "expense": 600, "net": 1900 },
    { "week": "2024-W23", "income": 1800, "expense": 400, "net": 1400 }
  ]
}
```

---

#### `GET /api/dashboard/recent`

Returns the most recent financial records ordered by date descending, with creator info populated.

**Access:** Admin, Analyst, Viewer

**Query Parameters:**

| Param   | Type    | Default | Description                        |
|---------|---------|---------|------------------------------------|
| `limit` | integer | `10`    | Maximum number of records to return |

**Example:** `GET /api/dashboard/recent?limit=10`

**Response `200`:**
```json
{
  "success": true,
  "message": "Recent activity fetched.",
  "data": [
    {
      "_id": "69cfd009686e7e0ef6865a33",
      "amount": 2000,
      "type": "income",
      "category": "salary",
      "date": "2024-06-15T00:00:00.000Z",
      "notes": "June salary payment",
      "createdBy": {
        "name": "Admin User",
        "email": "admin@finance.com"
      }
    }
  ]
}
```

---

## Response Format

Every API response follows this consistent envelope structure.

**Success:**
```json
{
  "success": true,
  "message": "Human-readable description of the result.",
  "data": { ... },
  "meta": {
    "total": 40,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

> `meta` is only present on paginated list responses.

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error message.",
  "errors": [
    { "field": "email",  "message": "Enter a valid email." },
    { "field": "amount", "message": "Amount must be a positive number." }
  ]
}
```

> `errors` is only present on validation failures (422).

---

## HTTP Status Codes

| Code | Meaning                                                    |
|------|------------------------------------------------------------|
| 200  | OK — request succeeded                                     |
| 201  | Created — new resource created                             |
| 400  | Bad Request — malformed input or invalid operation         |
| 401  | Unauthorized — missing, expired, or invalid token          |
| 403  | Forbidden — valid token but insufficient role/permission   |
| 404  | Not Found — resource does not exist                        |
| 409  | Conflict — duplicate record (e.g. email already registered)|
| 422  | Unprocessable Entity — validation failed                   |
| 500  | Internal Server Error                                      |


---

## Design Decisions

### Layered Architecture
Routes → Controllers → Services → Models. Controllers only handle HTTP concerns (reading `req`, sending `res`). All business logic lives in services. This keeps logic independently testable and reusable without Express.

### Named Permission Model
Rather than checking `req.user.role === 'admin'` directly in route handlers, the `authorize` middleware checks named permissions (`record:create`, `dashboard:read`, etc.) against the role-permission matrix in `src/config/roles.js`. Adding a new role or adjusting what a role can do requires editing exactly one file.

### Soft Deletes
Financial records are soft-deleted (`isDeleted: true`) rather than permanently removed. This preserves the full audit trail. A Mongoose `pre(/^find/)` hook automatically excludes deleted records from all queries — callers never need to remember to filter for it.

### Role Assignment on Registration
Public registration always assigns the `viewer` role, regardless of what is sent in the request body. Role elevation to `analyst` or `admin` can only be performed by an authenticated admin — either by passing `role` during registration with an admin token, or via `PATCH /api/users/:id` afterwards.

### Dashboard via Aggregation Pipelines
All dashboard analytics (`summary`, `categories`, `trends/monthly`, `trends/weekly`, `recent`) are computed entirely in MongoDB using aggregation pipelines in `dashboard.service.js`. No in-memory reduction happens on the application server, which keeps response times fast as data grows.

### Consistent Error Normalisation
A global error handler in `middleware/errorHandler.js` normalises all thrown errors — Mongoose validation errors, duplicate key violations, CastErrors, JWT errors, and unhandled exceptions — into the same response envelope. Controllers only call `next(err)` and the handler takes care of the rest.