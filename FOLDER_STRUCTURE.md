# Project Folder Structure

```
signup-system/
│
├── backend/                          # Node.js + Express Backend
│   ├── models/                       # MongoDB Models
│   │   ├── TempUser.js              # Temporary user with OTP (email, otp, otpExpires)
│   │   └── User.js                  # User model (name, email, password, isVerified, createdAt)
│   │
│   ├── routes/                       # API Routes
│   │   └── auth.js                  # Authentication routes
│   │       ├── POST /send-otp       # Send OTP to email
│   │       ├── POST /verify-otp      # Verify OTP code
│   │       └── POST /complete-registration  # Complete user registration
│   │
│   ├── middleware/                   # Express Middleware
│   │   └── rateLimiter.js           # Rate limiting for OTP spam prevention
│   │
│   ├── utils/                        # Utility Functions
│   │   ├── emailService.js          # Nodemailer email service
│   │   └── otpGenerator.js          # OTP generation and validation
│   │
│   ├── server.js                     # Express server setup
│   ├── package.json                  # Backend dependencies
│   ├── .env.example                  # Environment variables template
│   └── .env                          # Environment variables (create from .env.example)
│
├── frontend/                         # React Frontend
│   ├── public/                       # Static files
│   │   └── index.html               # HTML template
│   │
│   ├── src/                          # React source code
│   │   ├── components/              # React Components
│   │   │   ├── EmailStep.js        # Step 1: Email input page
│   │   │   ├── OTPStep.js          # Step 2: OTP verification page (with countdown timer)
│   │   │   ├── ProfileStep.js     # Step 3: Complete profile page
│   │   │   └── Success.js         # Success page
│   │   │
│   │   ├── services/                # API Services
│   │   │   └── api.js              # Axios API client
│   │   │
│   │   ├── App.js                   # Main App component with routing
│   │   ├── App.css                  # Custom CSS animations
│   │   ├── index.js                 # React entry point
│   │   └── index.css                # Tailwind CSS imports
│   │
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── package.json                 # Frontend dependencies
│   ├── .env.example                  # Environment variables template
│   └── .env                          # Environment variables (create from .env.example)
│
├── .gitignore                        # Git ignore file
├── README.md                         # Project documentation
└── FOLDER_STRUCTURE.md              # This file

```

## Database Models

### TempUser Model
- `email` (String, required, unique, lowercase)
- `otp` (String, required, 6 digits)
- `otpExpires` (Date, required, auto-delete after expiry)
- `createdAt` (Date, default: now)

### User Model
- `name` (String, required)
- `email` (String, required, unique, lowercase)
- `password` (String, required, hashed with bcrypt)
- `isVerified` (Boolean, default: true)
- `createdAt` (Date, default: now)

## API Routes

### POST /api/auth/send-otp
- **Rate Limit**: 3 requests per 15 minutes per IP
- **Body**: `{ email: string }`
- **Response**: `{ success: boolean, message: string, email: string, expiresAt: string }`

### POST /api/auth/verify-otp
- **Rate Limit**: 10 requests per 15 minutes per IP
- **Body**: `{ email: string, otp: string }`
- **Response**: `{ success: boolean, message: string, email: string }`

### POST /api/auth/complete-registration
- **Body**: `{ email: string, name: string, password: string }`
- **Response**: `{ success: boolean, message: string, user: object }`

## Frontend Pages

1. **Email Input Page** (`/`)
   - Email input field
   - Continue button
   - Loading state
   - Error messages

2. **OTP Verification Page** (`/verify-otp`)
   - 6-digit OTP input
   - 5-minute countdown timer
   - Resend OTP button
   - Change email button

3. **Complete Profile Page** (`/complete-profile`)
   - Name input
   - Password input
   - Confirm password input
   - Password requirements validation
   - Back button

4. **Success Page** (`/success`)
   - Success message
   - Sign in button
