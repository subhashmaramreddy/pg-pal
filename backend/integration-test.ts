// Simple room creation with environment variables for credentials
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'guesthubpg@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

let adminToken: string | null = null;

async function loginAdmin() {
  try {
    console.log(`\n🔐 Logging in as: ${ADMIN_EMAIL}`);
    const response = await axios.post(`${API_URL}/auth/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    adminToken = response.data.data.token;
    console.log('✓ Admin login successful');
    return response.data;
  } catch (error: any) {
    console.error('✗ Login failed:', error.response?.data?.error || error.message);
    throw error;
  }
}

async function createRooms() {
  if (!adminToken) {
    console.log('⚠ No admin token available');
    return;
  }

  const rooms = [
    // Boys PG
    { name: 'Room 101', capacity: 2, pgType: 'boys', rent: 5000 },
    { name: 'Room 102', capacity: 2, pgType: 'boys', rent: 5000 },
    { name: 'Room 103', capacity: 3, pgType: 'boys', rent: 7500 },
    { name: 'Room 201', capacity: 2, pgType: 'boys', rent: 5000 },
    { name: 'Room 202', capacity: 3, pgType: 'boys', rent: 7500 },
    // Girls PG
    { name: 'Room 101', capacity: 2, pgType: 'girls', rent: 5500 },
    { name: 'Room 102', capacity: 2, pgType: 'girls', rent: 5500 },
    { name: 'Room 201', capacity: 3, pgType: 'girls', rent: 8000 },
  ];

  try {
    console.log('\n🏠 Creating sample rooms...');
    let createdCount = 0;

    for (const room of rooms) {
      try {
        const response = await axios.post(`${API_URL}/admin/rooms`, room, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✓ ${room.pgType.toUpperCase()} PG - ${room.name} (${room.capacity} beds, ₹${room.rent})`);
        createdCount++;
      } catch (error: any) {
        if (error.response?.status === 409) {
          console.log(`⚠ ${room.name} already exists`);
        } else {
          console.error(`✗ Failed to create ${room.name}:`, error.response?.data?.error || error.message);
        }
      }
    }

    console.log(`\n✓ Created ${createdCount} rooms`);
    return createdCount;
  } catch (error) {
    console.error('✗ Room creation error:', error);
  }
}

async function getDashboardStats() {
  if (!adminToken) {
    console.log('⚠ No admin token available');
    return;
  }

  try {
    console.log('\n📊 Fetching dashboard stats...');
    
    // Fetch both boys and girls stats
    const [boysStats, girlsStats] = await Promise.all([
      axios.get(`${API_URL}/admin/stats?pgType=boys`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      }),
      axios.get(`${API_URL}/admin/stats?pgType=girls`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
    ]);

    console.log('\n📈 BOYS PG STATS:');
    console.log(JSON.stringify(boysStats.data, null, 2));

    console.log('\n📈 GIRLS PG STATS:');
    console.log(JSON.stringify(girlsStats.data, null, 2));

    return { boys: boysStats.data, girls: girlsStats.data };
  } catch (error: any) {
    console.error('✗ Dashboard fetch failed:', error.response?.data || error.message);
  }
}

async function testAdminEndpoints() {
  if (!adminToken) return;

  try {
    console.log('\n🔍 Testing admin endpoints...');

    // Get pending joiners
    console.log('\n📋 Fetching pending joiners...');
    const joinersResponse = await axios.get(`${API_URL}/admin/joiners?pgType=boys`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✓ Found ${joinersResponse.data.data?.length || 0} pending joiners`);

    // Get active tenants
    console.log('\n👥 Fetching active tenants...');
    const tenantsResponse = await axios.get(`${API_URL}/admin/tenants?pgType=boys`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✓ Found ${tenantsResponse.data.data?.length || 0} active tenants`);

    // Get rooms
    console.log('\n🏠 Fetching rooms...');
    const roomsResponse = await axios.get(`${API_URL}/admin/rooms?pgType=boys`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✓ Found ${roomsResponse.data.data?.length || 0} rooms`);

    return true;
  } catch (error: any) {
    console.error('✗ Endpoint test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 PG-Pal Integration Test');
  console.log('================================\n');

  try {
    // Step 1: Login
    await loginAdmin();

    // Step 2: Create rooms
    await createRooms();

    // Step 3: Get dashboard stats
    await getDashboardStats();

    // Step 4: Test endpoints
    await testAdminEndpoints();

    console.log('\n================================');
    console.log('✅ All Tests Completed!\n');
    console.log('🌐 Frontend URLs:');
    console.log('   Admin Dashboard: http://localhost:5173/admin/dashboard');
    console.log('   Boys PG Admin: http://localhost:5173/admin/dashboard');
    console.log('   Girls PG Admin: http://localhost:5173/admin/girls-dashboard');
    console.log('   User Login: http://localhost:5173/login');
    console.log('   Join PG: http://localhost:5173/join');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Tests failed:', (error as Error).message);
    process.exit(1);
  }
}

runTests();
