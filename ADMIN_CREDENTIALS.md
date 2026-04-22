# Admin Credentials for PG Pal

## 🔐 Admin Login Credentials

**Email:** `guesthubpg@gmail.com`  
**Password:** `Guesthub117`

---

## 🌐 How to Access

### Admin Dashboard (Boys PG)
1. Navigate to: `http://localhost:5173/admin/login`
2. Enter email: `guesthubpg@gmail.com`
3. Enter password: `Guesthub117`
4. Click "Login"

### Admin Dashboard (Girls PG)
1. After logging in to Boys PG dashboard
2. Click the "Girls PG" button in the top navigation
3. You'll be redirected to Girls PG admin dashboard

---

## 📊 What You Can Do with Admin Account

### Joiner Management
- ✅ View pending joiner applications
- ✅ Approve joiners and assign rooms
- ✅ Reject applications
- ✅ View application details

### Tenant Management
- ✅ View all active tenants
- ✅ Update tenant presence status
- ✅ Shift tenants between rooms
- ✅ Vacate tenants
- ✅ View tenant profiles

### Room Management
- ✅ View all rooms and their status
- ✅ See room occupancy
- ✅ Create new rooms
- ✅ Update room capacity

### Payment Tracking
- ✅ View all payments
- ✅ Mark payments as received
- ✅ Track payment status
- ✅ View payment history

### Leave Management
- ✅ View leave requests
- ✅ Approve leave requests
- ✅ Reject leave requests

---

## 🔧 Setup Instructions (First Time)

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
Backend will run on: `http://localhost:5000`

### 2. Start Frontend Dev Server (New Terminal)
```bash
cd pg-pal-main
npm install
npm run dev
```
Frontend will run on: `http://localhost:5173`

### 3. Create Admin Account (One-time setup)
```bash
cd backend
npx tsx setup-admin.ts
```

Expected output:
```
Creating test admin account...
✅ Admin account created successfully
```

### 4. Login with Admin Credentials
Navigate to: `http://localhost:5173/admin/login`

---

## 🧪 Testing Features

### Test Joiner Workflow
1. Open `http://localhost:5173/join`
2. Submit a joiner application
3. Go to Admin Dashboard
4. Approve the application and assign a room
5. The joiner will receive credentials to login

### Test Payment Tracking
1. Login as Admin
2. Go to "Payments" tab
3. View payment history and statuses

### Test Tenant Management
1. Login as Admin
2. Go to "Tenants" tab
3. View all active tenants
4. Try shifting a tenant to another room
5. Try updating presence status

---

## 🔑 Important Notes

- **Never share** these credentials publicly
- **Change password** after first login for security
- The admin account has access to **both Boys and Girls PG** dashboards
- You can switch between Boys/Girls PG using the dashboard button

---

## 📧 Credentials Storage

All credentials have been updated in:
- ✅ Backend setup files
- ✅ Test files
- ✅ Configuration files
- ✅ Documentation

### Files Updated
- `backend/setup-admin.ts`
- `backend/debug-api.ts`
- `backend/debug-rooms.ts`
- `backend/e2e-*.ts` (all test files)
- `backend/seed*.ts` (all seed files)
- `backend/src/routes/dev.ts`
- `backend/.env`
- `TESTING_GUIDE.md`
- `PROJECT_STATUS.md`
- `SETUP_GUIDE.md`

---

## 🆘 Troubleshooting

### Admin Login Fails
1. Make sure backend server is running on `http://localhost:5000`
2. Check if database is connected (Supabase)
3. Verify credentials are exactly: `guesthubpg@gmail.com` / `Guesthub117`

### Admin Account Not Found
1. Run setup script: `npx tsx backend/setup-admin.ts`
2. Check backend console for success message
3. Refresh page and try again

### Password Not Working
1. Check you're using: `Guesthub117` (not Guesthub117)
2. Verify Caps Lock is off
3. Copy-paste from this document if needed

---

## 🔄 Environment Configuration

The following `.env` variables are configured:

### Backend (.env)
```
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://hvhbstvgegawlzyzqfrr.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=supersecretkey12345678901234567890
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

---

## ✅ Verification Checklist

After setting up, verify:
- [ ] Backend server starts without errors
- [ ] Frontend dev server starts without errors
- [ ] Can navigate to `http://localhost:5173/admin/login`
- [ ] Can login with `guesthubpg@gmail.com` / `Guesthub117`
- [ ] Admin dashboard loads with data
- [ ] Can see "Joiners", "Tenants", "Rooms", "Payments" tabs
- [ ] Can switch to Girls PG dashboard

---

## 📞 Support

For issues with credentials or setup, check:
1. This document (`ADMIN_CREDENTIALS.md`)
2. Backend README (`backend/README.md`)
3. Testing Guide (`TESTING_GUIDE.md`)
4. Project Status (`PROJECT_STATUS.md`)
