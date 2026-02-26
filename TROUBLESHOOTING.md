# Troubleshooting Guide

## Common Issues and Solutions

### ❌ "Failed to send OTP. Please try again later."

This error can occur for several reasons:

#### 1. Backend Server Not Running
**Symptoms:**
- Error message appears immediately
- Browser console shows "Network Error" or "ECONNREFUSED"

**Solution:**
```bash
# Check if backend is running
cd backend
npm run dev

# Should see: "🚀 Server running on port 5000"
# Should see: "✅ MongoDB connected successfully"
```

#### 2. Email Configuration Missing
**Symptoms:**
- Backend logs show email authentication errors
- Error mentions "EMAIL_USER or EMAIL_PASS not set"

**Solution:**
1. Check `backend/.env` file exists
2. Verify these variables are set:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@yourapp.com
   ```
3. For Gmail, ensure you're using an App Password (not your regular password)
4. Restart backend server after updating `.env`

#### 3. MongoDB Not Running
**Symptoms:**
- Backend logs show "MongoServerError" or "MongoNetworkError"
- Error mentions "Database connection error"

**Solution:**
```bash
# Start MongoDB locally
mongod

# Or check MongoDB Atlas connection string
# Verify MONGODB_URI in backend/.env
```

#### 4. CORS Issues
**Symptoms:**
- Browser console shows CORS errors
- Frontend can't connect to backend

**Solution:**
1. Check `FRONTEND_URL` in `backend/.env` matches your frontend URL
2. Default: `FRONTEND_URL=http://localhost:3000`
3. Restart backend after updating

#### 5. Port Already in Use
**Symptoms:**
- Backend fails to start
- Error: "Port 5000 is already in use"

**Solution:**
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Or change PORT in backend/.env
```

### ❌ "Cannot connect to server"

**Solution:**
1. Verify backend is running: `http://localhost:5000/api/health`
2. Check `REACT_APP_API_URL` in `frontend/.env`
3. Ensure no firewall is blocking port 5000

### ❌ "Email authentication failed"

**Solution:**
1. For Gmail:
   - Enable 2-Step Verification
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Use 16-character app password (not regular password)
2. Check `EMAIL_USER` matches your Gmail address exactly
3. Verify `EMAIL_PASS` is the app password (no spaces)

### ❌ "OTP has expired"

**Solution:**
- This is normal behavior after 5 minutes
- Click "Resend OTP" to get a new code
- Ensure system clock is correct

### ❌ Rate Limiting Errors

**Symptoms:**
- "Too many OTP requests" error

**Solution:**
- Wait 15 minutes before requesting again
- Or adjust rate limits in `backend/middleware/rateLimiter.js`

## Debugging Steps

### 1. Check Backend Logs
```bash
cd backend
npm run dev
# Look for error messages in console
```

### 2. Check Frontend Console
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### 3. Test Backend API Directly
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test send-otp endpoint
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 4. Verify Environment Variables
```bash
# Backend
cd backend
cat .env
# Should see all required variables

# Frontend
cd frontend
cat .env
# Should see REACT_APP_API_URL
```

### 5. Check MongoDB Connection
```bash
# Test MongoDB connection
mongosh mongodb://localhost:27017/signup_db

# Or check MongoDB Atlas connection string
```

## Quick Checklist

- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] MongoDB is running (or MongoDB Atlas is accessible)
- [ ] `backend/.env` file exists with all required variables
- [ ] `frontend/.env` file exists with `REACT_APP_API_URL`
- [ ] Email credentials are correct (Gmail App Password)
- [ ] Ports 3000 and 5000 are not blocked by firewall
- [ ] No CORS errors in browser console
- [ ] Backend logs show "✅ MongoDB connected successfully"
- [ ] Backend logs show "✅ Email service ready"

## Still Having Issues?

1. Check backend console for detailed error messages
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed (`npm install` in both folders)
5. Try restarting both backend and frontend servers
