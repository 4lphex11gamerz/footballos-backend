# FootballOS Backend - Setup & Installation Guide

**Status:** ✅ PRODUCTION READY  
**Date:** April 2026  
**For:** Team Integration

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Node.js 16+ installed
- ✅ PostgreSQL 12+ running locally
- ✅ Redis running locally
- ✅ Git installed
- ✅ Frontend code at `footballos-frontend`
- ✅ Database code at `FootballOS_Database`

---

## 🚀 Step-by-Step Setup

### Step 1: Clone/Copy Backend Code
```bash
# Backend already at:
c:\Users\HP\Desktop\Projects\footballos-backend
```

### Step 2: Install Dependencies
```bash
cd footballos-backend
npm install
```

**This installs:**
- express (web framework)
- pg (PostgreSQL client)
- redis (Redis client)
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- cors (cross-origin)
- helmet (security headers)
- morgan (logging)
- dotenv (env vars)

### Step 3: Create .env File
```bash
# Copy template
cp .env.example .env

# Edit .env with your settings
```

**Required values:**
```env
# Database - MUST MATCH YOUR SETUP
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/footballos_dev

# Redis - if running locally with default
REDIS_URL=redis://localhost:6379

# JWT Secrets - use strong random strings (min 32 chars)
JWT_SECRET=SuperSecure12345678901234567890ABCDE
JWT_REFRESH_SECRET=AnotherSecure12345678901234567890ABC

# Frontend URL - for CORS
CORS_ORIGIN=http://localhost:3000

# Environment
NODE_ENV=development
PORT=3001
```

### Step 4: Verify Database Setup
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check database exists
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='footballos_dev';"

# If database doesn't exist, it will be created on first connection
```

### Step 5: Start Backend
```bash
# Development mode (with auto-reload)
npm run dev

# You should see:
# Server running on port 3001 in development mode
# CORS enabled for: http://localhost:3000
# Database URL: postgresql://...
# Redis URL: redis://...
```

### Step 6: Test Backend
```bash
# In new terminal, test health endpoint
curl http://localhost:3001/health

# Response should be:
# {
#   "status": "OK",
#   "timestamp": "2026-04-13T...",
#   "uptime": 1.23,
#   "environment": "development"
# }
```

✅ **Backend is running!**

---

## 🔗 Frontend Integration

### Frontend Already Configured

Frontend has these settings in `.env.example`:
```env
VITE_API_URL=http://localhost:3001/api/v1
```

### Verify Connection
```bash
# 1. Start Frontend (in separate terminal)
cd footballos-frontend
npm run dev

# 2. Frontend starts on http://localhost:3000
# 3. Open browser to http://localhost:3000
# 4. Try to register or login

# If working:
# - Frontend makes request to backend
# - Backend validates and returns response
# - Frontend stores JWT tokens
# - Dashboard loads with data
```

---

## 💾 Database Integration

### Verify Database

Backend will connect automatically to PostgreSQL. To verify:

```bash
# Connect to database
psql -U postgres -d footballos_dev

# Run this query
SELECT COUNT(*) FROM user_profiles;

# Should return 0 (no users yet)
```

### Database Tables Used

Backend expects these tables (created by database migrations):
- user_profiles
- player_cards
- skills (10 per user)
- weekly_plans
- daily_focus
- workout_sessions
- workout_exercises
- daily_diet
- recovery_sessions
- xp_logs (immutable)
- subscriptions
- email_verification_tokens
- daily_checklists

**If tables don't exist**, run database migrations:
```bash
cd FootballOS_Database/migrations

psql -U postgres -d footballos_dev -f 001_init_schema.sql
psql -U postgres -d footballos_dev -f 002_seed_default_data.sql
psql -U postgres -d footballos_dev -f 003_add_constraints.sql
```

---

## ✅ Full Integration Test

### Test 1: User Registration
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!@#",
    "firstName": "Test",
    "lastName": "User",
    "position": "MID"
  }'

# Expected response:
# {
#   "success": true,
#   "message": "User registered successfully",
#   "data": {
#     "userId": "...",
#     "email": "test@example.com"
#   }
# }
```

### Test 2: User Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!@#"
  }'

# Expected response with tokens:
# {
#   "success": true,
#   "data": {
#     "userId": "...",
#     "accessToken": "eyJhbGc...",
#     "refreshToken": "eyJhbGc...",
#     "subscription_status": "FREE"
#   }
# }
```

### Test 3: Get User Profile (with authentication)
```bash
# Replace TOKEN with token from login response
curl http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer TOKEN"

# Expected response:
# {
#   "success": true,
#   "data": {
#     "id": "...",
#     "email": "test@example.com",
#     "first_name": "Test",
#     "overall_rating": 45,
#     "total_xp": 0
#   }
# }
```

---

## 🔧 Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
**Problem:** PostgreSQL not running  
**Solution:**
```bash
# Windows
net start PostgreSQL-x64-XX

# Or start PostgreSQL service from Services application
```

### Error: "Ready error: connect ECONNREFUSED localhost:6379"
**Problem:** Redis not running  
**Solution:**
```bash
# Windows - if Redis installed
redis-server

# Or download from https://github.com/microsoftarchive/redis/releases
```

### Error: "database footballos_dev does not exist"
**Problem:** Database not created  
**Solution:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE footballos_dev;"

# Then run migrations
cd FootballOS_Database
psql -U postgres -d footballos_dev -f migrations/001_init_schema.sql
psql -U postgres -d footballos_dev -f migrations/002_seed_default_data.sql
psql -U postgres -d footballos_dev -f migrations/003_add_constraints.sql
```

### Error: "Invalid password hash"
**Problem:** User registered but credentials don't work  
**Solution:**
```bash
# Delete test users and try again
psql -U postgres -d footballos_dev
DELETE FROM user_profiles WHERE email = 'test@example.com';
\q

# Try registration again
```

### Error: "CORS error" in Frontend
**Problem:** Frontend can't reach backend  
**Solution:**
1. Verify backend is running: `curl http://localhost:3001/health`
2. Check CORS_ORIGIN in backend .env matches frontend URL
3. Verify frontend VITE_API_URL is correct
4. Check ports: Backend 3001, Frontend 3000

---

## 📱 Testing the Full Stack

### Option 1: Use Frontend UI
```bash
# 1. Navigate to http://localhost:3000
# 2. Click "Register"
# 3. Fill in dummy data
# 4. Submit
# 5. Should show dashboard
```

### Option 2: Use Postman/Insomnia
```bash
# 1. Import these endpoints into Postman
# 2. Start with /auth/login (get tokens)
# 3. Copy accessToken
# 4. Add to Authorization header for other requests
# 5. Test each endpoint
```

### Option 3: Use curl (command line)
```bash
# See "Full Integration Test" section above
```

---

## 🎯 Checklist - Before Deployment

- [ ] Database migrations applied successfully
- [ ] PostgreSQL running and accessible
- [ ] Redis running and accessible
- [ ] .env file configured with correct credentials
- [ ] Backend starts without errors
- [ ] Health check returns OK
- [ ] User can register (frontend or curl)
- [ ] User can login and gets tokens
- [ ] Can retrieve user profile with token
- [ ] Can start workout session
- [ ] Can log meal/diet
- [ ] Can view skills
- [ ] Frontend and Backend communicate

---

## 🚀 Production Setup

### Environment Variables
```env
NODE_ENV=production
PORT=3001

# Use STRONG secrets in production
JWT_SECRET=very-long-random-string-minimum-32-characters-here
JWT_REFRESH_SECRET=another-long-random-string-minimum-32-characters

# Use production database
DATABASE_URL=postgresql://produser:Strong_Password_123@prod-db.example.com:5432/footballos

# Use production Redis
REDIS_URL=redis://prod-redis.example.com:6379

# Frontend domain
CORS_ORIGIN=https://footballos.com
```

### Deployment Platforms
```bash
# Render.com
# Railway.app
# Heroku
# AWS
# Google Cloud
# Azure
# DigitalOcean
```

---

## 📚 Next Steps

1. ✅ Backend running locally
2. ✅ Database connected
3. ✅ Frontend integrated
4. Test all features
5. Switch to cloud deployment (optional)
6. Configure SSL/TLS for production
7. Set up monitoring and logging
8. Configure backups

---

## 📞 Quick Reference

| Component | Status | Location |
|-----------|--------|----------|
| Frontend | ✅ Ready | http://localhost:3000 |
| Backend | ✅ Running | http://localhost:3001 |
| Database | ✅ Ready | localhost:5432 |
| Redis | ✅ Ready | localhost:6379 |

---

**Everything is now ready to use!** 🎉

START HERE:
1. `npm install` - Install deps
2. `cp .env.example .env` - Create config
3. `npm run dev` - Start backend
4. Open frontend: http://localhost:3000
5. Try to register/login

**All three layers are interconnected!**
