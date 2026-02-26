# Backend Startup Checklist

Use this checklist to ensure your backend starts correctly:

## ✅ Pre-Startup Checklist

- [ ] **Node.js Installed**
  ```bash
  node --version
  # Should be v14 or higher
  ```

- [ ] **Dependencies Installed**
  ```bash
  cd backend
  npm install
  ```

- [ ] **.env File Created**
  ```bash
  # Check if .env exists
  dir .env  # Windows
  ls -la .env  # Mac/Linux
  
  # If not, create it:
  copy .env.example .env  # Windows
  cp .env.example .env  # Mac/Linux
  ```

- [ ] **.env File Configured**
  - [ ] MONGODB_URI is set
  - [ ] EMAIL_USER is set (your Gmail)
  - [ ] EMAIL_PASS is set (Gmail App Password)
  - [ ] PORT is set (default: 5000)

- [ ] **MongoDB Running**
  - [ ] Local MongoDB: `mongod` command running
  - [ ] OR MongoDB Atlas: Connection string is correct

## 🚀 Starting Backend

### Method 1: Using npm script
```bash
cd backend
npm run dev
```

### Method 2: Using start script
**Windows:**
```bash
cd backend
start-backend.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x start-backend.sh
./start-backend.sh
```

## ✅ Success Indicators

When backend starts successfully, you should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

## ❌ Common Errors & Solutions

### Error: "Cannot find module"
**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Error: "MongoDB connection error"
**Solutions:**
1. Check if MongoDB is running:
   ```bash
   # Windows: Check Services
   # Mac/Linux: ps aux | grep mongod
   ```
2. Verify MONGODB_URI in .env
3. For MongoDB Atlas: Check IP whitelist

### Error: "Port 5000 already in use"
**Solutions:**
1. Kill process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```
2. OR change PORT in .env file

### Error: "EMAIL_USER or EMAIL_PASS not set"
**Solution:** Add email credentials to .env file

## 🧪 Testing Backend

After starting, test with:
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

## 📝 Next Steps

Once backend is running:
1. Test email: `npm run test:email`
2. Test database: `npm run test:db`
3. Start frontend in another terminal
