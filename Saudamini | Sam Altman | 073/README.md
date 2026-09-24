# 📚 Library Management REST API - Assignment 5

**Author:** Raj Rasal  
**PRN / Roll Number:** 150096725066  
**Course:** Node.js, MongoDB & Firebase Backend Development  

A complete, production-ready REST API for an institutional Library Management System built using **Node.js**, **Express.js**, **JWT**, **bcrypt**, and **Google Firebase Firestore** with **Role-Based Access Control (RBAC)**, **Swagger / OpenAPI Documentation**, **Rate Limiting**, and **Custom Middleware**.

---

## 🌐 Live Deployment & Interactive Documentation

- **Live Base URL:** [https://librarymanagementapi-syeu.onrender.com](https://librarymanagementapi-syeu.onrender.com/)
- **Live Swagger UI Documentation:** [https://librarymanagementapi-syeu.onrender.com/api-docs](https://librarymanagementapi-syeu.onrender.com/api-docs)

---

## 🚀 Key Features

- 🔐 **Authentication & Authorization**: Secure JWT authentication with bcrypt password hashing (10 salt rounds).
- 👥 **Role-Based Access Control (RBAC)**: Distinct permissions for `student` and `librarian` roles guarded by custom middleware.
- 📚 **Book Management (CRUD)**: Complete lifecycle management for books with status tracking (`available`, `borrowed`), stock quantities, and multi-field search.
- 🔄 **Borrow & Return System**: Students can borrow and return books with automated 14-day due date tracking, stock adjustments, and borrow transaction history.
- 👤 **User Management (Admin)**: Librarians can view users, change user roles, and manage accounts.
- 📝 **Custom Middleware**:
  - `auth.js`: JWT token verification and extraction.
  - `role.js`: Dynamic role-checking middleware.
  - `logger.js`: Logs all requests (HTTP method, URL, timestamp, user/IP, latency).
  - `rateLimiter.js`: Rate limits to 100 requests per 15 minutes per IP.
  - `validator.js`: Request body and parameter validation using `express-validator`.
  - `errorHandler.js`: Centralized error handler with standardized JSON responses.
- 📊 **Interactive Swagger Documentation**: Full OpenAPI 3.0 UI rendered via Swagger UI at `/api-docs`.

---

## 🛠 Tech Stack

| Component | Technology |
|---|---|
| Runtime | Node.js (v18+) |
| Web Framework | Express.js (^4.18.2) |
| Database | Google Firebase Cloud Firestore (`firebase-admin` ^11.8.0) |
| Authentication | JSON Web Tokens (`jsonwebtoken` ^9.0.0) |
| Password Encryption | `bcrypt` (^5.1.0) |
| Input Validation | `express-validator` (^6.15.0) |
| Security & Rate Limit | `helmet` (^7.0.0), `cors` (^2.8.5), `express-rate-limit` (^6.7.0) |
| API Docs | `swagger-ui-express` (^4.6.0), `yamljs` (^0.3.0) |

---

## 📁 Directory Structure

```text
Assignment5/RajRasal_150096725066/
├── server.js                      # Express server entry point & middleware integration
├── package.json                   # Dependencies & run scripts
├── .env                           # Environment configurations
├── .env.example                   # Example template for environment configuration
├── .gitignore                     # Git ignore rules
├── seed.js                        # Database seeder for sample users and books
├── test-api.js                    # Automated end-to-end integration test runner
├── README.md                      # Comprehensive project documentation
├── docs/
│   └── swagger.yaml               # Complete OpenAPI 3.0 specification
└── src/
    ├── config/
    │   ├── firebase.js            # Firebase Admin SDK & Firestore connection
    │   ├── serviceAccountKey.json # Service account credentials
    │   └── swagger.js             # Swagger UI setup & routing
    ├── middleware/
    │   ├── auth.js                # JWT token verification
    │   ├── role.js                # Role-based access control (Student / Librarian)
    │   ├── logger.js              # Request & latency logger
    │   ├── rateLimiter.js         # IP rate limiting
    │   ├── validator.js           # express-validator handler
    │   └── errorHandler.js        # Centralized error handler
    ├── controllers/
    │   ├── authController.js      # Auth & Profile controller logic
    │   ├── bookController.js      # Book CRUD & Borrow/Return logic
    │   ├── transactionController.js # Transaction queries controller
    │   └── userController.js      # User management controller
    ├── models/
    │   ├── userModel.js           # Firestore User data access layer
    │   ├── bookModel.js           # Firestore Book data access layer
    │   └── transactionModel.js    # Firestore Transaction data access layer
    ├── routes/
    │   ├── authRoutes.js          # /api/auth endpoints
    │   ├── bookRoutes.js          # /api/books endpoints
    │   ├── transactionRoutes.js   # /api/transactions endpoints
    │   └── userRoutes.js          # /api/users endpoints
    └── utils/
        ├── jwt.js                 # JWT sign and verify helpers
        └── validation.js          # Reusable validation chains
```

---

## ⚙️ Installation & Setup

### 1. Clone or Open Project
```bash
cd "Assignment5/RajRasal_150096725066"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create or verify `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_library_jwt_key_2026_raj_rasal
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/serviceAccountKey.json
```

### 4. Seed Database with Initial Data
Seeds a Librarian account (`admin@library.com`), a Student account (`student@library.com`), and 6 diverse books:
```bash
npm run seed
```

**Default Credentials:**
- **Librarian:** `admin@library.com` / `Admin@123`
- **Student:** `student@library.com` / `Student@123`

### 5. Start the Server
Development mode:
```bash
npm run dev
```
Production mode:
```bash
npm start
```
Server runs at: `http://localhost:5000`  
Swagger UI at: `http://localhost:5000/api-docs`

---

## 📋 API Endpoints Reference

### 1. 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (`role`: `"student"` or `"librarian"`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/profile` | Authenticated | Get current logged-in user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update current user's profile information |

### 2. 📚 Book Routes (`/api/books`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/books` | Public | Get all books (supports `?category=`, `?status=`, `?author=`) |
| `GET` | `/api/books/search` | Public | Search books by keyword (`?q=term`) matching title/author |
| `GET` | `/api/books/:id` | Public | Get single book details by ID |
| `POST` | `/api/books` | **Librarian** | Add new book to library catalog |
| `PUT` | `/api/books/:id` | **Librarian** | Update existing book information |
| `DELETE` | `/api/books/:id` | **Librarian** | Remove book from catalog |

### 3. 🔄 Borrow & Return Routes (`/api/books` & `/api/transactions`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/books/:id/borrow` | **Student** | Borrow a book (checks stock, creates 14-day transaction) |
| `POST` | `/api/books/:id/return` | **Student** | Return a borrowed book (restores stock, marks returned) |
| `GET` | `/api/transactions` | **Librarian** | View all transaction logs across system |
| `GET` | `/api/transactions/my` | Authenticated | View logged-in user's own borrowing history |

### 4. 👥 User Management Routes (`/api/users`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | **Librarian** | Retrieve all registered users |
| `GET` | `/api/users/:id` | **Librarian** | Retrieve specific user details |
| `PUT` | `/api/users/:id/role` | **Librarian** | Update user role (`student` or `librarian`) |
| `DELETE` | `/api/users/:id` | **Librarian** | Delete a user account (cannot delete own account) |

---

## 🗄 Firestore Data Schemas

### `users` Collection
```json
{
  "userId": "docId",
  "name": "Raj Rasal",
  "email": "student@library.com",
  "password": "<bcrypt_hash>",
  "role": "student", // "student" | "librarian"
  "createdAt": "2026-09-02T10:00:00.000Z",
  "updatedAt": "2026-09-02T10:00:00.000Z"
}
```

### `books` Collection
```json
{
  "bookId": "docId",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "978-0132350884",
  "category": "Software Engineering",
  "status": "available", // "available" | "borrowed"
  "quantity": 5,
  "createdAt": "2026-09-02T10:00:00.000Z",
  "updatedAt": "2026-09-02T10:00:00.000Z"
}
```

### `transactions` Collection
```json
{
  "transactionId": "docId",
  "userId": "usr_123",
  "bookId": "bk_456",
  "type": "borrow", // "borrow" | "return"
  "borrowDate": "2026-09-02T10:00:00.000Z",
  "returnDate": null,
  "dueDate": "2026-09-16T10:00:00.000Z",
  "status": "active", // "active" | "returned" | "overdue"
  "createdAt": "2026-09-02T10:00:00.000Z",
  "updatedAt": "2026-09-02T10:00:00.000Z"
}
```

---

## 🧪 Testing with Automated Test Runner

Run the comprehensive integration test suite:
```bash
npm run test:api
```
This tests:
1. Server health check
2. Swagger documentation availability (`/api-docs`)
3. User Registration (Student & Librarian)
4. User Login & JWT Token generation
5. Profile retrieval & update
6. RBAC verification: Student blocked from adding books (403)
7. Librarian creating, updating, and deleting books
8. Search and filter books by category and keywords
9. Student borrowing a book (stock decrement & active transaction created)
10. Student returning the book (stock increment & transaction status marked returned)
11. Librarian viewing transaction logs
12. Student viewing personal borrowing history
13. Librarian updating user roles

---

## 🛡 Security & Best Practices

- **Password Hashing**: Salted bcrypt rounds prevent rainbow table and dictionary attacks.
- **JWT Authorization**: Stateless tokens with expiration verification.
- **Rate Limiting**: Defends against brute-force and DoS attacks.
- **Helmet**: Secures HTTP response headers.
- **Input Sanitization**: Normalized emails, trimmed strings, and type validation via `express-validator`.
