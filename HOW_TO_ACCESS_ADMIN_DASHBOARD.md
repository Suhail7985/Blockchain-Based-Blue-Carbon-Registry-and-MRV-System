# 🔐 How to Access Admin Dashboard

## 📋 Quick Guide

### Step 1: Start the Application

1. **Start Backend Server**:
   ```bash
   cd backend
   npm start
   ```
   Server will run on `http://localhost:5000`

2. **Start Frontend Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

---

## 🎯 How to Login as Admin

### Method 1: Login with Admin Email (Easiest)

1. **Open the application** in your browser:
   ```
   http://localhost:5173
   ```

2. **Click on "Login"** (if not already on login page)

3. **Enter Admin Credentials**:
   - **Email**: Any email that contains `admin` (case-insensitive)
     - Examples:
       - `admin@example.com`
       - `admin@gmail.com`
       - `adminuser@test.com`
       - `testadmin@example.com`
   - **Password**: Any password (currently mock authentication)

4. **Click "Sign In"**

5. **You're now logged in as Admin!** ✅

### Method 2: Register as Admin

1. **Click "Register here"** on the login page

2. **Fill in the registration form**:
   - **Email**: Any email containing `admin` (e.g., `admin@example.com`)
   - **Name**: Your name
   - **Role**: Select any role (admin role is determined by email)
   - **Organization**: Your organization name
   - **Phone**: Your phone number

3. **Click "Register"**

4. **You're now registered and logged in as Admin!** ✅

---

## 🎛️ Admin Features Available

Once logged in as admin, you'll see:

### 1. **Dashboard** (Available to All Users)
- View all plantation statistics
- See total area, trees, carbon sequestered
- View all plantations in a table
- **Access**: Click "Dashboard" in navigation

### 2. **Verification** (Admin Only) 🔒
- Review pending plantation verifications
- Approve or reject plantations
- Add verification notes
- **Access**: Click "Verification" in navigation (only visible to admins)

### 3. **Users** (Admin Only) 🔒
- View all registered users
- Filter users by role
- Search users
- Manage user accounts
- **Access**: Click "Users" in navigation (only visible to admins)

### 4. **Submit Data** (Available to All Users)
- Submit new plantation data
- View recent submissions
- **Access**: Click "Submit Data" in navigation

### 5. **My Plantations** (Available to All Users)
- View your own plantations
- Filter by status
- **Access**: Click "My Plantations" in navigation

### 6. **Profile** (Available to All Users)
- View your profile
- Edit profile information
- **Access**: Click user avatar → "Profile"

---

## 🔍 How Admin Role is Determined

### Backend Logic (Mock Authentication)

The backend assigns admin role based on email:

```javascript
// In backend/controllers/authController.js
role: email.includes('admin') ? 'admin' : 'ngo'
```

**Rules**:
- ✅ Email contains `admin` → Admin role
- ❌ Email doesn't contain `admin` → NGO role (or other roles)

### Frontend Logic

The frontend checks admin status:

```javascript
// In frontend/src/contexts/AuthContext.jsx
const isAdmin = () => user?.role === 'admin';
```

**Admin-only features are shown when**:
- `isAdmin()` returns `true`
- User role is exactly `'admin'`

---

## 🎨 What You'll See as Admin

### Navigation Bar (Admin View)

```
[🌍 Blue Carbon Registry]  [Dashboard] [Submit Data] [My Plantations] [Verification] [Users]  [👤 User Avatar]
```

**Admin-Only Tabs**:
- ✅ **Verification** - Review and approve plantations
- ✅ **Users** - Manage users

### Navigation Bar (Regular User View)

```
[🌍 Blue Carbon Registry]  [Dashboard] [Submit Data] [My Plantations]  [👤 User Avatar]
```

**Regular users don't see**:
- ❌ Verification tab
- ❌ Users tab

---

## 📊 Admin Dashboard Features

### Dashboard Statistics

1. **Total Area**: Sum of all plantation areas (hectares)
2. **Total Trees Planted**: Sum of all trees planted
3. **Carbon Sequestration**: Total carbon sequestered (tons/year)
4. **Active Projects**: Total number of plantations

### Plantation Table

- View all plantations
- See plantation details:
  - Plantation name
  - Location
  - Area (hectares)
  - Tree count
  - Carbon sequestered (tons/year)

---

## 🔐 Admin-Only Features

### 1. Verification Page

**Features**:
- View all pending verifications
- Click on a plantation to see details
- Approve or reject plantations
- Add verification notes
- Update plantation status

**How to Use**:
1. Click "Verification" in navigation
2. See list of pending plantations
3. Click on a plantation to view details
4. Click "Approve" or "Reject"
5. Add verification notes (optional)
6. Plantation status is updated

### 2. User Management Page

**Features**:
- View all registered users
- Filter users by role (NGO, Community, Panchayat, Admin)
- Search users by name or email
- View user details
- Manage user accounts

**How to Use**:
1. Click "Users" in navigation
2. See list of all users
3. Filter by role using buttons
4. Search users using search box
5. Click on a user to view details

---

## 🧪 Test Admin Access

### Quick Test

1. **Login as Admin**:
   - Email: `admin@test.com`
   - Password: `password123` (any password works)
   - Click "Sign In"

2. **Verify Admin Access**:
   - ✅ You should see "Verification" tab in navigation
   - ✅ You should see "Users" tab in navigation
   - ✅ User avatar shows your role as "admin"

3. **Test Admin Features**:
   - Click "Verification" → Should see verification page
   - Click "Users" → Should see user management page
   - Click "Dashboard" → Should see dashboard with statistics

---

## 🔧 Troubleshooting

### Problem: Admin tabs not showing

**Solution**:
1. Check if email contains `admin` (case-insensitive)
2. Logout and login again
3. Clear browser cache and localStorage
4. Check browser console for errors

### Problem: Cannot login

**Solution**:
1. Make sure backend server is running on `http://localhost:5000`
2. Make sure frontend server is running on `http://localhost:5173`
3. Check browser console for errors
4. Try logging in with a different admin email

### Problem: Admin features not working

**Solution**:
1. Check if you're logged in as admin (check user role in profile)
2. Logout and login again with admin email
3. Clear browser cache
4. Check backend server logs for errors

---

## 📝 Example Admin Credentials

### Test Accounts

**Admin Account 1**:
- Email: `admin@example.com`
- Password: `admin123`
- Role: Admin

**Admin Account 2**:
- Email: `adminuser@test.com`
- Password: `test123`
- Role: Admin

**Regular User Account**:
- Email: `user@example.com`
- Password: `user123`
- Role: NGO

---

## 🎯 Summary

### To Access Admin Dashboard:

1. ✅ **Start backend and frontend servers**
2. ✅ **Login with email containing `admin`**
3. ✅ **Click "Dashboard" in navigation** (available to all users)
4. ✅ **Admin-only features**: Click "Verification" or "Users" tabs

### Admin Features:

- ✅ **Dashboard**: View all plantation statistics
- ✅ **Verification**: Approve/reject plantations (Admin Only)
- ✅ **Users**: Manage users (Admin Only)
- ✅ **Submit Data**: Submit new plantations
- ✅ **My Plantations**: View your plantations
- ✅ **Profile**: View/edit your profile

---

## 🚀 Quick Start Commands

```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Then open browser:
# http://localhost:5173

# Login with:
# Email: admin@example.com
# Password: any password
```

---

**That's it! You now have full access to the Admin Dashboard!** 🎉

For more information, see:
- `backend/HOW_IT_WORKS.md` - How the backend works
- `PROJECT_ANALYSIS.md` - Project analysis
- `START_HERE.md` - Getting started guide


