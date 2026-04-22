# PG-Pal Backend API

Real-time backend server for the PG-Pal accommodation management system built with Node.js, Express, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Supabase account (free tier available at https://supabase.com)

### Installation

1. **Install dependencies**
```bash
npm install
# or with bun
bun install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

3. **Configure your `.env` file**
```env
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_very_secure_secret_key_here_change_me
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

### Supabase Setup

1. **Create a Supabase project** at https://supabase.com
2. **Get your credentials** from Project Settings → API
3. **Run the database schema**:
   - Go to SQL Editor in Supabase dashboard
   - Copy the contents of `backend/database.sql`
   - Execute the entire SQL to create all tables

4. **Create test admin users** (optional):
```sql
-- This will be hashed by the API during registration
INSERT INTO admins (email, password, pg_type) VALUES
  ('admin@pgpal.com', '$2b$10$...hashedpassword...', 'boys'),
  ('admin-girls@pgpal.com', '$2b$10$...hashedpassword...', 'girls');
```

### Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production build**:
```bash
npm run build
npm start
```

The server will start at `http://localhost:5000`

## 📚 API Endpoints

### Authentication

```
POST /api/auth/admin/login
- Login admin user
- Body: { email, password }
- Returns: { token, admin }

POST /api/auth/admin/register
- Register new admin (first-time setup)
- Body: { email, password, pgType }
- Returns: { token, admin }

POST /api/auth/verify-token
- Verify JWT token validity
- Body: { token }
- Returns: { decoded token data }
```

### Tenant Routes

```
POST /api/tenant/join
- Submit new joiner application
- Body: { name, email, phone, gender, college, department, year, pgType, roomType, joinDate, aadhaarUrl?, collegeIdUrl? }
- Returns: { application, token }

GET /api/tenant/profile/:tenantId
- Get tenant profile (requires auth)
- Returns: { tenant, room }

GET /api/tenant/payments/:tenantId
- Get payment history (requires auth)
- Returns: payment[]

GET /api/tenant/leaves/:tenantId
- Get leave requests (requires auth)
- Returns: leave[]

POST /api/tenant/leaves/:tenantId
- Request leave (requires auth)
- Body: { startDate, endDate, reason? }
- Returns: leave object
```

### Admin Routes (All require authentication + admin role)

```
GET /api/admin/stats
- Get dashboard statistics
- Returns: { totalRooms, occupiedRooms, occupancyRate, activeTenants, ... }

GET /api/admin/joiners
- Get pending applications
- Returns: joiner[]

POST /api/admin/joiners/:joinerId/approve
- Approve joiner application
- Body: { roomId, rent, deposit }
- Returns: tenant object

POST /api/admin/joiners/:joinerId/reject
- Reject joiner application
- Returns: { success }

GET /api/admin/tenants?search=query
- Get all tenants (with optional search)
- Returns: tenant[]

GET /api/admin/tenants/:tenantId
- Get specific tenant details
- Returns: tenant object

PATCH /api/admin/tenants/:tenantId/presence
- Update tenant presence status
- Body: { status: 'present' | 'on-leave' }
- Returns: tenant object

POST /api/admin/tenants/:tenantId/vacate
- Mark tenant as vacated
- Returns: { success }

POST /api/admin/tenants/:tenantId/shift
- Move tenant to different room
- Body: { newRoomId }
- Returns: tenant object

GET /api/admin/rooms
- Get all rooms with status
- Returns: room[]

PATCH /api/admin/rooms/:roomId/capacity
- Update room capacity (2 or 3)
- Body: { capacity }
- Returns: room object

GET /api/admin/payments
- Get all payments
- Returns: payment[]

POST /api/admin/payments/:paymentId/mark-paid
- Mark payment as paid
- Body: { paymentMethod, transactionId? }
- Returns: payment object
```

## 🔌 WebSocket Events (Real-time)

Connect with JWT token in `socket.handshake.auth.token`

### Broadcasting Events
```javascript
socket.on('joiner:submitted', data) // New application
socket.on('joiner:approved', data)  // Application approved
socket.on('joiner:rejected', data)  // Application rejected
socket.on('tenant:vacated', data)   // Tenant left
socket.on('tenant:shifted', data)   // Tenant moved rooms
socket.on('presence:updated', data) // Presence changed
socket.on('payment:made', data)     // Payment recorded
socket.on('leave:requested', data)  // Leave request made
socket.on('room:capacityUpdated', data) // Room capacity changed
```

### Listening Events
```javascript
// Receive updates for your PG type
socket.on('joiner:new', data)
socket.on('joiner:approved', data)
socket.on('tenant:left', data)
socket.on('tenant:roomChanged', data)
socket.on('presence:changed', data)
socket.on('payment:recorded', data)
socket.on('leave:new', data)
socket.on('room:updated', data)
socket.on('notification:received', data)
```

## 📊 Database Schema

### Tables
- **admins**: Admin users for each PG
- **joiners**: New applications (pending approval)
- **tenants**: Active tenants
- **rooms**: Room inventory and status
- **payments**: Monthly rent payments
- **leaves**: Leave requests
- **past_tenants**: Historical records

### Key Relationships
```
joiner → (approved) → tenant → room
tenant → payments (monthly rent)
tenant → leaves (leave requests)
```

## 🔐 Authentication Flow

1. **Admin Login**:
   - POST `/api/auth/admin/login` with credentials
   - Returns JWT token
   - Include token in `Authorization: Bearer <token>` header

2. **Tenant Signup**:
   - POST `/api/tenant/join` with application details
   - Returns temporary token (pending approval)
   - Admin approves application → tenant becomes active

3. **Token Verification**:
   - Middleware verifies token on protected routes
   - WebSocket auth via `socket.handshake.auth.token`

## 🎯 PG Types

The system supports two separate PG facilities:
- **boys**: Boys hostel
- **girls**: Girls hostel

Each has independent:
- Admin users
- Tenants and applications
- Rooms and assignments
- Payment records
- Real-time updates

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Main server entry point
│   ├── routes/
│   │   ├── auth.ts              # Authentication endpoints
│   │   ├── tenant.ts            # Tenant routes
│   │   └── admin.ts             # Admin routes
│   ├── services/
│   │   ├── database.ts          # Database operations
│   │   └── socket.ts            # WebSocket handlers
│   ├── middleware/
│   │   └── auth.ts              # Authentication middleware
│   ├── utils/
│   │   ├── jwt.ts               # JWT utilities
│   │   ├── password.ts          # Password hashing
│   │   └── supabase.ts          # Supabase client
│   └── types/
│       ├── index.ts             # TypeScript interfaces
│       └── express.ts           # Express extensions
├── database.sql                 # Database schema
├── package.json
├── tsconfig.json
└── .env.example
```

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No | Server port (default: 5000) |
| NODE_ENV | No | Environment (development/production) |
| SUPABASE_URL | Yes | Your Supabase project URL |
| SUPABASE_KEY | Yes | Supabase anon key |
| SUPABASE_SERVICE_ROLE_KEY | No | Service role key for admin operations |
| JWT_SECRET | Yes | Secret for JWT signing |
| JWT_EXPIRE | No | Token expiration (default: 7d) |
| FRONTEND_URL | No | Frontend URL for CORS |

## 🚀 Deployment

### Vercel
```bash
# Create vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Heroku
```bash
heroku create pg-pal-api
git push heroku main
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📞 Support

For issues and questions:
1. Check the API documentation at `/api`
2. Review database.sql for schema details
3. Ensure all environment variables are set correctly

## 📄 License

MIT License - Feel free to use this project!
