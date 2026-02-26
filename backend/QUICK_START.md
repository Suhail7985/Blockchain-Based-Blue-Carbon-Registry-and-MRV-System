# Backend Quick Start Guide

## Step-by-Step Setup

### 1. Navigate to Backend Folder
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create .env File
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### 4. Edit .env File
Open `.env` and configure:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blue_carbon_db
NODE_ENV=development

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@bluecarbon.gov.in

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 5. Start MongoDB
**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas**
- Use your MongoDB Atlas connection string in `MONGODB_URI`

### 6. Start Backend Server
```bash
npm run dev
```

### Expected Output:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

## Quick Test

Once running, test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"OK","message":"Server is running"}
```

## Common Issues

### Issue: "Cannot find module"
**Fix:** Run `npm install`

### Issue: "MongoDB connection error"
**Fix:** 
- Check if MongoDB is running
- Verify MONGODB_URI in .env

### Issue: "Port 5000 already in use"
**Fix:** Change PORT in .env or kill process using port 5000

### Issue: "EMAIL_USER not set"
**Fix:** Add email credentials to .env file

## Using Start Scripts

**Windows:**
```bash
start-backend.bat
```

**Mac/Linux:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```
