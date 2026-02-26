# Backend Setup - Quick Guide

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Create .env File
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### Step 3: Configure .env
Edit `.env` file and add:
- `MONGODB_URI` - Your MongoDB connection string
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASS` - Gmail App Password (not regular password)

### Step 4: Start MongoDB
**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas**
- Use your Atlas connection string in `MONGODB_URI`

### Step 5: Run Diagnostic (Optional)
```bash
npm run check
```

This will check:
- ✅ Node.js version
- ✅ Dependencies installed
- ✅ .env file exists
- ✅ Required files present

### Step 6: Start Backend
```bash
npm run dev
```

## ✅ Expected Output

When backend starts successfully:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

## ❌ Troubleshooting

### Backend won't start?

1. **Run diagnostic:**
   ```bash
   npm run check
   ```

2. **Check common issues:**
   - Dependencies not installed → `npm install`
   - .env file missing → `copy .env.example .env`
   - MongoDB not running → Start MongoDB
   - Port 5000 in use → Change PORT in .env

3. **See detailed guide:**
   - `BACKEND_TROUBLESHOOTING.md` - Detailed troubleshooting
   - `CHECKLIST.md` - Startup checklist
   - `QUICK_START.md` - Step-by-step guide

## 📝 Environment Variables

Required in `.env`:
- `MONGODB_URI` - MongoDB connection string
- `EMAIL_USER` - Gmail address
- `EMAIL_PASS` - Gmail App Password
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL (default: http://localhost:3000)

## 🧪 Testing

```bash
# Test database connection
npm run test:db

# Test email configuration
npm run test:email

# Test API health
curl http://localhost:5000/api/health
```

## 📚 More Help

- `BACKEND_TROUBLESHOOTING.md` - Complete troubleshooting guide
- `QUICK_START.md` - Detailed setup instructions
- `CHECKLIST.md` - Startup checklist
