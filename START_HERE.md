# 🚀 START HERE — FreshCart Setup Guide

## ⚡ 5-Minute Quick Start

### Step 1: Start MongoDB (2 minutes)

```bash
# From project root
docker-compose up -d

# Verify it's running
docker-compose ps
```

Expected output: `mongo` and `mongo-rs-init` services should be running.

### Step 2: Setup Backend (2 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate
# On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend (from backend directory)
uvicorn app.main:app --reload
```

✅ Backend ready at **http://localhost:8000**
- Test it: http://localhost:8000/docs

### Step 3: Setup Frontend (1 minute)

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ Frontend ready at **http://localhost:3000**

---

## ✅ Verify Everything Works

### Test Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "OK",
  "app": "FreshCart API",
  "version": "0.1.0",
  "environment": "development"
}
```

### Test Frontend

Visit **http://localhost:3000** in browser. You should see the FreshCart app.

### Test MongoDB

```bash
# Open MongoDB shell
docker exec -it freshcart-mongo mongosh -u admin -p freshcart123 --authenticationDatabase admin

# Inside mongosh:
use freshcartdb
show collections
```

---

## 🔧 Environment Files

### Backend (.env)

Already created at `backend/.env.example`. Copy it:

```bash
cp backend/.env.example backend/.env
```

**Important fields to update:**
```
MONGODB_URI=mongodb://admin:freshcart123@mongodb:27017/freshcartdb?authSource=admin&replicaSet=rs0
JWT_SECRET=your-secret-key-change-this
```

### Frontend (.env.local)

Already created at `frontend/.env.local.example`. Copy it:

```bash
cp frontend/.env.local.example frontend/.env.local
```

**No changes needed** — defaults are correct for local development.

---

## 📂 Project Structure at a Glance

```
freshcart/
├── frontend/              ← React/Next.js app
│   ├── app/              (Pages)
│   ├── components/       (React components)
│   └── lib/              (Utilities, API client)
│
├── backend/              ← Python/FastAPI app
│   ├── app/
│   │   ├── api/          (Routes)
│   │   ├── models/       (Database schemas)
│   │   ├── services/     (Business logic)
│   │   ├── core/         (Config, security)
│   │   └── db/           (Database connection)
│   └── requirements.txt
│
├── docker-compose.yml    (MongoDB setup)
└── README.md             (Project overview)
```

---

## 🎯 Phase 1: Foundation (Weeks 1-2)

**Goal:** Auth system with OTP login and JWT tokens

### What You're Building:
1. ✅ FastAPI backend with MongoDB
2. ✅ OTP generation and verification
3. ✅ JWT token management (access + refresh)
4. ✅ User login page with 6-digit OTP
5. ✅ Dashboard after login

### Files to Create:
- `backend/app/api/endpoints/auth.py` — Auth routes
- `frontend/app/auth/page.tsx` — Login page
- `frontend/lib/api.ts` — API client

---

## 🛠️ Available Commands

### Backend

```bash
cd backend

# Activate venv
source venv/bin/activate

# Start development server
uvicorn app.main:app --reload

# Run tests
pytest tests/

# View Swagger docs
# http://localhost:8000/docs
```

### Frontend

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type check
npm run type-check
```

### Docker

```bash
# From project root

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart mongodb

# Stop all services
docker-compose down

# Remove volumes (clears database)
docker-compose down -v
```

---

## 🐛 Troubleshooting

### Problem: "Port 27017 already in use"

```bash
# Change MongoDB port in docker-compose.yml
# Change from: 27017:27017
# To: 27018:27017
```

### Problem: "Cannot connect to backend from frontend"

**Check:**
1. Backend is running: `http://localhost:8000/docs`
2. Frontend `.env.local` has correct API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. CORS is enabled in backend (check `app/main.py`)

### Problem: "Python packages not installing"

```bash
# Recreate virtual environment
rm -rf backend/venv
python -m venv backend/venv
source venv/bin/activate
pip install -r requirements.txt
```

### Problem: "npm packages not installing"

```bash
# Clear cache and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
npm install
```

### Problem: MongoDB connection refused

```bash
# Check Docker is running
docker ps

# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker-compose logs mongodb
```

---

## 📚 Next Resources

- **README.md** — Project overview
- **FOLDER_STRUCTURE.md** — Detailed folder organization
- **QUICKSTART.md** — Phase 1 detailed guide
- **docs/setup/SETUP.md** — Advanced setup (when created)

---

## 💡 Tips for Success

1. **One thing at a time** — Start with backend, then frontend
2. **Test early** — Use Swagger at `/docs` to test APIs
3. **Check logs** — Always check terminal output for errors
4. **Keep `.env` files safe** — Never commit them to git
5. **Use hot reload** — Both backend and frontend support auto-reload

---

## 🎓 Learning Path

1. **Understand the flow** → Read the proposal document
2. **Explore the structure** → Browse the folder structure
3. **Setup locally** → Follow this guide
4. **Test the API** → Use Swagger UI at http://localhost:8000/docs
5. **Start coding** → Begin with Phase 1 auth system

---

## ✨ You're Ready!

You now have:
- ✅ Project structure created
- ✅ Backend configured and ready
- ✅ Frontend configured and ready
- ✅ MongoDB running in Docker
- ✅ All dependencies installed

**Next:** Open QUICKSTART.md to start Phase 1 implementation!

---

**Questions?** Check the error messages, review the logs, or consult the appropriate documentation file.

**Happy coding! 🚀**
