# 🍕 SliceCraft — Full-Stack Pizza Ordering & Real-Time Inventory Management Platform

> **Oasis Infobyte Internship Project Submission**  
> **Domain:** Web Development  
> **Task:** Pizza Delivery Full-Stack Application  
> **Author:** Syed Muhammad Ali (Adroit Ali)  

---

## 📌 1. Objective

The primary objective of this project is to build a production-grade, full-stack pizza ordering and inventory management platform featuring:
- **Dual Role Architecture**: Distinct User and Admin access controls.
- **User Experience**: Email verification, secure JWT authorization, password reset flow, interactive 4-step custom pizza builder with dynamic SVG visualizer, and Razorpay test payment integration.
- **Real-Time Tracking**: Live order status progression (*Order Received → In Kitchen → Sent to Delivery → Delivered*) powered by WebSockets (Socket.io) without page reload.
- **Admin & Inventory Control**: Real-time inventory tracking for 4 core ingredient categories (bases, sauces, cheeses, vegetables), automatic inventory decrements after each order, manual stock adjustment, and automated background stock monitoring with email alerts using `node-cron`.

---

## 🛠️ 2. Tools & Technologies Used

| Category | Tools & Libraries | Purpose |
|---|---|---|
| **Frontend Framework** | **React.js 19 (Vite)** | High-performance reactive UI and single-page routing |
| **Styling & Design System** | **Modern Vanilla CSS & Design Tokens** | Glassmorphism, animations, responsive design, dark mode theme |
| **Icons & UI Feedback** | **Lucide Icons & Canvas Confetti** | Crisp vector iconography and celebration particle effects |
| **Backend Runtime & API** | **Node.js (ESM) & Express.js** | Modular RESTful API architecture and route middleware |
| **Database & Modeling** | **MongoDB & Mongoose ODM** | Data modeling with embedded in-memory fallback for zero-setup execution |
| **Real-Time Communication** | **Socket.io (WebSockets)** | Instant bi-directional order status updates and stock sync |
| **Payment Gateway** | **Razorpay (Test Mode)** | Checkout order creation, simulated payment flow, and signature verification |
| **Scheduled Background Tasks** | **`node-cron`** | Periodic automated low-stock audit scheduler |
| **Email Services** | **Nodemailer** | SMTP email delivery for verification, password resets, and low-stock alerts |
| **Security & Authentication** | **JWT & `bcryptjs`** | Secure password hashing, token generation, and authorization guards |

---

## 📋 3. Steps Performed

1. **System Design & Architecture Planning**:
   - Outlined entity schemas for `User`, `Inventory`, `Order`, and `Pizza`.
   - Planned customer ordering funnel and admin kitchen dispatch workflows.
2. **Backend API & Middleware Engineering**:
   - Developed authentication controllers for registration, email verification token generation, login, and forgot/reset password flows.
   - Built dual-mode data persistence: real Mongoose ODM connection + embedded store for immediate local testing.
   - Configured Nodemailer email dispatch templates for account verification, password resets, and low-stock notifications.
   - Integrated `node-cron` scheduled background worker auditing inventory stock against configurable thresholds (`< 20` units).
3. **Real-Time WebSockets Engine**:
   - Configured Socket.io server and client context for live room joining (`order:<id>`, `admin_channel`).
   - Integrated events: `order:new`, `order:status_changed`, `inventory:updated`, and `inventory:low_stock_alert`.
4. **Interactive Frontend Customization Studio**:
   - Built a 4-step interactive pizza builder: **Base (5 options)**, **Sauce (5 options)**, **Cheese type**, and **Vegetables (multiple select)**.
   - Created [`PizzaVisualizer.jsx`](file:///c:/Users/ALI/InfoByte%20Web%20Project%20React/client/src/components/PizzaVisualizer.jsx): a dynamic SVG rendering engine reflecting crust blister patterns, sauce spread colors, cheese melt textures, and scattered vegetable toppings in real-time.
5. **Payment Gateway & Stock Decrement Integration**:
   - Built Razorpay checkout flow with simulated success and card/UPI options.
   - Programmed atomic inventory stock decrementing upon order confirmation.
6. **Admin Portal & Live Dispatch Panel**:
   - Implemented a separate admin login gateway at `/admin/login` protected by security keys and admin role guards.
   - Developed inventory dashboard with quick adjust buttons (`+10`, `+5`, `-1`), direct edit modal, and on-demand alert audit trigger.
   - Built incoming orders dispatch panel with one-click status transitions that instantly animate the customer's tracking stepper.
7. **End-to-End Testing & Verification**:
   - Created and executed [`server/test_flows.mjs`](file:///c:/Users/ALI/InfoByte%20Web%20Project%20React/server/test_flows.mjs) validating 22 automated integration tests covering all requirements.

---

## 🎯 4. Outcome & Results (in brief)

- **100% Feature Completion**: Every requirement across User and Admin sides is fully functional, tested, and responsive.
- **Flawless Real-Time Sync**: Order status changes made in the admin panel reflect instantly on the customer's dashboard without page reload.
- **Robust Inventory Safeguards**: Inventory ingredients auto-decrement upon order completion; automated email warnings dispatch if stock falls below 20 units.
- **22/22 Automated Tests Passed**: All API endpoints, security gates, checkout workflows, and database operations verified with zero errors.

---

## 🔑 Demo Credentials

| Role | Portal URL | Email | Password | Admin Key / Notes |
|---|---|---|---|---|
| **Chief Admin** | `/admin/login` | `admin@slicecraft.com` | `Admin@12345` | `admin_secret_portal_key_secure_2026` |
| **Customer** | `/login` | `customer@slicecraft.com` | `User@12345` | Verified account *(one-click auto-fill available)* |

---

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/adroit-ali/OIBSIP_web_development_task1.git
cd OIBSIP_web_development_task1
```

### 2. Start Backend Server
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000 (API: http://localhost:5000/api)
```

### 3. Start Frontend Client
```bash
cd ../client
npm install
npm run dev
# Application opens at http://localhost:5173
```

### 4. Run Automated Test Suite
```bash
cd ../server
node test_flows.mjs
# Runs all 22 end-to-end integration tests
```

---

## 📁 Repository Directory Structure

```text
├── server/
│   ├── config/
│   │   ├── db.js                 # MongoDB & embedded fallback store
│   │   └── emailService.js       # Nodemailer verification & alert engine
│   ├── controllers/
│   │   ├── authController.js     # Register, verify, login, reset password
│   │   ├── inventoryController.js# Stock queries, manual update, alert audit
│   │   ├── orderController.js    # Razorpay orders, stock decrement, tracking
│   │   └── pizzaController.js    # Signature pizza catalog
│   ├── cron/
│   │   └── stockNotifier.js      # node-cron scheduled inventory monitoring
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & admin-only guards
│   ├── models/
│   │   ├── User.js, Inventory.js, Order.js, Pizza.js, store.js
│   ├── routes/                   # Auth, inventory, order, and pizza routes
│   ├── seed/seedData.js          # Default admin, customer, ingredients, pizzas
│   ├── socket/socketHandler.js   # Socket.io real-time broadcast engine
│   ├── test_flows.mjs            # 22-step automated verification suite
│   ├── .env.example              # Reference environment variables
│   └── server.js                 # Server entry point
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx, Footer.jsx, PizzaVisualizer.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx, CartContext.jsx, SocketContext.jsx
    │   ├── pages/
    │   │   ├── HomeMenu.jsx, CustomPizzaBuilder.jsx, Checkout.jsx
    │   │   ├── OrderTracking.jsx, Login.jsx, Register.jsx, VerifyEmail.jsx
    │   │   ├── ForgotPassword.jsx, ResetPassword.jsx, AdminLogin.jsx
    │   │   ├── AdminInventory.jsx, AdminOrders.jsx
    │   ├── services/api.js       # Unified API client
    │   ├── App.jsx, index.css
    └── index.html
```

---

## 📜 Internship Declaration
This project is submitted in fulfillment of the **Oasis Infobyte Internship Program (OIBSIP)** in the **Web Development** domain.
