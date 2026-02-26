# Installation Guide

## Quick Start

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env file with your configuration
# (See Environment Variables section below)

# Start MongoDB (if running locally)
mongod

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env file
# Set REACT_APP_API_URL=http://localhost:5000/api

# Start frontend development server
npm start
```

Frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/signup_db
NODE_ENV=development

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Gmail Setup (for OTP emails)

1. Go to your Google Account settings
2. Enable **2-Step Verification**
3. Go to **App Passwords**: https://myaccount.google.com/apppasswords
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Use it as `EMAIL_PASS` in backend `.env`

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   mongod
   ```
3. Use connection string: `mongodb://localhost:27017/signup_db`

### Option 2: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get connection string
4. Replace `<password>` with your database password
5. Use connection string in `MONGODB_URI`

## Verification

1. Open `http://localhost:3000` in your browser
2. Enter an email address
3. Check your email for the OTP code
4. Enter the OTP code
5. Complete your profile
6. Verify account creation in MongoDB

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify MongoDB port (default: 27017)

**Email Not Sending**
- Verify Gmail app password is correct
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Ensure 2-Step Verification is enabled
- Check email service logs in console

**Port Already in Use**
- Change `PORT` in backend `.env`
- Or stop the process using port 5000

### Frontend Issues

**API Connection Error**
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`
- Check CORS settings in backend

**Build Errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Update `MONGODB_URI` to production database
3. Configure production email service
4. Set `FRONTEND_URL` to production domain
5. Use process manager (PM2): `pm2 start server.js`

### Frontend

1. Build production bundle: `npm run build`
2. Serve `build` folder with static server (Nginx, Apache)
3. Or deploy to Vercel/Netlify
4. Update `REACT_APP_API_URL` to production API URL

## Dependencies

### Backend Dependencies
- express: Web framework
- mongoose: MongoDB ODM
- nodemailer: Email service
- bcrypt: Password hashing
- express-validator: Input validation
- express-rate-limit: Rate limiting
- cors: CORS middleware
- dotenv: Environment variables

### Frontend Dependencies
- react: UI library
- react-dom: React DOM renderer
- react-router-dom: Routing
- axios: HTTP client
- tailwindcss: CSS framework
- autoprefixer: CSS post-processor
- postcss: CSS transformer
