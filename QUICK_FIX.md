# Quick Fix Guide

## ✅ Backend is Running!

Your backend server is working correctly. The issue is likely with **email configuration**.

## Step 1: Check Email Configuration

Run this test to check if email is configured:

```bash
cd backend
npm run test:email
```

This will tell you if:
- ✅ Email credentials are set
- ✅ Email can be sent successfully
- ❌ What's wrong with the configuration

## Step 2: Common Fixes

### If you see "EMAIL_USER or EMAIL_PASS is not set":

1. Make sure `backend/.env` file exists:
   ```bash
   cd backend
   ls -la .env
   ```

2. If it doesn't exist, create it:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your email credentials:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### For Gmail Users:

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Signup App" as the name
   - Copy the 16-character password

3. **Update `.env` file:**
   ```env
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx  # The 16-char app password (no spaces)
   ```

4. **Restart backend:**
   ```bash
   # Stop backend (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## Step 3: Test Again

After updating `.env`, test email:
```bash
npm run test:email
```

You should see: ✅ SUCCESS! Email sent successfully

## Step 4: Test Database (Optional)

If email works but you still have issues:
```bash
npm run test:db
```

## Still Not Working?

Check the backend console when you try to send OTP. Look for:
- ❌ Error messages
- ⚠️ Warning messages
- ✅ Success messages

Common errors:
- `EAUTH` = Wrong email/password
- `ECONNECTION` = Can't connect to email server
- `MongoNetworkError` = MongoDB not running

## Quick Checklist

- [ ] `backend/.env` file exists
- [ ] `EMAIL_USER` is set in `.env`
- [ ] `EMAIL_PASS` is set in `.env` (Gmail App Password)
- [ ] Backend restarted after updating `.env`
- [ ] `npm run test:email` shows success
