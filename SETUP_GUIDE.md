# PG-Pal Full-Stack Setup Guide

Complete setup instructions for running PG-Pal with both frontend and backend.

## 📋 Overview

PG-Pal is a complete accommodation management system with:
- **Frontend**: React + TypeScript + Vite (already built)
- **Backend**: Node.js + Express + Supabase + Socket.io (newly created)

---

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- **Node.js** 18+ or **Bun**
- **Supabase** account (free at https://supabase.com)
- **Git** (optional)

### Step 1: Supabase Setup (2 minutes)

1. Go to https://supabase.com and sign up (free tier)
2. Create a new project
3. Go to **Settings → API Keys** and copy:
   - `Project URL`
   - `anon public key`
   - `service_role key` (optional, for admin operations)

### Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with your Supabase credentials
cp .env.example .env
```

**Edit `backend/.env`:**
```env
PORT=5000
NODE_ENV=development

# Supabase (from Step 1)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration (generate a strong secret)
JWT_SECRET=your-super-secret-key-change-me-12345
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 3: Database Schema (1 minute)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **+ New Query**
3. Copy entire contents of `backend/database.sql`
4. Paste into SQL editor and click **Run**
5. Wait for tables to be created ✓

### Step 4: Start Backend

```bash
cd backend
npm run dev
```

Expected output:
```
✓ Supabase connection successful
╔════════════════════════════════════════════════╗
║         PG-Pal Backend Server Running          ║
║  Server: http://localhost:5000                ║
║  API Docs: http://localhost:5000/api           ║
║  WebSocket: ws://localhost:5000                ║
╚════════════════════════════════════════════════╝
```

### Step 5: Start Frontend (in another terminal)

```bash
# From project root
npm install
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## ✅ Verify Everything Works

### Test 1: Admin Login
1. Open http://localhost:5173
2. Click "Admin Login"
3. Register new admin:
   - Email: `admin@test.com`
   - Password: `test123`
   - PG Type: `Boys`
4. Should see admin dashboard ✓

### Test 2: Real-time Updates
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter for "WS"
4. Should see WebSocket connection to `ws://localhost:5000` ✓

### Test 3: Tenant Application
1. Go to http://localhost:5173
2. Click "Join PG"
3. Fill form and submit
4. Admin should see notification in real-time ✓

---

## 📁 Project Structure

```
pg-pal-main (3)/
├── src/                          # Frontend (React)
│   ├── pages/
│   ├── components/
│   ├── store/
│   ├── services/
│   │   └── api.ts               # ← NEW: API client
│   └── types/
│       └── api.ts               # ← NEW: API types
├── backend/                      # ← NEW: Express server
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Database & Socket.io
│   │   ├── middleware/          # Authentication
│   │   └── utils/               # JWT, Password, Supabase
│   ├── package.json
│   ├── database.sql             # ← Database schema
│   └── README.md
├── .env.local                   # ← Frontend env
├── .env.development
└── .env.production
```

---

## 🔌 API Quick Reference

### Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "uuid",
      "email": "admin@test.com",
      "pgType": "boys"
    }
  }
}
```

### Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Submit Tenant Application
```bash
curl -X POST http://localhost:5000/api/tenant/join \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@college.com",
    "phone": "9999999999",
    "gender": "M",
    "college": "XYZ University",
    "department": "CSE",
    "year": 2,
    "pgType": "boys",
    "roomType": "2-sharing",
    "joinDate": "2024-05-01"
  }'
```

See `backend/README.md` for complete API documentation.

---

## 🔐 Security Best Practices

1. **Never commit `.env` files**
   - Added to `.gitignore` ✓
   - Use `.env.example` for reference

2. **JWT Secret**
   - Generate strong secret: `openssl rand -base64 32`
   - Change `JWT_SECRET` in production

3. **Supabase Keys**
   - Use `anon key` for frontend (limited permissions)
   - Use `service_role key` only on backend
   - Enable Row Level Security (RLS) in production

4. **CORS**
   - Only allow frontend URL
   - Update `FRONTEND_URL` in `.env`

5. **Password Hashing**
   - Uses bcrypt (salted, 10 rounds)
   - Never store plaintext passwords

---

## 🛠️ Development Workflow

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Watches for changes, auto-restarts
```

### Terminal 2: Frontend
```bash
npm run dev
# Vite dev server with HMR
```

### Terminal 3: Database (optional)
```bash
# View Supabase dashboard
# https://app.supabase.com → Your Project → SQL Editor
```

---

## 📊 Database Management

### View Database
- Open https://app.supabase.com
- Select your project
- Go to **Table Editor** or **SQL Editor**

### Add Test Data
```sql
-- Create admin user
INSERT INTO admins (email, password, pg_type) VALUES
  ('boys-admin@pgpal.com', '$2b$10$hashedpassword', 'boys'),
  ('girls-admin@pgpal.com', '$2b$10$hashedpassword', 'girls');

-- Create sample rooms (boys)
INSERT INTO rooms (pg_type, room_number, floor, capacity, status) VALUES
  ('boys', '101', 1, 2, 'available'),
  ('boys', '102', 1, 3, 'available'),
  ('boys', '103', 1, 2, 'available');
```

### Backup Database
```bash
# Using Supabase CLI
supabase db pull > backup.sql
```

---

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Check `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Verify internet connection
- Check Supabase project status

### "CORS error" in frontend
- Ensure `FRONTEND_URL` matches your frontend URL
- Default is `http://localhost:5173` ✓

### "WebSocket connection failed"
- Check backend is running on port 5000
- Verify `VITE_WS_URL` is set correctly
- Check browser console for connection errors

### "Token verification failed"
- Regenerate `JWT_SECRET` - make sure it's 32+ characters
- Clear localStorage and login again
- Check token hasn't expired

### "Admin login returns 401"
- Verify email and password are correct
- Check password is hashed (starts with `$2b$`)
- Restart backend after DB changes

---

## 📚 Documentation Links

- **Backend API**: [backend/README.md](backend/README.md)
- **Frontend**: [README.md](README.md)
- **Supabase Docs**: https://supabase.com/docs
- **Express.js**: https://expressjs.com/
- **Socket.io**: https://socket.io/docs/
- **React**: https://react.dev/

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deployment via Vercel dashboard
```

### Backend (Heroku/Railway)
```bash
cd backend
npm run build
npm start
```

Update environment variables on hosting platform.

---

## 💡 Tips

1. **Real-time Development**
   - Keep both terminals open
   - Use DevTools Network tab to monitor API calls
   - Check Console for WebSocket events

2. **Testing APIs**
   - Use VS Code REST Client extension
   - Or use curl/Postman
   - Get token from frontend, use in Authorization header

3. **Debugging**
   - Frontend: DevTools → Console
   - Backend: Terminal output
   - Database: Supabase SQL Editor

4. **Environment Variables**
   - Frontend: `VITE_*` prefix (exposed to client)
   - Backend: Any prefix (secure, not exposed)
   - Always use `.env` (not committed)

---

## 📞 Support

- Check **Setup Issues** in troubleshooting
- Review error messages carefully
- Verify all prerequisites are installed
- Ensure ports 5000 (backend) and 5173 (frontend) are available

---

## 📄 Next Steps

1. ✅ Backend running on http://localhost:5000
2. ✅ Frontend running on http://localhost:5173
3. ✅ Database connected to Supabase
4. ✅ Real-time WebSocket working

Now start building! 🎉
