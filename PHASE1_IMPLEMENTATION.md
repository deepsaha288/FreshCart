# 🔥 Phase 1: Complete Implementation Guide

## Overview
Phase 1 focuses on building the complete authentication system with OTP login and JWT tokens. All files are now created and ready to use.

---

## 📋 Files Created in Phase 1

### Backend Files
✅ `app/core/config.py` — Configuration management
✅ `app/core/security.py` — JWT, password hashing, OTP utilities
✅ `app/main.py` — FastAPI app with routes
✅ `app/db/mongodb.py` — MongoDB connection
✅ `app/models/database/user.py` — User model
✅ `app/models/database/product.py` — Product model
✅ `app/models/database/order.py` — Order model
✅ `app/models/database/cart.py` — Cart model
✅ `app/models/schemas/auth.py` — Auth request/response schemas
✅ `app/services/auth/auth_service.py` — Auth business logic
✅ `app/api/endpoints/auth.py` — Auth API endpoints
✅ `tests/test_auth.py` — Test cases
✅ `requirements.txt` — Python dependencies
✅ `.env` — Environment variables
✅ `Dockerfile` — Container image

### Frontend Files
✅ `package.json` — Dependencies configured
✅ `tsconfig.json` — TypeScript setup
✅ `tailwind.config.js` — Tailwind CSS
✅ `next.config.js` — Next.js configuration
✅ `postcss.config.js` — PostCSS setup
✅ `.env.local` — Environment variables
✅ `app/layout.tsx` — Root layout
✅ `app/auth/page.tsx` — Login page
✅ `components/auth/LoginForm.tsx` — Phone input form
✅ `components/auth/OTPForm.tsx` — OTP verification form
✅ `app/dashboard/page.tsx` — User dashboard
✅ `lib/api.ts` — API client with interceptors
✅ `lib/store/authStore.ts` — Zustand auth store
✅ `styles/globals.css` — Global styles

### Configuration Files
✅ `docker-compose.yml` — MongoDB setup
✅ `.env` files — Backend & Frontend configs
✅ `.gitignore` — Git ignore rules

---

## 🚀 Step-by-Step Setup

### Step 1: Start MongoDB (2 minutes)

```bash
cd /home/claude/freshcart

# Start MongoDB with Docker
docker-compose up -d

# Verify it's running
docker-compose ps

# Check MongoDB is healthy
docker exec freshcart-mongo mongosh -u admin -p freshcart123 --eval "db.adminCommand('ping')"
```

Expected output: `{ ok: 1 }`

### Step 2: Setup Backend (5 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate
# On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend
uvicorn app.main:app --reload
```

✅ Backend running at: **http://localhost:8000**

**Test it:**
```bash
# In another terminal
curl http://localhost:8000/health

# Should return:
# {"status":"OK","app":"FreshCart API","version":"0.1.0","environment":"development"}
```

### Step 3: Setup Frontend (3 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ Frontend running at: **http://localhost:3000**

---

## 🧪 Testing Phase 1

### API Testing via Swagger

1. Open: **http://localhost:8000/docs**
2. You should see all auth endpoints:
   - POST `/api/auth/send-otp`
   - POST `/api/auth/verify-otp`
   - POST `/api/auth/refresh`
   - GET `/api/auth/me`
   - POST `/api/auth/logout`

### Test Flow 1: Send OTP

```bash
curl -X POST "http://localhost:8000/api/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

**Response:**
```json
{
  "message": "OTP sent to 9876543210. Valid for 10 minutes.",
  "phone": "9876543210",
  "otp_expires_in_minutes": 10
}
```

### Test Flow 2: Verify OTP

> **Note:** For development, the OTP is printed in backend logs. Check your terminal where backend is running.

```bash
# Replace 123456 with the actual OTP from logs
curl -X POST "http://localhost:8000/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "phone": "9876543210",
    "role": "customer",
    "is_verified": true,
    "created_at": "2024-01-15T10:30:00"
  },
  "tokens": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "token_type": "bearer",
    "expires_in": 900
  }
}
```

### Test Flow 3: Get Current User

```bash
# Replace with your access token from Step 2
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Flow 4: Refresh Token

```bash
curl -X POST "http://localhost:8000/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

### Test Frontend

1. Visit: **http://localhost:3000**
2. You should see the FreshCart login page
3. Enter phone number: `9876543210`
4. Click "Send OTP"
5. Check backend terminal for OTP code
6. Enter OTP in the 6-digit boxes
7. You should be logged in and redirected to dashboard

---

## 🧬 Database Schema (MongoDB)

### Users Collection

```javascript
{
  _id: ObjectId,
  phone: "9876543210",
  role: "customer", // or "admin"
  otp_hash: "bcrypt_hash",
  otp_attempts: 1,
  otp_expires_at: ISODate,
  is_verified: true,
  refresh_token: "jwt_token",
  name: "John",
  email: "john@example.com",
  address: "Main St, City",
  is_active: true,
  is_blocked: false,
  last_login: ISODate,
  created_at: ISODate,
  updated_at: ISODate
}
```

### Check Database

```bash
# Open MongoDB shell
docker exec -it freshcart-mongo mongosh -u admin -p freshcart123 --authenticationDatabase admin

# Inside mongosh:
use freshcartdb
show collections
db.users.find()
db.users.find({phone: "9876543210"})
```

---

## 🐛 Debugging

### Backend Logs

The backend terminal will show:
- OTP generated: `DEBUG: OTP for 9876543210 is 123456`
- Database operations
- Errors and exceptions

### Frontend Console

Open browser DevTools (F12) → Console to see:
- API requests
- Token storage
- Auth state changes

### MongoDB Logs

```bash
docker-compose logs mongodb
```

---

## 📝 Environment Variables

### Backend (.env)
```
JWT_SECRET=freshcart-secret-key-change-this-in-production
MONGODB_URI=mongodb://admin:freshcart123@mongodb:27017/freshcartdb?authSource=admin&replicaSet=rs0
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## ✅ Phase 1 Checklist

- [x] FastAPI backend setup
- [x] MongoDB connection
- [x] OTP generation and verification
- [x] JWT token management
- [x] Auth API endpoints (send-otp, verify-otp, refresh, me, logout)
- [x] Frontend Next.js app
- [x] Login page with phone input
- [x] OTP verification form (6 digit boxes)
- [x] Zustand auth store
- [x] API client with token management
- [x] Dashboard page
- [x] Environment configuration
- [x] Swagger API documentation

---

## 🔄 API Endpoints Summary

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-otp` | POST | Send 6-digit OTP |
| `/api/auth/verify-otp` | POST | Verify OTP & login |
| `/api/auth/refresh` | POST | Get new access token |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/logout` | POST | Logout user |

### Health

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | API health check |
| `/` | GET | Root endpoint |

---

## 🎓 What You've Built

### Backend
- Async FastAPI application with MongoDB
- OTP generation, verification, and hashing
- JWT token management (access + refresh)
- User authentication flow
- Proper error handling and logging

### Frontend
- Next.js 14 with TypeScript
- Phone-based login with OTP
- Zustand state management
- API client with token refresh
- Dashboard after login
- Tailwind CSS styling

### Database
- MongoDB with replica set (for transactions)
- User collection with all auth fields
- Proper indexes for performance
- TTL support for OTP expiration

---

## 🚀 What's Next (Phase 2)

Phase 2 will include:
- Product catalog with categories
- Product CRUD operations
- Shopping cart functionality
- Cart price snapshots
- Product search and filtering

---

## 📞 Common Issues & Solutions

### Port 27017 in use
```bash
# Change in docker-compose.yml
ports:
  - "27018:27017"  # Use 27018 instead

# Update .env
MONGODB_URI=mongodb://admin:freshcart123@localhost:27018/freshcartdb
```

### Backend won't start
```bash
# Check Python version
python --version  # Need 3.10+

# Recreate venv
rm -rf backend/venv
python -m venv backend/venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend npm issues
```bash
# Clear and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
npm install
npm run dev
```

### MongoDB connection error
```bash
# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker-compose logs mongodb
```

---

## 📚 Documentation

- **START_HERE.md** — Quick 5-minute setup
- **README.md** — Project overview
- **QUICKSTART.md** — Detailed implementation
- **FOLDER_STRUCTURE.md** — Project organization
- **docs/api/API.md** — API documentation (when created)

---

## ✨ Conclusion

Phase 1 is complete! You now have:
- ✅ Full authentication system
- ✅ OTP login functionality
- ✅ JWT token management
- ✅ User dashboard
- ✅ Working frontend and backend

**Time to complete:** ~40-50 hours (2 weeks)

Ready for Phase 2! 🚀
