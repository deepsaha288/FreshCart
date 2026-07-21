# 🛒 FreshCart — Grocery Ordering Platform

A modern, full-stack grocery ordering platform built with **Next.js**, **FastAPI**, and **MongoDB**. Features OTP-based authentication, real-time order tracking, WhatsApp notifications, and automatic bill generation.

## 📋 Overview

FreshCart is a complete solution for grocery shops to accept online orders. Customers order via phone OTP login, shop owners get instant WhatsApp alerts with item lists, and bills are automatically generated and sent when packing is complete.

### Key Features
- 📱 **OTP Login** — Phone-based authentication with 6-digit OTP
- 🛍️ **Product Catalog** — Browse and add items to cart
- 💳 **Smart Cart** — Price-snapshot ensures consistent pricing
- 📲 **WhatsApp Alerts** — Owner gets instant notifications with full item lists
- 🧾 **Auto Bill Generation** — Professional PDF bills generated on click
- 📊 **Admin Panel** — Live order management and dashboard
- 🚀 **Real-time Updates** — Order status updates in real-time

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** — React framework with App Router
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling
- **Shadcn/ui** — Pre-built UI components
- **Zustand** — Lightweight state management

### Backend
- **FastAPI** — High-performance async Python framework
- **MongoDB** — NoSQL database with replica set
- **Beanie** — MongoDB ODM for Python
- **FastAPI** — JWT-based authentication
- **Twilio** — SMS/WhatsApp APIs
- **WeasyPrint** — PDF generation

### DevOps
- **Docker & Docker Compose** — Containerization
- **Nginx** — Reverse proxy (production)

---

## 📦 Folder Structure

```
freshcart/
├── frontend/                 # Next.js application
│   ├── app/                  # Pages and routes
│   ├── components/           # React components
│   ├── lib/                  # Utilities and hooks
│   └── public/               # Static assets
│
├── backend/                  # FastAPI application
│   ├── app/                  # Application code
│   │   ├── api/              # API endpoints
│   │   ├── models/           # Database models
│   │   ├── services/         # Business logic
│   │   ├── core/             # Configuration
│   │   └── utils/            # Utilities
│   ├── templates/            # Email & bill templates
│   └── tests/                # Test suite
│
├── docker/                   # Docker configurations
├── database/                 # Database schemas
├── docs/                     # Documentation
└── docker-compose.yml        # Development setup
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** — For frontend
- **Python 3.12+** — For backend
- **Docker & Docker Compose** — For MongoDB
- **Git** — For version control

### 1. Clone & Setup

```bash
# Clone repository (if using git)
git clone <repo-url>
cd freshcart

# Create environment files
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 2. Start MongoDB

```bash
# Start MongoDB and replica set initialization
docker-compose up -d

# Verify MongoDB is running
docker-compose logs mongodb
```

### 3. Setup Backend

```bash
cd backend

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn app.main:app --reload
```

Backend will be available at **http://localhost:8000**
- API Docs: **http://localhost:8000/docs**
- ReDoc: **http://localhost:8000/redoc**

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at **http://localhost:3000**

---

## 📖 Environment Configuration

### Backend (.env)
```env
# MongoDB
MONGODB_URI=mongodb://admin:freshcart123@localhost:27017/freshcartdb?authSource=admin&replicaSet=rs0

# JWT
JWT_SECRET=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=15

# SMS (Twilio or 2factor.in)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token

# WhatsApp
OWNER_WHATSAPP=+919876543210

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🔄 Development Phases

| Phase | Duration | Focus |
|-------|----------|-------|
| **Phase 1** | 2 weeks | Auth + OTP + JWT + Database |
| **Phase 2** | 2 weeks | Products + Cart UI |
| **Phase 3** | 1.5 weeks | Checkout + Orders + WhatsApp |
| **Phase 4** | 1.5 weeks | Bill PDF Generation |
| **Phase 5** | 1.5 weeks | Admin Panel |
| **Phase 6** | 1 week | Polish + Deployment |

**Total: 9-10 weeks**

---

## 📚 Documentation

- **[Setup Guide](docs/setup/SETUP.md)** — Detailed environment setup
- **[API Documentation](docs/api/API.md)** — FastAPI endpoint docs
- **[Deployment Guide](docs/deployment/DEPLOYMENT.md)** — Production deployment
- **[Folder Structure](FOLDER_STRUCTURE.md)** — Project organization
- **[Quick Start](QUICKSTART.md)** — Phase 1 initialization

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
pytest tests/

# Run backend with coverage
pytest --cov=app tests/

# Run frontend tests (when available)
cd frontend
npm test
```

---

## 📝 API Endpoints (Phase 1)

### Authentication
- `POST /api/auth/send-otp` — Send OTP to phone
- `POST /api/auth/verify-otp` — Verify OTP and login
- `POST /api/auth/refresh` — Refresh access token

### Health
- `GET /health` — API health check
- `GET /` — Root endpoint

---

## 🐛 Common Issues

### MongoDB Connection Error
```bash
# Verify MongoDB is running
docker-compose ps

# Check logs
docker-compose logs mongodb

# Restart services
docker-compose down
docker-compose up -d
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml or .env
# Frontend: NEXT_PUBLIC_API_URL
# Backend: Update uvicorn port
```

### Python venv Issues
```bash
# Recreate virtual environment
rm -rf backend/venv
python -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

---

## 📱 Project Screenshots & Flows

See **FOLDER_TREE.txt** for visual structure and **QUICKSTART.md** for detailed phase-by-phase implementation.

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open pull request

---

## 📄 License

This project is proprietary and confidential.

---

## 🎯 Next Steps

1. ✅ Project structure created
2. ⬜ Run `npm install` in frontend
3. ⬜ Run `pip install -r requirements.txt` in backend
4. ⬜ Configure `.env` files
5. ⬜ Start Docker MongoDB
6. ⬜ Begin Phase 1 implementation

---

## 📞 Support

For issues or questions:
1. Check documentation in `/docs`
2. Review **QUICKSTART.md** for phase-specific help
3. Check error logs in `backend/logs/`

---

**Happy coding! 🚀**

*FreshCart — Making grocery shopping online, simple and fast.*
