# Backend Troubleshooting Guide

## Quick Fixes

### 1. Check if Dependencies are Installed

```bash
cd backend
npm install
```

If you see errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Check if .env File Exists

```bash
cd backend
dir .env
# or on Mac/Linux:
ls -la .env
```

If it doesn't exist:
```bash
copy .env.example .env
# or on Mac/Linux:
cp .env.example .env
```

Then edit `.env` and add your configuration.

### 3. Check MongoDB Connection

**Option A: Local MongoDB**
```bash
# Check if MongoDB is running
# Windows: Check Services
# Mac/Linux: 
ps aux | grep mongod

# Start MongoDB if not running
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Make sure your `MONGODB_URI` in `.env` is correct
- Check if your IP is whitelisted in MongoDB Atlas

### 4. Common Error Messages

#### "Cannot find module"
**Solution:** Run `npm install` in backend folder

#### "MongoDB connection error"
**Solution:** 
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check network/firewall settings

#### "Port 5000 already in use"
**Solution:**
```bash
# Windows: Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
```

#### "EMAIL_USER or EMAIL_PASS not set"
**Solution:** Add email credentials to `.env` file

### 5. Test Backend Step by Step

```bash
# Step 1: Install dependencies
cd backend
npm install

# Step 2: Check if .env exists
dir .env

# Step 3: Test database connection
npm run test:db

# Step 4: Test email configuration
npm run test:email

# Step 5: Start server
npm run dev
```

### 6. Expected Output When Running

When you run `npm run dev`, you should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

If you see errors, check the error message and refer to solutions above.

### 7. Check Node.js Version

Make sure you have Node.js v14 or higher:
```bash
node --version
```

If version is too old, update Node.js from nodejs.org

### 8. Windows-Specific Issues

If you're on Windows and having issues:
- Make sure you're using PowerShell or Command Prompt (not Git Bash for npm commands)
- Try running as Administrator if permission errors occur
- Check if antivirus is blocking Node.js

### 9. Still Not Working?

1. Check backend console for error messages
2. Verify all files exist:
   - server.js
   - routes/auth.js
   - models/User.js
   - models/TempUser.js
   - utils/emailService.js
   - middleware/rateLimiter.js
3. Check if port 5000 is accessible:
   ```bash
   curl http://localhost:5000/api/health
   ```
