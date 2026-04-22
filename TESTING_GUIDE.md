# PG-Pal System - Manual Integration Test Guide

## ✅ Quick Verification Checklist

### 1. **Create Sample Rooms** (Optional - if not already done)
Go to Supabase SQL Editor and run:
```sql
INSERT INTO public.rooms (pg_type, room_number, floor, capacity, occupants, rent, deposit, status, created_at, updated_at) 
VALUES 
  ('boys', '101', 1, 2, 0, 5000, 10000, 'available', NOW(), NOW()),
  ('boys', '102', 1, 2, 0, 5000, 10000, 'available', NOW(), NOW()),
  ('boys', '103', 1, 3, 0, 7500, 15000, 'available', NOW(), NOW()),
  ('girls', '101', 1, 2, 0, 5500, 11000, 'available', NOW(), NOW()),
  ('girls', '102', 1, 2, 0, 5500, 11000, 'available', NOW(), NOW());
```

### 2. **Test Admin Dashboard**
- [ ] Navigate to: http://localhost:5173/admin/dashboard
- [ ] Login with your credentials
- [ ] Verify dashboard loads with statistics
- [ ] Check both Boys PG and Girls PG tabs

### 3. **Test Girls Admin Dashboard**
- [ ] Navigate to: http://localhost:5173/admin/girls-dashboard
- [ ] Should show girls PG statistics

### 4. **Verify WebSocket Connection**
Open http://localhost:5173 and check Browser DevTools:
1. Press `F12` → Network tab
2. Filter by `WS` (WebSocket)
3. You should see a connection to `ws://localhost:5000`
4. Status should be `101 Switching Protocols`

### 5. **Test API Endpoints** (using curl or Postman)

**Get Dashboard Stats:**
```bash
curl -X GET http://localhost:5000/api/admin/stats?pgType=boys \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Get Rooms:**
```bash
curl -X GET http://localhost:5000/api/admin/rooms?pgType=boys \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Get Pending Joiners:**
```bash
curl -X GET http://localhost:5000/api/admin/joiners?pgType=boys \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 6. **Test Tenant UI**
- [ ] Navigate to: http://localhost:5173/join
- [ ] Fill out joiner application form
- [ ] Submit application
- [ ] Check if websocket broadcasts the event (browser console)

### 7. **Test Tenant Login**
- [ ] Navigate to: http://localhost:5173/login
- [ ] Should display login form

## 📊 System Status

**Backend Server:**
- ✓ Running on http://localhost:5000
- ✓ WebSocket enabled
- ✓ Database connected to Supabase

**Frontend App:**
- ✓ Running on http://localhost:5173
- ✓ All pages accessible
- ✓ Admin authentication working

**Database:**
- ✓ PostgreSQL via Supabase
- ✓ All tables created
- ✓ RLS disabled (development mode)
- ✓ Sample data ready to create

## 🔑 Credentials
- **Admin Email:** guesthubpg@gmail.com
- **Admin Password:** Guesthub117

## 📝 API Endpoints Reference

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/admin/register` - Admin registration (dev only)
- `POST /api/auth/verify-token` - Verify JWT token

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/rooms` - List rooms
- `GET /api/admin/joiners` - List pending joiners
- `GET /api/admin/tenants` - List active tenants
- `POST /api/admin/rooms` - Create room
- `POST /api/admin/approve` - Approve joiner

### Tenant Endpoints
- `POST /api/tenant/join` - Submit application
- `GET /api/tenant/profile/:id` - Get profile
- `GET /api/tenant/payments/:id` - Get payments
- `GET /api/tenant/leaves/:id` - Get leaves

## 🚀 Next Steps

1. ✅ Create sample rooms (use SQL above)
2. ✅ Test admin login → dashboard
3. ✅ Verify WebSocket in browser DevTools
4. ✅ Submit a test joiner application
5. ✅ Check real-time notifications in admin panel

## 📞 Troubleshooting

**Admin login fails:**
- Verify RLS is disabled in Supabase
- Check admin@pgpal.com exists in database
- Ensure password is correct

**WebSocket not connecting:**
- Check browser console for errors
- Verify backend is running on port 5000
- Check CORS settings in backend

**Rooms not showing:**
- Run the seed SQL in Supabase SQL Editor
- Refresh the admin dashboard
- Check browser Network tab for API errors

---

**System is ready for testing!** 🎉
