# Installation Steps - Government Authentication System

## Prerequisites
- Node.js v14 or higher
- MongoDB (local or MongoDB Atlas)
- Gmail account for OTP emails

## Step-by-Step Installation

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# This will install:
# - express, mongoose, nodemailer, bcrypt
# - jsonwebtoken (NEW)
# - cookie-parser (NEW)
# - express-rate-limit, express-validator
```

### Step 2: Backend Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
```

**Required .env variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blue_carbon_db
NODE_ENV=development

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=noreply@bluecarbon.gov.in

FRONTEND_URL=http://localhost:3000

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-in-production
JWT_EXPIRE=1h
```

**Important:** Generate a strong JWT_SECRET (minimum 32 characters)

### Step 3: Gmail App Password Setup

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and generate password
5. Copy 16-character password
6. Use as `EMAIL_PASS` in `.env`

### Step 4: Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already done)
npm install
```

### Step 5: Frontend Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
```

**Required .env variables:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 6: Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas**
- Use your Atlas connection string in `MONGODB_URI`

### Step 7: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ MongoDB connected successfully
✅ Email service ready
🚀 Server running on port 5000
```

### Step 8: Start Frontend Server

```bash
cd frontend
npm start
```

**Expected:** Browser opens at `http://localhost:3000`

## Verification

### Test Backend
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

### Test Registration Flow
1. Go to `http://localhost:3000`
2. Click "Register"
3. Enter email
4. Check email for OTP
5. Enter OTP
6. Complete registration

### Test Login Flow
1. Go to `http://localhost:3000/login`
2. Enter credentials
3. Should redirect to dashboard

## Common Issues

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists
- Check `JWT_SECRET` is set
- Run `npm run check` for diagnostics

### Email not sending
- Verify Gmail app password
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Run `npm run test:email`

### Frontend can't connect
- Check backend is running on port 5000
- Verify `REACT_APP_API_URL` in frontend `.env`
- Check CORS settings

## Next Steps

After installation:
1. ✅ Test registration flow
2. ✅ Test login flow
3. ✅ Test protected routes
4. ✅ Customize dashboard
5. ✅ Add more features

## Production Checklist

Before deploying:
- [ ] Strong JWT_SECRET (32+ chars)
- [ ] Production MongoDB URI
- [ ] Production email service
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Error logging configured
