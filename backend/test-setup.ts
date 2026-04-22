// Test setup script - creates admin account and sample data
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const testData = {
  admin: {
    email: 'admin@pgpal.com',
    password: 'Admin@123',
    name: 'Admin User',
    pgType: 'boys'
  },
  rooms: [
    { name: 'Room 101', capacity: 2, pgType: 'boys', rent: 5000 },
    { name: 'Room 102', capacity: 2, pgType: 'boys', rent: 5000 },
    { name: 'Room 103', capacity: 3, pgType: 'boys', rent: 7500 },
    { name: 'Room 201', capacity: 2, pgType: 'girls', rent: 5500 },
    { name: 'Room 202', capacity: 2, pgType: 'girls', rent: 5500 },
  ]
};

let adminToken: string | null = null;

async function registerAdmin() {
  try {
    console.log('\n📝 Registering admin account...');
    const response = await axios.post(`${API_URL}/dev/seed-admin`, testData.admin);
    console.log('✓ Admin registered:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.log('⚠ Admin already exists, attempting to login...');
      return await loginAdmin();
    }
    console.error('✗ Admin registration failed:', error.response?.data || error.message);
    throw error;
  }
}

async function loginAdmin() {
  try {
    console.log('\n🔐 Logging in as admin...');
    const response = await axios.post(`${API_URL}/auth/admin/login`, {
      email: testData.admin.email,
      password: testData.admin.password
    });
    adminToken = response.data.token;
    console.log('✓ Admin logged in successfully');
    console.log(`   Token: ${adminToken.substring(0, 20)}...`);
    return response.data;
  } catch (error: any) {
    console.error('✗ Admin login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function createRooms() {
  if (!adminToken) {
    console.log('⚠ No admin token available, skipping room creation');
    return;
  }

  try {
    console.log('\n🏠 Creating sample rooms...');
    for (const room of testData.rooms) {
      try {
        const response = await axios.post(`${API_URL}/admin/rooms`, room, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✓ Created ${room.name} (${room.capacity} beds, ₹${room.rent})`);
      } catch (error: any) {
        if (error.response?.status === 409) {
          console.log(`⚠ ${room.name} already exists`);
        } else {
          throw error;
        }
      }
    }
  } catch (error: any) {
    console.error('✗ Room creation failed:', error.response?.data || error.message);
  }
}

async function verifyDashboard() {
  if (!adminToken) {
    console.log('⚠ No admin token available, skipping dashboard verification');
    return;
  }

  try {
    console.log('\n📊 Fetching dashboard stats...');
    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✓ Dashboard stats:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    console.error('✗ Dashboard fetch failed:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting PG-Pal Test Setup');
  console.log('================================\n');

  try {
    // Step 1: Register or login admin
    await registerAdmin();
    await loginAdmin();

    // Step 2: Create sample rooms
    await createRooms();

    // Step 3: Verify dashboard
    await verifyDashboard();

    console.log('\n================================');
    console.log('✅ Setup Complete!\n');
    console.log('📱 Test Credentials:');
    console.log(`   Email: ${testData.admin.email}`);
    console.log(`   Password: ${testData.admin.password}`);
    console.log('\n🌐 Access URLs:');
    console.log('   Admin Login: http://localhost:5173/admin/login');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend API: http://localhost:5000/api');
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

runTests();
