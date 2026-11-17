# ⚙️ Laptop & Printer Store — Backend REST API

A scalable, production-deployed **Node.js & Express** backend powering the **Laptop & Printer Store** e-commerce platform. Designed for real-world retail operations, this API handles user authentication with OTP verification, role-based access control, product inventory management, and order processing.

🚀 **Live API Base URL:** [https://laptop-printer-store-backend.onrender.com](https://laptop-printer-store-backend.onrender.com)  
💻 **Frontend Repository:** [laptop_printer_store_frontend](https://github.com)

---

## ✨ Key Backend Features

- **Authentication & OTP Verification:** Secure user registration, email/OTP verification flow, password hashing (`bcryptjs`), and JWT-based session management.
- **Role-Based Access Control (RBAC):** Protected admin routes for managing products and store orders, separated from public customer endpoints.
- **Product & Inventory Management:** Full CRUD operations for laptops, printers, and peripherals with category filtering and stock updates.
- **Order Processing:** Endpoints for creating customer orders, calculating totals, and updating fulfillment statuses.
- **Production-Ready Security & CORS:** Configured CORS policies for cross-origin frontend communication and environment-based configuration.

---

## 🛠️ Tech Stack

- **Runtime & Framework:** Node.js, Express.js
- **Database & ODM:** MongoDB, Mongoose
- **Authentication & Security:** JSON Web Tokens (JWT), bcryptjs, CORS, dotenv
- **Deployment:** Render Cloud

---

## 📂 Project Structure

```text
laptop_printer_store-backend/
├── src/
│   ├── config/         # Database & external service configurations
│   ├── controllers/    # Route logic (Auth, OTP, Products, Orders)
│   ├── middleware/     # JWT authentication & Admin authorization guards
│   ├── models/         # Mongoose schemas (User, Product, Order)
│   ├── routes/         # Express API route definitions
│   └── utils/          # Email/OTP helpers & error handlers
├── .env.example        # Environment variable template
├── .gitignore
├── package.json
└── server.js           # Application entry point
```

---

## 🔌 Core API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user & trigger OTP verification | Public |
| `POST` | `/api/auth/verify-otp` | Verify user account via OTP | Public |
| `POST` | `/api/auth/login` | Authenticate user and return JWT | Public |
| `GET` | `/api/products` | Fetch all laptops, printers, and accessories | Public |
| `GET` | `/api/products/:id` | Fetch single product specifications | Public |
| `POST` | `/api/products` | Create a new product listing | Admin Only |
| `PUT` | `/api/products/:id` | Update product price, specs, or stock | Admin Only |
| `DELETE` | `/api/products/:id` | Delete a product listing | Admin Only |
| `POST` | `/api/orders` | Place a new customer order | Customer |
| `GET` | `/api/orders` | View all store orders | Admin Only |

---

## 🚀 Run Locally

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com
cd laptop_printer_store-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```
*(Update `PORT`, `MONGO_URI`, `JWT_SECRET`, and email/SMTP credentials in `.env`)*

### 4. Start the Server
```bash
npm start
# Or for development with nodemon:
npm run dev
```

---

## 👨‍💻 Author

**Rahul Chanda Sil**  
- **GitHub:** [@rahulchandasil](https://github.com)  
- **LinkedIn:** [Rahul Chanda Sil](https://linkedin.com)  
- **Location:** Kolkata, West Bengal, India
