# Government-Grade Authentication System

Complete authentication system integrated into Blue Carbon Registry project.

## 🏗️ Folder Structure

```
backend/
├── models/
│   ├── User.js              # User model with bcrypt password hashing
│   └── TempUser.js           # Temporary OTP storage with attempts tracking
├── routes/
│   └── auth.js              # Authentication routes (send-otp, verify-otp, register, login, me, logout)
├── middleware/
│   ├── auth.js              # JWT protection & authorization middleware
│   ├── rateLimiter.js       # OTP rate limiting
│   └── loginLimiter.js      # Login rate limiting (brute force protection)
├── utils/
│   ├── emailService.js      # Nodemailer email service
│   ├── otpGenerator.js      # OTP generation & validation
│   └── hashOTP.js           # OTP hashing utilities
└── server.js                 # Express server with cookie parser

frontend/
├── pages/
│   ├── Login.jsx            # Government-style login page
│   ├── Signup.jsx           # Step 1: Email entry
│   ├── VerifyOTP.jsx        # Step 2: OTP verification with timer
│   ├── CompleteRegistration.jsx  # Step 3: Profile completion
│   └── Dashboard.jsx        # Protected dashboard
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx  # Route protection middleware
│   └── layout/
│       └── Header.jsx       # Updated with user menu & logout
├── contexts/
│   └── AuthContext.jsx      # Authentication context with JWT
└── services/
    └── api.js               # API service with interceptors
```

## 🔐 Backend API Endpoints

### POST `/api/auth/send-otp`
Send OTP to email for registration.

**Rate Limit:** 3 requests per 15 minutes

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "An OTP has been sent to your registered email address.",
  "email": "user@example.com",
  "expiresAt": "2024-01-01T12:05:00.000Z"
}
```

### POST `/api/auth/verify-otp`
Verify OTP code.

**Rate Limit:** 10 requests per 15 minutes

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "email": "user@example.com"
}
```

**Security:**
- Max 5 failed attempts
- OTP expires after 5 minutes
- OTP is hashed before storage

### POST `/api/auth/register`
Complete user registration.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please login to continue.",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "isVerified": true,
    "role": "citizen"
  },
  "token": "jwt-token-here"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### POST `/api/auth/login`
User login.

**Rate Limit:** 5 attempts per 15 minutes

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "isVerified": true,
    "role": "citizen"
  },
  "token": "jwt-token-here"
}
```

**Security Checks:**
- Validates email exists
- Checks password with bcrypt
- Verifies `isVerified = true`
- Blocks unverified users

### GET `/api/auth/me`
Get current authenticated user.

**Protected:** Requires valid JWT token

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "isVerified": true,
    "role": "citizen"
  }
}
```

### POST `/api/auth/logout`
Logout user.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 🔒 Security Features

### Password Security
- ✅ Bcrypt hashing (10 rounds)
- ✅ Strong password requirements
- ✅ Password never returned in API responses

### OTP Security
- ✅ OTP hashed before storage
- ✅ 5-minute expiry
- ✅ Max 5 failed attempts
- ✅ Auto-delete after expiry
- ✅ Rate limiting (3 requests per 15 min)

### JWT Security
- ✅ HTTP-only cookies (recommended)
- ✅ Token in Authorization header (fallback)
- ✅ 1-hour expiry (7 days if rememberMe)
- ✅ Token verification middleware

### Rate Limiting
- ✅ OTP sending: 3 per 15 minutes
- ✅ OTP verification: 10 per 15 minutes
- ✅ Login attempts: 5 per 15 minutes

### Account Protection
- ✅ Email verification required
- ✅ Unverified users blocked from login
- ✅ Failed login attempt tracking

## 🎨 Frontend Features

### Sign Up Flow
1. **Email Entry** (`/signup`)
   - Official email input
   - Government-style messaging
   - OTP sent via email

2. **OTP Verification** (`/verify-otp`)
   - 6-digit OTP input
   - 5-minute countdown timer
   - Resend OTP (max 3 attempts)
   - Failed attempt tracking

3. **Complete Registration** (`/complete-registration`)
   - Full name input
   - Password with requirements checker
   - Confirm password
   - Terms & Conditions checkbox
   - Real-time validation

### Login Page (`/login`)
- Email & password fields
- Remember me checkbox
- Show/hide password toggle
- Government-style design
- Error handling

### Dashboard (`/dashboard`)
- Protected route
- User information display
- Quick actions
- Logout functionality

### Header Updates
- Shows user name when logged in
- User dropdown menu
- Logout button
- Sign In/Register buttons when not logged in

## 📋 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blue_carbon_db
NODE_ENV=development

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@bluecarbon.gov.in

FRONTEND_URL=http://localhost:3000

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=1h
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Installation Steps

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL
npm start
```

## 🔄 User Flow

1. **Registration:**
   - User clicks "Register" → `/signup`
   - Enters email → OTP sent
   - Verifies OTP → `/verify-otp`
   - Completes profile → `/complete-registration`
   - Redirected to login

2. **Login:**
   - User clicks "Sign In" → `/login`
   - Enters credentials
   - JWT token generated
   - Redirected to dashboard

3. **Dashboard Access:**
   - Protected route checks JWT
   - Verifies user is authenticated
   - Shows dashboard content

## 🛡️ Security Best Practices Implemented

- ✅ Password hashing with bcrypt
- ✅ OTP hashing before storage
- ✅ JWT token authentication
- ✅ HTTP-only cookies
- ✅ Rate limiting on all auth endpoints
- ✅ Input validation (frontend & backend)
- ✅ Email verification requirement
- ✅ Account lockout after failed attempts
- ✅ Environment variables for secrets
- ✅ CORS configuration
- ✅ Secure password requirements

## 📱 Responsive Design

All pages are fully responsive:
- Mobile-first design
- Tablet optimization
- Desktop layouts
- Touch-friendly inputs
- Accessible navigation

## ♿ Accessibility

- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ Semantic HTML
- ✅ Color contrast compliance

## 🎯 Next Steps

1. Install dependencies:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd frontend && npm install
   ```

2. Configure environment variables

3. Start servers:
   ```bash
   # Backend
   npm run dev
   
   # Frontend
   npm start
   ```

4. Test the flow:
   - Register new account
   - Verify OTP
   - Complete registration
   - Login
   - Access dashboard

The system is production-ready with government-grade security and professional UI!
