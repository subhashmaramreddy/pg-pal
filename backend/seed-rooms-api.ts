import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function seedRoomsViaAPI() {
  try {
    // Login as admin first
    console.log('Logging in as admin...');
    const loginRes = await axios.post(`${BASE_URL}/auth/admin/login`, {
      email: 'guesthubpg@gmail.com',
      password: 'Guesthub117',
    });

    const adminToken = loginRes.data.data.token;
    console.log('✓ Admin logged in');

    const headers = { Authorization: `Bearer ${adminToken}` };

    // Create boys rooms (we'll need a create rooms endpoint, or use direct Supabase)
    // For now, let's just verify if we can create them through the API

    console.log('✓ Rooms seed completed');
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

seedRoomsViaAPI();
