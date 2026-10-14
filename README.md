# 🍕 SliceCraft — Full-Stack Artisan Pizza Delivery & Inventory Platform

> **SliceCraft** is a production-grade, full-stack pizza ordering and inventory management platform featuring separate Admin and User roles, real-time kitchen order tracking, Razorpay test payment integration, interactive custom pizza builder, and automated stock monitoring with email alerts.

---

## 🚀 Tech Stack

- **Frontend**: React.js (Vite), Modern Vanilla CSS Design Tokens, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express.js (ES Modules)
- **Database**: MongoDB with Mongoose ODM (includes embedded zero-setup memory fallback for instant out-of-the-box local testing)
- **Real-Time Communication**: Socket.io (WebSockets with polling fallback)
- **Payment Gateway**: Razorpay (Test Mode with simulated card/UPI and signature verification)
- **Scheduled Background Jobs**: `node-cron`
- **Email Service**: Nodemailer (custom SMTP, Ethereal test inbox, and sandbox preview)

---

## 📋 Feature Checklist Implementation

### 👤 User Side
- [x] **User Registration with Email Verification**: Secure password hashing with `bcryptjs`, 32-byte cryptographic verification token, email delivery with activation link, and test sandbox quick-verify helper.
- [x] **User Login with JWT Authorisation**: Signed JSON Web Tokens (7-day validity), route guards, unverified account protection (HTTP 403 until verified).
- [x] **Forgot Password Flow**: Request password reset link by email, 1-hour expiration token, secure reset form with validation.
- [x] **Pizza Dashboard & Varieties**: 6 handcrafted signature pizzas (*Margherita Rustica, Truffle & Wild Mushroom, Fiery Peri Peri, Quattro Formaggi, Mediterranean Harvest, Smokey BBQ*), category filters (*Veg, Gourmet*), ratings, and prep times.
- [x] **Custom Pizza Builder Flow (4 Steps + Real-time Visualizer)**:
  - **Step 1**: Choose a pizza base (5 options: *Thin Crust, Cheese Burst, Hand Tossed, Gluten-Free Cauliflower, Deep Pan Crust*).
  - **Step 2**: Choose a sauce (5 options: *Classic Marinara, Creamy Garlic Alfredo, Spicy Peri Peri, Pesto Genovese, Smokey BBQ*).
  - **Step 3**: Choose cheese type (*Mozzarella, Sharp Cheddar, Ricotta & Feta, Vegan Almond Cheese, Aged Parmesan*).
  - **Step 4**: Choose vegetables (*multiple select: Black Olives, Bell Peppers, Mushrooms, Jalapeños, Red Onions, Sweet Corn, Baby Spinach, Sun-dried Tomatoes*).
  - **Live Visualizer**: Interactive SVG/canvas rendering crust blistering, sauce spread color, melted cheese texture, and scattered toppings as selected.
- [x] **Order Summary & Financial Breakdown**: Itemized custom recipe breakdown, delivery destination form, calculated subtotal, 5% tax, and delivery fee.
- [x] **Razorpay Checkout Integration**: Test mode integration with simulated card/UPI modal. Clicking **"Simulate Success"** confirms order, validates signature, auto-decrements stock, and triggers confetti.
- [x] **Real-Time Order Status Tracker**: Live 4-stage stepper (*Order Received → In Kitchen → Sent to Delivery → Delivered*) synced via WebSockets without page reload.

---

### 🛡️ Admin Side
- [x] **Separate Admin Login**: Dedicated portal at `/admin/login` with secret security key check. Completely separated from regular user registration.
- [x] **Inventory Dashboard**: Live tracking of all 4 ingredient categories (bases, sauces, cheeses, vegetables), stock counts, unit measures, and low-stock indicators.
- [x] **Automatic Stock Decrement**: Deducts exact quantities of base, sauce, cheese, and all selected vegetables immediately after every confirmed order.
- [x] **Manual Stock Updates**: Quick adjustment buttons (`+10`, `+5`, `-1`) and direct edit modal to adjust stock counts and alert thresholds.
- [x] **Automated Low-Stock Notifications**: Background scheduled job (`node-cron`) audits inventory every cycle; dispatches HTML low-stock alert emails to the admin when items drop below threshold (< 20 units). Includes on-demand audit trigger button.
- [x] **Order Management Panel**: Real-time incoming order feed (`order:new` socket event). Kitchen admin updates status directly.
- [x] **Real-Time Synchronization**: Any status update in the admin panel instantly updates the customer's tracking stepper via WebSockets.

---

## 🔑 Demo Credentials

| Role | Email | Password | Special Key |
|---|---|---|---|
| **Chief Admin** | `admin@slicecraft.com` | `Admin@12345` | `admin_secret_portal_key_secure_2026` |
| **Demo Customer** | `customer@slicecraft.com` | `User@12345` | — |

*(Both login portals also include instant one-click auto-fill buttons for fast testing).*

---

## 🏃 Quick Start Guide

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Start the Frontend Client
```bash
cd client
npm install
npm run dev
# Vite runs on http://localhost:5173
```

### 3. Run Automated End-to-End Test Suite
```bash
cd server
node test_flows.mjs
# Executes 22 comprehensive integration tests covering all requirements
```

---

## 📁 Directory Architecture

```text
InfoByte Web Project React/
├── server/
│   ├── config/
│   │   ├── db.js                 # MongoDB & in-memory fallback connection
│   │   └── emailService.js       # Nodemailer verification & low-stock alerts
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
│   │   ├── User.js               # User schema
│   │   ├── Inventory.js          # Ingredient inventory schema
│   │   ├── Order.js              # Order & timeline schema
│   │   ├── Pizza.js              # Preset pizza schema
│   │   └── store.js              # Unified store repository
│   ├── routes/                   # Express route definitions
│   ├── seed/
│   │   └── seedData.js           # Seeds default admin, customer, ingredients, pizzas
│   ├── socket/
│   │   └── socketHandler.js      # Socket.io real-time broadcast engine
│   ├── test_flows.mjs            # Automated verification test suite
│   ├── .env                      # Environment configuration
│   └── server.js                 # Express + HTTP + Socket server bootstrap
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Glassmorphic top navigation + socket status
    │   │   ├── Footer.jsx        # Footer & architecture badges
    │   │   └── PizzaVisualizer.jsx # Dynamic SVG interactive pizza layer visualizer
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Authentication state & actions
    │   │   ├── CartContext.jsx   # Shopping cart & financial calculations
    │   │   └── SocketContext.jsx # WebSockets connection manager
    │   ├── pages/
    │   │   ├── HomeMenu.jsx      # Hero showcase & pizza catalog
    │   │   ├── CustomPizzaBuilder.jsx # 4-step custom pizza builder studio
    │   │   ├── Checkout.jsx      # Order summary & Razorpay test checkout
    │   │   ├── OrderTracking.jsx # Live animated order status stepper
    │   │   ├── Login.jsx         # Customer login
    │   │   ├── Register.jsx      # User registration with email verification
    │   │   ├── VerifyEmail.jsx   # Token-based email verification
    │   │   ├── ForgotPassword.jsx# Password reset request
    │   │   ├── ResetPassword.jsx # Set new password form
    │   │   ├── AdminLogin.jsx    # Separate admin login portal
    │   │   ├── AdminInventory.jsx# Stock dashboard, manual update, cron alert
    │   │   └── AdminOrders.jsx   # Kitchen dispatch order management panel
    │   ├── services/
    │   │   └── api.js            # Unified API client
    │   ├── App.jsx               # Application router & views
    │   └── index.css             # Design tokens & styling
    └── index.html                # HTML5 structure, fonts & Razorpay script
```
