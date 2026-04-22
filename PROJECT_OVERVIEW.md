# PG-Pal: Complete Accommodation Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-yellow)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7+-red)](https://socket.io/)

A modern, real-time accommodation management system for student hostels (PGs) with separate facilities for boys and girls, built with React, Node.js, Express, and Supabase.

## 🎯 Features

### For Tenants
- ✅ Apply for accommodation with document uploads
- ✅ Real-time application status tracking
- ✅ View room assignment and room-mate details
- ✅ Track monthly rent payments and payment history
- ✅ Download payment receipts
- ✅ Request leaves and manage presence
- ✅ View personal profile and occupancy details

### For Admins
- ✅ Review and approve/reject tenant applications
- ✅ Assign rooms to approved tenants
- ✅ Real-time dashboard with statistics
- ✅ Manage active tenants (shift rooms, mark vacate)
- ✅ Track and manage payments
- ✅ Configure room capacity (2 or 3 sharing)
- ✅ Presence tracking (present/on-leave)
- ✅ View complete payment and occupancy reports

### Technical Features
- ✅ Real-time updates with WebSocket (Socket.io)
- ✅ JWT-based authentication
- ✅ Separate admin dashboards for boys and girls PGs
- ✅ Responsive UI with Tailwind CSS + shadcn-ui
- ✅ Type-safe with TypeScript
- ✅ PostgreSQL database with Supabase
- ✅ RESTful API with Express
- ✅ Form validation with Zod

## 📦 Project Structure

```
pg-pal-main (3)/
│
├── 📂 src/                          # Frontend (React + TypeScript)
│   ├── 📂 pages/                    # Page components
│   │   ├── Index.tsx                # Landing page
│   │   ├── Join.tsx                 # Tenant application
│   │   ├── Login.tsx                # Tenant login
│   │   ├── Dashboard.tsx            # Tenant dashboard
│   │   ├── Payment.tsx              # Payment page
│   │   ├── AdminLogin.tsx           # Admin login
│   │   ├── NotFound.tsx             # 404 page
│   │   └── admin/
│   │       ├── AdminDashboard.tsx   # Boys PG admin
│   │       └── GirlsAdminDashboard.tsx # Girls PG admin
│   │
│   ├── 📂 components/               # Reusable components
│   │   ├── 📂 layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── 📂 ui/                   # shadcn-ui components (38+)
│   │   ├── ApprovalDetailsDialog.tsx
│   │   ├── TenantProfileDialog.tsx
│   │   ├── PaymentReceipt.tsx
│   │   └── NavLink.tsx
│   │
│   ├── 📂 store/                    # Zustand state management
│   │   ├── pgStore.ts               # Boys PG store (localStorage)
│   │   └── girlsPGStore.ts          # Girls PG store (localStorage)
│   │
│   ├── 📂 services/
│   │   └── api.ts                   # 🆕 API client library
│   │
│   ├── 📂 types/
│   │   ├── index.ts
│   │   └── api.ts                   # 🆕 API TypeScript types
│   │
│   ├── 📂 hooks/                    # Custom React hooks
│   ├── 📂 lib/                      # Utilities
│   ├── 📂 test/                     # Tests
│   ├── App.tsx                      # Main router
│   └── main.tsx
│
├── 📂 backend/                      # 🆕 Express Backend
│   ├── 📂 src/
│   │   ├── 📂 routes/
│   │   │   ├── auth.ts              # /api/auth/* endpoints
│   │   │   ├── tenant.ts            # /api/tenant/* endpoints
│   │   │   └── admin.ts             # /api/admin/* endpoints
│   │   │
│   │   ├── 📂 services/
│   │   │   ├── database.ts          # Database operations (Supabase)
│   │   │   └── socket.ts            # WebSocket handling (Socket.io)
│   │   │
│   │   ├── 📂 middleware/
│   │   │   └── auth.ts              # JWT authentication
│   │   │
│   │   ├── 📂 utils/
│   │   │   ├── jwt.ts               # JWT utilities
│   │   │   ├── password.ts          # Password hashing (bcrypt)
│   │   │   └── supabase.ts          # Supabase client
│   │   │
│   │   ├── 📂 types/
│   │   │   ├── index.ts             # Database types
│   │   │   └── express.ts           # Express extensions
│   │   │
│   │   └── index.ts                 # Express server entry
│   │
│   ├── package.json                 # Backend dependencies
│   ├── tsconfig.json
│   ├── database.sql                 # 🆕 PostgreSQL schema
│   ├── .env.example
│   └── README.md                    # Backend documentation
│
├── 📄 SETUP_GUIDE.md                # 🆕 Complete setup instructions
├── 📄 API_INTEGRATION_EXAMPLES.md   # 🆕 Frontend integration examples
├── .env.local                       # 🆕 Frontend env (local)
├── .env.development                 # 🆕 Frontend env (dev)
├── .env.production                  # 🆕 Frontend env (prod)
├── package.json                     # Frontend dependencies
├── tsconfig.json
├── vite.config.ts
└── README.md                        # Frontend documentation
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ or **Bun**
- **Supabase** account (free at https://supabase.com)
- **Git** (optional)

### 1. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Setup database
# - Copy entire contents of database.sql
# - Paste in Supabase SQL Editor
# - Execute to create all tables

# Start backend
npm run dev
```

Backend runs at: http://localhost:5000

### 2. Frontend Setup (2 minutes)

```bash
# From project root
npm install

# Configure environment (already has defaults)
# .env.local already configured for local development

# Start frontend
npm run dev
```

Frontend runs at: http://localhost:5173

### 3. Verify Setup

- ✅ Visit http://localhost:5173
- ✅ Click "Admin Login" and register new admin
- ✅ Should see WebSocket connection in DevTools
- ✅ Submit tenant application, see real-time notification

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.

## 🏗️ Architecture

### Frontend Architecture
```
React Components (UI)
         ↓
     Zustand Store (State)  ← Migrating to backend
         ↓
   API Client Service (src/services/api.ts)
         ├─ HTTP Requests (REST API)
         └─ WebSocket Events (Real-time)
         ↓
   Backend Express Server
         ↓
   Supabase PostgreSQL
```

### Backend Architecture
```
Express Server (Port 5000)
    ├─ HTTP Routes
    │   ├─ /api/auth/*       (Authentication)
    │   ├─ /api/tenant/*     (Tenant operations)
    │   └─ /api/admin/*      (Admin operations)
    │
    ├─ WebSocket Server (Socket.io)
    │   ├─ Real-time events
    │   ├─ Broadcast updates
    │   └─ Notifications
    │
    ├─ Database Service
    │   ├─ CRUD operations
    │   └─ Supabase client
    │
    └─ Authentication
        ├─ JWT tokens
        └─ Password hashing
        
         ↓
    Supabase PostgreSQL (Database)
```

## 📊 Database Schema

### Core Tables
- **admins** - Admin users (boys & girls)
- **joiners** - New applications (pending approval)
- **tenants** - Active tenants
- **rooms** - Room inventory (58 boys, 32 girls)
- **payments** - Monthly rent payments
- **leaves** - Leave requests
- **past_tenants** - Vacated tenant history

### Room Structure
```
Boys PG:    7 floors, 58 rooms (9-9-9-9-9-9-4)
Girls PG:   6 floors, 32 rooms (6-6-6-6-6-2)
Capacity:   2-sharing or 3-sharing per room
```

### Pricing
```
Boys PG:    2-sharing ₹9,000  |  3-sharing ₹7,500
Girls PG:   2-sharing ₹9,500  |  3-sharing ₹8,000
Deposit:    Usually 2x monthly rent
```

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/admin/login       - Login admin
POST /api/auth/admin/register    - Register admin
POST /api/auth/verify-token      - Verify JWT token
```

### Tenant Routes
```
POST   /api/tenant/join                 - Submit application
GET    /api/tenant/profile/:tenantId    - Get profile
GET    /api/tenant/payments/:tenantId   - Payment history
POST   /api/tenant/leaves/:tenantId     - Request leave
GET    /api/tenant/leaves/:tenantId     - Get leaves
```

### Admin Routes
```
GET    /api/admin/stats                        - Dashboard stats
GET    /api/admin/joiners                      - Pending applications
POST   /api/admin/joiners/:joinerId/approve    - Approve application
POST   /api/admin/joiners/:joinerId/reject     - Reject application
GET    /api/admin/tenants                      - Get all tenants
GET    /api/admin/tenants/:tenantId            - Tenant details
PATCH  /api/admin/tenants/:tenantId/presence   - Update presence
POST   /api/admin/tenants/:tenantId/vacate     - Vacate tenant
POST   /api/admin/tenants/:tenantId/shift      - Shift room
GET    /api/admin/rooms                        - Get rooms
PATCH  /api/admin/rooms/:roomId/capacity       - Update capacity
GET    /api/admin/payments                     - Get payments
POST   /api/admin/payments/:paymentId/mark-paid - Mark paid
```

## 🔌 WebSocket Events

### Listen Events
```javascript
socket.on('joiner:new', data)              // New application
socket.on('joiner:approved', data)         // Application approved
socket.on('tenant:left', data)             // Tenant vacated
socket.on('presence:changed', data)        // Presence updated
socket.on('payment:recorded', data)        // Payment made
socket.on('room:updated', data)            // Room changed
socket.on('notification:received', data)   // Notification
```

### Emit Events
```javascript
socket.emit('joiner:submitted', data)      // New application
socket.emit('tenant:vacated', data)        // Mark vacated
socket.emit('presence:updated', data)      // Update presence
socket.emit('payment:made', data)          // Record payment
socket.emit('room:capacityUpdated', data)  // Change capacity
```

## 💡 Usage Examples

### Admin Login & Real-time Dashboard
```typescript
import { pgpalAPI } from '@/services/api';

// 1. Login
const { token, admin } = await pgpalAPI.adminLogin(email, password);

// 2. Connect WebSocket
await pgpalAPI.connectSocket();

// 3. Listen to real-time events
pgpalAPI.onJoinerSubmitted((data) => {
  console.log('New application received!', data);
});

// 4. Fetch data
const stats = await pgpalAPI.getDashboardStats();
const joiners = await pgpalAPI.getPendingJoiners();
```

See [API_INTEGRATION_EXAMPLES.md](API_INTEGRATION_EXAMPLES.md) for complete examples.

## 🔐 Security

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ CORS protection
- ✅ Environment variables for secrets
- ✅ Row-level security ready (Supabase RLS)
- ✅ Separate roles: admin, tenant

## 📱 Responsive Design

- ✅ Mobile-first design
- ✅ Tailwind CSS responsive utilities
- ✅ Mobile navigation drawer
- ✅ Touch-friendly interfaces
- ✅ Optimized for all screen sizes

## 🧪 Testing

### Frontend
```bash
npm test
```

### Backend
```bash
cd backend
npm test
```

## 📖 Documentation

- [Frontend README](README.md) - Frontend setup & features
- [Backend README](backend/README.md) - Backend API documentation
- [Setup Guide](SETUP_GUIDE.md) - Complete setup instructions
- [API Integration Examples](API_INTEGRATION_EXAMPLES.md) - Code examples

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy via Vercel dashboard
```

### Backend (Heroku/Railway)
```bash
cd backend
npm run build
npm start
```

Set environment variables on hosting platform.

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1
- **TypeScript** 5
- **Vite** 5
- **Tailwind CSS** 3
- **shadcn-ui** (38+ components)
- **Zustand** 5 (state)
- **React Router** 6
- **React Hook Form** + Zod (forms)
- **TanStack React Query** 5 (data fetching)
- **Socket.io Client** (real-time)

### Backend
- **Node.js** 18+
- **Express** 4.18
- **TypeScript** 5
- **Supabase** (PostgreSQL)
- **Socket.io** 4.7 (WebSocket)
- **JWT** (authentication)
- **Bcrypt** (password hashing)
- **Zod** (validation)

## 📝 Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

### Backend (.env)
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

## 🐛 Troubleshooting

### Backend won't start
- Check SUPABASE_URL and SUPABASE_KEY
- Verify port 5000 is available
- Check Node.js version (18+)

### Frontend won't connect to backend
- Verify backend is running on 5000
- Check VITE_API_URL in .env.local
- Check CORS settings in backend

### WebSocket connection fails
- Check WS_URL is correct
- Verify token is being sent
- Check browser console for errors

See [SETUP_GUIDE.md](SETUP_GUIDE.md#-troubleshooting) for more.

## 👥 Project Team

- Architecture: Full-stack system design
- Frontend: React + TypeScript + UI components
- Backend: Node.js + Express + Real-time updates
- Database: Supabase PostgreSQL

## 📄 License

MIT License - Feel free to use this project for learning and development!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions:
1. Check the documentation files
2. Review error messages in console/logs
3. Verify all environment variables are set

---

**Built with ❤️ for accommodation management**
