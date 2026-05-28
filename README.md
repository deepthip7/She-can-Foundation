**Stack:** React · Node.js · Express · MongoDB

---

## 📁 Project Structure

```
shecan/
├── backend/
│   ├── config/
│   │   └── db.js               → MongoDB connection
│   ├── middleware/
│   │   └── auth.js             → JWT protect middleware
│   ├── models/
│   │   ├── Submission.js       → Mongoose submission schema
│   │   └── Admin.js            → Mongoose admin schema (bcrypt passwords)
│   ├── routes/
│   │   ├── submissions.js      → CRUD API for submissions
│   │   └── auth.js             → Login, /me, seed admin
│   ├── .env.example            → Environment variable template
    |_.env
│   ├── package.json
│   └── server.js               → Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      → Sticky navbar with auth state
│   │   │   ├── Navbar.css
│   │   │   └── ProtectedRoute.jsx → Route guard for admin
│   │   ├── context/
│   │   │   └── AuthContext.jsx → React auth context (login/logout)
│   │   ├── pages/
│   │   │   ├── Home.jsx        → Hero + Contact Form
│   │   │   ├── Home.css
│   │   │   ├── Login.jsx       → Admin login
│   │   │   ├── Login.css
│   │   │   ├── Admin.jsx       → Admin dashboard
│   │   │   └── Admin.css
│   │   ├── utils/
│   │   │   └── api.js          → Axios instance with JWT interceptors
│   │   ├── App.jsx             → Router with protected routes
│   │   ├── index.js
│   │   └── index.css           → Global CSS variables + animations
│   ├── .env.example
│   └── package.json
│
├── package.json                → Root scripts
└── README.md
```

---

## 🚀 Setup & Running

### Step 1 — Prerequisites
- Node.js v18+
- MongoDB (local) or [MongoDB Atlas](https://cloud.mongodb.com) (free tier)

### Step 2 — Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env and set your MONGODB_URI

# 3. Start backend
npm run dev     # with nodemon (auto-reload)
# OR
npm start       # production
```

Backend runs on: **http://localhost:5000**

### Step 3 — Seed the Admin User

After backend starts, run once in your browser or Postman:

```
POST http://localhost:5000/api/auth/seed
```

This creates:
- **Email:** `admin@shecan.org`
- **Password:** `shecan2025`

### Step 4 — Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

# 3. Start React app
npm start
```

Frontend runs on: **http://localhost:3000**

---

## ✅ Features

### Basic Requirements
- [x] **Name Field** — with real-time validation
- [x] **Email Field** — regex format validation
- [x] **Message Field** — 1000-char limit with live counter
- [x] **Submit Button** — shows "Form Submitted Successfully" on success
- [x] **Success Message** — personalized confirmation with green alert banner

### Advanced Features
- [x] **Form Validation** — client-side (React state) + server-side (express-validator)
- [x] **Responsive Design** — CSS Grid + media queries, mobile-first
- [x] **Authentication** — JWT-based login, bcrypt password hashing, protected routes
- [x] **Admin Panel** — full dashboard: view, search, filter, sort, paginate, delete
- [x] **Database Integration** — MongoDB with Mongoose ODM, proper schemas + indexes
- [x] **RESTful API** — Express routes for all CRUD operations
- [x] **Rate Limiting** — express-rate-limit on API and form submission
- [x] **Backend Features** — pagination, server-side search, sort, filter by subject/status
- [x] **CSV Export** — download all submissions as CSV
- [x] **Status Tracking** — mark submissions as new / read / replied
- [x] **Security** — JWT auth, bcrypt hashing, CORS, input sanitization

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/api/health` | No | Health check |
| POST   | `/api/auth/seed` | No | Create default admin |
| POST   | `/api/auth/login` | No | Admin login → JWT token |
| GET    | `/api/auth/me` | JWT | Get current admin |
| POST   | `/api/submissions` | No | Submit contact form |
| GET    | `/api/submissions` | JWT | List all (paginated, filtered) |
| GET    | `/api/submissions/:id` | JWT | Get one submission |
| PATCH  | `/api/submissions/:id/status` | JWT | Update status |
| DELETE | `/api/submissions/:id` | JWT | Delete one |
| DELETE | `/api/submissions` | JWT | Delete all |

---

## 🔐 Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shecan
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🛠 Technology Choices

| Component | Tech | Reason |
|-----------|------|--------|
| Frontend  | React 18 + React Router v6 | Component-based UI, SPA routing |
| Styling   | Pure CSS with custom properties | No extra dependency, full control |
| HTTP      | Axios | Interceptors for JWT, clean API layer |
| Backend   | Node.js + Express | Fast, lightweight REST API |
| Database  | MongoDB + Mongoose | Flexible schema, easy CRUD |
| Auth      | JWT + bcryptjs | Stateless, secure |
| Validation| express-validator | Declarative server-side rules |
| Security  | express-rate-limit, CORS | Production-ready protection |

---

