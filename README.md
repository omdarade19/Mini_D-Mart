# Mini D-Mart — Full-Stack Grocery Web Application

A production-quality, minimal, and complete Mini D-Mart grocery store web application built using **React**, **Node.js/Express**, **MongoDB**, **Tailwind CSS**, and **JWT authentication** with **Role-Based Access Control (RBAC)**.

---

## Features & Highlights

- **Role-Based Access Control (RBAC)**: Supports 3 distinct user roles:
  - **Customer**: Browse products, search & filter, cart management, checkout with home delivery or store pickup, track orders, cancel eligible orders, and request returns/exchanges.
  - **Staff**: Staff processing dashboard, update order fulfillment statuses, process return/exchange requests, and view live inventory stock.
  - **Admin**: Full product CRUD, category CRUD, inventory management, and user role management.
- **Core Business Logic Enforcement**:
  - **Stock Revalidation**: Backend verifies stock and calculates subtotal/total at checkout using DB prices. Rejects checkout if stock is insufficient.
  - **Store Pickup Capacity Cap**: Restricts store pickup orders to **maximum 10 orders/day** for any given date.
  - **Order Cancellation Window**: Allows order cancellation ONLY before preparation starts (`PLACED` or `CONFIRMED`). Restores stock upon cancellation.
  - **7-Day Return / Exchange Policy**: Restricts return/exchange requests ONLY to delivered orders within **7 calendar days**. Automatically adjusts inventory upon approval (restocks returned items or checks/deducts replacement stock for exchanges).
- **Security & Integrity**: Passwords hashed with `bcryptjs`, JWT token authentication, input validation, audit logging for key actions, and strict resource ownership checks.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Axios, React Router v6
- **Backend**: Node.js, Express.js, Mongoose ODM
- **Database**: MongoDB Atlas / local MongoDB
- **Auth**: JSON Web Tokens (JWT) & bcryptjs

---

## Test Credentials

Quick-fill buttons are available on the Login page for instant testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@dmart.com` | `Admin@123` |
| **Staff** | `staff@dmart.com` | `Staff@123` |
| **Customer** | `customer@dmart.com` | `Customer@123` |

---

## Project Structure

```
Mini/
├── server/               # Express REST API
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers (Auth, Products, Cart, Orders, Returns, Users)
│   ├── middleware/       # JWT protection, RBAC, Audit logger, Error handler
│   ├── models/           # Mongoose schemas (User, Category, Product, Cart, Order, ReturnRequest)
│   ├── routes/           # Express API endpoints
│   ├── seed/             # Database seeder script
│   └── server.js         # Backend entry point
├── client/               # React + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/   # Reusable UI (Navbar, Footer, ProductCard, StatusBadge, Toast, Modal)
│   │   ├── context/      # AuthContext, CartContext
│   │   ├── pages/        # Public, Customer, Staff, and Admin pages
│   │   ├── services/     # Axios API service
│   │   └── App.jsx
└── README.md
```

---

## Installation & Local Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI string.

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mini-dmart
JWT_SECRET=minidmart_jwt_super_secret_key_2026
NODE_ENV=development
```

Run the database seeder script to populate products, categories, and test accounts:

```bash
npm run seed
```

Start the Express development server:

```bash
npm run dev
```

The backend server will run at `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

The React Vite frontend will run at `http://localhost:3000`.

---

## API Documentation Overview

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Authenticate and return JWT token
- `GET /api/auth/me` — Get logged-in user profile

### Products & Categories
- `GET /api/products` — Get products (supports `category`, `search`, `sort`)
- `GET /api/products/:id` — Get product detail
- `POST /api/products` — Create product (Staff/Admin)
- `PUT /api/products/:id` — Update product (Staff/Admin)
- `DELETE /api/products/:id` — Delete product (Staff/Admin)
- `GET /api/categories` — Get categories
- `POST /api/categories` — Create category (Staff/Admin)
- `PUT /api/categories/:id` — Update category (Staff/Admin)
- `DELETE /api/categories/:id` — Delete category (Staff/Admin)

### Cart & Orders
- `GET /api/cart` — Get user cart
- `POST /api/cart` — Add item to cart
- `PUT /api/cart/:productId` — Update item quantity
- `DELETE /api/cart/:productId` — Remove item from cart
- `POST /api/orders` — Checkout & place order (Stock revalidated, 10 pickup limit enforced)
- `GET /api/orders` — List orders (Customer: own orders; Staff/Admin: all orders)
- `GET /api/orders/:id` — Get order detail
- `PATCH /api/orders/:id/status` — Update order status (Staff/Admin)
- `PATCH /api/orders/:id/cancel` — Cancel order (Allowed only before preparation)

### Returns & User Management
- `POST /api/returns` — Request return/exchange (Allowed only within 7 days for delivered orders)
- `GET /api/returns` — List returns
- `PATCH /api/returns/:id` — Process return/exchange request (Staff/Admin)
- `GET /api/users` — Get all users (Admin)
- `PATCH /api/users/:id/role` — Update user role (Admin)

---

## Deployment Configuration

- **Frontend (Vercel)**: Includes `vercel.json` rewrite rules for single-page client side routing.
- **Backend (Render)**: Includes `render.yaml` configuration for Web Service deployment.

---

## Known Limitations

1. **Payment Integration**: Payment gateway processing is excluded as per assessment scope (orders are directly placed as cash on delivery / store payment).
2. **Real-time WebSockets**: Order status updates rely on API polling or manual page refresh rather than Socket.io.
