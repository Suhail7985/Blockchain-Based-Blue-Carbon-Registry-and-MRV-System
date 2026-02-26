# Modern Sign Up System

A professional, modern sign-up system with OTP email verification built with React (frontend) and Node.js + Express + MongoDB (backend).

## Features

- ✅ Email-based signup flow
- ✅ 6-digit OTP generation and email delivery
- ✅ OTP verification with 5-minute expiry and countdown timer
- ✅ Secure password hashing with bcrypt
- ✅ Profile completion (name, password)
- ✅ Rate limiting to prevent OTP spam
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ Error handling and validation
- ✅ Password strength requirements

## Project Structure

See [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for detailed folder structure.

## Signup Flow

1. **Email Input** → User enters email and clicks "Continue"
2. **OTP Generation** → Backend generates 6-digit OTP and sends via email
3. **OTP Verification** → User enters OTP (valid for 5 minutes with countdown timer)
4. **Profile Completion** → User enters name and password
5. **Account Creation** → User saved to database with `isVerified: true`

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ OTP expiry (5 minutes)
- ✅ OTP deletion after successful verification
- ✅ Rate limiting (3 OTP requests per 15 minutes, 10 verification attempts per 15 minutes)
- ✅ Duplicate email registration prevention
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Email normalization

## Database Models

### TempUser Model
- `email` - User email address
- `otp` - 6-digit OTP code
- `otpExpires` - OTP expiration timestamp
- Auto-deletes expired records

### User Model
- `name` - User's full name
- `email` - User email address (unique)
- `password` - Hashed password (bcrypt)
- `isVerified` - Verification status (default: true)
- `createdAt` - Account creation timestamp

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Email account for sending OTPs (Gmail recommended)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/signup_db
   NODE_ENV=development
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@yourapp.com
   
   FRONTEND_URL=http://localhost:3000
   ```

   **For Gmail:**
   - Enable 2-Factor Authentication
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Use the app password as `EMAIL_PASS`

5. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. Start the development server:
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

## API Endpoints

### POST `/api/auth/send-otp`
Send OTP to email address.

**Rate Limit**: 3 requests per 15 minutes per IP

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
  "message": "OTP sent successfully to your email",
  "email": "user@example.com",
  "expiresAt": "2024-01-01T12:05:00.000Z"
}
```

### POST `/api/auth/verify-otp`
Verify OTP code.

**Rate Limit**: 10 requests per 15 minutes per IP

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

### POST `/api/auth/complete-registration`
Complete user registration.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "isVerified": true,
    "createdAt": "..."
  }
}
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## OTP Expiry

- OTP expires after 5 minutes
- Expired OTPs are automatically deleted from the database
- Frontend displays countdown timer (5:00 to 0:00)
- Users can request a new OTP if expired

## Rate Limiting

- **OTP Sending**: Maximum 3 requests per 15 minutes per IP address
- **OTP Verification**: Maximum 10 attempts per 15 minutes per IP address
- Prevents OTP spam and brute force attacks

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Nodemailer** - Email service
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # React development server with hot reload
```

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Update `FRONTEND_URL` to your production frontend URL
3. Build frontend: `cd frontend && npm run build`
4. Serve frontend build with a static server or integrate with backend
5. Use environment variables for all sensitive data
6. Configure MongoDB Atlas or production MongoDB instance
7. Set up production email service (SendGrid, AWS SES, etc.)

## License

ISC
