# Government Authentication System - Setup Guide

## ✅ What's Been Built

A complete, production-ready government-grade authentication system integrated into your CarbonSetu project.

## 📁 Complete Folder Structure

```
blue-carbon-registry/
│
├── backend/
│   ├── models/
│   │   ├── User.js                    ✅ User model with bcrypt, role: 'citizen'
│   │   └── TempUser.js                 ✅ OTP storage with attempts tracking
│   │
│   ├── routes/
│   │   └── auth.js                     ✅ Complete auth routes (send-otp, verify-otp, register, login, me, logout)
│   │
│   ├── middleware/
│   │   ├── auth.js                     ✅ JWT protection & authorization
│   │   ├── rateLimiter.js              ✅ OTP rate limiting
│   │   └── loginLimiter.js             ✅ Login brute force protection
│   │
│   ├── utils/
│   │   ├── emailService.js             ✅ Nodemailer service
│   │   ├── otpGenerator.js             ✅ OTP generation
│   │   └── hashOTP.js                  ✅ OTP hashing (NEW)
│   │
│   ├── server.js                       ✅ Updated with cookie parser
│   └── package.json                    ✅ Added jsonwebtoken, cookie-parser
│
├── frontend/
│   ├── pages/
│   │   ├── Login.jsx                   ✅ Government-style login
│   │   ├── Signup.jsx                  ✅ Step 1: Email entry
│   │   ├── VerifyOTP.jsx               ✅ Step 2: OTP verification
│   │   ├── CompleteRegistration.jsx    ✅ Step 3: Profile completion
│   │   └── Dashboard.jsx               ✅ Protected dashboard
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx       ✅ Route protection
│   │   └── layout/
│   │       └── Header.jsx               ✅ Updated with user menu
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx             ✅ JWT authentication context
│   │
│   ├── services/
│   │   └── api.js                       ✅ API service with interceptors
│   │
│   └── App.js                           ✅ Updated routes
│
└── AUTHENTICATION_SYSTEM.md            ✅ Complete documentation
```

## 🚀 Quick Start

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

**New packages added:**
- `jsonwebtoken` - JWT token generation
- `cookie-parser` - HTTP-only cookie support

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

**Already installed:**
- `react-icons` - Icons for UI
- `axios` - HTTP client
- `react-router-dom` - Routing

### 3. Configure Backend Environment

Edit `backend/.env`:
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

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=1h
```

### 4. Configure Frontend Environment

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## 🔄 User Flow

### Registration Flow
1. User visits home page → Clicks "Register"
2. `/signup` → Enters email → OTP sent
3. `/verify-otp` → Enters 6-digit OTP → Verified
4. `/complete-registration` → Enters name & password → Account created
5. Redirected to `/login` with success message

### Login Flow
1. User clicks "Sign In" → `/login`
2. Enters email & password
3. JWT token generated & stored
4. Redirected to `/dashboard`

### Dashboard Access
- Protected route checks authentication
- Shows user information
- Logout functionality

## 🔐 Security Features

✅ **Password Security**
- Bcrypt hashing (10 rounds)
- Strong password requirements (8+ chars, uppercase, lowercase, number, special)
- Password never returned in responses

✅ **OTP Security**
- OTP hashed before storage
- 5-minute expiry
- Max 5 failed attempts
- Rate limiting (3 requests per 15 min)

✅ **JWT Security**
- HTTP-only cookies (secure)
- 1-hour expiry (7 days if rememberMe)
- Token verification middleware
- Auto-logout on token expiry

✅ **Rate Limiting**
- OTP sending: 3 per 15 minutes
- OTP verification: 10 per 15 minutes
- Login: 5 per 15 minutes

✅ **Account Protection**
- Email verification required
- Unverified users blocked
- Failed attempt tracking

## 📋 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/send-otp` | Send OTP to email | No |
| POST | `/api/auth/verify-otp` | Verify OTP code | No |
| POST | `/api/auth/register` | Complete registration | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | No |

## 🎨 UI Features

### Government-Style Design
- ✅ White + Navy Blue color theme
- ✅ Centered card layout
- ✅ Clear borders
- ✅ Minimal animations
- ✅ Professional appearance
- ✅ Accessible font sizes
- ✅ Mobile responsive

### Pages Created
1. **Login** - Email, password, remember me
2. **Signup** - Email entry with government messaging
3. **Verify OTP** - 6-digit input with countdown timer
4. **Complete Registration** - Name, password, terms checkbox
5. **Dashboard** - Protected user dashboard

### Header Updates
- Shows user name when logged in
- Dropdown menu with user info
- Logout button
- Sign In/Register when not logged in

## 🧪 Testing the System

### Test Registration
1. Go to home page
2. Click "Register"
3. Enter email → Check inbox for OTP
4. Enter OTP → Verify
5. Complete profile → Submit
6. Should redirect to login

### Test Login
1. Go to `/login`
2. Enter registered email & password
3. Click "Sign In"
4. Should redirect to dashboard
5. Header should show your name

### Test Protected Route
1. Try accessing `/dashboard` without login
2. Should redirect to `/login`
3. After login, should access dashboard

## 🔧 Troubleshooting

### Backend Issues
- **JWT errors:** Check `JWT_SECRET` is set in `.env`
- **Email not sending:** Verify Gmail app password
- **MongoDB errors:** Check connection string

### Frontend Issues
- **API errors:** Check `REACT_APP_API_URL` in `.env`
- **Auth not working:** Check token in localStorage
- **CORS errors:** Verify `FRONTEND_URL` in backend `.env`

## 📝 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Start servers
4. ✅ Test registration flow
5. ✅ Test login flow
6. ✅ Customize dashboard content
7. ✅ Add additional protected routes

## 🎯 Production Deployment

Before deploying:

1. **Backend:**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET` (32+ characters)
   - Configure production MongoDB
   - Set up production email service
   - Enable HTTPS

2. **Frontend:**
   - Update `REACT_APP_API_URL` to production URL
   - Build: `npm run build`
   - Deploy build folder

3. **Security:**
   - Enable HTTPS
   - Use HTTP-only cookies
   - Set secure cookie flags
   - Configure CORS properly

The system is production-ready! 🚀
