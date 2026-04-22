// Example: How to use the API client in your React components
// This file shows patterns for integrating the backend API

// ==================== EXAMPLE 1: Admin Login Page ====================

import { useState } from 'react';
import { pgpalAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';

export function AdminLoginExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { token, admin } = await pgpalAPI.adminLogin(email, password);
      
      // Store admin info in store
      // useAdminStore.setState({ admin, token });
      
      // Connect WebSocket for real-time updates
      await pgpalAPI.connectSocket(
        () => console.log('Connected to real-time updates'),
        (error) => console.error('Connection error:', error)
      );
      
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

// ==================== EXAMPLE 2: Admin Dashboard (fetch stats) ====================

import { useEffect, useState } from 'react';
import { pgpalAPI } from '@/services/api';
import type { DashboardStats } from '@/types/api';

export function AdminDashboardExample() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await pgpalAPI.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Optionally, refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>No data</div>;

  return (
    <div className="dashboard">
      <div className="stat-card">
        <h3>Occupancy Rate</h3>
        <p>{stats.occupancyRate}%</p>
      </div>
      <div className="stat-card">
        <h3>Active Tenants</h3>
        <p>{stats.activeTenants}</p>
      </div>
      <div className="stat-card">
        <h3>Pending Approvals</h3>
        <p>{stats.pendingApprovals}</p>
      </div>
      <div className="stat-card">
        <h3>Revenue</h3>
        <p>₹{stats.totalCollected}</p>
      </div>
    </div>
  );
}

// ==================== EXAMPLE 3: Joiner Approvals (real-time) ====================

import { useEffect, useState } from 'react';
import { pgpalAPI } from '@/services/api';
import type { JoinerApplication } from '@/types/api';

export function JoinerApprovalsExample() {
  const [joiners, setJoiners] = useState<JoinerApplication[]>([]);

  useEffect(() => {
    // Fetch initial joiners
    const fetchJoiners = async () => {
      const data = await pgpalAPI.getPendingJoiners();
      setJoiners(data);
    };

    fetchJoiners();

    // Listen to real-time new joiner submissions
    pgpalAPI.onJoinerSubmitted((newJoiner) => {
      setJoiners((prev) => [newJoiner, ...prev]);
      
      // Show notification
      pgpalAPI.sendNotification('admin', 'New application received!', 'info');
    });

    // Listen to approvals/rejections
    pgpalAPI.on('joiner:approved', ({ joinerId }) => {
      setJoiners((prev) => prev.filter((j) => j.id !== joinerId));
    });

    return () => {
      pgpalAPI.off('joiner:new');
      pgpalAPI.off('joiner:approved');
    };
  }, []);

  const handleApprove = async (joiner: JoinerApplication) => {
    try {
      // Need to select room from UI first
      const roomId = 'room-uuid'; // from UI selection
      const rent = 9000; // from UI input
      const deposit = 18000; // calculated

      await pgpalAPI.approveJoiner(joiner.id, roomId, rent, deposit);
      
      // Emit real-time event
      pgpalAPI.emitJoinerSubmitted({
        joinerId: joiner.id,
        pgType: joiner.pgType
      });

      setJoiners((prev) => prev.filter((j) => j.id !== joiner.id));
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  return (
    <div>
      <h2>Pending Applications ({joiners.length})</h2>
      {joiners.map((joiner) => (
        <div key={joiner.id} className="joiner-card">
          <h3>{joiner.name}</h3>
          <p>Email: {joiner.email}</p>
          <p>College: {joiner.college}</p>
          <p>Preference: {joiner.roomType}</p>
          <button onClick={() => handleApprove(joiner)}>Approve</button>
        </div>
      ))}
    </div>
  );
}

// ==================== EXAMPLE 4: Tenant Dashboard ====================

import { useEffect, useState } from 'react';
import { pgpalAPI } from '@/services/api';
import type { Tenant, Payment, Room } from '@/types/api';

export function TenantDashboardExample({ tenantId }: { tenantId: string }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tenant profile and room
        const { tenant: t, room: r } = await pgpalAPI.getTenantProfile(tenantId);
        setTenant(t);
        setRoom(r);

        // Fetch payment history
        const p = await pgpalAPI.getPaymentHistory(tenantId);
        setPayments(p);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();

    // Listen to real-time payment updates
    pgpalAPI.onPaymentRecorded((data) => {
      if (data.tenantId === tenantId) {
        // Refresh payments
        fetchData();
      }
    });

    return () => {
      pgpalAPI.off('payment:recorded');
    };
  }, [tenantId]);

  if (!tenant || !room) return <div>Loading...</div>;

  return (
    <div className="tenant-dashboard">
      <section>
        <h2>Profile</h2>
        <p>Name: {tenant.name}</p>
        <p>Room: {room.roomNumber}</p>
        <p>Floor: {room.floor}</p>
        <p>Rent: ₹{tenant.rent}/month</p>
      </section>

      <section>
        <h2>Payment History</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.month}</td>
                <td>₹{payment.amount}</td>
                <td>{payment.status}</td>
                <td>{payment.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

// ==================== EXAMPLE 5: Tenant Application Form ====================

import { useState } from 'react';
import { pgpalAPI } from '@/services/api';

export function TenantApplicationExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'M' as const,
    college: '',
    department: '',
    year: 1,
    pgType: 'boys' as const,
    roomType: '2-sharing' as const,
    joinDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { application, token } = await pgpalAPI.submitJoinerApplication(formData);
      
      // Store token for when approved
      localStorage.setItem('temp_token', token);
      
      setSuccess(true);
      console.log('Application submitted:', application);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div>Application submitted! Waiting for admin approval...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <select
        value={formData.pgType}
        onChange={(e) => setFormData({ ...formData, pgType: e.target.value as any })}
      >
        <option value="boys">Boys</option>
        <option value="girls">Girls</option>
      </select>
      <select
        value={formData.roomType}
        onChange={(e) => setFormData({ ...formData, roomType: e.target.value as any })}
      >
        <option value="2-sharing">2 Sharing - ₹9,000</option>
        <option value="3-sharing">3 Sharing - ₹7,500</option>
      </select>
      <input
        type="date"
        value={formData.joinDate}
        onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}

// ==================== EXAMPLE 6: Setting up API in App.tsx ====================

import { useEffect } from 'react';
import { pgpalAPI } from '@/services/api';

export function App() {
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('pgpal_token');
    if (token) {
      // Verify token is still valid
      pgpalAPI.verifyToken(token).then((isValid) => {
        if (isValid) {
          // Connect WebSocket
          pgpalAPI.connectSocket().catch((error) => {
            console.error('WebSocket connection failed:', error);
          });
        } else {
          // Token expired
          pgpalAPI.clearToken();
        }
      });
    }

    // Cleanup on unmount
    return () => {
      pgpalAPI.disconnect();
    };
  }, []);

  return (
    // Your app routes...
  );
}

// ==================== USAGE PATTERNS ====================

/*
1. LOGIN
   - Call pgpalAPI.adminLogin(email, password)
   - Token automatically stored and sent with requests
   - Connect WebSocket with pgpalAPI.connectSocket()

2. FETCH DATA
   - Use pgpalAPI methods: getDashboardStats(), getPendingJoiners(), etc.
   - Data is automatically fetched with correct authentication

3. REAL-TIME UPDATES
   - Use pgpalAPI.on(eventName, callback)
   - Events are emitted when data changes on backend
   - No need to manually refresh

4. SEND DATA
   - Use pgpalAPI methods: approveJoiner(), markPaymentAsPaid(), etc.
   - Backend automatically broadcasts updates via WebSocket

5. LOGOUT
   - Call pgpalAPI.clearToken()
   - WebSocket disconnects automatically
   - Token removed from localStorage

6. ERROR HANDLING
   - All methods return promises that reject on error
   - Use try/catch or .catch()
   - Check error.response?.data?.error for backend errors
*/
