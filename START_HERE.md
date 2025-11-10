# 🚀 How to Start Blue Carbon Registry

## Quick Start Guide

Follow these steps to run the application:

---

## 📋 Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local MongoDB installation, OR
   - MongoDB Atlas account (cloud database)

---

## 🔧 Step 1: Setup Backend

### 1.1 Navigate to backend folder
```bash
cd backend
```

### 1.2 Install dependencies (if not already installed)
```bash
npm install
```

### 1.3 Configure MongoDB Connection

**Option A: Local MongoDB**
- Make sure MongoDB is running locally
- No configuration needed (uses default: `mongodb://localhost:27017/blue-carbon-registry`)

**Option B: MongoDB Atlas (Cloud)**
1. Create a `.env` file in the `backend` folder:
```bash
# Create .env file
touch .env
```

2. Add your MongoDB Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blue-carbon-registry
PORT=5000
```

### 1.4 Start Backend Server
```bash
npm start
```

**Expected Output:**
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
📊 Health check: http://localhost:5000/api/health
📝 API endpoints: http://localhost:5000/api/plantations
```

**✅ Backend is running when you see:** "Server running on http://localhost:5000"

---

## 🎨 Step 2: Setup Frontend

### 2.1 Open a NEW terminal window
(Keep the backend running in the first terminal)

### 2.2 Navigate to frontend folder
```bash
cd frontend
```

### 2.3 Install dependencies (if not already installed)
```bash
npm install
```

### 2.4 Start Frontend Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Frontend is running when you see:** Local server URL (usually http://localhost:5173)

---

## 🌐 Step 3: Access the Application

1. **Open your browser**
2. **Navigate to:** `http://localhost:5173`
3. **You should see:**
   - 🌍 Blue Carbon Registry header
   - Navigation buttons (📝 Submit Data, 📊 Dashboard)
   - Form to submit plantation data

---

## ✅ Verification Checklist

### Backend Verification:
- [ ] Backend server shows "Server running on http://localhost:5000"
- [ ] MongoDB connection successful (no errors)
- [ ] Can access: http://localhost:5000/api/health
- [ ] Returns JSON: `{"status":"OK","message":"Blue Carbon Registry API is running"}`

### Frontend Verification:
- [ ] Frontend loads at http://localhost:5173
- [ ] No console errors (Press F12 → Console tab)
- [ ] Navigation buttons work
- [ ] Form displays correctly
- [ ] Can submit plantation data
- [ ] Data appears in Recent Submissions

---

## 🐛 Troubleshooting

### Issue 1: Backend won't start
**Error:** `MongoDB connection error`

**Solution:**
- Check if MongoDB is running: `mongosh` (or `mongo` in older versions)
- If using MongoDB Atlas, verify connection string in `.env` file
- Make sure MongoDB service is started (Windows: Services, Mac/Linux: `sudo systemctl start mongod`)

### Issue 2: Frontend can't connect to backend
**Error:** `Failed to fetch` or `Backend may not be running`

**Solution:**
- Make sure backend is running on port 5000
- Check backend terminal for errors
- Verify backend health: http://localhost:5000/api/health
- Check browser console (F12) for CORS errors

### Issue 3: Port already in use
**Error:** `Port 5000 is already in use` or `Port 5173 is already in use`

**Solution:**
- Close other applications using these ports
- Or change port in:
  - Backend: Set `PORT=5001` in `.env` file (and update frontend API URL)
  - Frontend: `npm run dev -- --port 5174`

### Issue 4: Dependencies not installed
**Error:** `Cannot find module` or `module not found`

**Solution:**
```bash
# In backend folder
cd backend
npm install

# In frontend folder
cd frontend
npm install
```

### Issue 5: Tailwind CSS not working
**Symptoms:** No styling, plain HTML

**Solution:**
- Make sure `postcss.config.js` exists in frontend folder
- Make sure `tailwind.config.js` exists in frontend folder
- Check `index.css` has Tailwind directives
- Restart frontend server: `Ctrl+C` then `npm run dev`

---

## 📁 Project Structure

```
blue-carbon-registry/
├── backend/
│   ├── server.js          # Backend server (Express + MongoDB)
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables (create this)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main app component
│   │   ├── components/   # React components
│   │   └── pages/        # Page components
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
│
└── START_HERE.md         # This file
```

---

## 🔗 Important URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health
- **Plantations API:** http://localhost:5000/api/plantations

---

## 🎯 Next Steps

1. **Test the Application:**
   - Submit a test plantation
   - Check it appears in Recent Submissions
   - View statistics in Dashboard

2. **Development:**
   - Backend API endpoints are ready
   - Frontend components are fixed and working
   - Ready for Smart India Hackathon (SIH) 2025

3. **Future Enhancements:**
   - Add authentication
   - Integrate blockchain smart contracts
   - Add data verification features
   - Deploy to production

---

## 💡 Tips

- **Keep both terminals open:** One for backend, one for frontend
- **Check console logs:** Both backend and browser console (F12)
- **Hot Reload:** Frontend auto-reloads on file changes
- **API Testing:** Use Postman or browser to test: http://localhost:5000/api/plantations

---

## 🆘 Need Help?

1. Check the Troubleshooting section above
2. Verify all prerequisites are installed
3. Check console logs for specific error messages
4. Ensure MongoDB is running and accessible

---

**🎉 You're all set! Start coding and good luck with SIH 2025!**

